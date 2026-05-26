import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

console.log('📦 Bundling renderer...')
execSync('npx webpack --mode production', { cwd: root, stdio: 'inherit' })

console.log('⚡ Building installer with electron-builder...')
execSync('npx electron-builder --win --publish never', { cwd: root, stdio: 'inherit' })

console.log('🎉 Listo! Archivos en /release')
