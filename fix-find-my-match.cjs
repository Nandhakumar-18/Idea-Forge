const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/pages/EventsPage.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const { user } = useAuth()')) {
  content = content.replace('export default function EventsPage() {', 'export default function EventsPage() {\n  const { user } = useAuth();');
}

content = content.replace(
  /<Link href="\/forge" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-\[#2926a6\] text-white px-5 text-sm font-bold text-white shadow-\[0_7px_20px_rgba\(41,38,166,\.16\)\] hover:bg-\[#201d8e\]">Find my match <ArrowRight className="h-4 w-4" \/><\/Link>/g,
  '{user?.role !== "organizer" && <Link href="/forge" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2926a6] text-white px-5 text-sm font-bold text-white shadow-[0_7px_20px_rgba(41,38,166,.16)] hover:bg-[#201d8e]">Find my match <ArrowRight className="h-4 w-4" /></Link>}'
);

fs.writeFileSync(file, content);
console.log('Fixed Find my match button');
