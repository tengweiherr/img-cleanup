import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

const TEST_DIR = path.join(__dirname, '__cli_testdata__');
const CLI_PATH = path.join(__dirname, '../src/cli.ts');

describe('purge-img CLI', () => {
  beforeEach(async () => {
    // Clean up and recreate test directory before each test
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
    // Clean up after all tests
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect and print unused images (no removal)', async () => {
    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets`, {
      cwd: TEST_DIR,
    });

    expect(stdout).toContain('Found 1 unused images');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('Run again with --remove flag to actually delete these files');
  });

  it('should delete unused images when --remove is passed', async () => {
    const unusedFile = path.join(TEST_DIR, 'assets', 'unused.png');
    await expect(fs.access(unusedFile)).resolves.toBeUndefined();

    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets --remove`, {
      cwd: TEST_DIR,
    });

    expect(stdout).toContain('Deleting unused images');
    expect(stdout).toContain('✓ Unused images deleted successfully');

    // After deletion, the file should not exist
    await expect(fs.access(unusedFile)).rejects.toThrow();
  });

  it('should ignore specified patterns and detect both images unused', async () => {
    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets -i "**/*.html"`, {
      cwd: TEST_DIR,
    });

    // Because we ignored HTML files, no references are found, so both images unused
    expect(stdout).toContain('Found 2 unused images');
    expect(stdout).toContain('used.png');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('Run again with --remove flag to actually delete these files');
  });
});
