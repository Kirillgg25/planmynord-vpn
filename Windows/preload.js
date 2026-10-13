const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('planMyNord', {
  importProfile: () => ipcRenderer.invoke('profile:import'),
  listProfiles: () => ipcRenderer.invoke('profiles:list'),
  addProfileLink: (value) => ipcRenderer.invoke('profiles:add-link', value),
  selectProfile: (id) => ipcRenderer.invoke('profiles:select', id),
  removeProfile: (id) => ipcRenderer.invoke('profiles:remove', id),
  getAccount: () => ipcRenderer.invoke('account:get'),
  loginAccount: (credentials) => ipcRenderer.invoke('account:login', credentials),
  logoutAccount: () => ipcRenderer.invoke('account:logout'),
  refreshVpnProfile: () => ipcRenderer.invoke('account:refresh-vpn'),
  registerAccount: () => ipcRenderer.invoke('account:register'),
  startVpnPayment: (provider) => ipcRenderer.invoke('account:payment', provider),
  getVpnProduct: () => ipcRenderer.invoke('account:vpn-product'),
  connectVpn: () => ipcRenderer.invoke('vpn:connect'),
  disconnectVpn: () => ipcRenderer.invoke('vpn:disconnect'),
  getVpnStatus: () => ipcRenderer.invoke('vpn:status'),
  onVpnStatus: (callback) => ipcRenderer.on('vpn:status-changed', (_event, value) => callback(value)),
  openExternal: (url) => ipcRenderer.invoke('external:open', url)
});
