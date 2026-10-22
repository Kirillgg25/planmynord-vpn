const { app, BrowserWindow, ipcMain, dialog, shell, net, session, safeStorage, clipboard } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { spawn, execFile } = require('child_process');
const tcp = require('node:net');
const http = require('node:http');
const { createHash, randomBytes, randomUUID } = require('crypto');

let mainWindow;
let singBoxProcess;
let xrayProcess;
let connectedAt;
let lastError = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 720, minWidth: 900, minHeight: 620,
    backgroundColor: '#08111f', title: 'PlanMyNord VPN', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

const accountFile = () => path.join(app.getPath('userData'), 'account.dat');
const profilesFile = () => path.join(app.getPath('userData'), 'profiles.dat');
const trialProfileFile = () => path.join(app.getPath('userData'), 'vpn-trial-profile.json');
const API_BASE = 'https://planmynord.com';
const SITE_LOGIN_PARTITION = 'persist:planmynord-site-login';

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { windowsHide: true, timeout: 10_000, maxBuffer: 1024 * 1024, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.message = String(stderr || error.message).trim();
        reject(error);
      } else resolve(stdout);
    });
  });
}

async function readAccount() {
  try {
    const payload = await fs.readFile(accountFile());
    return JSON.parse(safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(payload) : payload.toString('utf8'));
  } catch { return null; }
}

async function writeAccount(value) {
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  const json = JSON.stringify(value);
  const payload = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(json) : Buffer.from(json, 'utf8');
  await fs.writeFile(accountFile(), payload, { mode: 0o600 });
}

async function readProfiles() {
  try {
    const payload = await fs.readFile(profilesFile());
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Зашифрованное хранилище профилей недоступно');
    return JSON.parse(safeStorage.decryptString(payload));
  } catch { return []; }
}

async function writeProfiles(value) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Невозможно безопасно сохранить профиль: шифрование Windows недоступно');
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  const json = JSON.stringify(value);
  const payload = safeStorage.encryptString(json);
  await fs.writeFile(profilesFile(), payload, { mode: 0o600 });
}

async function apiRequest(route, { method = 'GET', body, token = '' } = {}) {
  const headers = { accept: 'application/json' };
  if (body) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await net.fetch(`${API_BASE}${route}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return { data, response };
}

async function accountLogin(email, password) {
  const { data, response } = await apiRequest('/api/login', { method: 'POST', body: { email, password } });
  const rawCookie = response.headers.get('set-cookie') || '';
  const match = rawCookie.match(/(?:^|,\s*)(connect\.sid=[^;,]+)/);
  const cookie = match ? match[1] : '';
  if (!cookie || !data.user) throw new Error('Сайт не вернул сессию. Проверьте подтверждение почты и попробуйте снова.');
  const account = { cookie, name: data.user.name || '', email: data.user.email || email };
  await writeAccount(account);
  return account;
}

function oauthResultPage(success) {
  const status = success
    ? { icon: '✓', eyebrow: 'АККАУНТ ПОДКЛЮЧЁН', title: 'Вход выполнен', copy: 'Google подтвердил вход. Вернитесь в PlanMyNord VPN — аккаунт уже передан приложению.', tone: 'success' }
    : { icon: '×', eyebrow: 'ВХОД НЕ ЗАВЕРШЁН', title: 'Не удалось войти', copy: 'Вход был отменён или не прошёл проверку. Вернитесь в PlanMyNord VPN и попробуйте ещё раз.', tone: 'error' };
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#08111f">
  <title>${status.title} · PlanMyNord VPN</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, "Segoe UI", Arial, sans-serif; background: #08111f; color: #eef5ff; }
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 28px;
      background: radial-gradient(ellipse at 50% 0%, #12325a 0, #0b1a2d 38%, #08111f 76%); }
    .card { width: min(100%, 460px); padding: 38px; border: 1px solid #263a53; border-radius: 24px;
      background: linear-gradient(145deg, rgba(17, 32, 51, .96), rgba(11, 23, 39, .98));
      box-shadow: 0 28px 80px rgba(0, 0, 0, .38); text-align: center; }
    .brand { display: flex; justify-content: center; align-items: center; gap: 11px; margin-bottom: 34px; }
    .brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid #3978c5;
      border-radius: 12px; background: linear-gradient(145deg, #174b8b, #0c2949); color: #8bdcff; font-size: 20px; font-weight: 700; }
    .brand-name { font-size: 15px; font-weight: 700; letter-spacing: .01em; }
    .brand-name span { display: block; margin-top: 3px; color: #62cafa; font-size: 10px; font-weight: 600; letter-spacing: .19em; text-align: left; }
    .status-icon { display: grid; place-items: center; width: 64px; height: 64px; margin: 0 auto 20px;
      border: 1px solid ${success ? '#236d64' : '#773d50'}; border-radius: 20px;
      background: ${success ? 'rgba(24, 133, 112, .17)' : 'rgba(176, 56, 76, .16)'};
      color: ${success ? '#63e0bd' : '#ff91a4'}; font-size: 30px; font-weight: 600; }
    .eyebrow { margin: 0 0 10px; color: ${success ? '#63e0bd' : '#ff91a4'}; font-size: 10px; font-weight: 700; letter-spacing: .16em; }
    h1 { margin: 0; font-size: clamp(25px, 6vw, 30px); letter-spacing: -.035em; }
    .copy { max-width: 340px; margin: 13px auto 0; color: #a9bbd1; font-size: 14px; line-height: 1.7; }
    .hint { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 28px; padding: 13px 15px;
      border: 1px solid #263a53; border-radius: 13px; background: rgba(8, 17, 31, .55); color: #d7e6f8; font-size: 12px; }
    .hint-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #53c5fa; box-shadow: 0 0 12px #53c5fa; }
    footer { margin-top: 27px; color: #6f839c; font-size: 11px; }
    @media (max-width: 420px) { .card { padding: 30px 22px; } }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand"><div class="brand-mark">盾</div><div class="brand-name">PlanMyNord<span>VPN</span></div></div>
    <div class="status-icon" aria-hidden="true">${status.icon}</div>
    <p class="eyebrow">${status.eyebrow}</p>
    <h1>${status.title}</h1>
    <p class="copy">${status.copy}</p>
    <div class="hint"><span class="hint-dot"></span><span>Можно закрыть эту вкладку и вернуться в приложение</span></div>
    <footer>Безопасное подключение к PlanMyNord VPN</footer>
  </main>
</body>
</html>`;
}

async function accountLoginViaWebsite() {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  let receiveTicket;
  const ticketPromise = new Promise((resolve, reject) => { receiveTicket = { resolve, reject }; });
  const callbackServer = http.createServer((request, response) => {
    let callbackUrl;
    try { callbackUrl = new URL(request.url, 'http://127.0.0.1'); }
    catch { response.writeHead(400).end('Invalid callback'); return; }
    if (request.method !== 'GET' || callbackUrl.pathname !== '/oauth/callback') {
      response.writeHead(404).end('Not found');
      return;
    }
    const error = callbackUrl.searchParams.get('error');
    const ticket = callbackUrl.searchParams.get('ticket') || '';
    if (error) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(oauthResultPage(false));
      receiveTicket.reject(new Error('Вход через сайт отменён.'));
      return;
    }
    if (!/^[A-Za-z0-9_-]{40,100}$/.test(ticket)) {
      response.writeHead(400).end('Invalid sign-in ticket');
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(oauthResultPage(true));
    receiveTicket.resolve(ticket);
  });

  await new Promise((resolve, reject) => {
    callbackServer.once('error', reject);
    callbackServer.listen(0, '127.0.0.1', resolve);
  });
  const callbackAddress = callbackServer.address();
  const redirectUri = `http://127.0.0.1:${callbackAddress.port}/oauth/callback`;
  const startUrl = new URL('/api/desktop-auth/start', API_BASE);
  startUrl.searchParams.set('code_challenge', codeChallenge);
  startUrl.searchParams.set('redirect_uri', redirectUri);
  let timeout;
  try {
    await shell.openExternal(startUrl.toString());
    const ticket = await Promise.race([
      ticketPromise,
      new Promise((_resolve, reject) => { timeout = setTimeout(() => reject(new Error('Время ожидания входа истекло. Попробуйте снова.')), 5 * 60 * 1000); })
    ]);
    const response = await net.fetch(`${API_BASE}/api/desktop-auth/exchange`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ ticket, code_verifier: codeVerifier })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) throw new Error(data.error || `HTTP ${response.status}`);
    const rawCookie = response.headers.get('set-cookie') || '';
    const match = rawCookie.match(/(?:^|,\s*)(connect\.sid=[^;,]+)/);
    if (!match) throw new Error('Сайт не передал сессию приложению. Попробуйте войти ещё раз.');
    const account = { cookie: match[1], name: data.user.name || '', email: data.user.email || '' };
    await writeAccount(account);
    return { name: account.name, email: account.email };
  } finally {
    clearTimeout(timeout);
    callbackServer.close();
  }
}

