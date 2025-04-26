import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

const SUPPORTED_IMAGES = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.avif', '.apng'];
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss'];

export async function scanForUnusedImages(
  assetsFolder: string,
  ignorePatterns: string[] = [],
  projectRoot: string = process.cwd()
): Promise<string[]> {
  const assetsPath = path.resolve(projectRoot, assetsFolder);

  const imageFiles = await findFiles(assetsPath, SUPPORTED_IMAGES, ignorePatterns);

  if (imageFiles.length === 0) {
    return [];
  }

  const sourceFiles = await findFiles(projectRoot, SOURCE_EXTENSIONS, ignorePatterns);

  if (sourceFiles.length === 0) {
    return imageFiles;
  }

  const allContent = await Promise.all(
    sourceFiles.map(file => fs.readFile(file, 'utf-8'))
  );

  const combinedContent = allContent.join('\n');

  const usedImages = new Set<string>();

  for (const image of imageFiles) {
    const basename = path.basename(image);
    if (combinedContent.includes(basename)) {
      usedImages.add(image);
    }
  }

  return imageFiles.filter(image => !usedImages.has(image));
}


async function findFiles(directory: string, extensions: string[], ignorePatterns: string[] = []) {
  const extPattern = extensions.map(ext => ext.replace('.', '')).join(',');
  const pattern = `${directory}/**/*.{${extPattern}}`;
  return glob(pattern, { nodir: true, ignore: ignorePatterns });
}
