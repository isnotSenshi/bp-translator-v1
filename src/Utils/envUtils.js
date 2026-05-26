import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '..', '.env')

export const readEnv = () => {
  try {
    return Object.fromEntries(
      fs.readFileSync(envPath, 'utf-8').split('\n')
        .filter(l => l.includes('='))
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
    )
  } catch { return {} }
}

export const writeEnv = (data) => {
  const content = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('\n')
  fs.writeFileSync(envPath, content, 'utf-8')
}
