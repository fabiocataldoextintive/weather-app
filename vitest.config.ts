// vitest.config.ts (crear en la raíz del proyecto)
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    globals: true, // ✅ Esto habilita describe, it, expect sin importar
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
      ]
    },
    server: {
      deps: {
        inline: ['@angular/**', '@ngrx/**']
      }
    }
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  }
}));