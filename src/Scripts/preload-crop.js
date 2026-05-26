const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('cropApi', {
  onScreenshot: fn => ipcRenderer.on('set-screenshot', (e, d) => fn(d)),
  finishCrop: dataUrl => ipcRenderer.send('crop-done', dataUrl)
});