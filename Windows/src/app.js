const translations = {
  no: {
    'nav.overview': 'Oversikt', 'nav.profiles': 'Profiler', 'nav.account': 'Konto', 'nav.settings': 'Innstillinger',
    'core.missing': 'Xray-kjerne innebygd', 'header.eyebrow': 'Sikker tilgang',
    'connection.autoNorway': 'Norge · Automatisk', 'connection.heading': 'Tilkobling',
    'connection.protocol': 'Protokoll', 'connection.xrayMissing': 'Xray · ikke konfigurert',
    'connection.ip': 'IP-adresse', 'connection.duration': 'Varighet',
    'connection.offline': 'Ikke tilkoblet', 'connection.online': 'VPN tilkoblet',
    'connection.ready': 'Klar når du er', 'connection.demoActive': 'Tilkoblingen er beskyttet',
    'connection.readyCopy': 'Velg en profil og koble sikkert til din private VPN.',
    'connection.demoCopy': 'Nettverkstrafikken går gjennom PlanMyNord VPN.',
    'profile.selectedLabel': 'Valgt profil', 'profile.demoNorway': 'Demo · Norge', 'common.change': 'Endre',
    'traffic.heading': 'Trafikk', 'traffic.lastSession': 'Siste økt', 'traffic.download': 'Nedlasting', 'traffic.upload': 'Opplasting',
    'demo.heading': 'Prototypemodus', 'demo.copy': 'Knappen demonstrerer brukerflyten, men oppretter ikke en ekte VPN-forbindelse ennå.',
    'profiles.eyebrow': 'Konfigurasjon', 'profiles.heading': 'VPN-profiler', 'profiles.import': 'Importer profil',
    'profiles.demoDescription': 'Eksempelprofil · ingen hemmeligheter lagret', 'profiles.chosen': 'Valgt',
    'profiles.imported': 'Importert lokalt', 'profiles.ready': 'Klar', 'profiles.importFile': 'Importer fil',
    'profiles.addLink': 'Legg til VPN via lenke', 'profiles.linkHint': 'Abonnement eller en VLESS-, VMess-, Trojan-, Shadowsocks-, Hysteria2- eller TUIC-lenke fra en valgfri leverandør.',
    'profiles.add': 'Legg til', 'profiles.noneSelected': 'Ingen profil valgt', 'profiles.connectionTitle': 'System-VPN-tilkobling',
    'profiles.connectionHint': 'TUN krever en kompatibel profil. Windows kan be om administratorrettigheter for VPN-adapteren.',
    'profiles.subscription': '3x-ui-abonnement', 'profiles.subscriptionHint': 'Lagres bare på denne PC-en og bygges aldri inn i appen.', 'profiles.saveSubscription': 'Lagre', 'profiles.subscriptionSaved': 'Abonnement lagret lokalt.', 'profiles.subscriptionInvalid': 'Skriv inn en gyldig HTTPS-abonnementslenke.',
    'settings.eyebrow': 'Program', 'settings.startWindows': 'Start med Windows',
    'settings.startWindowsCopy': 'Lanser klienten etter innlogging', 'settings.autoConnect': 'Automatisk tilkobling',
    'settings.autoConnectCopy': 'Koble til sist brukte profil', 'settings.killSwitchCopy': 'Blokker trafikk hvis VPN-forbindelsen faller ut',
    'settings.privacy': 'Personvern på planmynord.com', 'footer.version': 'PlanMyNord VPN · prototype 0.1.0',
    'footer.offline': 'Ingen aktiv forbindelse', 'footer.online': 'VPN-tilkobling aktiv'
  },
  ru: {
    'nav.overview': 'Обзор', 'nav.profiles': 'Профили', 'nav.account': 'Аккаунт', 'nav.settings': 'Настройки',
    'core.missing': 'Ядро Xray встроено', 'header.eyebrow': 'Безопасный доступ',
    'connection.autoNorway': 'Норвегия · Автоматически', 'connection.heading': 'Подключение',
    'connection.protocol': 'Протокол', 'connection.xrayMissing': 'Xray · не настроен',
    'connection.ip': 'IP-адрес', 'connection.duration': 'Длительность',
    'connection.offline': 'Не подключено', 'connection.online': 'VPN подключён',
    'connection.ready': 'Готово к подключению', 'connection.demoActive': 'Подключение защищено',
    'connection.readyCopy': 'Выберите профиль и безопасно подключитесь к своему VPN.',
    'connection.demoCopy': 'Сетевой трафик проходит через PlanMyNord VPN.',
    'profile.selectedLabel': 'Выбранный профиль', 'profile.demoNorway': 'Демо · Норвегия', 'common.change': 'Изменить',
    'traffic.heading': 'Трафик', 'traffic.lastSession': 'Последняя сессия', 'traffic.download': 'Загрузка', 'traffic.upload': 'Отдача',
    'demo.heading': 'Режим прототипа', 'demo.copy': 'Кнопка демонстрирует интерфейс, но пока не создаёт настоящее VPN-подключение.',
    'profiles.eyebrow': 'Конфигурация', 'profiles.heading': 'VPN-профили', 'profiles.import': 'Импортировать профиль',
    'profiles.demoDescription': 'Пример профиля · секреты не сохранены', 'profiles.chosen': 'Выбран',
    'profiles.imported': 'Добавлен локально', 'profiles.ready': 'Готов', 'profiles.importFile': 'Импорт файла',
    'profiles.addLink': 'Добавить VPN по ссылке', 'profiles.linkHint': 'Подписка или одиночная ссылка VLESS, VMess, Trojan, Shadowsocks, Hysteria2 или TUIC от любого провайдера.',
    'profiles.add': 'Добавить', 'profiles.noneSelected': 'Профиль не выбран', 'profiles.connectionTitle': 'Системное VPN-подключение',
    'profiles.connectionHint': 'Для TUN нужен совместимый профиль. Windows может запросить права администратора для VPN-адаптера.',
    'profiles.subscription': 'Подписка 3x-ui', 'profiles.subscriptionHint': 'Хранится только на этом ПК и не встраивается в программу.', 'profiles.saveSubscription': 'Сохранить', 'profiles.subscriptionSaved': 'Подписка сохранена локально.', 'profiles.subscriptionInvalid': 'Введите корректную HTTPS-ссылку подписки.',
    'settings.eyebrow': 'Приложение', 'settings.startWindows': 'Запускать с Windows',
    'settings.startWindowsCopy': 'Запускать клиент после входа в систему', 'settings.autoConnect': 'Автоподключение',
    'settings.autoConnectCopy': 'Подключаться к последнему профилю', 'settings.killSwitchCopy': 'Блокировать трафик при разрыве VPN',
    'settings.privacy': 'Конфиденциальность на planmynord.com', 'footer.version': 'PlanMyNord VPN · прототип 0.1.0',
    'footer.offline': 'Нет активного подключения', 'footer.online': 'VPN-подключение активно'
  },
  en: {
    'nav.overview': 'Overview', 'nav.profiles': 'Profiles', 'nav.account': 'Account', 'nav.settings': 'Settings',
    'core.missing': 'Xray core bundled', 'header.eyebrow': 'Secure access',
    'connection.autoNorway': 'Norway · Automatic', 'connection.heading': 'Connection',
    'connection.protocol': 'Protocol', 'connection.xrayMissing': 'Xray · not configured',
    'connection.ip': 'IP address', 'connection.duration': 'Duration',
    'connection.offline': 'Not connected', 'connection.online': 'VPN connected',
    'connection.ready': 'Ready when you are', 'connection.demoActive': 'Connection protected',
    'connection.readyCopy': 'Choose a profile and connect securely to your private VPN.',
    'connection.demoCopy': 'Network traffic is routed through PlanMyNord VPN.',
    'profile.selectedLabel': 'Selected profile', 'profile.demoNorway': 'Demo · Norway', 'common.change': 'Change',
    'traffic.heading': 'Traffic', 'traffic.lastSession': 'Last session', 'traffic.download': 'Download', 'traffic.upload': 'Upload',
    'demo.heading': 'Prototype mode', 'demo.copy': 'The button demonstrates the user flow but does not create a real VPN connection yet.',
    'profiles.eyebrow': 'Configuration', 'profiles.heading': 'VPN profiles', 'profiles.import': 'Import profile',
    'profiles.demoDescription': 'Example profile · no secrets stored', 'profiles.chosen': 'Selected',
    'profiles.imported': 'Added locally', 'profiles.ready': 'Ready', 'profiles.importFile': 'Import file',
    'profiles.addLink': 'Add VPN from link', 'profiles.linkHint': 'A subscription or a single VLESS, VMess, Trojan, Shadowsocks, Hysteria2, or TUIC link from any provider.',
    'profiles.add': 'Add', 'profiles.noneSelected': 'No profile selected', 'profiles.connectionTitle': 'System VPN connection',
    'profiles.connectionHint': 'TUN requires a compatible profile. Windows may ask for administrator permission for the VPN adapter.',
    'profiles.subscription': '3x-ui subscription', 'profiles.subscriptionHint': 'Stored only on this PC and never embedded into the app.', 'profiles.saveSubscription': 'Save', 'profiles.subscriptionSaved': 'Subscription saved locally.', 'profiles.subscriptionInvalid': 'Enter a valid HTTPS subscription URL.',
    'settings.eyebrow': 'Application', 'settings.startWindows': 'Start with Windows',
    'settings.startWindowsCopy': 'Launch the client after sign-in', 'settings.autoConnect': 'Auto-connect',
    'settings.autoConnectCopy': 'Connect to the last used profile', 'settings.killSwitchCopy': 'Block traffic if the VPN connection drops',
    'settings.privacy': 'Privacy at planmynord.com', 'footer.version': 'PlanMyNord VPN · prototype 0.1.0',
    'footer.offline': 'No active connection', 'footer.online': 'VPN connection active'
  }
};

