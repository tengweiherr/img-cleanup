import * as path from 'path';
import * as fs from 'fs/promises';
import { glob } from 'glob';

interface TsConfig {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
}

export class PathResolver {
  private baseUrl: string;
  private pathMappings: Map<string, string[]>;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.baseUrl = '.';
    this.pathMappings = new Map();
  }

  async initialize(): Promise<void> {
    try {
      const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');
      const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
      const tsConfig: TsConfig = JSON.parse(tsConfigContent);

      if (tsConfig.compilerOptions?.baseUrl) {
        this.baseUrl = tsConfig.compilerOptions.baseUrl;
      }

      if (tsConfig.compilerOptions?.paths) {
        for (const [key, value] of Object.entries(tsConfig.compilerOptions.paths)) {
          // Convert glob patterns to regex patterns
          const pattern = key
            .replace(/\*/g, '(.*)') // Convert * to capture group
            .replace(/\/$/, ''); // Remove trailing slash
          this.pathMappings.set(pattern, value);
        }
      }
    } catch (err) {
      // No tsconfig.json or invalid config, use defaults
      console.warn('No valid tsconfig.json found, using default path resolution');
    }
  }

  async resolveFilePath(filePath: string): Promise<string[]> {
    // If it's an absolute path, return as is
    if (path.isAbsolute(filePath)) {
      return [filePath];
    }

    // First try direct resolution from baseUrl
    const baseResolved = path.join(this.projectRoot, this.baseUrl, filePath);
    if (await this.fileExists(baseResolved)) {
      return [baseResolved];
    }

    // Try path mappings
    for (const [pattern, targets] of this.pathMappings.entries()) {
      const regex = new RegExp(`^${pattern}$`);
      const match = filePath.match(regex);
      
      if (match) {
        const [, ...groups] = match;
        const resolvedPaths: string[] = [];

        for (const target of targets) {
          let resolvedTarget = target;
          groups.forEach((group, index) => {
            resolvedTarget = resolvedTarget.replace(`$${index + 1}`, group);
          });

          const fullPath = path.join(this.projectRoot, this.baseUrl, resolvedTarget);
          const matches = await glob(fullPath);
          resolvedPaths.push(...matches);
        }

        if (resolvedPaths.length > 0) {
          return resolvedPaths;
        }
      }
    }

    // If no mapping found, return the original path resolved from project root
    return [path.join(this.projectRoot, filePath)];
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
