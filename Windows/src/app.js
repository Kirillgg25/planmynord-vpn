const translations = {
  no: {
    'aria.mainMenu': 'Hovedmeny', 'aria.language': 'Språk', 'aria.connect': 'Koble til', 'aria.profileLink': 'Abonnementslenke eller serverlenke', 'aria.subscriptionLink': 'VPN-abonnementslenke',
    'notice.windows': 'Windows kan be om administratorrettigheter for å opprette VPN-adapteren.',
    'profiles.empty': 'Legg til et abonnement eller en serverlenke for å starte.', 'profiles.selected': 'Valgt', 'profiles.select': 'Velg', 'profiles.remove': 'Fjern', 'profiles.adding': 'Laster ned og kontrollerer profilen…', 'profiles.addedCount': 'Profiler lagt til: {count}',
    'connection.connecting': 'Kobler til VPN…', 'connection.disconnecting': 'Kobler fra VPN…', 'connection.connectedAs': 'Tilkoblet: {name}', 'connection.disconnected': 'VPN frakoblet.',
    'account.title': 'Felles konto for nettstedet og VPN', 'account.hint': 'Logg inn på nettstedskontoen for å administrere VPN-abonnementet og enhetene dine.', 'account.paymentChecking': 'Kontrollerer betalingsstatus…',
    'account.refresh': 'Oppdater konto', 'account.logout': 'Logg ut', 'account.changeAvatar': 'Last opp avatar', 'account.avatarSaved': 'Profilbildet er oppdatert på kontoen din.', 'account.email': 'E-postadresse', 'account.password': 'Passord', 'account.passwordPlaceholder': 'Skriv inn passord', 'account.login': 'Logg inn', 'account.websiteLogin': 'Logg inn via nettstedet / Google', 'account.websiteLoginCopy': 'Logg inn med e-post og passord, eller bruk den sikre PlanMyNord-nettsiden.', 'account.register': 'Opprett konto',
    'account.priceDefault': 'PlanMyNord VPN-abonnement', 'account.payCard': 'Betal med kort', 'account.payVipps': 'Betal med Vipps', 'account.trialHeading': 'Test VPN · 30 dager', 'account.trialCopy': 'Lager en fungerende profil på kontoen din. Ingen betaling belastes.', 'account.createProfile': 'Opprett VPN-profil', 'account.cancelTrial': 'Avbryt prøvetilgang', 'account.copyLink': 'Kopier lenke',
    'account.loginProgress': 'Åpner PlanMyNord for innlogging…', 'account.openingPayment': 'Åpner en sikker Stripe-betalingsside…', 'account.paymentOpened': 'Betalingssiden åpnet i nettleseren. Gå tilbake hit etter betaling og oppdater statusen.', 'account.profilePreparing': 'Klargjør VPN-profilen din…', 'account.profileCreatedUntil': 'Profil opprettet · tilgang til {date}', 'account.profileCopied': 'Profilen «{name}» er klar. Lenken er kopiert.', 'account.profileCopyFailed': 'Profilen «{name}» er klar, men lenken kunne ikke kopieres.', 'account.revokingTrial': 'Avslutter prøvetilgangen…', 'account.trialCancelled': 'Prøvetilgangen er avbrutt, og profilen er fjernet.', 'account.accessDisabled': 'VPN-tilgangen er slått av.', 'account.linkCopied': 'Lenken er kopiert.', 'account.refreshing': 'Oppdaterer VPN-profilen…', 'account.updated': 'Konto oppdatert · {device}', 'account.trialActiveUntil': 'VPN-prøvetilgang aktiv til {date}.', 'account.trialInactive': 'Ingen aktiv prøvetilgang.',
    'account.productPrice': '{name} · {price} NOK · {days} dager · opptil {devices} enheter', 'account.productNotConfigured': 'Betaling blir tilgjengelig når VPN-profillevering er konfigurert på serveren.', 'account.productLoadFailed': 'Kunne ikke hente nettstedets abonnement: {error}. Importerte profiler er fortsatt tilgjengelige.',
    'payment.unknown': 'Betalingsstatus ukjent', 'payment.paidUntil': 'Betalt · aktiv til {date}', 'payment.paid': 'Betalt', 'payment.unpaid': 'Ikke betalt · VPN-tilgang er inaktiv', 'account.vpnPaidUntil': 'VPN · til {date}', 'account.vpnPaid': 'VPN aktiv', 'account.vpnUnpaid': 'Tilgang ikke betalt',
    'error.badSubscription': 'Serveren returnerte paneladressen i stedet for abonnementslenken. Kontroller VPN_SUBSCRIPTION_BASE_URL i serverens .env: HTTPS, port 2096 og /sub/…-rute. Start deretter tjenesten PlanMyNord på nytt.', 'error.loginRequired': 'Logg inn på PlanMyNord-kontoen først.', 'error.noProfile': 'Legg til en VPN-lenke i Profil-delen først.', 'error.noSupportedProfile': 'Lenken inneholder ingen støttede VPN-profiler.', 'error.serverNotConfigured': 'VPN-profilutstedelse er ikke konfigurert på serveren.',
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
    'aria.mainMenu': 'Главное меню', 'aria.language': 'Язык', 'aria.connect': 'Подключить VPN', 'aria.profileLink': 'Ссылка подписки или VPN-сервера', 'aria.subscriptionLink': 'Ссылка VPN-подписки',
    'notice.windows': 'Windows может запросить права администратора для создания VPN-адаптера.',
    'profiles.empty': 'Добавьте ссылку подписки или VPN-сервера, чтобы начать.', 'profiles.selected': 'Выбран', 'profiles.select': 'Выбрать', 'profiles.remove': 'Удалить', 'profiles.adding': 'Загружаю и проверяю профиль…', 'profiles.addedCount': 'Добавлено профилей: {count}',
    'connection.connecting': 'Подключение VPN…', 'connection.disconnecting': 'Отключение VPN…', 'connection.connectedAs': 'Подключено: {name}', 'connection.disconnected': 'VPN отключён.',
    'account.title': 'Общий аккаунт сайта и VPN', 'account.hint': 'Войдите в аккаунт сайта, чтобы управлять VPN-подпиской и устройствами.', 'account.paymentChecking': 'Проверка статуса оплаты…',
    'account.refresh': 'Обновить аккаунт', 'account.logout': 'Выйти', 'account.changeAvatar': 'Загрузить аватар', 'account.avatarSaved': 'Фото профиля обновлено в аккаунте.', 'account.email': 'Электронная почта', 'account.password': 'Пароль', 'account.passwordPlaceholder': 'Введите пароль', 'account.login': 'Войти', 'account.websiteLogin': 'Войти через сайт / Google', 'account.websiteLoginCopy': 'Войдите по email и паролю или через защищённую страницу PlanMyNord.', 'account.register': 'Создать аккаунт',
    'account.priceDefault': 'Тариф PlanMyNord VPN', 'account.payCard': 'Оплатить картой', 'account.payVipps': 'Оплатить через Vipps', 'account.trialHeading': 'Проверить VPN · 30 дней', 'account.trialCopy': 'Создаст рабочий профиль в вашей учётной записи. Без списания денег.', 'account.createProfile': 'Создать VPN-профиль', 'account.cancelTrial': 'Отменить пробный доступ', 'account.copyLink': 'Копировать ссылку',
    'account.loginProgress': 'Открываю PlanMyNord для входа…', 'account.openingPayment': 'Открываю защищённую страницу оплаты Stripe…', 'account.paymentOpened': 'Страница оплаты открыта в браузере. После оплаты вернитесь сюда и обновите статус.', 'account.profilePreparing': 'Подготавливаю VPN-профиль…', 'account.profileCreatedUntil': 'Профиль создан · доступ до {date}', 'account.profileCopied': 'Профиль «{name}» готов. Ссылка скопирована.', 'account.profileCopyFailed': 'Профиль «{name}» готов, но ссылку не удалось скопировать.', 'account.revokingTrial': 'Отзываю пробный доступ…', 'account.trialCancelled': 'Пробный доступ отменён, профиль удалён.', 'account.accessDisabled': 'VPN-доступ отключён.', 'account.linkCopied': 'Ссылка скопирована.', 'account.refreshing': 'Обновляю VPN-профиль…', 'account.updated': 'Аккаунт обновлён · {device}', 'account.trialActiveUntil': 'Пробный VPN-доступ активен до {date}.', 'account.trialInactive': 'Пробный доступ не активен.',
    'account.productPrice': '{name} · {price} NOK · {days} дней · до {devices} устройств', 'account.productNotConfigured': 'Оплата станет доступна после настройки выдачи VPN-профилей на сервере.', 'account.productLoadFailed': 'Не удалось загрузить тариф сайта: {error}. Импортированные профили доступны.',
    'payment.unknown': 'Статус оплаты неизвестен', 'payment.paidUntil': 'Оплачено · действует до {date}', 'payment.paid': 'Оплачено', 'payment.unpaid': 'Не оплачено · VPN-доступ не активен', 'account.vpnPaidUntil': 'VPN · до {date}', 'account.vpnPaid': 'VPN активен', 'account.vpnUnpaid': 'Доступ не оплачен',
    'error.badSubscription': 'Сервер вернул адрес панели вместо ссылки подписки. Проверьте VPN_SUBSCRIPTION_BASE_URL в .env на сервере: HTTPS, порт 2096 и маршрут /sub/…. Затем перезапустите службу PlanMyNord.', 'error.loginRequired': 'Сначала войдите в аккаунт PlanMyNord.', 'error.noProfile': 'Сначала добавьте VPN-ссылку в разделе «Профили».', 'error.noSupportedProfile': 'В ссылке не найдены поддерживаемые VPN-профили.', 'error.serverNotConfigured': 'На сервере не настроена выдача VPN-профилей.',
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
    'aria.mainMenu': 'Main menu', 'aria.language': 'Language', 'aria.connect': 'Connect VPN', 'aria.profileLink': 'Subscription or VPN server link', 'aria.subscriptionLink': 'VPN subscription link',
    'notice.windows': 'Windows may ask for administrator permission to create the VPN adapter.',
    'profiles.empty': 'Add a subscription or VPN server link to get started.', 'profiles.selected': 'Selected', 'profiles.select': 'Select', 'profiles.remove': 'Remove', 'profiles.adding': 'Downloading and checking the profile…', 'profiles.addedCount': 'Profiles added: {count}',
    'connection.connecting': 'Connecting VPN…', 'connection.disconnecting': 'Disconnecting VPN…', 'connection.connectedAs': 'Connected: {name}', 'connection.disconnected': 'VPN disconnected.',
    'account.title': 'Shared website and VPN account', 'account.hint': 'Sign in to your website account to manage your VPN subscription and devices.', 'account.paymentChecking': 'Checking payment status…',
    'account.refresh': 'Refresh account', 'account.logout': 'Sign out', 'account.changeAvatar': 'Upload avatar', 'account.avatarSaved': 'Your account profile photo has been updated.', 'account.email': 'Email address', 'account.password': 'Password', 'account.passwordPlaceholder': 'Enter password', 'account.login': 'Sign in', 'account.websiteLogin': 'Sign in through website / Google', 'account.websiteLoginCopy': 'Sign in with email and password, or use the secure PlanMyNord website.', 'account.register': 'Create account',
    'account.priceDefault': 'PlanMyNord VPN plan', 'account.payCard': 'Pay by card', 'account.payVipps': 'Pay with Vipps', 'account.trialHeading': 'Try VPN · 30 days', 'account.trialCopy': 'Creates a working profile in your account. No charge is made.', 'account.createProfile': 'Create VPN profile', 'account.cancelTrial': 'Cancel trial access', 'account.copyLink': 'Copy link',
    'account.loginProgress': 'Opening PlanMyNord sign-in…', 'account.openingPayment': 'Opening secure Stripe checkout…', 'account.paymentOpened': 'Checkout opened in your browser. Return here after payment and refresh the status.', 'account.profilePreparing': 'Preparing your VPN profile…', 'account.profileCreatedUntil': 'Profile created · access until {date}', 'account.profileCopied': 'Profile “{name}” is ready. The link was copied.', 'account.profileCopyFailed': 'Profile “{name}” is ready, but the link could not be copied.', 'account.revokingTrial': 'Revoking trial access…', 'account.trialCancelled': 'Trial access cancelled and the profile removed.', 'account.accessDisabled': 'VPN access disabled.', 'account.linkCopied': 'Link copied.', 'account.refreshing': 'Refreshing VPN profile…', 'account.updated': 'Account updated · {device}', 'account.trialActiveUntil': 'VPN trial active until {date}.', 'account.trialInactive': 'No active trial access.',
    'account.productPrice': '{name} · {price} NOK · {days} days · up to {devices} devices', 'account.productNotConfigured': 'Payments will be available after VPN profile delivery is configured on the server.', 'account.productLoadFailed': 'Could not load the website plan: {error}. Imported profiles remain available.',
    'payment.unknown': 'Payment status unknown', 'payment.paidUntil': 'Paid · active until {date}', 'payment.paid': 'Paid', 'payment.unpaid': 'Unpaid · VPN access is inactive', 'account.vpnPaidUntil': 'VPN · until {date}', 'account.vpnPaid': 'VPN active', 'account.vpnUnpaid': 'Access not paid',
    'error.badSubscription': 'The server returned the panel address instead of a subscription link. Check VPN_SUBSCRIPTION_BASE_URL in the server .env: HTTPS, port 2096, and a /sub/… route. Then restart the PlanMyNord service.', 'error.loginRequired': 'Sign in to your PlanMyNord account first.', 'error.noProfile': 'Add a VPN link in Profiles first.', 'error.noSupportedProfile': 'The link contains no supported VPN profiles.', 'error.serverNotConfigured': 'VPN profile delivery is not configured on the server.',
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

const savedLanguage = localStorage.getItem('planmynord-language');
const state = {
  connected: false, startedAt: null, timer: null, importedProfiles: [], profiles: [], selectedProfile: null,
  connectionMessage: null, accountNotice: null, profileLinkNotice: null, vpnTrialNotice: null,
  payment: null, vpnSummary: null, vpnProduct: null,
  vpnSummaryError: '',
  language: ['no', 'ru', 'en'].includes(savedLanguage) ? savedLanguage : 'no'
};
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

function formatDate(value) {
  const locales = { no: 'nb-NO', ru: 'ru-RU', en: 'en-GB' };
  return new Date(value).toLocaleDateString(locales[state.language] || 'en-GB');
}

function t(key, values = {}) {
  const template = translations[state.language]?.[key] || translations.no[key] || key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => {
    if (name === 'date' && values[name]) return formatDate(values[name]);
    if (name === 'error' && values[name]) return localizeError(values[name]);
    return String(values[name] ?? `{${name}}`);
  });
}

function localizeError(error) {
  const message = String(error?.message || error || '');
  if (state.language === 'ru') return message;
  if (/Сервер вернул адрес панели VPN вместо ссылки подписки/.test(message)) return t('error.badSubscription');
  if (/Войдите в аккаунт|Сначала войдите в аккаунт/.test(message)) return t('error.loginRequired');
  if (/Сначала добавьте VPN-ссылку/.test(message)) return t('error.noProfile');
  if (/В ссылке не найдены поддерживаемые профили/.test(message)) return t('error.noSupportedProfile');
  if (/Для выдачи профилей нужно подключить сервер VPN/.test(message)) return t('error.serverNotConfigured');
  return message;
}

function setAccountStatus(key, tone = 'info', values = {}) {
  state.accountNotice = { key, tone, values };
  renderAccountNotice();
}

function setAccountError(error, tone = 'error') {
  state.accountNotice = { error: String(error?.message || error || ''), tone };
  renderAccountNotice();
}

function renderAccountNotice() {
  if (!accountStatus || !state.accountNotice) return;
  const notice = state.accountNotice;
  accountStatus.textContent = notice.error ? localizeError(notice.error) : t(notice.key, notice.values);
  accountStatus.dataset.tone = notice.tone;
}

function setProfileLinkStatus(key, values = {}) {
  state.profileLinkNotice = { key, values };
  renderProfileLinkNotice();
}

function setProfileLinkError(error) {
  state.profileLinkNotice = { error: String(error?.message || error || '') };
  renderProfileLinkNotice();
}

function renderProfileLinkNotice() {
  const element = document.querySelector('#profileLinkStatus');
  if (!element || !state.profileLinkNotice) return;
  element.textContent = state.profileLinkNotice.error ? localizeError(state.profileLinkNotice.error) : t(state.profileLinkNotice.key, state.profileLinkNotice.values);
}

function setVpnTrialStatus(key, values = {}) {
  state.vpnTrialNotice = { key, values };
  renderVpnTrialNotice();
}

function renderVpnTrialNotice() {
  const element = document.querySelector('#vpnTrialStatus');
  if (!element || !state.vpnTrialNotice) return;
  element.textContent = state.vpnTrialNotice.error ? localizeError(state.vpnTrialNotice.error) : t(state.vpnTrialNotice.key, state.vpnTrialNotice.values);
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel)); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder)); });
  document.querySelectorAll('.language-button').forEach((button) => button.classList.toggle('active', button.dataset.language === state.language));
  document.querySelectorAll('.imported-description').forEach((element) => { element.textContent = t('profiles.imported'); });
  document.querySelectorAll('.imported-status').forEach((element) => { element.textContent = t('profiles.ready'); });
  renderProfiles(state.profiles);
  renderConnection(false);
  renderAccountNotice();
  renderProfileLinkNotice();
  renderVpnTrialNotice();
  renderPaymentState(state.payment);
  renderAccountPlan();
  renderVpnProduct();
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
    note.textContent = t('profiles.empty');
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
    select.textContent = t(profile.selected ? 'profiles.selected' : 'profiles.select');
    select.addEventListener('click', async () => {
      await window.planMyNord.selectProfile(profile.id);
      renderProfiles(await window.planMyNord.listProfiles());
    });
    const remove = document.createElement('button');
    remove.className = 'button compact ghost';
    remove.textContent = t('profiles.remove');
    remove.addEventListener('click', async () => renderProfiles(await window.planMyNord.removeProfile(profile.id)));
    actions.append(select, remove);
    row.append(flag, detail, actions);
    profileList.append(row);
  }
  const label = state.selectedProfile?.name || t('profiles.noneSelected');
  document.querySelector('#selectedProfile').textContent = label;
  document.querySelector('#profileName').textContent = state.selectedProfile ? `${state.selectedProfile.protocol.toUpperCase()} · ${state.selectedProfile.server}` : t('profiles.noneSelected');
}

