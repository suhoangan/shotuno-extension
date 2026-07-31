/**
 * Zip `dist/` for Chrome Web Store upload.
 * Run after `npm run build`.
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const outDir = join(root, 'store-listing')

if (!existsSync(join(dist, 'manifest.json'))) {
  console.error('Missing dist/manifest.json — run `npm run build` first.')
  process.exit(1)
}

/** @type {{ version?: string, host_permissions?: string[] }} */
const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'))

const version = manifest.version || '0.0.0'
const hosts = manifest.host_permissions || []
const hasLocalhost = hosts.some(
  (h) => h.includes('localhost') || h.includes('127.0.0.1'),
)

if (hasLocalhost) {
  console.error(
    'Refusing to package: dist/manifest.json still includes localhost host_permissions.\n' +
      'Build with production mode and a public VITE_WEB_URL (or omit local URL).',
  )
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
const zipPath = join(outDir, `shotuno-${version}.zip`)

const isWin = process.platform === 'win32'
let result
if (isWin) {
  result = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `if (Test-Path -LiteralPath '${zipPath}') { Remove-Item -LiteralPath '${zipPath}' -Force }; Compress-Archive -Path '${dist}\\*' -DestinationPath '${zipPath}' -Force`,
    ],
    { encoding: 'utf8' },
  )
} else {
  result = spawnSync('zip', ['-r', '-q', zipPath, '.'], {
    cwd: dist,
    encoding: 'utf8',
  })
}

if (result.status !== 0) {
  console.error(result.stdout || '')
  console.error(result.stderr || '')
  console.error('Failed to create zip.')
  process.exit(result.status ?? 1)
}

console.log(`Packaged ${zipPath}`)
console.log(`Manifest version: ${version}`)
console.log(`host_permissions: ${hosts.join(', ') || '(none)'}`)
