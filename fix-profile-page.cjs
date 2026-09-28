const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/ProfilePage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'save.mutate({ organizationName: organizationName.trim() || undefined, website: website.trim() || undefined, bio: bio.trim() || undefined });',
  'save.mutate({ organizationName: organizationName.trim() || \\"Default Org\\", websiteUrl: website.trim() || undefined, bio: bio.trim() || undefined });'
);

fs.writeFileSync(file, content);
console.log('Fixed ProfilePage compilation error');
