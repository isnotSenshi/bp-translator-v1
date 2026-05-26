import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { createWriteStream } from 'fs'
import { app } from 'electron'

const PYTHON_INSTALLER_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe'
const VCREDIST_URL = 'https://aka.ms/vs/17/release/vc_redist.x64.exe'

const tryExec = (cmd) => {
  try {
    return execSync(cmd, { shell: true, timeout: 5000, stdio: 'pipe' }).toString().trim()
  } catch { return null }
}

export const findSystemPython = () => {
  const local = process.env.LOCALAPPDATA || ''
  const candidates = [
    'python',
    'python3',
    path.join(local, 'Programs', 'Python', 'Python313', 'python.exe'),
    path.join(local, 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(local, 'Programs', 'Python', 'Python311', 'python.exe'),
    path.join(local, 'Programs', 'Python', 'Python310', 'python.exe'),
    path.join(local, 'Programs', 'Python', 'Python39', 'python.exe'),
    'C:\\Python313\\python.exe',
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Python310\\python.exe',
  ]

  for (const exe of candidates) {
    const result = tryExec(`"${exe}" -c "import sys; print(sys.executable)"`)
    if (result && fs.existsSync(result)) return result
  }
  return null
}

const checkDependencies = (pythonExe) =>
  !!tryExec(`"${pythonExe}" -c "import manga_ocr, flask, deep_translator, PIL"`)

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

const downloadFile = (url, dest, onProgress) => new Promise((resolve, reject) => {
  // If the file already exists, delete it to avoid it being locked from a previous failed run
  try { if (fs.existsSync(dest)) fs.rmSync(dest, { force: true }) } catch {}

  fs.mkdirSync(path.dirname(dest), { recursive: true })

  const doGet = (reqUrl) => {
    https.get(reqUrl, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        return doGet(res.headers.location)
      }
      const file = createWriteStream(dest)
      const total = parseInt(res.headers['content-length'] || '0', 10)
      let downloaded = 0
      res.on('data', (chunk) => {
        downloaded += chunk.length
        if (total > 0) onProgress?.(downloaded / total)
      })
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      res.on('error', (err) => { fs.unlink(dest, () => {}); reject(err) })
    }).on('error', reject)
  }

  doGet(url)
})

// Retries executing the installer up to 5 times with a delay between attempts.
// Required because Windows Defender may lock a freshly downloaded .exe while scanning it.
const execWithRetry = async (cmd, opts, retries = 5, delayMs = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      execSync(cmd, opts)
      return
    } catch (err) {
      const isLocked = err.message?.includes('siendo utilizado') ||
                       err.message?.includes('being used') ||
                       err.message?.includes('Access is denied') ||
                       err.message?.includes('acceso')
      if (isLocked && i < retries - 1) {
        await sleep(delayMs)
        continue
      }
      throw err
    }
  }
}

const installDependencies = (pythonExe, onMessage) => new Promise((resolve, reject) => {
  // Install all required packages from requirements.txt bundled with the app
  const requirementsPath = path.join(app.getAppPath(), 'python', 'requirements.txt')
  const args = fs.existsSync(requirementsPath)
    ? ['-m', 'pip', 'install', '-r', requirementsPath]
    : ['-m', 'pip', 'install', 'manga-ocr', 'flask', 'pillow', 'deep-translator']

  const pip = spawn(pythonExe, args, {
    shell: true,
    env: { ...process.env }
  })

  let buf = ''
  const parse = (data) => {
    buf += data.toString()
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      const t = line.trim()
      if (!t) continue
      if (t.startsWith('Downloading')) {
        const name = t.split(' ')[1]?.split('-')[0] || ''
        if (name) onMessage?.(`Downloading ${name}...`)
      } else if (t.startsWith('Installing')) {
        onMessage?.('Installing packages...')
      }
    }
  }

  pip.stdout.on('data', parse)
  pip.stderr.on('data', parse)
  pip.on('close', (code) => code === 0 ? resolve() : reject(new Error(`pip failed (exit code ${code})`)))
  pip.on('error', reject)
})

const isVcRedistInstalled = () => {
  // Check registry for Visual C++ 2015-2022 Redistributable (required by PyTorch)
  const keys = [
    'HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64',
    'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64',
  ]
  return keys.some(key =>
    tryExec(`reg query "${key}" /v Installed 2>nul`) !== null
  )
}

const installVcRedist = async (onStep, tmpDir) => {
  const vcPath = path.join(tmpDir, 'vc_redist.x64.exe')
  onStep({ percent: 3, message: 'Downloading Visual C++ Redistributable...' })
  await downloadFile(VCREDIST_URL, vcPath, (p) => {
    onStep({ percent: 3 + Math.floor(p * 4), message: `Downloading Visual C++ Redistributable... ${Math.floor(p * 100)}%` })
  })
  onStep({ percent: 7, message: 'Installing Visual C++ Redistributable...' })
  await sleep(2000)
  await execWithRetry(`"${vcPath}" /quiet /norestart`, { shell: true, timeout: 120000 })
  try { fs.rmSync(vcPath, { force: true }) } catch {}
}

export const runSetup = async (onStep) => {
  const tmpDir = path.join(app.getPath('temp'), 'traductor-setup')
  fs.mkdirSync(tmpDir, { recursive: true })

  // 1. Install Visual C++ Redistributable if missing (required by PyTorch/manga-ocr)
  if (!isVcRedistInstalled()) {
    await installVcRedist(onStep, tmpDir)
  }

  // 2. Look for Python on the system
  onStep({ percent: 8, message: 'Looking for Python on the system...' })
  const systemPython = findSystemPython()

  if (systemPython) {
    onStep({ percent: 20, message: 'Python found. Checking dependencies...' })

    if (checkDependencies(systemPython)) {
      onStep({ percent: 100, message: 'All done!' })
      return systemPython
    }

    onStep({ percent: 30, message: 'Installing dependencies (this may take several minutes)...' })
    await installDependencies(systemPython, (msg) => onStep({ percent: null, message: msg }))
    onStep({ percent: 100, message: 'All done!' })
    return systemPython
  }

  // 3. Python not found — download installer
  const installerPath = path.join(tmpDir, 'python-installer.exe')

  onStep({ percent: 10, message: 'Python not found. Downloading installer (~25 MB)...' })
  await downloadFile(PYTHON_INSTALLER_URL, installerPath, (p) => {
    onStep({
      percent: 10 + Math.floor(p * 20),
      message: `Downloading Python... ${Math.floor(p * 100)}%`
    })
  })

  onStep({ percent: 30, message: 'Installing Python...' })
  // Wait 3s for Windows Defender to finish scanning the file before executing it
  await sleep(3000)
  await execWithRetry(
    `"${installerPath}" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0`,
    { shell: true, timeout: 120000 }
  )
  try { fs.rmSync(installerPath, { force: true }) } catch {}

  // 4. Find the just-installed Python
  onStep({ percent: 35, message: 'Verifying Python installation...' })
  const newPython = findSystemPython()
  if (!newPython) throw new Error('Python was installed but could not be found. Please restart the app.')

  // 5. Install dependencies
  onStep({ percent: 38, message: 'Installing dependencies (this may take several minutes)...' })
  await installDependencies(newPython, (msg) => onStep({ percent: null, message: msg }))
  onStep({ percent: 100, message: 'All done!' })
  return newPython
}
