import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the compiled dist version
const { default: getExtensionInfo } = await import('../dist/common/utils/getExtensionInfo.js');

describe('getExtensionInfo', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  it('should read version from manifest.json', async () => {
    const info = await getExtensionInfo(fixturesDir);
    expect(info.version).toBe('1.0.0');
  });

  it('should read name from package.json', async () => {
    const info = await getExtensionInfo(fixturesDir);
    expect(info.name).toBe('test-extension');
  });

  it('should read description from package.json', async () => {
    const info = await getExtensionInfo(fixturesDir);
    expect(info.description).toBe('Test extension');
  });

  it('should throw error when manifest.json is missing', async () => {
    await expect(getExtensionInfo('/nonexistent')).rejects.toThrow("You need to provide a valid 'manifest.json'");
  });
});
