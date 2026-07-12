const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const replaceRules = [
  { match: /<Aurora \/>/g, replace: '' },
  { match: /import \{ Aurora \} from '@\/components\/ui\/Aurora';\n/g, replace: '' },
  { match: /glass-card/g, replace: 'rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))]' },
  { match: /glow-brand/g, replace: '' },
  { match: /gradient-text/g, replace: 'text-[rgb(var(--ink))]' },
  { match: /hover-lift/g, replace: 'transition-colors hover:border-[rgb(var(--ink-muted))]' },
  { match: /style=\{\{ color: 'rgb\(var\(--ink\)\)' \}\}/g, replace: 'text-[rgb(var(--ink))]' },
  { match: /style=\{\{ color: 'rgb\(var\(--ink-muted\)\)' \}\}/g, replace: 'text-[rgb(var(--ink-muted))]' },
  { match: /style=\{\{ borderColor: 'rgb\(var\(--success\) \/ 0\.3\)' \}\}/g, replace: 'border-green-900/50' },
  { match: /style=\{\{ borderColor: 'rgb\(var\(--danger\) \/ 0\.3\)' \}\}/g, replace: 'border-red-900/50' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const rule of replaceRules) {
    content = content.replace(rule.match, rule.replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned up:', path.basename(filePath));
  }
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(pagesDir, file));
  }
});
