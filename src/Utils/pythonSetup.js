import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { createWriteStream } from 'fs'
import { app } from 'electron'

const PYTHON_INSTALLER_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe'
const VCREDIST_URL = 'https://aka.ms/vs/17/release/vc_redist.x64.exe'

// ─── Setup log (persists to %APPDATA%\bp-translator\setup.log) ───────────────

const getSetupLogPath = () => {
  try { return path.join(app.getPath('userData'), 'setup.log') } catch { return null }
}

const log = (msg) => {
  const logPath = getSetupLogPath()
  const line = `[${new Date().toISOString()}] ${msg}\n`
  if (logPath) try { fs.appendFileSync(logPath, line) } catch {}
  console.log('[Setup]', msg)
}

const clearLog = () => {
  const logPath = getSetupLogPath()
  if (logPath) try { fs.writeFileSync(logPath, `=== Setup started at ${new Date().toISOString()} ===\n`) } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    if (result && fs.existsSync(result)) {
      log(`Python found: ${result}`)
      return result
    }
  }
  log('Python not found in any candidate path')
  return null
}

const checkDependencies = (pythonExe) => {
  const ok = !!tryExec(`"${pythonExe}" -c "import manga_ocr, flask, deep_translator, PIL"`)
  log(`Dependencies check: ${ok ? 'OK' : 'missing'}`)
  return ok
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// ─── Download ─────────────────────────────────────────────────────────────────

const downloadFile = (url, dest, onProgress) => new Promise((resolve, reject) => {
  log(`Downloading: ${url} → ${dest}`)
  try { if (fs.existsSync(dest)) fs.rmSync(dest, { force: true }) } catch {}
  fs.mkdirSync(path.dirname(dest), { recursive: true })

  const doGet = (reqUrl) => {
    https.get(reqUrl, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        log(`Redirect → ${res.headers.location}`)
        return doGet(res.headers.location)
      }
      if (res.statusCode !== 200) {
        const err = new Error(`HTTP ${res.statusCode} downloading ${reqUrl}`)
        log(`Download error: ${err.message}`)
        return reject(err)
      }
      const file = createWriteStream(dest)
      const total = parseInt(res.headers['content-length'] || '0', 10)
      let downloaded = 0
      res.on('data', (chunk) => {
        downloaded += chunk.length
        if (total > 0) onProgress?.(downloaded / total)
      })
      res.pipe(file)
      file.on('finish', () => { file.close(); log(`Download complete: ${dest}`); resolve() })
      res.on('error', (err) => { log(`Download stream error: ${err.message}`); fs.unlink(dest, () => {}); reject(err) })
    }).on('error', (err) => { log(`Download request error: ${err.message}`); reject(err) })
  }

  doGet(url)
})

// ─── Retry exec (for Defender-locked files) ───────────────────────────────────

const execWithRetry = async (cmd, opts, retries = 5, delayMs = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      log(`Executing (attempt ${i + 1}): ${cmd}`)
      execSync(cmd, opts)
      log('Execution succeeded')
      return
    } catch (err) {
      log(`Execution error (attempt ${i + 1}): ${err.message}`)
      const isLocked = err.message?.includes('siendo utilizado') ||
                       err.message?.includes('being used') ||
                       err.message?.includes('Access is denied') ||
                       err.message?.includes('acceso')
      if (isLocked && i < retries - 1) {
        log(`File locked — retrying in ${delayMs}ms...`)
        await sleep(delayMs)
        continue
      }
      throw err
    }
  }
}

// ─── pip ──────────────────────────────────────────────────────────────────────

const upgradePip = (pythonExe) => new Promise((resolve) => {
  log('Upgrading pip...')
  const proc = spawn(pythonExe, ['-m', 'pip', 'install', '--upgrade', 'pip'], {
    shell: true, env: { ...process.env }
  })
  proc.stdout.on('data', (d) => log(`pip-upgrade stdout: ${d.toString().trim()}`))
  proc.stderr.on('data', (d) => log(`pip-upgrade stderr: ${d.toString().trim()}`))
  proc.on('close', (code) => { log(`pip upgrade exited ${code}`); resolve() })
  proc.on('error', (err) => { log(`pip upgrade spawn error: ${err.message}`); resolve() })
})