const state = { connected: false, startedAt: null, timer: null, importedProfiles: [], profiles: [], selectedProfile: null, connectionMessage: '', language: localStorage.getItem('planmynord-language') || 'no' };
const views = { home: document.querySelector('#homeView'), profiles: document.querySelector('#profilesView'), settings: document.querySelector('#settingsView'), account: document.querySelector('#accountView') };
const connectButton = document.querySelector('#connectButton');
const connectHint = document.querySelector('#connectionCopy');
const stateBadge = document.querySelector('#stateBadge');
const connectionTitle = document.querySelector('#connectionTitle');
const connectionCopy = document.querySelector('#connectionCopy');
const duration = document.querySelector('#duration');
const footerMessage = document.querySelector('#footerMessage');
const profileList = document.querySelector('#profileList');
const subscriptionStatus = document.querySelector('#subscriptionStatus');
const accountStatus = document.querySelector('#accountStatus');

function setAccountStatus(message, tone = 'info') {
  accountStatus.textContent = message;
  accountStatus.dataset.tone = message ? tone : '';
}

function t(key) { return translations[state.language]?.[key] || translations.no[key] || key; }

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('.language-button').forEach((button) => button.classList.toggle('active', button.dataset.language === state.language));
  document.querySelectorAll('.imported-description').forEach((element) => { element.textContent = t('profiles.imported'); });
  document.querySelectorAll('.imported-status').forEach((element) => { element.textContent = t('profiles.ready'); });
  renderConnection(false);
}

