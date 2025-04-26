import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  dts: true,
  outDir: './dist',
  minify: true,
  clean: true
});