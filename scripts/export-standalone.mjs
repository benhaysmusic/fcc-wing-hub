import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Bundle the built UI into one offline file for reviewers without a dev server.
let html = await readFile('dist/index.html', 'utf8');
const script = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
const stylesheet = html.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !stylesheet) throw new Error('Expected Vite script and stylesheet assets');
const js = await readFile(resolve('dist', script[1].replace(/^\//, '')), 'utf8');
const css = await readFile(resolve('dist', stylesheet[1].replace(/^\//, '')), 'utf8');
html = html.replace(script[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
await writeFile('dist/FCC-WING-Trainer.html', html);
console.log('Created dist/FCC-WING-Trainer.html');