function setView(name) {
  Object.entries(views).forEach(([key, element]) => element.classList.toggle('active', key === name));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === name));
}

function renderProfiles(profiles = []) {
  state.profiles = profiles;
  state.selectedProfile = profiles.find((profile) => profile.selected) || profiles[0] || null;
  profileList.replaceChildren();
  if (!profiles.length) {
    const empty = document.createElement('article');
    empty.className = 'profile-row';
    const note = document.createElement('span');
    note.textContent = state.language === 'en' ? 'Add a subscription link or a single server link to get started.' : state.language === 'no' ? 'Legg til en abonnementlenke eller serverlenke for å starte.' : 'Добавьте ссылку подписки или ссылку сервера, чтобы начать.';
    note.style.gridColumn = '1 / -1';
    empty.append(note);
    profileList.append(empty);
  }
  for (const profile of profiles) {
    const row = document.createElement('article');
    row.className = `profile-row${profile.selected ? ' selected' : ''}`;
    const flag = document.createElement('div');
    flag.className = 'flag';
    flag.textContent = profile.protocol.toUpperCase().slice(0, 3);
    const detail = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = profile.name;
    const meta = document.createElement('span');
    meta.textContent = `${profile.protocol.toUpperCase()} · ${profile.server}`;
    detail.append(title, meta);
    const actions = document.createElement('div');
    actions.className = 'profile-actions';
    const select = document.createElement('button');
    select.className = 'button compact';
    select.textContent = profile.selected ? (state.language === 'en' ? 'Selected' : state.language === 'no' ? 'Valgt' : 'Выбран') : (state.language === 'en' ? 'Select' : state.language === 'no' ? 'Velg' : 'Выбрать');
    select.addEventListener('click', async () => {
      await window.planMyNord.selectProfile(profile.id);
      renderProfiles(await window.planMyNord.listProfiles());
    });
    const remove = document.createElement('button');
    remove.className = 'button compact ghost';
    remove.textContent = state.language === 'en' ? 'Remove' : state.language === 'no' ? 'Fjern' : 'Удалить';
    remove.addEventListener('click', async () => renderProfiles(await window.planMyNord.removeProfile(profile.id)));
    actions.append(select, remove);
    row.append(flag, detail, actions);
    profileList.append(row);
  }
  const label = state.selectedProfile?.name || t('profiles.noneSelected');
  document.querySelector('#selectedProfile').textContent = label;
  document.querySelector('#profileName').textContent = state.selectedProfile ? `${state.selectedProfile.protocol.toUpperCase()} · ${state.selectedProfile.server}` : t('profiles.noneSelected');
}

