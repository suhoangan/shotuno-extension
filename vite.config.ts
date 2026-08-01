import { defineConfig, type ConfigEnv, type Plugin, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import path from 'path'
import manifest from './manifest.config.ts'

function isPlugin(option: unknown): option is Plugin {
  return (
    typeof option === 'object' &&
    option !== null &&
    !Array.isArray(option) &&
    'name' in option &&
    typeof (option as { name: unknown }).name === 'string'
  )
}

const crxPlugins = crx({ manifest })
const crxHmrPlugin = crxPlugins.find(
  (p): p is Plugin => isPlugin(p) && p.name === 'crx:hmr',
)

if (crxHmrPlugin && typeof crxHmrPlugin.config === 'function') {
  const originalConfig = crxHmrPlugin.config
  crxHmrPlugin.config = async function (config: UserConfig, env: ConfigEnv) {
    const result = await originalConfig.call(this, config, env)
    const hmr = result?.server?.hmr
    if (result?.server && hmr && typeof hmr === 'object') {
      result.server.ws = { ...result.server.ws, ...hmr }
      delete result.server.hmr
    }
    return result
  }
}

const reactPath = path.resolve(__dirname, 'node_modules/react')
const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom')
const konvaPath = path.resolve(__dirname, 'node_modules/konva')

/**
 * Content-script HMR can leave react @ __v--AAA while react-dom is @ __v--BBB
 * → "Invalid hook call". Force a full reload when the React family changes.
 */
function shotunoReactHmrGuard(): Plugin {
  return {
    name: 'shotuno-react-hmr-guard',
    apply: 'serve',
    handleHotUpdate({ file, server }) {
      const norm = file.replace(/\\/g, '/')
      const touchesReactFamily =
        /\/node_modules\/(react|react-dom|scheduler)\//.test(norm)
        || /\/\.vite\/deps\/(react|react-dom|scheduler)/.test(norm)
        || /\/src\/content\//.test(norm)
      if (!touchesReactFamily) return
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    shotunoReactHmrGuard(),
    ...crxPlugins,
  ],
  server: {
    // A second `vite` on 5174 while the extension still points at 5173 loads two
    // React/Konva copies → "Invalid hook call" / "Several Konva instances".
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Package dirs (not index.js files) so subpaths like react-dom/client resolve.
      react: reactPath,
      'react-dom': reactDomPath,
      'react/jsx-runtime': path.resolve(reactPath, 'jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(reactPath, 'jsx-dev-runtime.js'),
      konva: konvaPath,
    },
    dedupe: ['react', 'react-dom', 'scheduler', 'konva', 'react-konva'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'scheduler',
      'konva',
      'react-konva',
      'react-konva-utils',
    ],
    // Crawl content bootstrap so react + react-dom share one optimized metadata hash.
    entries: [
      'src/content/index.tsx',
      'src/content/bootstrap.tsx',
      'src/sidepanel/index.html',
      'src/popup/index.html',
    ],
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
})
