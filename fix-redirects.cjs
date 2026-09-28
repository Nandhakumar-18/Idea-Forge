const fs = require('fs');
const path = require('path');
const file1 = path.join(__dirname, 'client/src/pages/Home.tsx');
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace('if (user?.role === "organizer") {', 'if (user?.role === "organizer" || user?.role === "judge") {');
fs.writeFileSync(file1, content1);

const file2 = path.join(__dirname, 'client/src/pages/Forge.tsx');
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace('if (user?.role === "organizer") {', 'if (user?.role === "organizer" || user?.role === "judge") {');
fs.writeFileSync(file2, content2);

console.log('Fixed redirects');