function setConnectionMessage(key, values = {}) {
  state.connectionMessage = { key, values };
}

function setConnectionError(error) {
  state.connectionMessage = { error: String(error?.message || error || '') };
}

function connectionMessageText() {
  if (!state.connectionMessage) return '';
  return state.connectionMessage.error
    ? localizeError(state.connectionMessage.error)
    : t(state.connectionMessage.key, state.connectionMessage.values);
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
  connectionCopy.textContent = connectionMessageText() || t(state.connected ? 'connection.demoCopy' : 'connection.readyCopy');
  subscriptionStatus.textContent = connectionMessageText();
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
  setConnectionMessage(state.connected ? 'connection.disconnecting' : 'connection.connecting');
  renderConnection(false);
  try {
    const result = state.connected ? await window.planMyNord.disconnectVpn() : await window.planMyNord.connectVpn();
    state.connected = result.status === 'connected';
    if (result.error) setConnectionError(result.error);
    else if (state.connected) setConnectionMessage('connection.connectedAs', { name: result.profile || state.selectedProfile?.name || 'VPN' });
    else setConnectionMessage('connection.disconnected');
  } catch (error) {
    setConnectionError(error);
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
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => {
  setView(item.dataset.view);
  if (item.dataset.view === 'account') initializeAccount({ issueTrialProfile: false });
}));
document.querySelector('#changeProfile').addEventListener('click', () => setView('profiles'));
document.querySelector('#importProfile').addEventListener('click', async () => {
  if (!window.planMyNord) return;
  const imported = await window.planMyNord.importProfile();
  if (!imported) return;
  try {
    const result = await window.planMyNord.addProfileLink(imported.content);
    renderProfiles(result.profiles);
    setProfileLinkStatus('profiles.addedCount', { count: result.added });
  } catch (error) { setProfileLinkError(error); }
});

