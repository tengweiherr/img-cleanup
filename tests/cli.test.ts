import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

const TEST_DIR = path.join(__dirname, '__cli_testdata__');
const CLI_PATH = path.join(__dirname, '../src/cli.ts'); // adjust based on your CLI location

describe('img-cleanup CLI', () => {
  beforeEach(async () => {
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
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should detect and print unused images (dry-run)', async () => {
    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets -d`, {
      cwd: TEST_DIR,
    });

    // Should show "Found 1 unused images"
    expect(stdout).toContain('Found 1 unused images');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('To delete these files, run without --dry-run flag');
  });

  it('should delete unused images when not dry-run', async () => {
    // Verify the unused file exists first
    const unusedFile = path.join(TEST_DIR, 'assets', 'unused.png');
    await expect(fs.access(unusedFile)).resolves.toBeUndefined();

    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets`, {
      cwd: TEST_DIR,
    });

    expect(stdout).toContain('Deleting unused images');
    expect(stdout).toContain('✓ Unused images deleted successfully');

    // File should now be deleted
    await expect(fs.access(unusedFile)).rejects.toThrow();
  });

  it('should ignore specified patterns', async () => {
    const { stdout } = await execAsync(`npx tsx ${CLI_PATH} assets -d -i "**/*.html"`, {
      cwd: TEST_DIR,
    });
  
    // Should show more unused images (both used.png and unused.png)
    expect(stdout).toContain('Found 2 unused images');
    expect(stdout).toContain('used.png');
    expect(stdout).toContain('unused.png');
    expect(stdout).toContain('To delete these files, run without --dry-run flag');
  });
  
});