function formatDuration(startedAt) {
  const total = Math.floor((Date.now() - startedAt) / 1000);
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((value) => String(value).padStart(2, '0')).join(':');
}

function renderConnection(resetTimer = true) {
  connectButton.classList.toggle('connected', state.connected);
  stateBadge.className = `badge ${state.connected ? 'online' : 'offline'}`;
  stateBadge.textContent = t(state.connected ? 'connection.online' : 'connection.offline');
  connectionTitle.textContent = t(state.connected ? 'connection.demoActive' : 'connection.ready');
  connectionCopy.textContent = state.connectionMessage || t(state.connected ? 'connection.demoCopy' : 'connection.readyCopy');
  footerMessage.textContent = t(state.connected ? 'footer.online' : 'footer.offline');

  if (!resetTimer) return;
  clearInterval(state.timer);
  state.timer = null;
  if (state.connected) {
    state.startedAt = Date.now();
    duration.textContent = '00:00:00';
    state.timer = setInterval(() => { duration.textContent = formatDuration(state.startedAt); }, 1000);
  } else duration.textContent = '00:00:00';
}

connectButton.addEventListener('click', async () => {
  if (!window.planMyNord) return;
  connectButton.disabled = true;
  state.connectionMessage = state.connected ? 'Отключение VPN…' : 'Подключение VPN…';
  subscriptionStatus.textContent = state.connectionMessage;
  renderConnection(false);
  try {
    const result = state.connected ? await window.planMyNord.disconnectVpn() : await window.planMyNord.connectVpn();
    state.connected = result.status === 'connected';
    state.connectionMessage = result.error || (state.connected ? `Подключено: ${result.profile || state.selectedProfile?.name || 'VPN'}` : 'VPN отключён.');
    subscriptionStatus.textContent = state.connectionMessage;
  } catch (error) {
    state.connectionMessage = error.message;
    subscriptionStatus.textContent = error.message;
    if (error.message.includes('Сначала добавьте VPN-ссылку')) setView('profiles');
  } finally {
    connectButton.disabled = false;
    renderConnection();
  }
});
document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => {
  state.language = button.dataset.language;
  localStorage.setItem('planmynord-language', state.language);
  applyLanguage();
}));
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => setView(item.dataset.view)));
document.querySelector('#changeProfile').addEventListener('click', () => setView('profiles'));
document.querySelector('#importProfile').addEventListener('click', async () => {
  if (!window.planMyNord) return;
  const imported = await window.planMyNord.importProfile();
  if (!imported) return;
  try {
    const result = await window.planMyNord.addProfileLink(imported.content);
    renderProfiles(result.profiles);
    document.querySelector('#profileLinkStatus').textContent = `Добавлено профилей: ${result.added}`;
  } catch (error) { document.querySelector('#profileLinkStatus').textContent = error.message; }
});