document.querySelector('#profileLinkForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#profileLink');
  setProfileLinkStatus('profiles.adding');
  try {
    const result = await window.planMyNord.addProfileLink(input.value);
    renderProfiles(result.profiles);
    input.value = '';
    setProfileLinkStatus('profiles.addedCount', { count: result.added });
  } catch (error) { setProfileLinkError(error); }
});

document.querySelector('#openWebsite').addEventListener('click', () => window.planMyNord?.openExternal('https://planmynord.com/'));
document.querySelector('#privacyLink').addEventListener('click', () => window.planMyNord?.openExternal('https://planmynord.com/privacy.html'));
document.querySelector('#loginAccount').addEventListener('click', async () => {
  const email = document.querySelector('#accountEmailInput').value.trim();
  const password = document.querySelector('#accountPasswordInput').value;
  setAccountStatus('account.loginProgress');
  try {
    await window.planMyNord.loginAccount({ email, password });
    await initializeAccount();
  } catch (error) { setAccountError(error); }
});
document.querySelector('#loginWebsiteAccount').addEventListener('click', async () => {
  setAccountStatus('account.loginProgress');
  try {
    await window.planMyNord.loginWebsiteAccount();
    await initializeAccount();
  } catch (error) { setAccountError(error); }
});
const accountAvatarInput = document.querySelector('#accountAvatarInput');
const accountAvatarPicker = document.querySelector('#accountAvatarPicker');
const accountAvatarImage = document.querySelector('#accountAvatarImage');
const accountAvatarFallback = document.querySelector('#accountAvatarFallback');
function renderAccountAvatar(account) {
  const imageUrl = account?.user?.avatarUrl || '';
  const name = String(account?.name || account?.email || '').trim();
  accountAvatarFallback.textContent = name.split(/\s+/).filter((part) => /\p{L}/u.test(part)).slice(0, 2)
    .map((part) => part.match(/\p{L}/u)?.[0]?.toLocaleUpperCase()).join('') || '?';
  accountAvatarFallback.hidden = Boolean(imageUrl);
  accountAvatarImage.hidden = !imageUrl;
  if (imageUrl) accountAvatarImage.src = imageUrl;
  else accountAvatarImage.removeAttribute('src');
}
accountAvatarImage.addEventListener('error', () => {
  accountAvatarImage.hidden = true;
  accountAvatarFallback.hidden = false;
});
async function imageFileToAvatarDataUrl(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Выберите файл изображения.');
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const x = Math.round((bitmap.width - side) / 2);
  const y = Math.round((bitmap.height - side) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  canvas.getContext('2d').drawImage(bitmap, x, y, side, side, 0, 0, 512, 512);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.84);
}
async function uploadAccountAvatar(file) {
  if (!file) return;
  accountAvatarPicker.disabled = true;
  try {
    const dataUrl = await imageFileToAvatarDataUrl(file);
    const avatarUrl = await window.planMyNord.uploadAvatar(dataUrl);
    accountAvatarImage.src = avatarUrl;
    accountAvatarImage.hidden = false;
    accountAvatarFallback.hidden = true;
    setAccountStatus('account.avatarSaved', 'success');
  } catch (error) { setAccountError(error); }
  finally {
    accountAvatarPicker.disabled = false;
    accountAvatarInput.value = '';
  }
}
accountAvatarPicker.addEventListener('click', () => accountAvatarInput.click());
document.querySelector('#accountUploadAvatar').addEventListener('click', () => accountAvatarInput.click());
accountAvatarInput.addEventListener('change', (event) => uploadAccountAvatar(event.target.files?.[0]));
document.querySelector('#registerAccount').addEventListener('click', () => window.planMyNord?.registerAccount());
document.querySelector('#payVpnCard').addEventListener('click', async () => {
  setAccountStatus('account.openingPayment');
  try { await window.planMyNord.startVpnPayment('card'); setAccountStatus('account.paymentOpened', 'success'); }
  catch (error) { setAccountError(error); }
});
async function createVpnProfileInApp() {
  const button = document.querySelector('#createVpnProfile');
  const cancelButton = document.querySelector('#cancelVpnTrial');
  button.disabled = true;
  setAccountStatus('account.profilePreparing');
  try {
    const result = await window.planMyNord.createVpnProfile();
    renderProfiles(result.profiles);
    const linkRow = document.querySelector('#vpnTrialLinkRow');
    document.querySelector('#vpnTrialLink').value = result.subscriptionUrl;
    linkRow.hidden = false;
    setVpnTrialStatus('account.profileCreatedUntil', { date: result.endsAt });
    cancelButton.disabled = false;
    setAccountStatus(result.linkCopied ? 'account.profileCopied' : 'account.profileCopyFailed', result.linkCopied ? 'success' : 'error', { name: result.displayName });
    return true;
  } catch (error) {
    setAccountError(error);
    return false;
  }
  finally { button.disabled = false; }
}
document.querySelector('#createVpnProfile').addEventListener('click', createVpnProfileInApp);
document.querySelector('#cancelVpnTrial').addEventListener('click', async () => {
  const button = document.querySelector('#cancelVpnTrial');
  button.disabled = true;
  setAccountStatus('account.revokingTrial');
  try {
    const result = await window.planMyNord.cancelVpnTrial();
    renderProfiles(result.profiles || []);
    document.querySelector('#vpnTrialLinkRow').hidden = true;
    document.querySelector('#vpnTrialLink').value = '';
    setVpnTrialStatus('account.trialCancelled');
    setAccountStatus('account.accessDisabled', 'info');
  } catch (error) { setAccountError(error); button.disabled = false; }
});
document.querySelector('#copyVpnTrialLink').addEventListener('click', async () => {
  try { await window.planMyNord.copyVpnTrialLink(document.querySelector('#vpnTrialLink').value); setAccountStatus('account.linkCopied', 'success'); }
  catch (error) { setAccountError(error); }
});
document.querySelector('#payVpnVipps').addEventListener('click', async () => {
  try { await window.planMyNord.startVpnPayment('vipps'); } catch (error) { setAccountError(error); }
});
document.querySelector('#refreshAccount').addEventListener('click', async () => {
  setAccountStatus('account.refreshing');
  try {
    const result = await window.planMyNord.refreshVpnProfile();
    state.vpnSummary = result;
    state.vpnSummaryError = '';
    renderAccountPlan();
    setAccountStatus('account.updated', 'success', { device: result.device?.name || 'Windows' });
  } catch (error) { setAccountError(error); }
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
    if (next.error) setConnectionError(next.error);
    else if (next.status === 'connected') setConnectionMessage('connection.online');
    else if (next.status === 'disconnected') state.connectionMessage = null;
    renderConnection();
  });
}