const installDependencies = async (pythonExe, onMessage) => {
  log(`Installing dependencies with: ${pythonExe}`)

  await upgradePip(pythonExe)

  return new Promise((resolve, reject) => {
    const requirementsPath = path.join(app.getAppPath(), 'python', 'requirements.txt')
    const usingReqFile = fs.existsSync(requirementsPath)
    const args = usingReqFile
      ? ['-m', 'pip', 'install', '-r', `"${requirementsPath}"`]
      : ['-m', 'pip', 'install', 'manga-ocr', 'flask', 'pillow', 'deep-translator']

    log(`pip args: ${args.join(' ')} (requirements.txt ${usingReqFile ? 'found' : 'not found, using fallback'})`)

    const pip = spawn(pythonExe, args, { shell: true, env: { ...process.env } })

    let buf = ''
    const parse = (data) => {
      const text = data.toString()
      log(`pip: ${text.trim()}`)
      buf += text
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
    pip.on('close', (code) => {
      if (code === 0) {
        log('pip install succeeded')
        resolve()
      } else {
        const msg = `pip failed (exit code ${code}). Check setup.log at %APPDATA%\\bp-translator\\setup.log`
        log(msg)
        reject(new Error(`pip failed (exit code ${code})`))
      }
    })
    pip.on('error', (err) => {
      log(`pip spawn error: ${err.message}`)
      reject(err)
    })
  })
}

// ─── VC++ Redistributable ─────────────────────────────────────────────────────

const isVcRedistInstalled = () => {
  const keys = [
    'HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64',
    'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64',
  ]
  const installed = keys.some(key => tryExec(`reg query "${key}" /v Installed 2>nul`) !== null)
  log(`VC++ Redistributable installed: ${installed}`)
  return installed
}

const installVcRedist = async (onStep, tmpDir) => {
  const vcPath = path.join(tmpDir, 'vc_redist.x64.exe')
  log('Downloading VC++ Redistributable...')
  onStep({ percent: 3, message: 'Downloading Visual C++ Redistributable...' })
  await downloadFile(VCREDIST_URL, vcPath, (p) => {
    onStep({ percent: 3 + Math.floor(p * 4), message: `Downloading Visual C++ Redistributable... ${Math.floor(p * 100)}%` })
  })
  log('Installing VC++ Redistributable...')
  onStep({ percent: 7, message: 'Installing Visual C++ Redistributable...' })
  await sleep(2000)
  await execWithRetry(`"${vcPath}" /quiet /norestart`, { shell: true, timeout: 120000 })
  log('VC++ Redistributable installed successfully')
  try { fs.rmSync(vcPath, { force: true }) } catch {}
}

// ─── Main setup flow ──────────────────────────────────────────────────────────

export const runSetup = async (onStep) => {
  clearLog()
  log(`Platform: ${process.platform} | arch: ${process.arch}`)
  log(`LOCALAPPDATA: ${process.env.LOCALAPPDATA}`)
  log(`App path: ${app.getAppPath()}`)

  const tmpDir = path.join(app.getPath('temp'), 'traductor-setup')
  log(`Temp dir: ${tmpDir}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  // 1. VC++ Redistributable
  if (!isVcRedistInstalled()) {
    log('VC++ not found — installing...')
    try {
      await installVcRedist(onStep, tmpDir)
    } catch (err) {
      log(`VC++ install failed (non-fatal): ${err.message}`)
      // Non-fatal — continue anyway, some systems have it under a different key
    }
  }

  // 2. Find Python
  onStep({ percent: 8, message: 'Looking for Python on the system...' })
  const systemPython = findSystemPython()

  if (systemPython) {
    onStep({ percent: 20, message: 'Python found. Checking dependencies...' })

    if (checkDependencies(systemPython)) {
      log('All dependencies already installed — setup complete')
      onStep({ percent: 100, message: 'All done!' })
      return systemPython
    }

    log('Dependencies missing — installing...')
    onStep({ percent: 30, message: 'Installing dependencies (this may take several minutes)...' })
    await installDependencies(systemPython, (msg) => onStep({ percent: null, message: msg }))
    log('Setup complete')
    onStep({ percent: 100, message: 'All done!' })
    return systemPython
  }

  // 3. Python not found — download and install
  const installerPath = path.join(tmpDir, 'python-installer.exe')
  log('Python not found — downloading installer...')
  onStep({ percent: 10, message: 'Python not found. Downloading installer (~25 MB)...' })
  await downloadFile(PYTHON_INSTALLER_URL, installerPath, (p) => {
    onStep({
      percent: 10 + Math.floor(p * 20),
      message: `Downloading Python... ${Math.floor(p * 100)}%`
    })
  })

  onStep({ percent: 30, message: 'Installing Python...' })
  log('Running Python installer...')
  await sleep(3000)
  await execWithRetry(
    `"${installerPath}" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0`,
    { shell: true, timeout: 120000 }
  )
  try { fs.rmSync(installerPath, { force: true }) } catch {}
  log('Python installer finished')

  // 4. Verify Python was installed
  onStep({ percent: 35, message: 'Verifying Python installation...' })
  const newPython = findSystemPython()
  if (!newPython) {
    log('ERROR: Python installed but not found in PATH — user may need to restart')
    throw new Error('Python was installed but could not be found. Please restart the app.')
  }

  // 5. Install dependencies
  log('Installing Python dependencies...')
  onStep({ percent: 38, message: 'Installing dependencies (this may take several minutes)...' })
  await installDependencies(newPython, (msg) => onStep({ percent: null, message: msg }))
  log('Setup complete')
  onStep({ percent: 100, message: 'All done!' })
  return newPython
}
