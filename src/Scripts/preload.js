const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('api', {
  closeWindow: () => ipcRenderer.send('close-window'),
  getState: (getValue) => ipcRenderer.invoke('get-state', getValue),
  setState: (value, newValue) => ipcRenderer.invoke('set-state', value, newValue),
  onStateChanged: (fn) => ipcRenderer.on('state-changed', (e, key, newValue) => fn(key, newValue)),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  openCropWindow: (dataUrl) => ipcRenderer.invoke('open-crop-window', dataUrl),
  saveImageToRoot: dataUrl => ipcRenderer.invoke('save-image-to-root', dataUrl),
  translateText: dataUrl => ipcRenderer.invoke('translate-text'),  
  restart: dataUrl => ipcRenderer.invoke('restart-tool'),  
  addTextHistory: dataUrl => ipcRenderer.invoke('add-text-history'),
  undoHistory: dataUrl => ipcRenderer.invoke('undo-history'),
  validateGroqKey: (apiKey) => ipcRenderer.invoke('validate-groq-key', apiKey),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getOcrReady: () => ipcRenderer.invoke('get-ocr-ready'),
  onOcrReady: (fn) => ipcRenderer.on('ocr-server-ready', fn),
  onOcrError: (fn) => ipcRenderer.on('ocr-server-error', (e, errType) => fn(errType)),
  getSavedKey: (engine) => ipcRenderer.invoke('get-saved-key', engine),
  checkConnection: () => ipcRenderer.invoke('check-connection'),
  onShortcut: (fn) => ipcRenderer.on('shortcut', (e, action) => fn(action)),
  checkPythonSetup: () => ipcRenderer.invoke('check-python-setup'),
  runSetup: () => ipcRenderer.invoke('run-setup'),
  onSetupProgress: (fn) => ipcRenderer.on('setup-progress', (e, data) => fn(data)),
  onSetupDone: (fn) => ipcRenderer.on('setup-done', fn),
  onSetupError: (fn) => ipcRenderer.on('setup-error', (e, msg) => fn(msg)),
})

