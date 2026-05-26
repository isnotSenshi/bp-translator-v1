import { BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: true,
    icon: path.join(__dirname, '..', '..', 'assets', 'bPants', 'burguerico.ico'),
    // resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      preload: path.join(__dirname, '..', 'Scripts', 'preload.js')
    }
  })
  mainWindow.loadFile('public/index.html')
  return mainWindow
}

export const watchBundle = (mainWindow) => {
  const bundlePath = path.join(__dirname, '..', '..', 'dist', 'bundle.js')
  let debounce = null
  fs.watch(bundlePath, () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => mainWindow?.webContents.reload(), 300)
  })
}
