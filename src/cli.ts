#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import { scanForUnusedImages } from './scanner';

const program = new Command();

program
  .name('img-cleanup')
  .description('CLI tool to detect and remove unused images in your project')
  .version('1.0.0')
  .argument('<path>', 'Path to the assets folder to scan')
  .option('-d, --dry-run', 'Show what would be deleted without actually deleting', false)
  .option('-i, --ignore <patterns...>', 'Patterns to ignore (e.g., "**/*.test.js" "vendor/**")')
  .option('-c, --config <path>', 'Path to config file (.imagecleanupignore)')
  .parse();

const options = program.opts();
const [folderPath] = program.args;

async function loadIgnorePatterns(): Promise<string[]> {
  const ignorePatterns: string[] = [];
  
  // Add command line ignore patterns
  if (options.ignore) {
    ignorePatterns.push(...options.ignore);
  }

  // Try to load config file
  const configPaths = [
    options.config,
    '.imagecleanupignore'
  ].filter(Boolean);

  for (const configPath of configPaths) {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const patterns = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      ignorePatterns.push(...patterns);
      break; // Stop after first found config file
    } catch (err) {
      // Config file doesn't exist or can't be read, continue to next
      continue;
    }
  }

  return ignorePatterns;
}

async function main() {
  try {
    const ignorePatterns = await loadIgnorePatterns();
    const projectRoot = process.cwd();
    const unusedImages = await scanForUnusedImages(folderPath, ignorePatterns, projectRoot);
    
    if (unusedImages.length === 0) {
      console.log(chalk.green('✓ No unused images found!'));
      return;
    }

    console.log(chalk.yellow(`\nFound ${unusedImages.length} unused images:`));
    unusedImages.forEach(image => {
      console.log(chalk.yellow(`- ${image}`));
    });

    if (options.dryRun) {
      // TODO: Implement actual deletion
      console.log(chalk.red('\nTo delete these files, run without --dry-run flag'));
    } else {
      console.log('\nDeleting unused images...');
      for (const image of unusedImages) {
        await fs.unlink(image);
      }
      console.log(chalk.green('\n✓ Unused images deleted successfully'));
    }
  } catch (error) {
    console.error(chalk.red('Error:', (error as Error).message));
    process.exit(1);
  }
}

main();
