/**
 * Zip `dist/` to `release/` for Chrome Web Store / GitHub Release upload.
 * Run after `npm run build` or pass `--build`.
 */
import { existsSync, readFileSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const outDir = process.env.RELEASE_DIR
  ? join(root, process.env.RELEASE_DIR)
  : join(root, 'release')

// If --build flag is specified or dist is missing, build first
const shouldBuild = process.argv.includes('--build')
if (shouldBuild || !existsSync(join(dist, 'manifest.json'))) {
  console.log('📦 Building extension before packaging...')
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const buildResult = spawnSync(npmCmd, ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
  })
  if (buildResult.status !== 0) {
    console.error('❌ Build failed. Aborting packaging.')
    process.exit(buildResult.status ?? 1)
  }
}

if (!existsSync(join(dist, 'manifest.json'))) {
  console.error('❌ Missing dist/manifest.json — run `npm run build` first.')
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
    '❌ Refusing to package: dist/manifest.json still includes localhost host_permissions.\n' +
      'Build with production mode and a public VITE_WEB_URL (or omit local URL).',
  )
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
const zipPath = join(outDir, `shotuno-${version}.zip`)

if (existsSync(zipPath)) {
  rmSync(zipPath, { force: true })
}

const isWin = process.platform === 'win32'
let result
if (isWin) {
  result = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path '${dist}\\*' -DestinationPath '${zipPath}' -Force`,
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
  console.error('❌ Failed to create zip archive.')
  process.exit(result.status ?? 1)
}

const stats = statSync(zipPath)
const sizeKb = (stats.size / 1024).toFixed(1)

console.log(`\n✅ Successfully packaged extension for release!`)
console.log(`📦 Archive: ${zipPath} (${sizeKb} KB)`)
console.log(`🔖 Version: ${version}`)
console.log(`🌐 Permissions: ${hosts.join(', ') || '(none)'}\n`)
