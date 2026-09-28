const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /from-\[#eeedff\]/g, replacement: 'from-[#eeedff] dark:from-[#292943]' },
  { regex: /via-\[#f5f4ff\]/g, replacement: 'via-[#f5f4ff] dark:via-[#20213d]' },
  { regex: /to-\[#fff5ec\]/g, replacement: 'to-[#fff5ec] dark:to-[#1e1e36]' },
  { regex: /border-\[#e8e7f4\]/g, replacement: 'border-[#e8e7f4] dark:border-[#35354f]' },
  { regex: /bg-\[#eeedff\]/g, replacement: 'bg-[#eeedff] dark:bg-[#2c2b53]' },
  { regex: /text-\[#4d49ca\]/g, replacement: 'text-[#4d49ca] dark:text-[#8e8aff]' },
  { regex: /text-\[#242540\]/g, replacement: 'text-[#242540] dark:text-[#f1f1fa]' },
  { regex: /text-\[#818298\]/g, replacement: 'text-[#818298] dark:text-[#a3a3bb]' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== 'ui') {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, (match, offset, str) => {
          if (str.substring(offset + match.length).startsWith(' dark:')) return match;
          return replacement;
        });
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'client/src'));
console.log('Done');
