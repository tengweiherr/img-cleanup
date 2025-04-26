I got tired of checking for unused images as they piled up, so I built a CLI tool to detect and get rid of them.

# 🏞️ img-cleanup 🧹

A CLI tool to detect and remove unused images in JavaScript, TypeScript, and HTML projects.

## Installation

```bash
# Install globally
pnpm install img-cleanup

# Or use with npx
npx img-cleanup
```

## Usage

```bash
# Scan a specific folder, it will run against the current working directory
img-cleanup src/assets

# Dry run (show what would be deleted without actually deleting)
img-cleanup src/assets --dry-run

# With ignore patterns
img-cleanup src/assets -i "**/*.test.tsx"

# Show help
img-cleanup --help
```

## Features

- Detects unused images in JavaScript, TypeScript, and HTML files
- Supports multiple image formats (png, jpg, jpeg, svg, gif, webp, avif, apng)
- Scans for various import patterns:
  - ES6 imports
  - require() statements
  - HTML img tags
  - CSS/SCSS background images
  - Node.js fs operations
- Smart enough to ignore commented out code

## Caveats
- It doesn't recognize path aliases in TypeScript yet

## License

MIT
