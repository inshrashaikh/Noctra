import fs from 'node:fs';
import path from 'node:path';

// Fix upstream Tailwind v4.0.0 bug where `m` contains undefined when compiler.root is null
const searchDir = './node_modules/.pnpm';
if (fs.existsSync(searchDir)) {
  const dirs = fs.readdirSync(searchDir);
  const vitePkg = dirs.find((d) => d.startsWith('@tailwindcss+vite@4.0.0'));
  if (vitePkg) {
    const target = path.join(
      searchDir,
      vitePkg,
      'node_modules/@tailwindcss/vite/dist/index.mjs'
    );
    if (fs.existsSync(target)) {
      let code = fs.readFileSync(target, 'utf8');
      if (code.includes('this.scanner=new q({sources:m})')) {
        code = code.replace(
          'this.scanner=new q({sources:m})',
          'let cleanSources = m.filter(Boolean); this.scanner=new q({sources:cleanSources})'
        );
        fs.writeFileSync(target, code);
        console.log('Applied Tailwind v4.0.0 Windows monorepo patch');
      }
    }
  }
}