async function initializeAccount({ issueTrialProfile = true } = {}) {
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
    renderAccountAvatar(account);
      try {
        const result = await window.planMyNord.refreshVpnProfile();
        state.vpnSummary = result;
        state.vpnSummaryError = '';
        renderAccountPlan();
        renderPaymentState(result.payment);
        if (account.user?.vpnPreview && result.trialProfile?.active) {
          document.querySelector('#cancelVpnTrial').disabled = false;
          setVpnTrialStatus('account.trialActiveUntil', { date: result.trialProfile.endsAt });
        } else if (account.user?.vpnPreview) {
          document.querySelector('#cancelVpnTrial').disabled = true;
          setVpnTrialStatus('account.trialInactive');
        }
        if (account.user?.vpnPreview && issueTrialProfile) await createVpnProfileInApp();
      } catch (error) {
        state.vpnSummaryError = String(error?.message || error || '');
        renderAccountPlan();
        renderPaymentState(null);
      }
    }
    if (account) {
      try {
        const vpnProduct = await window.planMyNord?.getVpnProduct();
        if (vpnProduct?.product) {
          state.vpnProduct = vpnProduct;
          renderVpnProduct();
          
          const product = vpnProduct.product;
          document.querySelector('#payVpnCard').disabled = !vpnProduct.providers?.stripe || !vpnProduct.configured;
          document.querySelector('#payVpnVipps').disabled = !vpnProduct.providers?.vipps || !vpnProduct.configured;
          if (!vpnProduct.configured) setAccountStatus('account.productNotConfigured', 'info');
        }
      } catch (error) {
        setAccountStatus('account.productLoadFailed', 'error', { error: error?.message || error });
      }
    }
  } catch (error) {
    signedIn.hidden = true;
    signedOut.hidden = false;
    document.querySelector('#vpnPaymentActions').hidden = true;
    document.querySelector('#vpnTrialActions').hidden = true;
    document.querySelector('#accountHint').hidden = false;
    setAccountError(error);
    setConnectionError(error);
    renderConnection(false);
  }
}

