import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), {
    name: 'strip-permissions-policy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const header = res.getHeader('Permissions-Policy')
          if (header) {
            const cleaned = header.toString().split(',').filter(part => !['browsing-topics', 'run-ad-auction', 'join-ad-interest-group'].some(bad => part.includes(bad))).join(', ')
            res.setHeader('Permissions-Policy', cleaned)
          }
        } catch (e) {
          console.error('Permissions-Policy middleware error:', e)
        }
        next()
      })
    },
  }],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: { port: 5173, open: false },
  preview: {
    allowedHosts: true,
  },
  // Reduce large bundle warnings and split vendor code for faster loads
  build: {
    // Raise warning limit so we can control splitting ourselves
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Separate heavy third‑party libs into their own chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('@supabase')) return 'supabase';
            // default vendor chunk for everything else
            return 'vendor';
          }
        },
      },
    },
  },
})