document.querySelector('#profileLinkForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#profileLink');
  const status = document.querySelector('#profileLinkStatus');
  status.textContent = 'Загружаю и проверяю профиль…';
  try {
    const result = await window.planMyNord.addProfileLink(input.value);
    renderProfiles(result.profiles);
    input.value = '';
    status.textContent = `Добавлено профилей: ${result.added}`;
  } catch (error) { status.textContent = error.message; }
});

document.querySelector('#openWebsite').addEventListener('click', () => window.planMyNord?.openExternal('https://planmynord.com/'));
document.querySelector('#privacyLink').addEventListener('click', () => window.planMyNord?.openExternal('https://planmynord.com/privacy.html'));
document.querySelector('#loginAccount').addEventListener('click', async () => {
  const email = document.querySelector('#accountEmailInput').value.trim();
  const password = document.querySelector('#accountPasswordInput').value;
  setAccountStatus('Выполняется вход…');
  try {
    await window.planMyNord.loginAccount({ email, password });
    await initializeAccount();
  } catch (error) { setAccountStatus(error.message, 'error'); }
});
document.querySelector('#registerAccount').addEventListener('click', () => window.planMyNord?.registerAccount());
document.querySelector('#payVpnCard').addEventListener('click', async () => {
  setAccountStatus('Открываю защищённую страницу оплаты Stripe…');
  try { await window.planMyNord.startVpnPayment('card'); setAccountStatus('Страница оплаты открыта в браузере. После оплаты вернитесь сюда и обновите статус.', 'success'); }
  catch (error) { setAccountStatus(error.message, 'error'); }
});
document.querySelector('#createVpnProfile').addEventListener('click', async () => {
  const button = document.querySelector('#createVpnProfile');
  const cancelButton = document.querySelector('#cancelVpnTrial');
  button.disabled = true;
  setAccountStatus('Создаю персональный VPN-профиль на 30 дней…');
  try {
    const result = await window.planMyNord.createVpnProfile();
    renderProfiles(result.profiles);
    const linkRow = document.querySelector('#vpnTrialLinkRow');
    document.querySelector('#vpnTrialLink').value = result.subscriptionUrl;
    linkRow.hidden = false;
    document.querySelector('#vpnTrialStatus').textContent = `Профиль создан · доступ до ${new Date(result.endsAt).toLocaleDateString()}`;
    cancelButton.disabled = false;
    setAccountStatus('VPN-профиль добавлен в раздел «Профили».', 'success');
  } catch (error) { setAccountStatus(error.message, 'error'); }
  finally { button.disabled = false; }
});
document.querySelector('#cancelVpnTrial').addEventListener('click', async () => {
  const button = document.querySelector('#cancelVpnTrial');
  button.disabled = true;
  setAccountStatus('Отзываю пробный VPN-доступ…');
  try {
    const result = await window.planMyNord.cancelVpnTrial();
    renderProfiles(result.profiles || []);
    document.querySelector('#vpnTrialLinkRow').hidden = true;
    document.querySelector('#vpnTrialLink').value = '';
    document.querySelector('#vpnTrialStatus').textContent = 'Пробный доступ отменён, созданный профиль удалён.';
    setAccountStatus('VPN-доступ отключён.', 'info');
  } catch (error) { setAccountStatus(error.message, 'error'); button.disabled = false; }
});
document.querySelector('#copyVpnTrialLink').addEventListener('click', async () => {
  try { await window.planMyNord.copyVpnTrialLink(document.querySelector('#vpnTrialLink').value); setAccountStatus('Ссылка скопирована.', 'success'); }
  catch (error) { setAccountStatus(error.message, 'error'); }
});
document.querySelector('#payVpnVipps').addEventListener('click', async () => {
  try { await window.planMyNord.startVpnPayment('vipps'); } catch (error) { setAccountStatus(error.message, 'error'); }
});
document.querySelector('#refreshAccount').addEventListener('click', async () => {
  setAccountStatus('Обновление VPN-профиля…');
  try {
    const result = await window.planMyNord.refreshVpnProfile();
    setAccountStatus(`${result.plan} · ${result.device?.name || 'Windows'}`, 'success');
  } catch (error) { setAccountStatus(error.message, 'error'); }
});
document.querySelector('#logoutAccount').addEventListener('click', async () => {
  await window.planMyNord.logoutAccount();
  document.querySelector('#accountEmailInput').value = '';
  document.querySelector('#accountPasswordInput').value = '';
  await initializeAccount();
});
applyLanguage();

