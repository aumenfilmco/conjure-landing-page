import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      // Server-side modules (session, supabase-admin, admin page, login actions)
      // must run in node environment so Uint8Array / SubtleCrypto are native Node globals,
      // not jsdom shims that break instanceof checks in jose.
      ['src/lib/session.test.ts', 'node'],
      ['src/lib/supabase-admin.test.ts', 'node'],
      ['src/app/admin/page.test.ts', 'node'],
      ['src/app/admin/login/actions.test.ts', 'node'],
    ],
    server: {
      deps: {
        inline: ['server-only'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/test/server-only-mock.ts'),
    },
  },
})
