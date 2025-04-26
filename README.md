# img-cleanup

A CLI tool to detect and remove unused images in JavaScript, TypeScript, and HTML projects.

## Installation

```bash
# Install globally
npm install -g img-cleanup

# Or use with npx
npx img-cleanup
```

## Usage

```bash
# Scan a specific folder
img-cleanup src/assets

# Dry run (show what would be deleted)
img-cleanup src/assets --dry-run

# With ignore patterns
img-cleanup src/assets -i "**/*.test.js" "vendor/**"

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

## License

MIT
