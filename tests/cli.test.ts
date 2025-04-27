import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import util from 'util';

jest.setTimeout(15000); // Increase Jest timeout for CLI tests

const execAsync = util.promisify(exec);

const TEST_DIR = path.join(__dirname, '__cli_testdata__');
const CLI_PATH = path.join(__dirname, '../src/cli.ts');

describe('img-cleanup CLI', () => {
  beforeEach(async () => {
    // Reset the test directory before each test
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    await fs.mkdir(path.join(TEST_DIR, 'assets'), { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, 'assets', 'used.png'), 'fakeimg');
    await fs.writeFile(path.join(TEST_DIR, 'assets', 'unused.png'), 'fakeimg');

    await fs.writeFile(path.join(TEST_DIR, 'index.html'), `
      <html>
        <body>
          <img src="/assets/used.png" />
        </body>
      </html>
    `);
  });

  afterAll(async () => {
    // Final cleanup after all tests
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect and print unused images (without removing)', async () => {
    const { stdout } = await execAsync(`npx tsx "${CLI_PATH}" assets`, {
      cwd: TEST_DIR,
    });

    expect(stdout).toContain('Found 1 unused images');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('Run again with --remove flag to actually delete these files');
  });

  it('should delete unused images when --remove flag is used', async () => {
    const unusedFile = path.join(TEST_DIR, 'assets', 'unused.png');
    await expect(fs.access(unusedFile)).resolves.toBeUndefined(); // unused.png exists initially

    const { stdout } = await execAsync(`npx tsx "${CLI_PATH}" assets --remove`, {
      cwd: TEST_DIR,
    });

    expect(stdout).toContain('Deleting unused images');
    expect(stdout).toContain('✓ Unused images deleted successfully');

    await expect(fs.access(unusedFile)).rejects.toThrow(); // should be deleted
  });

  it('should ignore specified patterns', async () => {
    const { stdout } = await execAsync(`npx tsx "${CLI_PATH}" assets -i "**/*.html"`, {
      cwd: TEST_DIR,
    });

    // Since we ignore the HTML file, no image is seen as used anymore
    expect(stdout).toContain('Found 2 unused images');
    expect(stdout).toContain('used.png');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('Run again with --remove flag to actually delete these files');
  });
});
