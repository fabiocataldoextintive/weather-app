// vitest.config.ts (crear en la raíz del proyecto)
import { defineConfig, configDefaults } from 'vitest/config';
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
        ...configDefaults.exclude,
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/e2e/**',
        'src/app/i18n/messages.ts',
        'src/app/models/**',
        'src/app/app.routes.ts',
        'src/app/app.config.ts',
      ]
    },
    server: {
      deps: {
        inline: ['@angular/**', '@ngrx/**']
      }
    },
    exclude: [
      ...configDefaults.exclude,
      'node_modules/',
      'src/test-setup.ts',
      '**/*.d.ts',
      '**/e2e/**',
      'src/app/i18n/messages.ts',
      'src/app/models/**',
      'src/app/app.routes.ts',
      'src/app/app.config.ts',
    ]
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  }
}));