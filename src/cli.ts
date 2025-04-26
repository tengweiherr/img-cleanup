#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { scanForUnusedImages } from './scanner';

const program = new Command();

program
  .name('img-cleanup')
  .description('CLI tool to detect and remove unused images in your project')
  .argument('<path>', 'Path to the assets folder to scan')
  .option('-d, --dry-run', 'Show what would be deleted without actually deleting', false)
  .option('-i, --ignore <patterns...>', 'Patterns to ignore (e.g., "**/*.test.js" "vendor/**")')
  .parse();

const options = program.opts();

const [assetsFolder] = program.args;

async function loadIgnorePatterns(projectRoot: string): Promise<string[]> {
  const ignorePatterns: string[] = [];
  
  // 1. Add CLI passed ignore patterns
  if (options.ignore) {
    ignorePatterns.push(...options.ignore);
  }

  // 2. Add patterns from ignore config file
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
    // Skip if it fails
  }

  return ignorePatterns;
}

async function main() {
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

    if (options.dryRun) {
      console.log(chalk.red('\nTo delete these files, run without --dry-run flag'));
    } else {
      console.log(chalk.magenta('\nDeleting unused images...'));
      for (const image of unusedImages) {
        await fs.unlink(image);
      }
      console.log(chalk.green('\n✓ Unused images deleted successfully'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error:'), (error as Error).message);
    process.exit(1);
  }
}

main();
