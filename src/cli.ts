#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { scanForUnusedImages } from './scanner';

const program = new Command();

program
  .name('purge-img')
  .description('CLI tool to detect and remove unused images in your project')
  .argument('<path>', 'Path to the assets folder to scan')
  .option('-r, --remove', 'Actually delete the unused images after detection', false)
  .option('-i, --ignore <patterns...>', 'Patterns to ignore (e.g., "**/*.test.js" "vendor/**")')
  .parse();

const options = program.opts();
const [assetsFolder] = program.args;

async function loadIgnorePatterns(projectRoot: string): Promise<string[]> {
  const ignorePatterns: string[] = [];

  if (options.ignore) {
    ignorePatterns.push(...options.ignore);
  }

  const configFilePath = path.resolve(projectRoot, '.imgcleanupignore');

  try {
    const content = await fs.readFile(configFilePath, 'utf-8');
    const patterns = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    ignorePatterns.push(...patterns);

    console.log(chalk.gray(`Ignoring patterns from ${configFilePath}`));
  } catch (err) {
    // Skip silently if no config
  }

  return ignorePatterns;
}

async function main() {
  console.log(chalk.gray('Scanning for unused images...'));
  try {
    const projectRoot = process.cwd();
    const ignorePatterns = await loadIgnorePatterns(projectRoot);
    const unusedImages = await scanForUnusedImages(assetsFolder, ignorePatterns, projectRoot);
    if (unusedImages.length === 0) {
      console.log(chalk.green('✓ No unused images found!'));
      return;
    }

    console.log(chalk.yellow(`\nFound ${unusedImages.length} unused images:`));

    unusedImages.forEach(image => {
      console.log(chalk.yellow(`- ${image}`));
    });

    if (options.remove) {
      console.log(chalk.magenta('\nDeleting unused images...'));
      for (const image of unusedImages) {
        await fs.unlink(image);
      }
      console.log(chalk.green('\n✓ Unused images deleted successfully'));
    } else {
      console.log(chalk.red('\nRun again with --remove flag to actually delete these files'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error:'), (error as Error).message);
    process.exit(1);
  }
}

main();
