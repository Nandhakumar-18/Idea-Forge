const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/EventsPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Sidebar Planned team size
content = content.replace(/text-\[#494a65\]">Planned team size/g, 'text-[#494a65] dark:text-[#e5e5f1]">Planned team size');
// select tag
content = content.replace(/px-3 text-sm font-semibold outline-none/g, 'px-3 text-sm font-semibold outline-none text-[#333] dark:text-[#f1f1fa]');
// Disclaimer text
content = content.replace(/text-\[#9899a8\]">Registration is only/g, 'text-[#9899a8] dark:text-[#74758d]">Registration is only');
// Registered participants label
content = content.replace(/text-\[#7f8092\]">Registered participants/g, 'text-[#7f8092] dark:text-[#8888a3]">Registered participants');
// Participant count
content = content.replace(/text-\[#44455f\]">\{event\.participantCount\}/g, 'text-[#44455f] dark:text-[#f1f1fa]">{event.participantCount}');
// Team size label
content = content.replace(/text-\[#7f8092\]">Team size/g, 'text-[#7f8092] dark:text-[#8888a3]">Team size');
// Team size value
content = content.replace(/text-\[#44455f\]">\{event\.minTeamSize\}/g, 'text-[#44455f] dark:text-[#f1f1fa]">{event.minTeamSize}');
// Want to refine banner
content = content.replace(/bg-\[#f6f6fb\] p-3 text-\[11px\]/g, 'bg-[#f6f6fb] dark:bg-[#2c2b53] p-3 text-[11px]');
// Ask IdeaForge link
content = content.replace(/text-\[#4340b7\]">Ask IdeaForge AI/g, 'text-[#4340b7] dark:text-[#8e8aff]">Ask IdeaForge AI');
// Event facts banner
content = content.replace(/bg-\[#f6f6fb\] p-4 text-xs leading-5 text-\[#828397\] dark:text-\[#8888a3\]/g, 'bg-[#f6f6fb] dark:bg-[#2c2b53] p-4 text-xs leading-5 text-[#828397] dark:text-[#a3a3bb]');

fs.writeFileSync(file, content);
console.log('Fixed EventDetails sidebar dark mode text colors');