async function initializeVpn() {
  if (!window.planMyNord) return;
  const current = await window.planMyNord.getVpnStatus();
  state.connected = current.status === 'connected';
  renderConnection();
  window.planMyNord.onVpnStatus((next) => {
    state.connected = next.status === 'connected';
    if (next.error) state.connectionMessage = next.error;
    else if (next.status === 'connected') state.connectionMessage = 'VPN подключён.';
    else if (next.status === 'disconnected') state.connectionMessage = '';
    subscriptionStatus.textContent = state.connectionMessage;
    renderConnection();
  });
}

async function initializeAccount() {
  const signedIn = document.querySelector('#signedInAccount');
  const signedOut = document.querySelector('#signedOutAccount');
  try {
    const account = await window.planMyNord?.getAccount();
    signedIn.hidden = !account;
    signedOut.hidden = Boolean(account);
    document.querySelector('#vpnPaymentActions').hidden = !account;
    document.querySelector('#vpnTrialActions').hidden = !account?.user?.vpnPreview;
    document.querySelector('#accountHint').hidden = Boolean(account);
    if (account) {
      document.querySelector('#accountName').textContent = account.name;
      document.querySelector('#accountEmail').textContent = account.email;
      try {
        const result = await window.planMyNord.refreshVpnProfile();
        document.querySelector('#accountPlan').textContent = `${result.plan} · ${result.device?.name || 'Windows'}`;
        renderPaymentState(result.payment);
        if (account.user?.vpnPreview && result.trialProfile?.active) {
          document.querySelector('#cancelVpnTrial').disabled = false;
          document.querySelector('#vpnTrialStatus').textContent = `Пробный VPN-доступ активен до ${new Date(result.trialProfile.endsAt).toLocaleDateString()}.`;
        } else if (account.user?.vpnPreview) {
          document.querySelector('#cancelVpnTrial').disabled = true;
          document.querySelector('#vpnTrialStatus').textContent = 'Пробный доступ не активен.';
        }
      } catch (error) {
        document.querySelector('#accountPlan').textContent = error.message;
        renderPaymentState(null);
      }
    }
    if (account) {
      try {
        const vpnProduct = await window.planMyNord?.getVpnProduct();
        if (vpnProduct?.product) {
          const product = vpnProduct.product;
          document.querySelector('#vpnPriceText').textContent = `${product.name} · ${product.priceNok} NOK · ${product.durationDays} дней · до ${product.deviceLimit} устройств`;
          document.querySelector('#payVpnCard').disabled = !vpnProduct.providers?.stripe || !vpnProduct.configured;
          document.querySelector('#payVpnVipps').disabled = !vpnProduct.providers?.vipps || !vpnProduct.configured;
          if (!vpnProduct.configured) setAccountStatus('Оплата включится после подключения серверной выдачи VPN-профилей.', 'info');
        }
      } catch (error) {
        setAccountStatus(`Не удалось загрузить тариф сайта: ${error.message}. Импортированные профили доступны независимо от аккаунта.`, 'error');
      }
    }
  } catch (error) {
    signedIn.hidden = true;
    signedOut.hidden = false;
    document.querySelector('#vpnPaymentActions').hidden = true;
    document.querySelector('#vpnTrialActions').hidden = true;
    document.querySelector('#accountHint').hidden = false;
    setAccountStatus(error.message, 'error');
    if (connectHint) connectHint.textContent = error.message;
  }
}

function renderPaymentState(payment) {
  const element = document.querySelector('#paymentState');
  element.className = `payment-state ${payment ? (payment.paid ? 'paid' : 'unpaid') : 'unknown'}`;
  if (!payment) element.textContent = 'Статус оплаты неизвестен';
  else if (payment.paid) element.textContent = `Оплачено${payment.endsAt ? ` · действует до ${new Date(payment.endsAt).toLocaleDateString()}` : ''}`;
  else element.textContent = 'Не оплачено · VPN-доступ не активен';
}

initializeVpn();
initializeAccount();
window.planMyNord?.listProfiles().then(renderProfiles).catch((error) => { document.querySelector('#profileLinkStatus').textContent = error.message; });
