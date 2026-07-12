const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let cnt = fs.readFileSync(p, 'utf8');
  let newCnt = cnt
    .replace(/className=`([^`]*)`\s+text-\[rgb\((.+?)\)\]/g, 'className=`$1 text-[rgb($2)]`')
    .replace(/className="([^"]*)"\s+text-\[rgb\((.+?)\)\]/g, 'className="$1 text-[rgb($2)]"')
    .replace(/(\s+)text-\[rgb\((.+?)\)\]/g, '$1className="text-[rgb($2)]"');
  if (cnt !== newCnt) {
    fs.writeFileSync(p, newCnt);
    console.log('Fixed', file);
  }
});
