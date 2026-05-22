import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', 'src/test'],

    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],

    reporters: ['verbose'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules',
        '.next',
        'e2e',
        'src/test',
        'src/**/__tests__',
        'src/**/*.config.{ts,js}',
        'src/**/*.d.ts',
        // Next.js-specific files that are not business logic
        'src/app/**',
        'src/components/ui/**', // shadcn/ui generated — not authored code
        // Pure config/mapping — no logic to test
        'src/lib/utils/rsvp.ts',
        'src/lib/utils.ts',
        'src/lib/guest-session.ts',
        // Infrastructure — covered by E2E
        'src/lib/supabase/**',
        'src/lib/queries/**',
        'src/hooks/**',
        'src/i18n/**',
        'src/proxy.ts',
        'src/types/**',
        // Components — covered by E2E; unit tests added incrementally
        'src/components/**',
      ],
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