function renderPaymentState(payment) {
  state.payment = payment;
  const element = document.querySelector('#paymentState');
  element.className = `payment-state ${payment ? (payment.paid ? 'paid' : 'unpaid') : 'unknown'}`;
  if (!payment) element.textContent = t('payment.unknown');
  else if (payment.paid) element.textContent = payment.endsAt ? t('payment.paidUntil', { date: payment.endsAt }) : t('payment.paid');
  else element.textContent = t('payment.unpaid');
}

function renderAccountPlan() {
  const element = document.querySelector('#accountPlan');
  if (!element) return;
  if (state.vpnSummaryError) {
    element.textContent = localizeError(state.vpnSummaryError);
    return;
  }
  if (!state.vpnSummary) return;
  const result = state.vpnSummary;
  const plan = result.payment?.paid
    ? (result.payment.endsAt ? t('account.vpnPaidUntil', { date: result.payment.endsAt }) : t('account.vpnPaid'))
    : t('account.vpnUnpaid');
  element.textContent = `${plan} · ${result.device?.name || 'Windows'}`;
}

function renderVpnProduct() {
  const element = document.querySelector('#vpnPriceText');
  const product = state.vpnProduct?.product;
  if (!element || !product) return;
  element.textContent = t('account.productPrice', {
    name: product.name, price: product.priceNok, days: product.durationDays, devices: product.deviceLimit
  });
}

initializeVpn();
initializeAccount();
window.planMyNord?.listProfiles().then(renderProfiles).catch(setProfileLinkError);
