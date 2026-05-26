import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import { app } from 'electron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let pythonProcess = null
let ocrServerReady = false

// Log file at: C:\Users\<user>\AppData\Roaming\bp-translator\ocr.log
const getLogPath = () => path.join(app.getPath('userData'), 'ocr.log')

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  try { fs.appendFileSync(getLogPath(), line) } catch {}
  console.log('[OCR]', msg)
}

export const isOcrServerReady = () => ocrServerReady

export const stopPythonServer = () => {
  if (pythonProcess) pythonProcess.kill()
}

// Fallback for dev mode: try to detect Python on the system
const detectDevPython = () => {
  try {
    return execSync('python -c "import sys; print(sys.executable)"', {
      shell: true, timeout: 5000, stdio: 'pipe'
    }).toString().trim()
  } catch {
    return 'python'
  }
}

export const startPythonServer = (mainWindow, pythonExeOverride = null) => {
  const pythonExe = pythonExeOverride || detectDevPython()
  const scriptPath = path.join(__dirname, '..', '..', 'python', 'server.py')

  log(`Starting OCR server — python: ${pythonExe}`)
  log(`Script path: ${scriptPath}`)

  if (!fs.existsSync(scriptPath)) {
    log('ERROR: server.py not found')
    return
  }

  pythonProcess = spawn(pythonExe, [scriptPath], {
    env: { ...process.env }
  })

  log(`Process spawned — PID: ${pythonProcess.pid}`)

  pythonProcess.stdout.on('data', (data) => {
    const text = data.toString().trim()
    log(`stdout: ${text}`)
    if (text.includes('manga-ocr ready')) {
      ocrServerReady = true
      log('OCR server is ready')
      if (mainWindow?.webContents) {
        mainWindow.webContents.send('ocr-server-ready')
      }
    }
  })

  let stderrBuffer = ''
  pythonProcess.stderr.on('data', (data) => {
    const text = data.toString()
    stderrBuffer += text
    log(`stderr: ${text.trim()}`)
  })

  pythonProcess.on('close', (code) => {
    log(`Process closed with code ${code}`)
    if (code !== 0 && !ocrServerReady) {
      const isModuleError = stderrBuffer.includes('ModuleNotFoundError') || stderrBuffer.includes('No module named')
      const errType = isModuleError ? 'module-missing' : 'crash'
      log(`ERROR type: ${errType}`)
      if (mainWindow?.webContents) {
        mainWindow.webContents.send('ocr-server-error', errType)
      }
    }
  })

  pythonProcess.on('error', (err) => {
    log(`ERROR spawning process: ${err.message}`)
    if (mainWindow?.webContents) {
      mainWindow.webContents.send('ocr-server-error', 'no-python')
    }
  })
}
