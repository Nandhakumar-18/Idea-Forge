const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/JudgePage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Remove join mutation
content = content.replace(/const join = trpc.ideaForge.judging.joinAsJudge.useMutation\(\{[\s\S]*?\}\);\r?\n/, '');

// Fix empty state text
content = content.replace(
  'Ask the event organizer to assign a submission to your account ID. If you haven?Tt enrolled as a judge yet, use the button on this page.',
  'Ask the event organizer to assign a submission to your account. You will receive an email when a submission is ready for your review.'
);

fs.writeFileSync(file, content);
console.log('Fixed JudgePage mutations');
