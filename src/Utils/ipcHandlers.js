import { ipcMain, desktopCapturer, screen, shell, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { translateTextOpenAi } from '../Scripts/translateOpenAi.js'
import { convertTextOpenAi } from '../Scripts/convertTextOpenAi.js'
import { translateTextGroq } from '../Scripts/translateGroq.js'
import { convertTextGroq } from '../Scripts/convertTextGroq.js'
import { convertTextLocal } from '../Scripts/convertTextLocal.js'
import { translateTextLocal } from '../Scripts/translateLocal.js'
import { state, mainTextIntro } from './appState.js'
import { readEnv, writeEnv } from './envUtils.js'
import { isOcrServerReady } from './ocrServer.js'
import { checkInternetConnection } from './connectionUtils.js'
import { t } from './i18n.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const hasJapaneseText = (text) => {
  if (!text?.trim()) return false
  if (text.trim() === '(. . .)' || text.trim() === '. . .') return false
  return /[぀-ヿ一-鿿･-ﾟ]/.test(text)
}

export const registerIpcHandlers = (mainWindow) => {

  ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close()
  })

  // getState(value)
  ipcMain.handle('get-state', async (event, value) => {
    return state[value]
  })

  // setState(value, newValue)
  ipcMain.handle('set-state', async (event, value, newValue) => {
    state[value] = newValue

    if (mainWindow?.webContents) {
      mainWindow.webContents.send('state-changed', value, newValue)
    }

    if (value === 'engine') {
      state.mainText = mainTextIntro
      state.currentBpants = '../assets/bPants/Burgerpants.webp'
      state.croppedImage = false
      state.queryText = ''
      const imagePath = path.join('./public', 'lastCrop.png')
      fs.rm(imagePath, () => null)
      mainWindow.webContents.send('state-changed', 'mainText', mainTextIntro)
      mainWindow.webContents.send('state-changed', 'currentBpants', '../assets/bPants/Burgerpants.webp')
      mainWindow.webContents.send('state-changed', 'croppedImage', false)
      mainWindow.webContents.send('state-changed', 'queryText', '')
      if ((newValue === 'openai' || newValue === 'groq') && state.apiKey) {
        const envKey = newValue === 'openai' ? 'OPENAI_KEY' : 'GROQ_KEY'
        writeEnv({ ...readEnv(), [envKey]: state.apiKey })
      }
    }

    if (value === 'storyContext' && newValue === null) {
      state.textHistory = []
      state.textHistoryNT = []
      state.queryText = ''
      state.queryTextNT = ''
      mainWindow.webContents.send('state-changed', 'textHistory', [])
      mainWindow.webContents.send('state-changed', 'textHistoryNT', [])
    }

    return state[value]
  })

  // OPEN EXTERNAL LINK
  ipcMain.handle('open-external', (event, url) => shell.openExternal(url))

  // VALIDATE GROQ KEY
  ipcMain.handle('validate-groq-key', async (event, apiKey) => {
    try {
      const { default: OpenAI } = await import('openai')
      const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
      await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1
      })
      return true
    } catch (err) {
      console.error('[Groq validation error]', err?.message || err)
      return false
    }
  })

  // CAPTURE
  ipcMain.handle('capture-screen', async () => {
    mainWindow.minimize()
    const primaryDisplay = screen.getPrimaryDisplay()
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: primaryDisplay.size.width,
        height: primaryDisplay.size.height
      }
    })
    return sources[0].thumbnail.toDataURL()
  })

  // CROP
  ipcMain.handle('open-crop-window', async (event, screenshotDataUrl) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const cropWindow = new BrowserWindow({
      width,
      height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '..', 'Scripts', 'preload-crop.js')
      }
    })

    cropWindow.loadFile('./crop.html')

    state.mainText = '. . .'
    mainWindow.webContents.send('state-changed', 'mainText', '. . .')

    cropWindow.once('ready-to-show', () => {
      cropWindow.show()
      cropWindow.webContents.send('set-screenshot', screenshotDataUrl)
    })

    return await new Promise(resolve => {
      const handler = (ev, croppedDataUrl) => {
        if (!cropWindow.isDestroyed()) cropWindow.close()
        resolve(croppedDataUrl)
      }
      ipcMain.once('crop-done', handler)

      // If the crop window is closed without cropping (e.g. ESC), clean up the listener
      cropWindow.on('closed', () => {
        ipcMain.removeListener('crop-done', handler)
        resolve(null)
      })
    })
  })

  // SAVE IMAGE
  ipcMain.handle('save-image-to-root', async (event, dataUrl) => {
    state.base64Img = dataUrl
    mainWindow.webContents.send('state-changed', 'base64Img', dataUrl)

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
    const imagePath = path.join('./public', 'lastCrop.png')

    mainWindow.restore()
    try {
      fs.writeFileSync(imagePath, base64Data, 'base64')
    } catch (e) {
      console.warn('[save-image] Could not write lastCrop.png:', e.message)
    }

    state.croppedImage = true
    state.queryText = ''
    state.queryTextNT = ''
    mainWindow.webContents.send('state-changed', 'croppedImage', true)

    if (state.engine === 'local') {
      try {
        const jpTxt = await convertTextLocal(dataUrl)
        if (jpTxt.trim() === 'それでも、') {
          const msg = t('NO_TEXT_FOUND', state.lang)
          state.mainText = msg
          mainWindow.webContents.send('state-changed', 'mainText', msg)
          return
        }
        if (!hasJapaneseText(jpTxt)) {
          const msg = t('NO_TEXT_FOUND', state.lang)
          state.mainText = msg
          mainWindow.webContents.send('state-changed', 'mainText', msg)
          return
        }
        state.queryTextNT = jpTxt
        state.queryText = jpTxt
        mainWindow.webContents.send('state-changed', 'queryText', jpTxt)
      } catch (err) {
        const msg = t('LOCAL_OCR_ERROR', state.lang) + err.message
        state.mainText = msg
        mainWindow.webContents.send('state-changed', 'mainText', msg)
      }
      return
    }

    const jpTxt = state.engine === 'groq'
      ? await convertTextGroq(dataUrl, state.apiKey)
      : await convertTextOpenAi(dataUrl, state.apiKey)

    if (!hasJapaneseText(jpTxt)) {
      const msg = t('NO_TEXT_FOUND', state.lang)
      state.mainText = msg
      mainWindow.webContents.send('state-changed', 'mainText', msg)
      return
    }

    state.queryTextNT = jpTxt
    state.queryText = jpTxt
    mainWindow.webContents.send('state-changed', 'queryText', state.queryText)
  })

  // TRANSLATE
  ipcMain.handle('translate-text', async () => {
    if (state.queryText === '') return
    if (state.engine === 'local') {
      translateTextLocal(state.queryText, state.lang).then(text => {
        const bP = '../assets/bPants/Burgerpants5.webp'
        state.mainText = text
        state.currentBpants = bP
        state.queryText = ''
        mainWindow.webContents.send('state-changed', 'mainText', text)
        mainWindow.webContents.send('state-changed', 'currentBpants', bP)
        mainWindow.webContents.send('state-changed', 'queryText', '')
      }).catch(err => {
        const msg = t('TRANSLATE_ERROR', state.lang) + err.message
        state.mainText = msg
        mainWindow.webContents.send('state-changed', 'mainText', msg)
      })
      return
    }
    const translateFn = state.engine === 'groq' ? translateTextGroq : translateTextOpenAi
    translateFn(state.apiKey, state.queryText, state.mustContext, state.storyContext, state.lang).then(text => {
      const bP = '../assets/bPants/Burgerpants5.webp'
      state.mainText = text
      state.currentBpants = bP
      state.queryText = ''
      mainWindow.webContents.send('state-changed', 'mainText', text)
      mainWindow.webContents.send('state-changed', 'currentBpants', bP)
      mainWindow.webContents.send('state-changed', 'queryText', '')
    })
  })

  // RESTART
  ipcMain.handle('restart-tool', async () => {
    const bP = '../assets/bPants/Burgerpants.webp'
    state.mainText = mainTextIntro
    state.currentBpants = bP
    state.croppedImage = null
    state.queryText = ''

    const imagePath = path.join('./public', 'lastCrop.png')
    fs.rm(imagePath, () => null)

    mainWindow.webContents.send('state-changed', 'croppedImage', false)
    mainWindow.webContents.send('state-changed', 'mainText', mainTextIntro)
    mainWindow.webContents.send('state-changed', 'queryText', '')
    mainWindow.webContents.send('state-changed', 'currentBpants', bP)
  })

  // ADD TO HISTORY
  ipcMain.handle('add-text-history', async () => {
    if (state.mainText === mainTextIntro || state.mainText === '. . .') return
    if (!state.queryTextNT) return

    const bP = '../assets/bPants/Burgerpants3.webp'
    const cleanText = state.mainText.replace(/\s*\(\d+%\)\s*$/, '').trim()
    state.textHistory.push(cleanText)
    state.textHistoryNT.push(state.queryTextNT)
    state.mainText = mainTextIntro
    state.currentBpants = bP
    state.queryText = ''
    mainWindow.webContents.send('state-changed', 'mainText', '. . .')
    mainWindow.webContents.send('state-changed', 'currentBpants', bP)
    mainWindow.webContents.send('state-changed', 'queryText', '')
    mainWindow.webContents.send('state-changed', 'textHistory', state.textHistory)
    mainWindow.webContents.send('state-changed', 'textHistoryNT', state.textHistoryNT)
  })

  // UNDO HISTORY
  ipcMain.handle('undo-history', async () => {
    state.textHistory.pop()
    mainWindow.webContents.send('state-changed', 'textHistory', state.textHistory)
  })

  ipcMain.handle('get-ocr-ready', () => isOcrServerReady())

  ipcMain.handle('check-connection', () => checkInternetConnection())

  ipcMain.handle('get-saved-key', (event, engine) => {
    const key = engine === 'openai' ? 'OPENAI_KEY' : 'GROQ_KEY'
    return readEnv()[key] || null
  })
}
