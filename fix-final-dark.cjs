const fs = require('fs');
const path = require('path');

const replacements = [
  // ProfilePage inputs
  { regex: /bg-\[#fcfcfe\]/g, replacement: 'bg-[#fcfcfe] dark:bg-[#1e1e36]' },

  // Home transparent backgrounds
  { regex: /bg-white\/80/g, replacement: 'bg-white/80 dark:bg-[#1e1e36]/80' },
  { regex: /bg-white\/90/g, replacement: 'bg-white/90 dark:bg-[#1e1e36]/90' },
  { regex: /border-white\/80/g, replacement: 'border-white/80 dark:border-[#35354f]/80' },
  { regex: /ring-white/g, replacement: 'ring-white dark:ring-[#35354f]' },

  // Profile text colors
  { regex: /text-\[#4d4e68\]/g, replacement: 'text-[#4d4e68] dark:text-[#a3a3bb]' },
  { regex: /text-\[#2b2c49\]/g, replacement: 'text-[#2b2c49] dark:text-[#f1f1fa]' },
  { regex: /text-\[#818297\]/g, replacement: 'text-[#818297] dark:text-[#8888a3]' },
  { regex: /text-\[#62637d\]/g, replacement: 'text-[#62637d] dark:text-[#a3a3bb]' },
  { regex: /text-\[#9293a4\]/g, replacement: 'text-[#9293a4] dark:text-[#74758d]' },

  // Home text colors
  { regex: /text-\[#20213e\]/g, replacement: 'text-[#20213e] dark:text-[#f1f1fa]' },
  { regex: /text-\[#6f7087\]/g, replacement: 'text-[#6f7087] dark:text-[#a3a3bb]' },
  { regex: /text-\[#30314f\]/g, replacement: 'text-[#30314f] dark:text-[#e5e5f1]' },
  { regex: /text-\[#a2a3b4\]/g, replacement: 'text-[#a2a3b4] dark:text-[#74758d]' },
  { regex: /text-\[#85869c\]/g, replacement: 'text-[#85869c] dark:text-[#8888a3]' },
  { regex: /text-\[#666780\]/g, replacement: 'text-[#666780] dark:text-[#a3a3bb]' },
  { regex: /text-\[#2a2b49\]/g, replacement: 'text-[#2a2b49] dark:text-[#f1f1fa]' },
  { regex: /text-\[#9091a4\]/g, replacement: 'text-[#9091a4] dark:text-[#8888a3]' },
  { regex: /text-\[#4b4c6d\]/g, replacement: 'text-[#4b4c6d] dark:text-[#e5e5f1]' },
  { regex: /text-\[#282944\]/g, replacement: 'text-[#282944] dark:text-[#f1f1fa]' },
  { regex: /text-\[#70718a\]/g, replacement: 'text-[#70718a] dark:text-[#a3a3bb]' },
  { regex: /text-\[#52509a\]/g, replacement: 'text-[#52509a] dark:text-[#a3a3bb]' },
  { regex: /text-\[#393a59\]/g, replacement: 'text-[#393a59] dark:text-[#f1f1fa]' },
  { regex: /text-\[#8e8fa2\]/g, replacement: 'text-[#8e8fa2] dark:text-[#74758d]' },
  { regex: /text-\[#333450\]/g, replacement: 'text-[#333450] dark:text-[#f1f1fa]' },
  { regex: /text-\[#828397\]/g, replacement: 'text-[#828397] dark:text-[#8888a3]' },

  // Fix button text on save profile
  { regex: /text-\[#3734ae\]/g, replacement: 'text-[#3734ae] dark:text-[#8e8aff]' },
  { regex: /text-\[#5954ce\]/g, replacement: 'text-[#5954ce] dark:text-[#8e8aff]' },
  { regex: /text-\[#32805f\]/g, replacement: 'text-[#32805f] dark:text-[#32b583]' },
  { regex: /text-\[#7a75db\]/g, replacement: 'text-[#7a75db] dark:text-[#8e8aff]' },

  // More Backgrounds on Home
  { regex: /bg-\[#eff8f3\]/g, replacement: 'bg-[#eff8f3] dark:bg-[#1e3d2f]' },
  { regex: /bg-\[#f3f2ff\]/g, replacement: 'bg-[#f3f2ff] dark:bg-[#292943]' },
  { regex: /bg-\[#fff1ec\]/g, replacement: 'bg-[#fff1ec] dark:bg-[#4a341e]' },
  { regex: /bg-\[#edecff\]/g, replacement: 'bg-[#edecff] dark:bg-[#2c2b53]' },
  { regex: /bg-\[#fff3e6\]/g, replacement: 'bg-[#fff3e6] dark:bg-[#4a341e]' },

  // Shadows that look weird in dark mode (Home mock chat, etc.)
  { regex: /shadow-\[0_14px_46px_rgba\(41,38,140,\.09\)\]/g, replacement: 'shadow-[0_14px_46px_rgba(41,38,140,.09)] dark:shadow-none' },
  { regex: /shadow-\[0_12px_36px_rgba\(43,40,115,\.11\)\]/g, replacement: 'shadow-[0_12px_36px_rgba(43,40,115,.11)] dark:shadow-none' },
  { regex: /shadow-\[0_4px_18px_rgba\(30,31,77,\.05\)\]/g, replacement: 'shadow-[0_4px_18px_rgba(30,31,77,.05)] dark:shadow-none' },
  { regex: /shadow-\[0_12px_30px_rgba\(37,36,102,\.12\)\]/g, replacement: 'shadow-[0_12px_30px_rgba(37,36,102,.12)] dark:shadow-none' },
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
      content = content.replace(/dark:shadow-none\s+dark:shadow-none/g, 'dark:shadow-none');
      content = content.replace(/dark:ring-\[[^\]]+\]\s+dark:ring-\[[^\]]+\]/g, (m) => m.split(' ')[0]);

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'client/src'));
console.log('Done');
