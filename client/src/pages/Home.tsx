import { ArrowRight, ArrowUpRight, BrainCircuit, CalendarDays, ChevronRight, Compass, GraduationCap, HeartPulse, Lightbulb, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [, setLocation] = useLocation();
  const eventsQuery = trpc.ideaForge.events.list.useQuery(undefined, { retry: 1 });
  const events = eventsQuery.data ?? [];
  const openForge = (value = prompt) => {
    if (value.trim()) sessionStorage.setItem("ideaforge:first-prompt", value.trim());
    setLocation("/forge");
  };
  return <div className="overflow-hidden bg-[#f8f8fc] dark:bg-[#20213d]">
    <section className="relative mx-auto max-w-[1440px] px-5 pb-12 pt-14 lg:px-10 lg:pb-16 lg:pt-[76px]">
      <div className="pointer-events-none absolute -right-28 top-0 h-[500px] w-[640px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(157,151,255,.18),rgba(255,255,255,0)_65%)]" />
      <div className="pointer-events-none absolute left-[46%] top-[340px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,211,156,.3),transparent_70%)]" />
      <div className="relative grid items-center gap-12 lg:grid-cols-[1.04fr_.96fr] lg:gap-8">
        <div className="fade-up relative z-10 max-w-[650px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e5e4fd] bg-white/80 dark:bg-[#1e1e36]/80 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.11em] text-[#524fc1] shadow-[0_4px_16px_rgba(49,47,131,.05)]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#edecff] dark:bg-[#2c2b53]"><Sparkles className="h-3 w-3" /></span> A smarter way to find your next challenge</div>
          <h1 className="font-display text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.03] tracking-[-.065em] text-[#20213e] dark:text-[#f1f1fa]">Find the right<br className="hidden sm:block" /> hackathon for <span className="relative inline-block text-[#3733bb]">your idea.<svg aria-hidden="true" className="absolute -bottom-1 left-0 h-3 w-full text-[#9a96ff]" viewBox="0 0 250 10" fill="none"><path d="M2 7C55 1 173 1 247 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span></h1>
          <p className="mt-6 max-w-[530px] text-[17px] leading-8 text-[#6f7087] dark:text-[#a3a3bb]">Tell IdeaForge what you want to build, what you know, and what matters to you. We’ll find real competitions that fit.</p>
          <div className="mt-8 rounded-[22px] border border-[#e6e5f4] bg-white dark:bg-[#1e1e36] p-2.5 shadow-[0_14px_46px_rgba(41,38,140,.09)] dark:shadow-none ring-1 ring-white dark:ring-[#35354f]">
            <label htmlFor="home-prompt" className="sr-only">Describe the hackathon you are looking for</label>
            <textarea id="home-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); openForge(); } }} rows={2} placeholder="I’m looking for a free online AI healthcare hackathon for a team of 4..." className="min-h-[72px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-6 text-[#30314f] dark:text-[#e5e5f1] outline-none placeholder:text-[#a2a3b4] dark:text-[#74758d] focus:ring-0" />
            <div className="flex flex-col justify-between gap-2 border-t border-[#f0f0f5] dark:border-[#35354f] px-2 pt-2 sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-2 px-2 text-[11px] font-medium text-[#85869a] dark:text-[#8888a3]"><ShieldCheck className="h-3.5 w-3.5 text-[#4a9a79]" />Eligibility is checked against event rules</span>
              <Button onClick={() => openForge()} className="h-11 rounded-xl bg-[#2b28a7] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(43,40,167,.18)] hover:bg-[#201d90]">Find my hackathons <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#85869c] dark:text-[#8888a3]"><span className="mr-1 font-semibold text-[#666780] dark:text-[#a3a3bb]">Try a prompt:</span>{["AI for better healthcare", "A team-friendly online challenge", "Education and accessibility"].map(item => <button key={item} onClick={() => openForge(item)} className="rounded-full border border-[#e8e8f1] dark:border-[#35354f] bg-white/80 dark:bg-[#1e1e36]/80 px-3 py-1.5 transition hover:border-[#c9c7fa] hover:text-[#3834b4]">{item}</button>)}</div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#73748d]"><span className="inline-flex items-center gap-2"><WandSparkles className="h-4 w-4 text-[#6e68e8]" />Personalized recommendations</span><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#52a17e]" />Explainable eligibility</span><span className="inline-flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-[#8a75df]" />Grounded AI answers</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[565px] lg:mr-0">
          <div className="relative rounded-[34px] border border-[#e8e7f4] bg-gradient-to-br from-[#eeedff] via-[#f5f4ff] to-[#fff5ec] p-5 shadow-[0_28px_80px_rgba(43,40,115,.13)] sm:p-8">
            <div className="absolute right-8 top-7 h-2 w-2 rounded-full bg-[#bbb7ff]" /><div className="absolute left-8 top-[43%] h-3 w-3 rounded-full bg-[#ffc39c]" />
            <div className="relative overflow-hidden rounded-[24px] border border-white/80 dark:border-[#35354f]/80 bg-white/90 dark:bg-[#1e1e36]/90 p-5 shadow-[0_12px_36px_rgba(43,40,115,.11)] dark:shadow-none sm:p-6">
              <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2825aa] text-white"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-[#2a2b49] dark:text-[#f1f1fa]">IdeaForge AI</p><p className="text-[11px] text-[#9091a4] dark:text-[#8888a3]">Your discovery assistant</p></div></div><span className="flex items-center gap-1.5 rounded-full bg-[#eff8f3] dark:bg-[#1e3d2f] px-2.5 py-1 text-[10px] font-bold text-[#32805f] dark:text-[#32b583]"><span className="h-1.5 w-1.5 rounded-full bg-[#46a379]" />Catalogue ready</span></div>
              <div className="ml-6 rounded-2xl rounded-tl-sm bg-[#f1f0ff] dark:bg-[#2c2b53] px-4 py-3 text-[13px] leading-6 text-[#4b4c6d] dark:text-[#e5e5f1]">I’m looking for an AI healthcare challenge for a team of four. Online and free would be ideal.</div>
              <div className="mt-5 flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#eeedff] text-[#4d49ca]"><Sparkles className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="mb-2 text-[13px] leading-6 text-[#65667d] dark:text-[#a3a3bb]">I’ll check the catalogue for open events, then verify your team size against each event’s rules.</p>
                <div className="rounded-[17px] border border-[#e9e9f2] bg-white dark:bg-[#1e1e36] p-4 shadow-[0_4px_18px_rgba(30,31,77,.05)] dark:shadow-none"><div className="flex items-start justify-between gap-2"><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#5954ce] dark:text-[#8e8aff]">Healthcare · Online</span><h3 className="mt-1 text-[15px] font-extrabold tracking-[-.02em] text-[#282944] dark:text-[#f1f1fa]">CareAI Innovation Sprint</h3></div><span className="rounded-full bg-[#eaf7f1] dark:bg-[#1e3d2f] px-2.5 py-1 text-[10px] font-bold text-[#32805f] dark:text-[#32b583]">Match details</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#70718a] dark:text-[#a3a3bb]"><span className="flex items-center gap-1.5"><UsersMini />2–5 builders</span><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#817bef]" />Two-week sprint</span></div><div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f3f2ff] dark:bg-[#292943] px-3 py-2.5 text-[11px] leading-4 text-[#52509a] dark:text-[#a3a3bb]"><ShieldCheck className="h-4 w-4 shrink-0" />Team size fits; open status and deadline verified</div></div>
              </div></div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#ededf4] dark:border-[#35354f] bg-[#fbfbfd] dark:bg-[#20213d] px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff3e6] dark:bg-[#4a341e] text-[#ca8649]"><Lightbulb className="h-4 w-4" /></span><p className="text-[11px] leading-5 text-[#77788e] dark:text-[#a3a3bb]">Have a follow-up? Compare events, ask about rules, or refine your search.</p><ChevronRight className="ml-auto h-4 w-4 text-[#a1a1b4]" /></div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-[16px] border border-[#eeedf7] bg-white dark:bg-[#1e1e36] px-4 py-3 shadow-[0_12px_30px_rgba(37,36,102,.12)] dark:shadow-none sm:flex"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff1ec] dark:bg-[#4a341e] text-[#d37d62]"><HeartPulse className="h-4 w-4" /></span><span><b className="block text-xs text-[#393a59] dark:text-[#f1f1fa]">Built for your next big idea</b><small className="text-[10px] text-[#8e8fa2] dark:text-[#74758d]">Browse verified, open challenges</small></span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 pb-14 pt-2 lg:px-10 lg:pb-20">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#7773da] dark:text-[#8e8aff]">Explore the catalogue</p><h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-.04em] text-[#242540]">Open calls worth your time</h2><p className="mt-1 text-sm text-[#818298]">Real event records, deadlines, and team rules.</p></div><Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-[#3835b5] hover:gap-3">Browse all events <ArrowUpRight className="h-4 w-4" /></Link></div>
      {eventsQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="h-64 animate-pulse rounded-[22px] bg-[#ececf4]" /><div className="h-64 animate-pulse rounded-[22px] bg-[#ececf4]" /><div className="hidden h-64 animate-pulse rounded-[22px] bg-[#ececf4] xl:block" /></div> : eventsQuery.error ? <div className="rounded-2xl border border-[#f3dddd] bg-white dark:bg-[#1e1e36] p-8 text-sm text-[#965b62]">We couldn’t load events right now. Please retry in a moment.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.slice(0, 3).map(event => <EventCard key={event.id} event={event} compact />)}</div>}
      <div className="mt-10 grid gap-4 rounded-[24px] border border-[#e9e9f3] bg-white dark:bg-[#1e1e36] p-6 sm:grid-cols-3 sm:p-8">
        {[{icon: Sparkles,title:"Start with your idea",text:"Tell us your skills, interests, team size, and constraints in plain language."},{icon: ShieldCheck,title:"Know why it fits",text:"See transparent match factors and deterministic eligibility checks."},{icon: GraduationCap,title:"Go all the way",text:"Register, build your team, submit, get judged, and keep your achievements."}].map(item => {const Icon=item.icon;return <div key={item.title} className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0efff] dark:bg-[#2c2b53] text-[#5651d1]"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-[#333450] dark:text-[#f1f1fa]">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#828397] dark:text-[#8888a3]">{item.text}</p></div></div>})}
      </div>
      <div className="mt-8 flex justify-center"><Button onClick={() => setLocation("/forge")} variant="outline" className="h-11 rounded-full border-[#dbdaf2] bg-white dark:bg-[#1e1e36] px-5 text-sm font-bold text-[#3734ae] dark:text-[#8e8aff] hover:bg-[#f4f3ff]">Explore with IdeaForge AI <Sparkles className="ml-2 h-4 w-4" /></Button></div>
      <p className="mt-5 text-center text-[11px] text-[#9999aa]">Recommendations are based on the current IdeaForge catalogue. Always confirm organizer-published rules.</p>
    </section>
  </div>;
}

function UsersMini() { return <svg className="h-3.5 w-3.5 text-[#817bef]" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10.5 13.3v-1.1c0-1.2-1.1-2.2-2.5-2.2H4.2c-1.4 0-2.5 1-2.5 2.2v1.1M6.1 7.4a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM10.5 3a2.3 2.3 0 0 1 0 4.5M14.3 13.3v-1.1c0-1.2-.8-2-2-2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
