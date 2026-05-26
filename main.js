import { app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import process from 'process'
import { createWindow, watchBundle } from './src/Utils/windowManager.js'
import { startPythonServer, stopPythonServer } from './src/Utils/ocrServer.js'
import { registerIpcHandlers } from './src/Utils/ipcHandlers.js'
import { registerSetupHandlers, isPythonReady, getStoredPythonPath } from './src/Utils/setupHandlers.js'
import { registerShortcuts, unregisterShortcuts } from './src/Utils/shortcutUtils.js'

const isDev = process.env.NODE_ENV === 'development'
let mainWindow

app.whenReady().then(() => {
  const imagePath = path.join('./public', 'lastCrop.png')
  fs.rm(imagePath, () => null)

  mainWindow = createWindow()
  registerIpcHandlers(mainWindow)
  registerSetupHandlers(mainWindow, (pythonPath) => {
    // Called when setup completes — start the OCR server with the new Python path
    startPythonServer(mainWindow, pythonPath)
  })
  registerShortcuts(mainWindow)

  // Start OCR server immediately if Python is already configured (or in dev mode)
  if (isDev) {
    startPythonServer(mainWindow)
  } else if (isPythonReady()) {
    startPythonServer(mainWindow, getStoredPythonPath())
  }

  if (isDev) watchBundle(mainWindow)
})

app.on('window-all-closed', () => {
  stopPythonServer()
  unregisterShortcuts()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
