import process from 'node:process';
import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const directory = mkdtempSync(join(tmpdir(), 'chitflow-e2e-'));
process.env.CHITFLOW_E2E_DIRECTORY = directory;
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
const python = process.env.CHITFLOW_TEST_PYTHON || '.venv/bin/python';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 180000,
  workers: 1,
  reporter: 'list',
  globalTeardown: './tests/e2e/cleanup.js',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: [
    {
      command: `${quote(python)} -m uvicorn app.main:app --host 127.0.0.1 --port 8001`,
      cwd: '../backend',
      url: 'http://127.0.0.1:8001/health',
      reuseExistingServer: false,
      env: {
        DATABASE_URL: `sqlite:///${join(directory, 'test.db')}`,
        SECRET_KEY: randomBytes(48).toString('hex'),
        CORS_ORIGINS: '["http://127.0.0.1:5174"]',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:8001' },
    },
  ],
});
