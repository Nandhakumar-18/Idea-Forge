const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/JudgePage.tsx');
let content = fs.readFileSync(file, 'utf8');

// The line starts with <aside className="space-y-4"><div className="rounded-[22px] border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-5">...
content = content.replace(
  /<aside className="space-y-4"><div className="rounded-\[22px\] border border-\[#e8e8f1\] dark:border-\[#35354f\] bg-white dark:bg-\[#1e1e36\] p-5"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-\[#f0efff\] dark:bg-\[#2c2b53\] text-\[#514dc4\] dark:text-\[#8e8aff\]"><UserRoundCheck className="h-4 w-4" \/><\/span><h2 className="text-sm font-extrabold text-\[#3a3b56\]">Judge access<\/h2><\/div><p className="mt-3 text-xs leading-5 text-\[#7c7d91\]">Judging is restricted to event organizers\. Share your organizer account ID <b>#\{user\?\.id\}<\/b> with an event organizer to be assigned a submission to review\.<\/p><Button onClick=\{\(\) => join\.mutate\(\)\} disabled=\{join\.isPending \|\| user\?\.role === "admin" \|\| user\?\.role === "organizer"\} variant="outline" className="mt-4 h-10 w-full rounded-lg border-\[#dbdaf1\] text-xs font-bold text-\[#4541b5\] dark:text-\[#8e8aff\]">\{user\?\.role === "admin" \|\| user\?\.role === "organizer" \? "Organizer access active" : join\.isPending \? "Verifying\?\?" : "Verify organizer access"\}<ArrowRight className="ml-2 h-3\.5 w-3\.5" \/><\/Button><\/div>/,
  '<aside className="space-y-4"><div className="rounded-[22px] border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-5"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f0efff] dark:bg-[#2c2b53] text-[#514dc4] dark:text-[#8e8aff]"><UserRoundCheck className="h-4 w-4" /></span><h2 className="text-sm font-extrabold text-[#3a3b56] dark:text-[#f1f1fa]">Judge access</h2></div><p className="mt-3 text-xs leading-5 text-[#7c7d91] dark:text-[#8888a3]">You are officially registered as a Judge. Share your registered email with an event organizer so they can assign submissions to you.</p><div className="mt-4 rounded-lg bg-[#f9f9fb] dark:bg-[#20213d] p-3 text-center text-[11px] font-bold text-[#5a55ce] dark:text-[#8e8aff]">{user?.email || "Email linked"}</div></div>'
);

content = content.replace(
  'Ask the event organizer to assign a submission to your account ID. If you haven?Tt enrolled as a judge yet, use the button on this page.',
  'Ask the event organizer to assign a submission to your account. You will receive an email when a submission is ready for your review.'
);

fs.writeFileSync(file, content);
console.log('Fixed JudgePage');
