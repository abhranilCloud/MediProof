const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let cnt = fs.readFileSync(p, 'utf8');
  // Fix `<span text-[rgb(var(--ink))]">`
  let newCnt = cnt.replace(/(\s)text-\[rgb\(([^)]+)\)\]">/g, '$1className="text-[rgb($2)]">');
  // Fix `<span text-[rgb(var(--ink))]>`
  newCnt = newCnt.replace(/(\s)text-\[rgb\(([^)]+)\)\]([^>]*?)>/g, (m, g1, g2, g3) => {
    if (m.includes('className=')) return m; // leave alone if className is already there
    return `${g1}className="text-[rgb(${g2})]${g3}">`;
  });
  if (cnt !== newCnt) {
    fs.writeFileSync(p, newCnt);
    console.log('Fixed syntax in', file);
  }
});
