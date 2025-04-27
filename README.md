I got tired of checking for unused images as they piled up, so I built a CLI tool to detect and get rid of them.

# 🏞️ img-cleanup 🧹

A CLI tool to detect and remove unused images in your project.


https://github.com/user-attachments/assets/e16bec33-167a-41b6-89af-668debf962b1


## ⚠️ Warning
Important:
Only use this tool inside your own project repositories.
Do not run this on system folders, external drives, or outside of your intended project —
it may detect and delete images based on filename matches.

## Usage

```bash
# Scan a specific folder (relative to the current working directory) and print unused images without deleting anything
npx img-cleanup src/assets

# Actually remove unused images
npx img-cleanup src/assets -r

# Ignore specific patterns
npx img-cleanup src/assets -i "**/*.test.tsx"

# Show help
npx img-cleanup --help
```

## Supported extensions

- `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.css`, `.scss`, `.vue`, `.svelte`, `.md`, `.mdx`, `.json`, `.yaml`, `.yml`, `.txt`

## Supported image formats

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

- It does not resolve TypeScript path aliases (like @/assets/logo.png).
- It doesn't differentiate files with the same name from different folders

## License

MIT
