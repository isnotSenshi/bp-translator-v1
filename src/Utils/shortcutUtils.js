import { globalShortcut } from 'electron'

export const registerShortcuts = (mainWindow) => {
  globalShortcut.register('Ctrl+Shift+Z', () => mainWindow.webContents.send('shortcut', 'capture'))
  globalShortcut.register('Ctrl+Shift+X', () => mainWindow.webContents.send('shortcut', 'translate'))
  globalShortcut.register('Ctrl+Shift+C', () => mainWindow.webContents.send('shortcut', 'save'))
  globalShortcut.register('Ctrl+Shift+V', () => mainWindow.webContents.send('shortcut', 'undo'))
}

export const unregisterShortcuts = () => globalShortcut.unregisterAll()
