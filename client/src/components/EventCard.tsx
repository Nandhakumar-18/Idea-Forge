import { CalendarClock, MapPin, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";

export type EventCardData = {
  id: number;
  title: string;
  tagline: string;
  domain: string;
  format: "online" | "in-person" | "hybrid";
  entryType: "free" | "paid";
  location: string | null;
  registrationDeadline: Date | string;
  startsAt: Date | string;
  minTeamSize: number;
  maxTeamSize: number;
  skillsRequired: string[];
};

export function EventCard({ event, score, reasons, eligible, caution, compact = false }: {
  event: EventCardData;
  score?: number;
  reasons?: string[];
  eligible?: boolean;
  caution?: string[];
  compact?: boolean;
}) {
  const deadline = new Date(event.registrationDeadline);
  const starts = new Date(event.startsAt);
  const dateLabel = deadline.toLocaleDateString("en", { month: "short", day: "numeric" });
  return (
    <article className={`group relative overflow-hidden rounded-[22px] border border-[#e9e9f2] bg-white dark:bg-[#1e1e36] transition duration-200 hover:-translate-y-1 hover:border-[#cecdf8] hover:shadow-[0_16px_42px_rgba(35,35,80,.09)] ${compact ? "p-5" : "p-6"}`}>
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#625be9] via-[#9491ff] to-[#d3b6f9] opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-[#f0efff] dark:bg-[#2c2b53] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#4d49c5]">{event.domain}</span>
        {score !== undefined && <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf7f1] dark:bg-[#1e3d2f] px-2.5 py-1.5 text-xs font-bold text-[#22845e]"><Sparkles className="h-3 w-3" />{score}% match</span>}
      </div>
      <h3 className="mt-4 font-display text-[20px] font-extrabold leading-tight tracking-[-.035em] text-[#232440]">{event.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#77788e]">{event.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#6e7088]">
        <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-[#817bef]" />Register by {dateLabel}</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[#817bef]" />{event.minTeamSize}–{event.maxTeamSize} people</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#817bef]" />{event.format === "online" ? "Online" : event.location || event.format}</span>
      </div>
      {!compact && event.skillsRequired.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{event.skillsRequired.slice(0, 4).map(skill => <span key={skill} className="rounded-full border border-[#eeeeF5] bg-[#fbfbfd] px-2.5 py-1 text-[11px] font-medium text-[#66677f]">{skill}</span>)}</div>}
      {reasons?.length ? <div className="mt-4 rounded-xl bg-[#f7f7fd] px-3.5 py-3 text-xs leading-5 text-[#5c5e77]"><p className="mb-1 font-bold text-[#393a5d]">Why it fits</p>{reasons.slice(0, 2).map(reason => <p key={reason}>✓ {reason}</p>)}</div> : null}
      {caution?.length ? <p className="mt-3 rounded-lg bg-[#fff8eb] px-3 py-2 text-xs leading-5 text-[#946422]">{caution[0]}</p> : null}
      {eligible !== undefined && <p className={`mt-3 text-xs font-semibold ${eligible ? "text-[#27845f]" : "text-[#a86e28]"}`}>{eligible ? "✓ Passes current status, deadline, and team-size checks" : "! Review eligibility details before registering"}</p>}
      <div className="mt-5 flex items-center justify-between border-t border-[#f0f0f5] pt-4">
        <span className="text-xs font-semibold text-[#7c7d92]">Starts {starts.toLocaleDateString("en", { month: "short", day: "numeric" })} · {event.entryType === "free" ? "Free to enter" : "Entry fee"}</span>
        <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#3431ac] transition group-hover:gap-2">View event <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
