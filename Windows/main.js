const { app, BrowserWindow, ipcMain, dialog, shell, net, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');

let mainWindow;
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
const API_BASE = 'https://planmynord.com';

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
  const plan = entitlement.plan === 'vpn' && entitlement.status === 'active'
    ? `VPN · до ${entitlement.endsAt || 'не ограничено'}`
    : 'Доступ не оплачен';
  return { subscription: entitlement, device, plan };
}

function decodeSubscription(value) {
  const text = String(value || '').trim();
  if (/^(vless|vmess|trojan):\/\//m.test(text)) return text;
  try { return Buffer.from(text.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'); }
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

function subscriptionOutbound(body) {
  const link = decodeSubscription(body).split(/\r?\n/).map((line) => line.trim()).find((line) => /^(vless|vmess|trojan):\/\//i.test(line));
  if (!link) throw new Error('Subscription has no supported Xray profile');
  return parseOutbound(link);
}

const xrayDirectory = () => app.isPackaged ? path.join(process.resourcesPath, 'xray') : path.join(__dirname, 'vendor', 'xray');

function emitStatus(status, error = '') {
  lastError = error;
  mainWindow?.webContents.send('vpn:status-changed', { status, connectedAt, error });
}

async function stopVpn() {
  if (xrayProcess) {
    const child = xrayProcess;
    xrayProcess = null;
    child.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
  }
  connectedAt = null;
  emitStatus('disconnected');
}

async function connectVpn() {
  if (xrayProcess) return { status: 'connected', connectedAt };
  emitStatus('connecting');
  const account = await readAccount();
  if (!account?.cookie) throw new Error('Сначала войдите в общий аккаунт PlanMyNord.');
  const accountState = await refreshVpnProfile();
  if (accountState.subscription.plan !== 'vpn' || accountState.subscription.status !== 'active'
      || (accountState.subscription.endsAt && Date.parse(accountState.subscription.endsAt) <= Date.now())) {
    throw new Error('VPN-доступ не оплачен или срок подписки завершился. Откройте сайт и оплатите тариф.');
  }
  throw new Error('Оплаченный аккаунт готов. Серверный профиль VPN пока не подключён к сайту.');
  return { status: 'error', error: 'Сервер VPN не подключён.' };
}

app.whenReady().then(() => {
  ipcMain.handle('profile:import', async () => {
    const result = await dialog.showOpenDialog({ title: 'Importer VPN-profil', properties: ['openFile'], filters: [{ name: 'VPN-konfigurasjon', extensions: ['json', 'txt', 'conf'] }, { name: 'Alle filer', extensions: ['*'] }] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return { name: path.basename(result.filePaths[0]), content: await fs.readFile(result.filePaths[0], 'utf8') };
  });
  ipcMain.handle('account:get', async () => {
    const account = await readAccount();
    if (!account) return null;
    try {
      const response = await net.fetch(`${API_BASE}/api/me`, { headers: { cookie: account.cookie, accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      const updated = { ...account, name: data.user.name, email: data.user.email };
      await writeAccount(updated);
      return { name: updated.name, email: updated.email, user: data.user };
    } catch (error) { await fs.rm(accountFile(), { force: true }); throw error; }
  });
  ipcMain.handle('account:login', (_event, credentials) => accountLogin(credentials.email, credentials.password));
  ipcMain.handle('account:logout', async () => { await fs.rm(accountFile(), { force: true }); return true; });
  ipcMain.handle('account:refresh-vpn', refreshVpnProfile);
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
    const response = await net.fetch(`${API_BASE}/api/vpn/product`, { headers: { accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  });
  ipcMain.handle('vpn:connect', async () => {
    try { return await connectVpn(); }
    catch (error) { await stopVpn(); emitStatus('error', error.message); return { status: 'error', error: error.message }; }
  });
  ipcMain.handle('vpn:disconnect', async () => { await stopVpn(); return { status: 'disconnected' }; });
  ipcMain.handle('vpn:status', () => ({ status: xrayProcess ? 'connected' : 'disconnected', connectedAt, error: lastError }));
  ipcMain.handle('external:open', async (_event, url) => {
    if (!new Set(['https://planmynord.com/', 'https://planmynord.com/privacy.html', 'https://planmynord.com/account', 'https://planmynord.com/profile']).has(url)) throw new Error('URL is not allowed');
    await shell.openExternal(url); return true;
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => { if (xrayProcess) xrayProcess.kill('SIGTERM'); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
