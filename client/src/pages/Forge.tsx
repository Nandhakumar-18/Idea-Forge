import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CircleHelp, Compass, FileSearch, MessageCircle, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { Link, Redirect } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type Match = { score: number; eligible: boolean; reasons: string[]; caution: string[]; event: { id: number; title: string; tagline: string; domain: string; format: "online" | "in-person" | "hybrid"; entryType: "free" | "paid"; location: string | null; registrationDeadline: Date; startsAt: Date; endsAt: Date; minTeamSize: number; maxTeamSize: number; skillsRequired: string[]; eligibilityText: string } };

export default function Forge() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [intent, setIntent] = useState<{ domains: string[]; skills: string[]; format: string; teamSize: number; freeOnly: boolean } | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const seeded = useRef(false);
  const { user, isAuthenticated } = useAuth();
  const recommend = trpc.ideaForge.discovery.recommend.useMutation();

  if (user?.role === "organizer") return <Redirect to="/events" />;

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const initial = sessionStorage.getItem("ideaforge:first-prompt");
    if (initial) {
      sessionStorage.removeItem("ideaforge:first-prompt");
      void sendMessage(initial, []);
    }
  }, []);

  async function sendMessage(content: string, history = messages) {
    const clean = content.trim();
    if (!clean || recommend.isPending) return;
    setLastPrompt(clean);
    setMessages(previous => [...previous, { role: "user", content: clean }]);
    const context = [...history.filter(message => message.role !== "system").slice(-6), { role: "user" as const, content: clean }]
      .map(message => `${message.role === "user" ? "Student" : "IdeaForge"}: ${message.content}`).join("\n");
    try {
      const response = await recommend.mutateAsync({ prompt: context.slice(-5000) });
      setIntent(response.intent);
      setMatches(response.matches as Match[]);
      setMessages(previous => [...previous, { role: "assistant", content: response.message }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while searching. Please try again.";
      setMessages(previous => [...previous, { role: "assistant", content: `I couldn't complete that search. ${message}` }]);
    }
  }

  const prompts = ["Free online AI or healthcare event for 4 people", "Education or accessibility hackathons", "Show me online events that fit Python and ML"];
  return <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 lg:px-10 lg:pt-10">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e6e5fa] bg-white dark:bg-[#1e1e36] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#5552bd]"><Sparkles className="h-3.5 w-3.5" />IdeaForge AI workspace</div><h1 className="font-display text-3xl font-extrabold tracking-[-.05em] text-[#20213e] dark:text-[#f1f1fa] sm:text-[38px]">Tell us what you want to build.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#78798f]">Ask in your own words. We’ll check the live catalogue, apply event rules, and explain the strongest matches.</p></div>
      <div className="flex items-center gap-2 rounded-xl border border-[#e9e9f2] bg-white dark:bg-[#1e1e36] px-3 py-2 text-xs text-[#77788d]"><span className="h-2 w-2 rounded-full bg-[#5cb68d]" />Catalogue and eligibility checks online</div>
    </div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
      <section className="rounded-[24px] border border-[#e7e7f0] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-3 shadow-[0_12px_34px_rgba(32,33,74,.05)] sm:p-4">
        {!messages.length && <div className="mb-3 rounded-[18px] bg-gradient-to-br from-[#f0efff] dark:from-[#2c2b53] to-[#faf9ff] dark:to-[#1e1e36] p-5 sm:p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white dark:bg-[#1e1e36] text-[#514cc9] shadow-sm"><WandSparkles className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-[#2e2f50] dark:text-[#f1f1fa]">Your next challenge starts with a conversation.</p><p className="mt-1 text-xs leading-5 text-[#71728b] dark:text-[#a3a3bb]">Share a domain, your skills, team size, event format, or any other constraints. We’ll ask only if something important is missing.</p></div></div></div>}
        <AIChatBox messages={messages} onSendMessage={content => { void sendMessage(content); }} isLoading={recommend.isPending} height="min(62vh, 590px)" placeholder="I want an AI healthcare hackathon for four people..." emptyStateMessage="Share your idea to see verified matches" suggestedPrompts={prompts} className="border-0 shadow-none" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f0f5] dark:border-[#35354f] px-2 pt-3 text-[10px] leading-5 text-[#9293a5]"><span className="inline-flex items-center gap-1.5"><ShieldMini />Eligibility is backend-verified; explanations use listed event data.</span><span>Enter to send · Shift+Enter for a new line</span></div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-[22px] border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-5 shadow-[0_8px_26px_rgba(32,33,74,.04)] sm:p-6">
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#7974d8]">Your matches</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-[-.035em] text-[#282944] dark:text-[#f1f1fa]">Recommendations</h2></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f0efff] dark:bg-[#2c2b53] text-[#514cc9]"><Compass className="h-4 w-4" /></span></div>
          {intent && <div className="mt-4 flex flex-wrap gap-1.5">{intent.domains.map(item => <span key={item} className="rounded-full bg-[#f1f0ff] dark:bg-[#2c2b53] px-2.5 py-1 text-[10px] font-semibold text-[#524dc8]">{item}</span>)}{intent.skills.slice(0, 4).map(item => <span key={item} className="rounded-full bg-[#f4f4f8] dark:bg-[#292943] px-2.5 py-1 text-[10px] font-semibold text-[#62637a] dark:text-[#a3a3bb]">{item}</span>)}{intent.teamSize > 0 && <span className="rounded-full bg-[#f4f4f8] dark:bg-[#292943] px-2.5 py-1 text-[10px] font-semibold text-[#62637a] dark:text-[#a3a3bb]">Team of {intent.teamSize}</span>}{intent.format !== "either" && <span className="rounded-full bg-[#f4f4f8] dark:bg-[#292943] px-2.5 py-1 text-[10px] font-semibold text-[#62637a] dark:text-[#a3a3bb]">{intent.format}</span>}</div>}
          {!matches.length ? <div className="mt-5 rounded-2xl border border-dashed border-[#ddddec] bg-[#fbfbfe] dark:bg-[#1e1e36] px-5 py-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white dark:bg-[#1e1e36] text-[#7671dc] dark:text-[#8e8aff] shadow-sm"><FileSearch className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-[#3d3e5a] dark:text-[#f1f1fa]">Matches appear here</p><p className="mx-auto mt-1 max-w-[270px] text-xs leading-5 text-[#898a9e] dark:text-[#8888a3]">Your results are ranked only after checking open status, deadlines, and stated constraints.</p></div> : <div className="mt-4 space-y-3">{matches.map(match => <EventCard key={match.event.id} event={match.event} score={match.score} eligible={match.eligible} reasons={match.reasons} caution={match.caution} compact />)}</div>}
        </div>
        <div className="rounded-[22px] border border-[#e7e6f4] dark:border-[#35354f] bg-gradient-to-br from-[#2825aa] to-[#4741c3] p-5 text-white shadow-[0_13px_34px_rgba(42,39,166,.18)]"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15"><CircleHelp className="h-4 w-4" /></span><div><h3 className="text-sm font-bold">Good matches, better profile</h3><p className="mt-1 text-xs leading-5 text-white/75">Add skills and interests to make recommendations more personal. Your profile won’t replace organizer eligibility rules.</p><Link href="/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white hover:gap-2">Update profile <ArrowRight className="h-3 w-3" /></Link></div></div></div>
        {!isAuthenticated && <div className="rounded-[20px] border border-[#e9e9f2] bg-white dark:bg-[#1e1e36] p-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f4f2ff] text-[#625ed1]"><UserRound className="h-4 w-4" /></span><div><h3 className="text-sm font-bold text-[#393a56] dark:text-[#f1f1fa]">Save your progress</h3><p className="mt-1 text-xs leading-5 text-[#828399] dark:text-[#8888a3]">Sign in to save your profile, register, and keep track of teams and submissions.</p><Button onClick={() => startLogin()} variant="outline" className="mt-3 h-9 rounded-lg border-[#dddcef] px-3 text-xs font-bold text-[#3c39b0]">Sign in <ArrowRight className="ml-1.5 h-3 w-3" /></Button></div></div></div>}
        {lastPrompt && <p className="px-1 text-[10px] text-[#a1a1b0] dark:text-[#8888a3]">Latest request: “{lastPrompt.slice(0, 86)}{lastPrompt.length > 86 ? "…" : ""}”</p>}
      </aside>
    </div>
    <p className="mt-7 flex items-center justify-center gap-2 text-center text-[10px] leading-5 text-[#9a9bab]"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#77ad91]" />AI can help interpret your request, but event facts and eligibility come from stored organizer data and deterministic rules.</p>
  </div>;
}

function ShieldMini() { return <svg className="h-3.5 w-3.5 shrink-0 text-[#52a17e]" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.6 13 3.5v3.7c0 3.1-2.1 5.8-5 7.2-2.9-1.4-5-4.1-5-7.2V3.5L8 1.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m5.5 7.9 1.7 1.7 3.4-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
