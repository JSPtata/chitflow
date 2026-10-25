import process from 'node:process';
import { rmSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';

export default function cleanup() {
  const directory = process.env.CHITFLOW_E2E_DIRECTORY;
  if (directory && dirname(directory) === tmpdir() && basename(directory).startsWith('chitflow-e2e-')) {
    rmSync(directory, { recursive: true, force: true });
  }
}