async function refreshVpnProfile() {
  const account = await readAccount();
  if (!account?.cookie) throw new Error('Сначала войдите в аккаунт PlanMyNord.');
  const deviceName = `${app.getName()} · ${require('os').hostname()}`.slice(0, 60);
  const response = await net.fetch(`${API_BASE}/api/vpn/account`, { headers: { cookie: account.cookie, accept: 'application/json' } });
  const accountResult = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(accountResult.error || `HTTP ${response.status}`);
  let device = accountResult.devices.find((item) => item.name === deviceName && item.platform === 'windows');
  if (!device) {
    const created = await net.fetch(`${API_BASE}/api/vpn/devices`, {
      method: 'POST', headers: { cookie: account.cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ name: deviceName, platform: 'windows' })
    });
    const result = await created.json().catch(() => ({}));
    if (!created.ok) throw new Error(result.error || `HTTP ${created.status}`);
    device = result.device;
  }
  const entitlement = accountResult.subscription;
  const expiresAt = entitlement.endsAt ? Date.parse(entitlement.endsAt) : null;
  const paid = entitlement.plan === 'vpn' && entitlement.status === 'active'
    && (!Number.isFinite(expiresAt) || expiresAt > Date.now());
  const plan = paid
    ? `VPN · до ${entitlement.endsAt || 'не ограничено'}`
    : 'Доступ не оплачен';
  return {
    subscription: entitlement,
    device,
    plan,
    trialProfile: accountResult.trialProfile || null,
    payment: { paid, status: paid ? 'paid' : 'unpaid', endsAt: entitlement.endsAt || null }
  };
}

