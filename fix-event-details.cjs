const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/EventsPage.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<label className="mt-5 block text-xs font-bold text-\[#494a65\]">Planned team size[\s\S]*?<\/Button><p className="mt-3 text-center text-\[10px\] leading-4 text-\[#9899a8\]">Registration is only recorded after server-side eligibility validation\.<\/p>/m;

content = content.replace(regex, (match) => {
  return '{user?.role === "organizer" || user?.role === "judge" ? <div className="mt-5 rounded-xl bg-[#f0efff] dark:bg-[#2c2b53] p-4 text-center text-xs font-bold text-[#5550ca] dark:text-[#8e8aff]">As an {user.role}, you cannot register for events.</div> : <>\\n' + match + '\\n</>}';
});

fs.writeFileSync(file, content);
console.log('Fixed EventDetails registration block');
