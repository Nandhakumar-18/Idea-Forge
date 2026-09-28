const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-white(?!\/)/g, replacement: 'bg-white dark:bg-[#1e1e36]' },
  { regex: /bg-\[#fafafd\]/g, replacement: 'bg-[#fafafd] dark:bg-[#292943]' },
  { regex: /bg-\[#f8f8fc\]/g, replacement: 'bg-[#f8f8fc] dark:bg-[#20213d]' },
  { regex: /bg-\[#f8f8fb\]/g, replacement: 'bg-[#f8f8fb] dark:bg-[#20213d]' },
  { regex: /bg-\[#f0efff\]/g, replacement: 'bg-[#f0efff] dark:bg-[#2c2b53]' },
  { regex: /bg-\[#f1f0ff\]/g, replacement: 'bg-[#f1f0ff] dark:bg-[#2c2b53]' },
  { regex: /bg-\[#f3f3f7\]/g, replacement: 'bg-[#f3f3f7] dark:bg-[#292943]' },
  { regex: /bg-\[#efefff\]/g, replacement: 'bg-[#efefff] dark:bg-[#2c2b53]' },
  { regex: /bg-\[#fff4e8\]/g, replacement: 'bg-[#fff4e8] dark:bg-[#4a341e]' },
  { regex: /bg-\[#eaf7f1\]/g, replacement: 'bg-[#eaf7f1] dark:bg-[#1e3d2f]' },
  { regex: /bg-\[#fff3e7\]/g, replacement: 'bg-[#fff3e7] dark:bg-[#4a341e]' },
  // Borders
  { regex: /border-\[#e8e8f1\]/g, replacement: 'border-[#e8e8f1] dark:border-[#35354f]' },
  { regex: /border-\[#e7e7f0\]/g, replacement: 'border-[#e7e7f0] dark:border-[#35354f]' },
  { regex: /border-\[#ededf4\]/g, replacement: 'border-[#ededf4] dark:border-[#35354f]' },
  { regex: /border-\[#e9e9f1\]/g, replacement: 'border-[#e9e9f1] dark:border-[#35354f]' },
  { regex: /border-\[#e7e6f4\]/g, replacement: 'border-[#e7e6f4] dark:border-[#35354f]' },
  { regex: /border-\[#deddf1\]/g, replacement: 'border-[#deddf1] dark:border-[#35354f]' },
  { regex: /border-\[#e6e6ef\]/g, replacement: 'border-[#e6e6ef] dark:border-[#35354f]' },
  { regex: /border-\[#ebebf2\]/g, replacement: 'border-[#ebebf2] dark:border-[#35354f]' },
  { regex: /border-\[#f1f1f5\]/g, replacement: 'border-[#f1f1f5] dark:border-[#292943]' },
  // Text darks to lights
  { regex: /text-\[#21223e\]/g, replacement: 'text-[#21223e] dark:text-[#f1f1fa]' },
  { regex: /text-\[#17183c\]/g, replacement: 'text-[#17183c] dark:text-[#f1f1fa]' },
  { regex: /text-\[#2d2e4a\]/g, replacement: 'text-[#2d2e4a] dark:text-[#f1f1fa]' },
  { regex: /text-\[#292a47\]/g, replacement: 'text-[#292a47] dark:text-[#f1f1fa]' },
  { regex: /text-\[#2b2c49\]/g, replacement: 'text-[#2b2c49] dark:text-[#f1f1fa]' },
  { regex: /text-\[#393a55\]/g, replacement: 'text-[#393a55] dark:text-[#e5e5f1]' },
  { regex: /text-\[#43445f\]/g, replacement: 'text-[#43445f] dark:text-[#e5e5f1]' },
  { regex: /text-\[#454660\]/g, replacement: 'text-[#454660] dark:text-[#e5e5f1]' },
  { regex: /text-\[#464763\]/g, replacement: 'text-[#464763] dark:text-[#e5e5f1]' },
  { regex: /text-\[#49468f\]/g, replacement: 'text-[#49468f] dark:text-[#cbc9ff]' },
  { regex: /text-\[#41425e\]/g, replacement: 'text-[#41425e] dark:text-[#e5e5f1]' },
  // Text grays to light grays
  { regex: /text-\[#565771\]/g, replacement: 'text-[#565771] dark:text-[#a3a3bb]' },
  { regex: /text-\[#65667d\]/g, replacement: 'text-[#65667d] dark:text-[#a3a3bb]' },
  { regex: /text-\[#60617b\]/g, replacement: 'text-[#60617b] dark:text-[#a3a3bb]' },
  { regex: /text-\[#676881\]/g, replacement: 'text-[#676881] dark:text-[#a3a3bb]' },
  { regex: /text-\[#7b7c91\]/g, replacement: 'text-[#7b7c91] dark:text-[#8888a3]' },
  { regex: /text-\[#7b7c90\]/g, replacement: 'text-[#7b7c90] dark:text-[#8888a3]' },
  { regex: /text-\[#77788c\]/g, replacement: 'text-[#77788c] dark:text-[#8888a3]' },
  { regex: /text-\[#85869a\]/g, replacement: 'text-[#85869a] dark:text-[#8888a3]' },
  { regex: /text-\[#88899d\]/g, replacement: 'text-[#88899d] dark:text-[#8888a3]' },
  { regex: /text-\[#898a9d\]/g, replacement: 'text-[#898a9d] dark:text-[#8888a3]' },
  { regex: /text-\[#898a9f\]/g, replacement: 'text-[#898a9f] dark:text-[#8888a3]' },
  { regex: /text-\[#86879b\]/g, replacement: 'text-[#86879b] dark:text-[#8888a3]' },
  { regex: /text-\[#797a8f\]/g, replacement: 'text-[#797a8f] dark:text-[#8888a3]' },
  { regex: /text-\[#9394a5\]/g, replacement: 'text-[#9394a5] dark:text-[#74758d]' },
  { regex: /text-\[#9798a8\]/g, replacement: 'text-[#9798a8] dark:text-[#74758d]' },
  { regex: /text-\[#9999a8\]/g, replacement: 'text-[#9999a8] dark:text-[#74758d]' },
  { regex: /text-\[#8a8b9e\]/g, replacement: 'text-[#8a8b9e] dark:text-[#74758d]' },
  { regex: /text-\[#7777a0\]/g, replacement: 'text-[#7777a0] dark:text-[#74758d]' },
  { regex: /text-\[#52536e\]/g, replacement: 'text-[#52536e] dark:text-[#a3a3bb]' },
  { regex: /text-\[#444560\]/g, replacement: 'text-[#444560] dark:text-[#e5e5f1]' },
  { regex: /text-\[#34354f\]/g, replacement: 'text-[#34354f] dark:text-[#f1f1fa]' },
  { regex: /text-\[#7773da\]/g, replacement: 'text-[#7773da] dark:text-[#8e8aff]' },
  // Primaries
  { regex: /text-\[#5c57ca\]/g, replacement: 'text-[#5c57ca] dark:text-[#8e8aff]' },
  { regex: /text-\[#534fca\]/g, replacement: 'text-[#534fca] dark:text-[#8e8aff]' },
  { regex: /text-\[#302daf\]/g, replacement: 'text-[#302daf] dark:text-[#8e8aff]' },
  { regex: /text-\[#6d67da\]/g, replacement: 'text-[#6d67da] dark:text-[#8e8aff]' },
  { regex: /text-\[#4541b5\]/g, replacement: 'text-[#4541b5] dark:text-[#8e8aff]' },
  { regex: /text-\[#2422a7\]/g, replacement: 'text-[#2422a7] dark:text-[#8e8aff]' },
  { regex: /text-\[#514dc4\]/g, replacement: 'text-[#514dc4] dark:text-[#8e8aff]' },
  // Hovers
  { regex: /hover:bg-\[#f5f5fa\]/g, replacement: 'hover:bg-[#f5f5fa] dark:hover:bg-[#292943]' },
  { regex: /hover:bg-\[#fafaff\]/g, replacement: 'hover:bg-[#fafaff] dark:hover:bg-[#292943]' },
  { regex: /hover:text-\[#222345\]/g, replacement: 'hover:text-[#222345] dark:hover:text-[#f1f1fa]' },
  { regex: /hover:text-\[#373858\]/g, replacement: 'hover:text-[#373858] dark:hover:text-[#f1f1fa]' },
  // Others
  { regex: /bg-white\/85/g, replacement: 'bg-white/85 dark:bg-[#151528]/85' },
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
      content = content.replace(/dark:hover:bg-\[[^\]]+\]\s+dark:hover:bg-\[[^\]]+\]/g, (m) => m.split(' ')[0]);
      content = content.replace(/dark:hover:text-\[[^\]]+\]\s+dark:hover:text-\[[^\]]+\]/g, (m) => m.split(' ')[0]);

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'client/src'));
console.log('Done');
