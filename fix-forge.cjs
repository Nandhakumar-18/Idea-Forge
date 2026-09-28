const fs = require('fs');
const path = require('path');

const replacements = [
  // Forge specific gradient and backgrounds
  { regex: /from-\[#f0efff\]/g, replacement: 'from-[#f0efff] dark:from-[#2c2b53]' },
  { regex: /to-\[#faf9ff\]/g, replacement: 'to-[#faf9ff] dark:to-[#1e1e36]' },
  
  // Forge text colors missed
  { regex: /text-\[#2e2f50\]/g, replacement: 'text-[#2e2f50] dark:text-[#f1f1fa]' },
  { regex: /text-\[#71728b\]/g, replacement: 'text-[#71728b] dark:text-[#a3a3bb]' },
  { regex: /text-\[#3d3e5a\]/g, replacement: 'text-[#3d3e5a] dark:text-[#f1f1fa]' },
  { regex: /text-\[#898a9e\]/g, replacement: 'text-[#898a9e] dark:text-[#8888a3]' },
  { regex: /text-\[#393a56\]/g, replacement: 'text-[#393a56] dark:text-[#f1f1fa]' },
  { regex: /text-\[#828399\]/g, replacement: 'text-[#828399] dark:text-[#8888a3]' },
  { regex: /text-\[#a1a1b0\]/g, replacement: 'text-[#a1a1b0] dark:text-[#8888a3]' },
  
  // Also AIChatBox colors
  { regex: /text-\[#5e5f7a\]/g, replacement: 'text-[#5e5f7a] dark:text-[#a3a3bb]' },
  { regex: /text-\[#232440\]/g, replacement: 'text-[#232440] dark:text-[#f1f1fa]' },
  { regex: /text-\[#3c3d5a\]/g, replacement: 'text-[#3c3d5a] dark:text-[#f1f1fa]' },
  { regex: /text-\[#a4a5b6\]/g, replacement: 'text-[#a4a5b6] dark:text-[#74758d]' },
  { regex: /bg-\[#f9f9fc\]/g, replacement: 'bg-[#f9f9fc] dark:bg-[#20213d]' },
  { regex: /border-\[#ececf5\]/g, replacement: 'border-[#ececf5] dark:border-[#35354f]' },
  { regex: /bg-white\/60/g, replacement: 'bg-white/60 dark:bg-[#1e1e36]/60' },
  { regex: /bg-\[#f4f4f8\]/g, replacement: 'bg-[#f4f4f8] dark:bg-[#292943]' },
  { regex: /text-\[#62637a\]/g, replacement: 'text-[#62637a] dark:text-[#a3a3bb]' },
  { regex: /text-\[#7671dc\]/g, replacement: 'text-[#7671dc] dark:text-[#8e8aff]' },
  
  // Home unpatched text
  { regex: /text-\[#30314f\]/g, replacement: 'text-[#30314f] dark:text-[#f1f1fa]' },
  { regex: /text-\[#a2a3b4\]/g, replacement: 'text-[#a2a3b4] dark:text-[#74758d]' },
  { regex: /text-\[#85869c\]/g, replacement: 'text-[#85869c] dark:text-[#8888a3]' },
  { regex: /text-\[#666780\]/g, replacement: 'text-[#666780] dark:text-[#a3a3bb]' },
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
