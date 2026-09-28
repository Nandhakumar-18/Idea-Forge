const fs = require('fs');
const path = require('path');

const replacements = [
  // Additional dark text fixes for EventCard
  { regex: /text-\[#232440\]/g, replacement: 'text-[#232440] dark:text-[#f1f1fa]' },
  { regex: /text-\[#77788e\]/g, replacement: 'text-[#77788e] dark:text-[#a3a3bb]' },
  { regex: /text-\[#6e7088\]/g, replacement: 'text-[#6e7088] dark:text-[#a3a3bb]' },
  { regex: /text-\[#66677f\]/g, replacement: 'text-[#66677f] dark:text-[#a3a3bb]' },
  { regex: /text-\[#5c5e77\]/g, replacement: 'text-[#5c5e77] dark:text-[#a3a3bb]' },
  { regex: /text-\[#393a5d\]/g, replacement: 'text-[#393a5d] dark:text-[#f1f1fa]' },
  { regex: /text-\[#946422\]/g, replacement: 'text-[#946422] dark:text-[#f5b85a]' },
  { regex: /text-\[#7c7d92\]/g, replacement: 'text-[#7c7d92] dark:text-[#8888a3]' },
  { regex: /text-\[#3431ac\]/g, replacement: 'text-[#3431ac] dark:text-[#8e8aff]' },
  { regex: /text-\[#4d49c5\]/g, replacement: 'text-[#4d49c5] dark:text-[#8e8aff]' },
  { regex: /text-\[#22845e\]/g, replacement: 'text-[#22845e] dark:text-[#32b583]' },
  { regex: /text-\[#27845f\]/g, replacement: 'text-[#27845f] dark:text-[#32b583]' },
  { regex: /text-\[#a86e28\]/g, replacement: 'text-[#a86e28] dark:text-[#f5b85a]' },

  // Additional background fixes
  { regex: /bg-\[#fbfbfd\]/g, replacement: 'bg-[#fbfbfd] dark:bg-[#20213d]' },
  { regex: /bg-\[#f7f7fd\]/g, replacement: 'bg-[#f7f7fd] dark:bg-[#292943]' },
  { regex: /bg-\[#fff8eb\]/g, replacement: 'bg-[#fff8eb] dark:bg-[#4a341e]' },

  // Additional border fixes
  { regex: /border-\[#eeeeF5\]/g, replacement: 'border-[#eeeeF5] dark:border-[#35354f]' },
  { regex: /border-\[#f0f0f5\]/g, replacement: 'border-[#f0f0f5] dark:border-[#35354f]' }
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
