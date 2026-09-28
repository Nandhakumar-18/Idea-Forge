const fs = require('fs');
const path = require('path');

const replacements = [
  // EventsPage Select boxes
  { regex: /border-\[#e8e8f0\]/g, replacement: 'border-[#e8e8f0] dark:border-[#35354f]' },
  { regex: /bg-\[#fbfbfe\]/g, replacement: 'bg-[#fbfbfe] dark:bg-[#1e1e36]' },
  { regex: /text-\[#5c5d75\]/g, replacement: 'text-[#5c5d75] dark:text-[#f1f1fa]' },
  { regex: /text-\[#9899a9\]/g, replacement: 'text-[#9899a9] dark:text-[#a3a3bb]' },
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

      // Cleanup double darks if any
      content = content.replace(/dark:bg-\[[^\]]+\]\s+dark:bg-\[[^\]]+\]/g, (m) => m.split(' ')[0]);
      content = content.replace(/dark:text-\[[^\]]+\]\s+dark:text-\[[^\]]+\]/g, (m) => m.split(' ')[0]);
      content = content.replace(/dark:border-\[[^\]]+\]\s+dark:border-\[[^\]]+\]/g, (m) => m.split(' ')[0]);

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'client/src'));
console.log('Done');
