I got tired of checking for unused images as they piled up, so I built a CLI tool to detect and get rid of them.

# 🏞️ img-cleanup 🧹

A CLI tool to detect and remove unused images in your project.

## Usage

```bash
# Scan a specific folder, it will run against the current working directory
npx img-cleanup src/assets

# Dry run (show what would be deleted without actually deleting)
npx img-cleanup src/assets -d

# With ignore patterns
npx img-cleanup src/assets -i "**/*.test.tsx"

# Show help
npx img-cleanup --help
```

Supported extensions

- `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.css`, `.scss`, `.vue`, `.svelte`, `.md`, `.mdx`, `.json`, `.yaml`, `.yml`, `.txt`

Supported image formats

- `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp`, `.avif`, `.apng`

## How it works

1. Scans the specified assets folder for all supported image files
2. Scans the project for source files with supported extensions
3. Checks if the image file basename is used in the supported source files (e.g., `file.png`)
4. Returns a list of unused images

## Ignore patterns

You can use the `-i` or `--ignore` flag to specify patterns to ignore. You can specify multiple patterns by using the flag multiple times.

```bash
npx img-cleanup src/assets -i "**/*.test.tsx"
```

You can also create an `.imgcleanupignore` file in the root of your project to specify patterns to ignore.

```bash
# .imgcleanupignore
**/*.test.tsx
```

## Caveats

- It doesn't recognize path aliases in TypeScript yet
- It doesn't differentiate files with the same name from different folders

## License

MIT
