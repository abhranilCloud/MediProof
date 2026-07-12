const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let cnt = fs.readFileSync(p, 'utf8');
  // Fix double classname injected by previous script
  // e.g. className="text-3xl font-extrabold tracking-tight mb-2 className="text-[rgb(var(--ink))]""
  // we want to turn it into: className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]"
  let newCnt = cnt.replace(/className="([^"]*?)\s+className="([^"]+)"\"/g, 'className="$1 $2"');
  if (cnt !== newCnt) {
    fs.writeFileSync(p, newCnt);
    console.log('Fixed double className in', file);
  }
});
