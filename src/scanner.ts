import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PathResolver } from './path-resolver';

const SUPPORTED_IMAGES = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.avif', '.apng'];
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.vue', '.svelte'];

export async function scanForUnusedImages(
  assetsFolder: string,
  ignorePatterns: string[] = [],
  projectRoot: string = process.cwd()
): Promise<string[]> {
  // Initialize path resolver
  const pathResolver = new PathResolver(projectRoot);
  await pathResolver.initialize();

  // Resolve assets folder path
  const resolvedAssetsPaths = await pathResolver.resolveFilePath(assetsFolder);
  const resolvedAssetsFolder = resolvedAssetsPaths[0]; // Use first match

  // Get all image files
  const imageFiles = await findImageFiles(resolvedAssetsFolder, ignorePatterns);
  const sourceFiles = await findSourceFiles(path.dirname(resolvedAssetsFolder), ignorePatterns);
  const usedImages = new Set<string>();

  // Scan all source files for image references
  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf-8');
    // When finding references, also try to resolve any aliased paths
    await findImageReferences(content, imageFiles, usedImages, pathResolver);
  }

  // Return unused images
  return imageFiles.filter(image => !usedImages.has(image));
}

async function findImageFiles(directory: string, ignorePatterns: string[] = []): Promise<string[]> {
  const pattern = `${directory}/**/*.{${SUPPORTED_IMAGES.join(',')}}`;
  return glob(pattern, { 
    nodir: true,
    ignore: ignorePatterns
  });
}

async function findSourceFiles(directory: string, ignorePatterns: string[] = []): Promise<string[]> {
  const pattern = `${directory}/**/*.{${SOURCE_EXTENSIONS.join(',')}}`;
  return glob(pattern, { 
    nodir: true,
    ignore: ignorePatterns
  });
}

async function findImageReferences(
  content: string,
  imageFiles: string[],
  usedImages: Set<string>,
  pathResolver: PathResolver
) {
  // Common patterns to match image usage
  const patterns = [
    // ES6 imports
    /import\s+.*?['"](.+?(?:png|jpe?g|svg|gif|webp|avif|apng))['"]|from\s+['"](.+?(?:png|jpe?g|svg|gif|webp|avif|apng))['"]/g,
    // require statements
    /require\(['"](.+?(?:png|jpe?g|svg|gif|webp|avif|apng))['"]\)/g,
    // HTML img tags
    /src=["']([^"']+?(?:png|jpe?g|svg|gif|webp|avif|apng))["']/g,
    // CSS/SCSS background images
    /url\(['"]?([^'"')]+?(?:png|jpe?g|svg|gif|webp|avif|apng))['"]?\)/g,
    // Node.js fs operations
    /fs\.(?:readFile|readFileSync|createReadStream)\(['"](.+?(?:png|jpe?g|svg|gif|webp|avif|apng))['"]/g
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const imagePath = match[1] || match[2];
      if (!imagePath) continue;

      const basename = path.basename(imagePath);
      const matchingImage = imageFiles.find(file => file.endsWith(basename));
      if (matchingImage) {
        usedImages.add(matchingImage);
      } else {
        // Try resolving the path using tsconfig paths
        const resolvedPaths = await pathResolver.resolveFilePath(imagePath);
        for (const resolvedPath of resolvedPaths) {
          const matchingImage = imageFiles.find(file => file.endsWith(path.basename(resolvedPath)));
          if (matchingImage) {
            usedImages.add(matchingImage);
            break;
          }
        }
      }
    }
  }
}
