import * as fs from 'fs/promises';
import * as path from 'path';
import { scanForUnusedImages } from '../src/scanner';

const TEST_DIR = path.join(__dirname, '__testdata__');

beforeAll(async () => {
  await fs.mkdir(TEST_DIR, { recursive: true });

  // Create test assets
  await fs.mkdir(path.join(TEST_DIR, 'assets'), { recursive: true });
  await fs.writeFile(path.join(TEST_DIR, 'assets', 'used-image.svg'), 'fakeimg');
  await fs.writeFile(path.join(TEST_DIR, 'assets', 'unused-image.svg'), 'fakeimg');
});

afterAll(async () => {
  // Cleanup after tests
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

describe('scanForUnusedImages', () => {
  it('HTML: should detect unused images with src', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.html'), `
      <html>
        <body>
          <img src="/assets/used-image.svg" />
        </body>
      </html>
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('HTML: should detect unused images with srcset', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.html'), `
      <html>
        <body>
          <img srcset="/assets/used-image.svg" />
        </body>
      </html>
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('JavaScript: should detect unused images with src', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.js'), `
      const img = new Image();
      img.src = '/assets/used-image.svg';
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('Next.js Image: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.tsx'), `
      import { Image } from 'next/image';
      <Image src="/assets/used-image.svg" alt="Used" />
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('Vue: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.vue'), `
      <template>
        <img src="/assets/used-image.svg" alt="Used" />
      </template>
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('Svelte: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'index.svelte'), `
      <img src="/assets/used-image.svg" alt="Used" />
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('Markdown: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'README.md'), `
      ![Used](/assets/used-image.svg)
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('YAML: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'config.yaml'), `
      image: /assets/used-image.svg
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('JSON: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'config.json'), `
      {
        "image": "/assets/used-image.svg"
      }
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  it('Text: should detect unused images correctly', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'README.txt'), `
      Used image: /assets/used-image.svg
    `);

    const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
    expect(unusedImages).toHaveLength(1);
  });

  // TODO: Detect nested images
  // it('Should detect nested images correctly', async () => {
  //   await fs.writeFile(path.join(TEST_DIR, 'index.html'), `
  //     <img src="/assets/nested/used-image.svg" alt="Nested image" />
  //   `);

  //   const unusedImages = await scanForUnusedImages('assets', [], TEST_DIR);
  
  //   expect(unusedImages).toHaveLength(0);
  // });
});