async function restoreAccountFromCookie(cookie) {
  const response = await net.fetch(`${API_BASE}/api/me`, {
    headers: { cookie, accept: 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  if (!data.user) return null;
  const account = { cookie, name: data.user.name || '', email: data.user.email || '' };
  await writeAccount(account);
  return { name: account.name, email: account.email, user: data.user };
}

async function uploadAccountAvatar(avatarDataUrl) {
  const account = await readAccount();
  if (!account?.cookie) throw new Error('Сначала войдите в аккаунт PlanMyNord.');
  if (typeof avatarDataUrl !== 'string' || !avatarDataUrl.startsWith('data:image/') || avatarDataUrl.length > 1_900_000) {
    throw new Error('Не удалось подготовить изображение. Выберите другое фото.');
  }
  const response = await net.fetch(`${API_BASE}/api/avatar`, {
    method: 'POST',
    headers: { cookie: account.cookie, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ avatarUrl: avatarDataUrl })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.avatarUrl) throw new Error(data.error || `HTTP ${response.status}`);
  return data.avatarUrl;
}

function decodeSubscription(value) {
  const text = String(value || '').replace(/^\uFEFF/, '').trim();
  const supported = /^(vless|vmess|trojan|ss|hysteria2|hy2|tuic):\/\//im;
  if (supported.test(text)) return text;
  try {
    const decoded = Buffer.from(text.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const normalized = decoded.replace(/^\uFEFF/, '').trim();
    return supported.test(normalized) || normalized.startsWith('{') ? normalized : text;
  }
  catch { return text; }
}

function streamSettings(params) {
  const network = (params.get('type') || 'tcp').toLowerCase();
  const security = (params.get('security') || 'none').toLowerCase();
  const result = { network, security };
  const host = params.get('host') || '';
  const routePath = params.get('path') || '/';
  if (network === 'xhttp' || network === 'splithttp') {
    result.network = 'xhttp';
    result.xhttpSettings = { path: routePath };
    if (host) result.xhttpSettings.host = host;
    if (params.get('mode')) result.xhttpSettings.mode = params.get('mode');
  } else if (network === 'ws') {
    result.wsSettings = { path: routePath, headers: host ? { Host: host } : {} };
  } else if (network === 'grpc') {
    result.grpcSettings = { serviceName: params.get('serviceName') || routePath.replace(/^\//, '') };
  } else if (network === 'httpupgrade') {
    result.httpupgradeSettings = { path: routePath, host };
  }
  if (security === 'reality') {
    result.realitySettings = {
      serverName: params.get('sni') || host, fingerprint: params.get('fp') || 'chrome',
      publicKey: params.get('pbk') || params.get('publicKey') || '', shortId: params.get('sid') || '', spiderX: params.get('spx') || ''
    };
  } else if (security === 'tls') {
    result.tlsSettings = {
      serverName: params.get('sni') || host, fingerprint: params.get('fp') || 'chrome',
      allowInsecure: params.get('allowInsecure') === '1'
    };
    if (params.get('alpn')) result.tlsSettings.alpn = params.get('alpn').split(',');
  }
  return result;
}

function parseOutbound(link) {
  if (link.startsWith('vmess://')) {
    const data = JSON.parse(Buffer.from(link.slice(8), 'base64').toString('utf8'));
    const params = new URLSearchParams({ type: data.net || 'tcp', security: data.tls || 'none', host: data.host || '', path: data.path || '/', sni: data.sni || '', fp: data.fp || 'chrome' });
    return { tag: 'proxy', protocol: 'vmess', settings: { vnext: [{ address: data.add, port: Number(data.port), users: [{ id: data.id, alterId: Number(data.aid || 0), security: data.scy || 'auto' }] }] }, streamSettings: streamSettings(params) };
  }
  const url = new URL(link);
  if (!url.username || !url.hostname || !url.port) throw new Error('Incomplete subscription profile');
  if (url.protocol === 'trojan:') {
    return { tag: 'proxy', protocol: 'trojan', settings: { servers: [{ address: url.hostname, port: Number(url.port), password: decodeURIComponent(url.username) }] }, streamSettings: streamSettings(url.searchParams) };
  }
  const user = { id: decodeURIComponent(url.username), encryption: url.searchParams.get('encryption') || 'none' };
  if (url.searchParams.get('flow')) user.flow = url.searchParams.get('flow');
  return { tag: 'proxy', protocol: 'vless', settings: { vnext: [{ address: url.hostname, port: Number(url.port), users: [user] }] }, streamSettings: streamSettings(url.searchParams) };
}

function decodeLinkName(link, fallback) {
  const fragment = link.split('#').slice(1).join('#');
  try { return fragment ? decodeURIComponent(fragment) : fallback; } catch { return fallback; }
}

function queryParam(params, ...names) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  for (const [key, value] of params.entries()) {
    if (wanted.has(key.toLowerCase())) return value;
  }
  return '';
}

function singBoxOutbound(link) {
  if (link.startsWith('vmess://')) {
    const data = JSON.parse(Buffer.from(link.slice(8).split('#')[0], 'base64').toString('utf8'));
    if (!data.add || !data.port || !data.id) throw new Error('Некорректная VMess-ссылка');
    const outbound = { type: 'vmess', tag: 'proxy', server: data.add, server_port: Number(data.port), uuid: data.id, security: data.scy || 'auto', alter_id: Number(data.aid || 0) };
    if (data.tls && data.tls !== 'none') outbound.tls = { enabled: true, server_name: data.sni || data.host || data.add, ...(data.fp ? { utls: { enabled: true, fingerprint: data.fp } } : {}) };
    const network = data.net || 'tcp';
    if (network === 'ws') outbound.transport = { type: 'ws', path: data.path || '/', ...(data.host ? { headers: { Host: data.host } } : {}) };
    else if (network === 'grpc') outbound.transport = { type: 'grpc', service_name: (data.path || '').replace(/^\//, '') };
    else if (network === 'httpupgrade') outbound.transport = { type: 'httpupgrade', path: data.path || '/', ...(data.host ? { host: data.host } : {}) };
    return outbound;
  }

  const url = new URL(link);
  const common = { tag: 'proxy', server: url.hostname, server_port: Number(url.port) };
  if (!common.server || !common.server_port) throw new Error('В ссылке не указан сервер или порт');
  const params = url.searchParams;
  let outbound;
  if (url.protocol === 'vless:') {
    if (!url.username) throw new Error('В VLESS-ссылке отсутствует UUID');
    const flow = queryParam(params, 'flow');
    outbound = { ...common, type: 'vless', uuid: decodeURIComponent(url.username), ...(flow ? { flow } : {}) };
  } else if (url.protocol === 'trojan:') {
    if (!url.username) throw new Error('В Trojan-ссылке отсутствует пароль');
    outbound = { ...common, type: 'trojan', password: decodeURIComponent(url.username) };
  } else if (url.protocol === 'ss:') {
    let method, password;
    if (url.username && url.password) { method = decodeURIComponent(url.username); password = decodeURIComponent(url.password); }
    else {
      const userInfo = decodeURIComponent(url.username || '');
      const decoded = Buffer.from(userInfo, 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      if (separator < 1) throw new Error('Некорректная Shadowsocks-ссылка');
      method = decoded.slice(0, separator); password = decoded.slice(separator + 1);
    }
    outbound = { ...common, type: 'shadowsocks', method, password };
  } else if (url.protocol === 'hysteria2:' || url.protocol === 'hy2:') {
    if (!url.username) throw new Error('В Hysteria2-ссылке отсутствует пароль');
    outbound = { ...common, type: 'hysteria2', password: decodeURIComponent(url.username) };
  } else if (url.protocol === 'tuic:') {
    if (!url.username || !url.password) throw new Error('В TUIC-ссылке отсутствуют учётные данные');
    outbound = { ...common, type: 'tuic', uuid: decodeURIComponent(url.username), password: decodeURIComponent(url.password), congestion_control: params.get('congestion_control') || 'bbr', udp_relay_mode: params.get('udp_relay_mode') || 'native' };
  } else {
    throw new Error(`Протокол ${url.protocol.replace(':', '')} пока не поддерживается`);
  }

  const security = queryParam(params, 'security').toLowerCase() || (url.protocol === 'hysteria2:' || url.protocol === 'hy2:' || url.protocol === 'tuic:' ? 'tls' : 'none');
  if (security !== 'none' || url.protocol === 'hysteria2:' || url.protocol === 'hy2:' || url.protocol === 'tuic:') {
    const reality = security === 'reality';
    outbound.tls = { enabled: true, server_name: queryParam(params, 'sni', 'serverName', 'server_name') || queryParam(params, 'host') || url.hostname };
    const fingerprint = queryParam(params, 'fp', 'fingerprint') || (reality ? 'chrome' : '');
    if (fingerprint) outbound.tls.utls = { enabled: true, fingerprint };
    if (reality) {
      const publicKey = queryParam(params, 'pbk', 'publicKey', 'public_key', 'public-key').trim().replace(/ /g, '+');
      if (!publicKey) throw new Error('В Reality-ссылке отсутствует публичный ключ (pbk)');
      outbound.tls.reality = { enabled: true, public_key: publicKey, short_id: queryParam(params, 'sid', 'shortId', 'short_id', 'short-id') };
    }
    const alpn = queryParam(params, 'alpn');
    if (alpn) outbound.tls.alpn = alpn.split(',');
  }
  const network = queryParam(params, 'type', 'network').toLowerCase();
  const transportPath = queryParam(params, 'path') || '/';
  const host = queryParam(params, 'host');
  if (network === 'ws') outbound.transport = { type: 'ws', path: transportPath, ...(host ? { headers: { Host: host } } : {}) };
  else if (network === 'grpc') outbound.transport = { type: 'grpc', service_name: params.get('serviceName') || transportPath.replace(/^\//, '') };
  else if (network === 'httpupgrade') outbound.transport = { type: 'httpupgrade', path: transportPath, ...(host ? { host } : {}) };
  else if (network === 'xhttp' || network === 'splithttp') outbound.transport = { type: 'http', path: transportPath, ...(host ? { host } : {}) };
  return outbound;
}

function parseSubscription(body, fallbackName) {
  const text = decodeSubscription(body).replace(/^\uFEFF/, '').trim();
  if (text.trim().startsWith('{')) {
    const document = JSON.parse(text);
    const outbounds = Array.isArray(document.outbounds) ? document.outbounds : document.outbound ? [document.outbound] : [];
    const profiles = outbounds
      .filter((outbound) => outbound && !['direct', 'block', 'dns', 'selector', 'urltest', 'redirect', 'dns', 'tor'].includes(outbound.type)
        && (outbound.server || outbound.server_port || Array.isArray(outbound.peers)))
      .map((outbound, index) => {
        const id = randomUUID();
        const copy = { ...outbound, tag: 'proxy' };
        return { id, name: outbound.tag || `${fallbackName} · ${index + 1}`, protocol: outbound.type || 'sing-box', server: outbound.server || 'WireGuard', outbound: copy };
      });
    if (profiles.length) return profiles;
  }
  const links = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^(vless|vmess|trojan|ss|hysteria2|hy2|tuic):\/\//i.test(line));
  const profiles = [];
  for (const link of links) {
    try {
      const outbound = singBoxOutbound(link);
      const id = randomUUID();
      profiles.push({ id, name: decodeLinkName(link, `${fallbackName} · ${profiles.length + 1}`), protocol: outbound.type, server: outbound.server, outbound });
    } catch (error) {
      if (!links.length) throw error;
    }
  }
  if (!profiles.length) throw new Error('В ссылке не найдены поддерживаемые профили VLESS, VMess, Trojan, Shadowsocks, Hysteria2 или TUIC');
  return profiles;
}

const singBoxDirectory = () => app.isPackaged ? path.join(process.resourcesPath, 'sing-box') : path.join(__dirname, 'vendor', 'sing-box');
const singBoxExecutable = () => path.join(singBoxDirectory(), 'sing-box.exe');
const xrayDirectory = () => app.isPackaged ? path.join(process.resourcesPath, 'xray') : path.join(__dirname, 'vendor', 'xray');
const xrayExecutable = () => path.join(xrayDirectory(), 'xray.exe');

async function resolveVpnServerAddress(hostname) {
  const host = String(hostname || '').trim().replace(/\.$/, '');
  if (!host) throw new Error('В профиле не указан адрес VPN-сервера');
  if (tcp.isIP(host)) return host;
  try {
    return (await require('dns').promises.lookup(host, { family: 4 })).address;
  } catch (systemDnsError) {
    try {
      const url = new URL('https://cloudflare-dns.com/dns-query');
      url.searchParams.set('name', host);
      url.searchParams.set('type', 'A');
      const response = await net.fetch(url.toString(), {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(8000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.Status !== 0) throw new Error(`DNS-over-HTTPS вернул HTTP ${response.status}, DNS status ${result.Status ?? 'unknown'}`);
      const answer = (result.Answer || []).find((item) => item.type === 1 && tcp.isIP(item.data) === 4);
      if (!answer) throw new Error('DNS-over-HTTPS не вернул IPv4-адрес сервера');
      return answer.data;
    } catch (dohError) {
      throw new Error(`Не удалось определить адрес VPN-сервера через системный DNS или резервный DoH: ${dohError.message || systemDnsError.message}`);
    }
  }
}

function xrayConfigFromOutbound(outbound, serverAddress) {
  const user = outbound.type === 'vless'
    ? { id: outbound.uuid, encryption: 'none', ...(outbound.flow ? { flow: outbound.flow } : {}) }
    : { id: outbound.uuid, alterId: Number(outbound.alter_id || 0), security: outbound.security || 'auto' };
  const protocol = outbound.type === 'vmess' ? 'vmess' : 'vless';
  const streamSettings = { network: outbound.transport?.type || 'tcp', security: outbound.tls?.reality?.enabled ? 'reality' : outbound.tls?.enabled ? 'tls' : 'none' };
  if (outbound.transport?.type === 'ws') streamSettings.wsSettings = { path: outbound.transport.path || '/', headers: outbound.transport.headers || {} };
  if (outbound.transport?.type === 'grpc') streamSettings.grpcSettings = { serviceName: outbound.transport.service_name || '' };
  if (outbound.transport?.type === 'httpupgrade') streamSettings.httpupgradeSettings = { path: outbound.transport.path || '/', host: outbound.transport.host || '' };
  if (outbound.transport?.type === 'http') { streamSettings.network = 'xhttp'; streamSettings.xhttpSettings = { path: outbound.transport.path || '/', host: outbound.transport.host || '' }; }
  if (streamSettings.security === 'reality') {
    streamSettings.realitySettings = {
      serverName: outbound.tls.server_name || outbound.server,
      fingerprint: outbound.tls.utls?.fingerprint || 'chrome',
      publicKey: outbound.tls.reality.public_key,
      shortId: outbound.tls.reality.short_id || '',
      spiderX: outbound.tls.reality.spider_x || ''
    };
  } else if (streamSettings.security === 'tls') {
    streamSettings.tlsSettings = {
      serverName: outbound.tls.server_name || outbound.server,
      fingerprint: outbound.tls.utls?.fingerprint || 'chrome',
      allowInsecure: outbound.tls.insecure === true,
      ...(outbound.tls.alpn ? { alpn: outbound.tls.alpn } : {})
    };
  }
  return {
    log: { loglevel: 'warning' },
    inbounds: [{ listen: '127.0.0.1', port: 2081, protocol: 'socks', settings: { auth: 'noauth', udp: true } }],
    outbounds: [{ tag: 'proxy', protocol, settings: { vnext: [{ address: serverAddress, port: Number(outbound.server_port), users: [user] }] }, streamSettings }, { tag: 'direct', protocol: 'freedom' }]
  };
}

function startCore(binary, args, cwd, onExit) {
  const child = spawn(binary, args, { cwd, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  child.once('error', (error) => emitStatus('error', error.message));
  child.once('exit', (code) => onExit(child, code, stderr));
  return { child, get stderr() { return stderr; } };
}

function waitForLocalPort(port, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const attempt = () => {
      const socket = tcp.createConnection({ host: '127.0.0.1', port });
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started >= timeoutMs) reject(new Error(`Локальный прокси Xray не открыл порт ${port}`));
        else setTimeout(attempt, 150);
      });
    };
    attempt();
  });
}

function emitStatus(status, error = '') {
  lastError = error;
  mainWindow?.webContents.send('vpn:status-changed', { status, connectedAt, error });
}

async function curlThroughTunnel(url, { insecure = false } = {}) {
  return new Promise((resolve, reject) => {
    const args = ['--silent', '--show-error', '--fail', '--max-time', '12', '--proxy', 'http://127.0.0.1:2080'];
    if (insecure) args.push('--insecure');
    args.push(url);
    execFile('curl.exe', args, { windowsHide: true, timeout: 14000 }, (error, stdout, stderr) => {
      if (error) return reject(new Error(stderr.trim() || `запрос через VPN не прошёл (${error.message})`));
      if (!stdout.trim()) return reject(new Error('через VPN не получен ответ'));
      resolve(stdout.trim());
    });
  });
}

async function probeTunnelDns() {
  try {
    // Use an IP URL first so this request does not depend on DNS.
    await curlThroughTunnel('https://1.1.1.1/cdn-cgi/trace', { insecure: true });
  } catch (error) {
    throw new Error(`Проверка маршрута без DNS не прошла: ${error.message}`);
  }
  try {
    return await curlThroughTunnel('https://api.ipify.org/');
  } catch (error) {
    throw new Error(`Маршрут по IP работает, но проверка доменного имени не прошла: ${error.message}`);
  }
}

async function probeTunnelTcp() {
  await probeTunnelDns();
}

async function stopVpn() {
  const children = [singBoxProcess, xrayProcess].filter(Boolean);
  singBoxProcess = null;
  xrayProcess = null;
  await Promise.all(children.map((child) => new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.kill('SIGTERM');
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  })));
  await fs.rm(path.join(app.getPath('userData'), 'active-vpn.json'), { force: true }).catch(() => {});
  await fs.rm(path.join(app.getPath('userData'), 'active-xray.json'), { force: true }).catch(() => {});
  connectedAt = null;
  emitStatus('disconnected');
}

let selectedProfileId = '';

async function connectVpn() {
  if (singBoxProcess && singBoxProcess.exitCode === null) {
    try {
      await probeTunnelTcp();
      return { status: 'connected', connectedAt };
    } catch (error) {
      await stopVpn();
      throw new Error(`VPN-процесс запущен, но проверка связи не прошла: ${error.message}`);
    }
  }
  emitStatus('connecting');
  const profiles = await readProfiles();
  const profile = profiles.find((item) => item.id === selectedProfileId) || profiles[0];
  if (!profile) throw new Error('Сначала добавьте VPN-ссылку в разделе «Профили».');
  const outbound = structuredClone(profile.outbound);
  const useXrayReality = outbound.type === 'vless' && outbound.tls?.reality?.enabled === true;
  const reality = outbound.type === 'vless' && outbound.tls?.reality?.enabled === true;
  if (reality && (!outbound.tls.utls?.enabled || !outbound.tls.utls.fingerprint)) {
    // Apply the same Reality fingerprint default as the Android/Xray importer,
    // including profiles that were stored before the Windows parser fix.
    outbound.tls.utls = { enabled: true, fingerprint: 'chrome' };
  }
  if (reality && !outbound.tls.reality.public_key) {
    throw new Error('В сохранённом профиле Reality нет public key. Удалите профиль и импортируйте подписку заново, чтобы обновить сохранённые параметры.');
  }
  const realitySummary = reality
    ? `Reality-параметры: public key ${outbound.tls.reality.public_key ? 'есть' : 'нет'}, short ID ${outbound.tls.reality.short_id ? 'есть' : 'пустой'}, SNI ${outbound.tls.server_name ? 'есть' : 'нет'}, fingerprint ${outbound.tls.utls?.fingerprint || 'не задан'}.`
    : '';
  const configPath = path.join(app.getPath('userData'), 'active-vpn.json');
  let xrayStderr = '';
  let xrayServerAddress = '';
  if (useXrayReality) {
    const xrayBin = xrayExecutable();
    await fs.access(xrayBin);
    xrayServerAddress = await resolveVpnServerAddress(outbound.server);
    const xrayPath = path.join(app.getPath('userData'), 'active-xray.json');
    const xrayConfig = xrayConfigFromOutbound(outbound, xrayServerAddress);
    await fs.writeFile(xrayPath, JSON.stringify(xrayConfig), { mode: 0o600 });
    const startedXray = startCore(xrayBin, ['run', '-c', xrayPath], xrayDirectory(), (child, code, stderr) => {
      if (xrayProcess !== child) return;
      xrayProcess = null;
      xrayStderr = stderr;
      if (singBoxProcess) { singBoxProcess.kill('SIGTERM'); singBoxProcess = null; }
      connectedAt = null;
      emitStatus('error', stderr.trim() || `Xray завершился с кодом ${code}`);
    });
    xrayProcess = startedXray.child;
    xrayProcess.__stderr = () => startedXray.stderr;
    await waitForLocalPort(2081);
    if (xrayProcess?.exitCode !== null) throw new Error(startedXray.stderr.trim() || 'Xray не запустился');
  }
  const tunnelOutbound = useXrayReality
    ? { type: 'socks', tag: 'proxy', server: '127.0.0.1', server_port: 2081 }
    : outbound;
  const config = {
    log: { level: 'info' },
    dns: {
      // Bootstrap DNS must use the physical network: resolving the VLESS
      // server through DoH-on-proxy creates a circular dependency. User DNS
      // remains on DoH through the VPN outbound.
      servers: [
        { type: 'udp', tag: 'bootstrap', server: '1.1.1.1', server_port: 53 },
        { type: 'https', tag: 'remote', server: '1.1.1.1', path: '/dns-query', detour: 'proxy' }
      ],
      final: 'remote', strategy: 'prefer_ipv4'
    },
    inbounds: [
      { type: 'tun', tag: 'tun-in', interface_name: 'PlanMyNord', address: ['172.19.0.1/30'], auto_route: true, strict_route: true, stack: 'mixed' },
      { type: 'mixed', tag: 'health-proxy', listen: '127.0.0.1', listen_port: 2080 }
    ],
    outbounds: [tunnelOutbound, { type: 'direct', tag: 'direct' }, { type: 'block', tag: 'block' }],
    route: {
      auto_detect_interface: true,
      default_domain_resolver: 'bootstrap',
      final: 'proxy',
      rules: [
        ...(xrayServerAddress ? [{ ip_cidr: [`${xrayServerAddress}/32`], action: 'route', outbound: 'direct' }] : []),
        { action: 'sniff' },
        { protocol: 'dns', action: 'hijack-dns' }
      ]
    }
  };
  await fs.writeFile(configPath, JSON.stringify(config), { mode: 0o600 });
  const binary = singBoxExecutable();
  await fs.access(binary);
  const child = spawn(binary, ['--disable-color', 'run', '--config', configPath], { cwd: singBoxDirectory(), windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  singBoxProcess = child;
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
  child.once('error', (error) => emitStatus('error', error.message));
  child.once('exit', (code) => {
    if (singBoxProcess !== child) return;
    singBoxProcess = null;
    connectedAt = null;
    emitStatus('error', stderr.trim() || `sing-box завершился с кодом ${code}`);
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 1000);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(stderr.trim() || `sing-box завершился с кодом ${code}`)); });
  });
  if (child.exitCode !== null) throw new Error(stderr.trim() || `sing-box завершился с кодом ${child.exitCode}`);
  try {
    await probeTunnelDns();
    if (singBoxProcess !== child || child.exitCode !== null) throw new Error('sing-box завершился во время проверки соединения');
  } catch (error) {
    const coreDetail = [stderr.trim(), xrayProcess?.__stderr?.() || xrayStderr].filter(Boolean).join(' · ');
    await stopVpn();
    throw new Error(`Туннель запустился, но интернет через него не прошёл проверку: ${error.message}${realitySummary ? ` · ${realitySummary}` : ''}${coreDetail ? ` · ${coreDetail}` : ''}`);
  }
  connectedAt = Date.now();
  emitStatus('connected');
  return { status: 'connected', connectedAt, profile: profile.name };
}

app.whenReady().then(() => {
  ipcMain.handle('profile:import', async () => {
    const result = await dialog.showOpenDialog({ title: 'Importer VPN-profil', properties: ['openFile'], filters: [{ name: 'VPN-konfigurasjon', extensions: ['json', 'txt', 'conf'] }, { name: 'Alle filer', extensions: ['*'] }] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return { name: path.basename(result.filePaths[0]), content: await fs.readFile(result.filePaths[0], 'utf8') };
  });
  ipcMain.handle('profiles:list', async () => {
    const profiles = await readProfiles();
    if (!profiles.some((profile) => profile.id === selectedProfileId)) selectedProfileId = profiles[0]?.id || '';
    return profiles.map(({ id, name, protocol, server }) => ({ id, name, protocol, server, selected: id === selectedProfileId }));
  });
  ipcMain.handle('profiles:select', async (_event, id) => {
    const profiles = await readProfiles();
    if (!profiles.some((profile) => profile.id === id)) throw new Error('Профиль не найден');
    selectedProfileId = id;
    return true;
  });
  ipcMain.handle('profiles:remove', async (_event, id) => {
    const profiles = (await readProfiles()).filter((profile) => profile.id !== id);
    await writeProfiles(profiles);
    if (selectedProfileId === id) selectedProfileId = profiles[0]?.id || '';
    return profiles.map(({ id: profileId, name, protocol, server }) => ({ id: profileId, name, protocol, server, selected: profileId === selectedProfileId }));
  });
  async function addProfileLink(input, { selectFirst = false } = {}) {
    const value = String(input || '').trim();
    if (!value) throw new Error('Вставьте ссылку подписки или VPN-конфигурацию');
    let body = value;
    let name = 'VPN-профиль';
    let responseDetails = null;
    if (/^https:\/\//i.test(value)) {
      const url = new URL(value);
      if (url.username || url.password) throw new Error('Ссылка подписки не должна содержать логин или пароль в адресе');
      const response = await net.fetch(url.toString(), { headers: { accept: 'text/plain, application/json;q=0.9, */*;q=0.8' } });
      if (!response.ok) throw new Error(`Не удалось загрузить подписку: HTTP ${response.status}`);
      const finalUrl = new URL(response.url || url);
      if (finalUrl.protocol !== 'https:') throw new Error('Подписка должна оставаться на HTTPS');
      const length = Number(response.headers.get('content-length') || 0);
      if (length > 1024 * 1024) throw new Error('Файл подписки превышает 1 МБ');
      body = await response.text();
      if (Buffer.byteLength(body, 'utf8') > 1024 * 1024) throw new Error('Файл подписки превышает 1 МБ');
      name = url.hostname;
      const finalPath = new URL(response.url || url).pathname.split('/').filter(Boolean);
      responseDetails = {
        status: response.status,
        contentType: response.headers.get('content-type') || 'не указан',
        requestedHost: url.host,
        requestedRouteShape: `/${url.pathname.split('/').filter(Boolean).map((segment) => segment.toLowerCase() === 'sub' ? 'sub' : '…').join('/')}`,
        requestedSubSegments: url.pathname.split('/').filter((segment) => segment.toLowerCase() === 'sub').length,
        host: new URL(response.url || url).host,
        routeShape: `/${finalPath.map((segment) => segment.toLowerCase() === 'sub' ? 'sub' : '…').join('/')}`,
        subSegments: finalPath.filter((segment) => segment.toLowerCase() === 'sub').length
      };
    }
    let additions;
    try { additions = parseSubscription(body, name); }
    catch (error) {
      if (!responseDetails) throw error;
      const trimmed = body.replace(/^\uFEFF/, '').trimStart();
      const format = !trimmed ? 'пустой ответ' : /^<!doctype\s+html|^<html/i.test(trimmed) ? 'HTML-страница' : /^\s*\{/.test(trimmed) ? 'JSON без распознанных профилей' : /^[A-Za-z0-9+/_=-]+$/.test(trimmed) ? 'Base64 без распознанных профилей' : 'текст без распознанных ссылок';
      throw new Error(`${error.message}. Ответ подписки: HTTP ${responseDetails.status}, ${responseDetails.contentType}, ${Buffer.byteLength(body, 'utf8')} байт; формат: ${format}; запрос ${responseDetails.requestedHost}, маршрут ${responseDetails.requestedRouteShape}, сегментов /sub: ${responseDetails.requestedSubSegments}; после перенаправления ${responseDetails.host}, маршрут ${responseDetails.routeShape}, сегментов /sub: ${responseDetails.subSegments}.`);
    }
    const profiles = await readProfiles();
    await writeProfiles([...profiles, ...additions]);
    if (selectFirst || !selectedProfileId) selectedProfileId = additions[0].id;
    return { added: additions.length, addedProfileIds: additions.map((profile) => profile.id), profiles: [...profiles, ...additions].map(({ id, name: profileName, protocol, server }) => ({ id, name: profileName, protocol, server, selected: id === selectedProfileId })) };
  }
  ipcMain.handle('profiles:add-link', (_event, input) => addProfileLink(input));
  ipcMain.handle('account:get', async () => {
    const account = await readAccount();
    if (account?.cookie) {
      const savedSession = await restoreAccountFromCookie(account.cookie);
      if (savedSession) return savedSession;
      await fs.rm(accountFile(), { force: true });
    }
    const loginSession = session.fromPartition(SITE_LOGIN_PARTITION);
    const cookies = await loginSession.cookies.get({ url: API_BASE });
    const sessionCookie = cookies.find((cookie) => cookie.name === 'connect.sid');
    if (sessionCookie?.value) {
      const cookie = `${sessionCookie.name}=${sessionCookie.value}`;
      const siteSession = await restoreAccountFromCookie(cookie);
      if (siteSession) return siteSession;
      await loginSession.clearStorageData({ storages: ['cookies'] });
    }
    return null;
  });
  ipcMain.handle('account:login', (_event, credentials) => accountLogin(credentials.email, credentials.password));
  ipcMain.handle('account:login-website', () => accountLoginViaWebsite());
  ipcMain.handle('account:upload-avatar', (_event, avatarDataUrl) => uploadAccountAvatar(avatarDataUrl));
  ipcMain.handle('account:logout', async () => {
    await fs.rm(accountFile(), { force: true });
    await session.fromPartition(SITE_LOGIN_PARTITION).clearStorageData({ storages: ['cookies'] });
    return true;
  });
  ipcMain.handle('account:refresh-vpn', refreshVpnProfile);
  ipcMain.handle('account:create-vpn-profile', async () => {
    const account = await readAccount();
    if (!account?.cookie) throw new Error('Войдите в аккаунт PlanMyNord.');
    const accountState = await refreshVpnProfile();
    const response = await net.fetch(`${API_BASE}/api/vpn/client-token`, {
      method: 'POST', headers: { cookie: account.cookie, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ deviceId: accountState.device.id })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const subscriptionUrl = new URL(data.subscriptionUrl || data.url);
    if (subscriptionUrl.protocol !== 'https:' || !(subscriptionUrl.hostname === 'vpn.planmynord.com' || subscriptionUrl.hostname.endsWith('.planmynord.com'))) {
      throw new Error('Сервер вернул небезопасную или неизвестную ссылку VPN-подписки.');
    }
    const subscriptionSegments = subscriptionUrl.pathname.split('/').filter(Boolean);
    const hasSubscriptionRoute = subscriptionSegments.some((segment) => segment.toLowerCase() === 'sub');
    if (subscriptionUrl.hostname === 'vpn.planmynord.com' && (subscriptionUrl.port === '8001' || !hasSubscriptionRoute)) {
      throw new Error('Сервер вернул адрес панели VPN вместо ссылки подписки (порт :8001 или отсутствует маршрут /sub/…). Проверьте VPN_SUBSCRIPTION_BASE_URL в .env работающего сервера: HTTPS, порт подписки :2096, путь /sub/…; затем перезапустите службу PlanMyNord командой sudo systemctl restart planmynord и повторите создание профиля.');
    }
    let cached = null;
    try { cached = JSON.parse(await fs.readFile(trialProfileFile(), 'utf8')); } catch {}
    const profiles = await readProfiles();
    let imported;
    let resolvedSubscriptionUrl = subscriptionUrl;
    if (cached?.profileIds?.length && cached.profileIds.every((id) => profiles.some((profile) => profile.id === id))) {
      imported = { added: 0, addedProfileIds: cached.profileIds, profiles: profiles.map(({ id, name, protocol, server }) => ({ id, name, protocol, server, selected: id === selectedProfileId })) };
    } else {
      try {
        imported = await addProfileLink(subscriptionUrl.toString(), { selectFirst: true });
      } catch (error) {
        const segments = subscriptionUrl.pathname.split('/').filter(Boolean);
        const firstSub = segments.findIndex((segment) => segment.toLowerCase() === 'sub');
        const extraSubIndexes = segments.map((segment, index) => segment.toLowerCase() === 'sub' && index > firstSub && index < segments.length - 1 ? index : -1).filter((index) => index >= 0);
        const mayRepairRoute = subscriptionUrl.hostname === 'vpn.planmynord.com' && firstSub >= 0 && extraSubIndexes.length > 0 && /формат: HTML-страница/i.test(error.message);
        if (!mayRepairRoute) throw error;
        let repairError = error;
        for (const index of extraSubIndexes) {
          const correctedUrl = new URL(subscriptionUrl);
          const correctedSegments = segments.filter((_segment, segmentIndex) => segmentIndex !== index);
          correctedUrl.pathname = `/${correctedSegments.join('/')}`;
          try {
            imported = await addProfileLink(correctedUrl.toString(), { selectFirst: true });
            resolvedSubscriptionUrl = correctedUrl;
            break;
          } catch (nextError) { repairError = nextError; }
        }
        if (!imported) throw new Error(`${repairError.message} Автопроверка также убрала повторный сегмент /sub.`);
      }
      await fs.mkdir(app.getPath('userData'), { recursive: true });
      await fs.writeFile(trialProfileFile(), JSON.stringify({ profileIds: imported.addedProfileIds, endsAt: data.endsAt }), { mode: 0o600 });
    }
    const trialProfileIds = imported.addedProfileIds?.length ? imported.addedProfileIds : (cached?.profileIds || []);
    const storedProfiles = await readProfiles();
    const originalName = storedProfiles.find((profile) => trialProfileIds.includes(profile.id))?.name || account.name || account.email.split('@')[0] || 'VPN';
    const cleanName = originalName.replace(/^Norway-/, '').replace(/\s*\|\s*⏳\d+D$/, '');
    const expiresAt = Date.parse(data.endsAt || cached?.endsAt || '');
    const daysLeft = Number.isFinite(expiresAt) ? Math.max(0, Math.floor((expiresAt - Date.now()) / 86_400_000)) : 30;
    const displayName = `Norway-${cleanName}|⏳${daysLeft}D`;
    const renamedProfiles = storedProfiles.map((profile) => trialProfileIds.includes(profile.id) ? { ...profile, name: displayName } : profile);
    if (renamedProfiles.some((profile, index) => profile.name !== storedProfiles[index]?.name)) await writeProfiles(renamedProfiles);
    const resolvedUrl = resolvedSubscriptionUrl.toString();
    let linkCopied = false;
    try {
      clipboard.writeText(resolvedUrl);
      linkCopied = true;
    } catch {}
    return {
      ...imported,
      addedProfileIds: trialProfileIds,
      profiles: renamedProfiles.map(({ id, name, protocol, server }) => ({ id, name, protocol, server, selected: id === selectedProfileId })),
      displayName,
      endsAt: data.endsAt || cached?.endsAt,
      subscriptionUrl: resolvedUrl,
      linkCopied
    };
  });
  ipcMain.handle('account:cancel-vpn-trial', async () => {
    const account = await readAccount();
    if (!account?.cookie) throw new Error('Войдите в аккаунт PlanMyNord.');
    const accountState = await refreshVpnProfile();
    const response = await net.fetch(`${API_BASE}/api/vpn/client-token/revoke`, {
      method: 'POST', headers: { cookie: account.cookie, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ deviceId: accountState.device.id })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    let cached = null;
    try { cached = JSON.parse(await fs.readFile(trialProfileFile(), 'utf8')); } catch {}
    let profiles = await readProfiles();
    if (cached?.profileIds?.length) {
      if (cached.profileIds.includes(selectedProfileId) && singBoxProcess) await stopVpn();
      profiles = profiles.filter((profile) => !cached.profileIds.includes(profile.id));
      await writeProfiles(profiles);
      if (cached.profileIds.includes(selectedProfileId)) selectedProfileId = profiles[0]?.id || '';
    }
    await fs.rm(trialProfileFile(), { force: true });
    return { ...data, profiles: profiles.map(({ id, name, protocol, server }) => ({ id, name, protocol, server, selected: id === selectedProfileId })) };
  });
  ipcMain.handle('account:copy-vpn-trial-link', async (_event, value) => {
    const url = new URL(String(value || ''));
    if (url.protocol !== 'https:' || !(url.hostname === 'vpn.planmynord.com' || url.hostname.endsWith('.planmynord.com'))) throw new Error('Недопустимая ссылка VPN-подписки.');
    clipboard.writeText(url.toString());
    return true;
  });
  ipcMain.handle('account:register', async () => { await shell.openExternal('https://planmynord.com/account'); return true; });
  ipcMain.handle('account:payment', async (_event, provider) => {
    const account = await readAccount();
    if (!account?.cookie) throw new Error('Войдите в аккаунт PlanMyNord.');
    const route = provider === 'vipps' ? '/api/vpn/payment/vipps/create' : '/api/vpn/payment/card/create';
    const response = await net.fetch(`${API_BASE}${route}`, { method: 'POST', headers: { cookie: account.cookie, accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const url = new URL(data.url);
    if (!['checkout.stripe.com', 'pay.vipps.no'].includes(url.hostname) && !url.hostname.endsWith('.vipps.no')) throw new Error('Неожиданный адрес оплаты.');
    await shell.openExternal(url.toString());
    return true;
  });
  ipcMain.handle('account:vpn-product', async () => {
    const account = await readAccount();
    if (!account?.cookie) throw new Error('Войдите в аккаунт PlanMyNord.');
    const response = await net.fetch(`${API_BASE}/api/vpn/product`, { headers: { cookie: account.cookie, accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  });
  ipcMain.handle('vpn:connect', async () => {
    try { return await connectVpn(); }
    catch (error) { await stopVpn(); emitStatus('error', error.message); return { status: 'error', error: error.message }; }
  });
  ipcMain.handle('vpn:disconnect', async () => { await stopVpn(); return { status: 'disconnected' }; });
  ipcMain.handle('vpn:status', () => ({ status: singBoxProcess ? 'connected' : 'disconnected', connectedAt, error: lastError }));
  ipcMain.handle('external:open', async (_event, url) => {
    if (!new Set(['https://planmynord.com/', 'https://planmynord.com/privacy.html', 'https://planmynord.com/account', 'https://planmynord.com/profile']).has(url)) throw new Error('URL is not allowed');
    await shell.openExternal(url); return true;
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => { if (singBoxProcess) singBoxProcess.kill('SIGTERM'); if (xrayProcess) xrayProcess.kill('SIGTERM'); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
