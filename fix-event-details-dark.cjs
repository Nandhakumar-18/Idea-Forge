const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/EventsPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Title text
content = content.replace(/text-\[#20213d\] sm:text-\[44px\]/g, 'text-[#20213d] dark:text-[#f1f1fa] sm:text-[44px]');
// Tagline text
content = content.replace(/text-\[#71728a\]">\{event\.tagline\}/g, 'text-[#71728a] dark:text-[#a3a3bb]">{event.tagline}');
// About the challenge H2
content = content.replace(/text-\[#2e2f4c\]">About the challenge/g, 'text-[#2e2f4c] dark:text-[#f1f1fa]">About the challenge');
// Description text
content = content.replace(/text-\[#6f7086\]">\{event\.description\}/g, 'text-[#6f7086] dark:text-[#a3a3bb]">{event.description}');
// H3s
content = content.replace(/text-\[#363752\]">What/g, 'text-[#363752] dark:text-[#e5e5f1]">What');
content = content.replace(/text-\[#363752\]">Eligibility/g, 'text-[#363752] dark:text-[#e5e5f1]">Eligibility');
content = content.replace(/text-\[#363752\]">Timeline/g, 'text-[#363752] dark:text-[#e5e5f1]">Timeline');
content = content.replace(/text-\[#363752\]">Published/g, 'text-[#363752] dark:text-[#e5e5f1]">Published');
// Skills pill text
content = content.replace(/text-\[#65667e\]">\{skill\}/g, 'text-[#65667e] dark:text-[#a3a3bb]">{skill}');
// Eligibility text and list
content = content.replace(/text-\[#707187\]">\{event\.eligibilityText\}/g, 'text-[#707187] dark:text-[#a3a3bb]">{event.eligibilityText}');
content = content.replace(/text-\[#707187\]">\{event\.studentOnly/g, 'text-[#707187] dark:text-[#a3a3bb]">{event.studentOnly');
// Info banner
content = content.replace(/bg-\[#f1f8f4\] p-3 text-xs leading-5 text-\[#43795f\]/g, 'bg-[#f1f8f4] dark:bg-[#1e3d2f] p-3 text-xs leading-5 text-[#43795f] dark:text-[#32b583]');
// Round name
content = content.replace(/text-\[#383953\]">\{round\.name\}/g, 'text-[#383953] dark:text-[#e5e5f1]">{round.name}');
// Round requirements
content = content.replace(/text-\[#797a8e\]">\{round\.requirements\}/g, 'text-[#797a8e] dark:text-[#a3a3bb]">{round.requirements}');
// No rounds text
content = content.replace(/text-\[#8b8ca0\]">No rounds/g, 'text-[#8b8ca0] dark:text-[#8888a3]">No rounds');
// Published results list
content = content.replace(/text-\[#44455f\]">\{result\.submission\.title\}/g, 'text-[#44455f] dark:text-[#e5e5f1]">{result.submission.title}');

// Let's also check Info component inside EventDetails
// function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) { return <div className="rounded-[20px] border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-4"><div className="flex items-center gap-2 text-[#7f8097]"><Icon className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[.05em]">{label}</span></div><p className="mt-3 font-bold text-[#353652]">{value}</p></div>; }
content = content.replace(/text-\[#7f8097\]"><Icon/g, 'text-[#7f8097] dark:text-[#a3a3bb]"><Icon');
content = content.replace(/text-\[#353652\]">\{value\}/g, 'text-[#353652] dark:text-[#f1f1fa]">{value}');

fs.writeFileSync(file, content);
console.log('Fixed EventDetails dark mode text colors');
