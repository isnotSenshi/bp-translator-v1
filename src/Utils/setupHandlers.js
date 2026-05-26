import { ipcMain } from 'electron'
import Store from 'electron-store'
import fs from 'fs'
import { runSetup } from './pythonSetup.js'

const store = new Store()

export const isPythonReady = () => {
  const p = store.get('pythonPath')
  return !!(p && fs.existsSync(p))
}

export const getStoredPythonPath = () => store.get('pythonPath') || null

export const registerSetupHandlers = (mainWindow, onSetupComplete) => {
  ipcMain.handle('check-python-setup', () => isPythonReady())

  ipcMain.handle('run-setup', async () => {
    try {
      const pythonPath = await runSetup((progress) => {
        if (mainWindow?.webContents) {
          mainWindow.webContents.send('setup-progress', progress)
        }
      })

      store.set('pythonPath', pythonPath)

      if (mainWindow?.webContents) {
        mainWindow.webContents.send('setup-done')
      }

      onSetupComplete?.(pythonPath)
    } catch (err) {
      if (mainWindow?.webContents) {
        mainWindow.webContents.send('setup-error', err.message)
      }
    }
  })
}
