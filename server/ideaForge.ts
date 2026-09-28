import { randomBytes } from "node:crypto";
import { z } from "zod";
import { Certificate, Evaluation, EventRound, Event, JudgeAssignment, Registration, StudentProfile, Submission, TeamMember, Team, User } from "./models";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

const demoEvents = [
  {
    title: "CareAI Innovation Sprint",
    tagline: "Build practical AI tools for healthier communities.",
    description: "A two-week online sprint for teams creating responsible AI prototypes for care access, clinical workflows, prevention, and patient education. Mentors provide two office-hour sessions; finalists present a working demo.",
    domain: "Healthcare",
    format: "online" as const,
    entryType: "free" as const,
    location: "Online",
    skillsRequired: ["Python", "Machine learning", "Data science", "Product design"],
    minTeamSize: 2,
    maxTeamSize: 5,
    eligibilityText: "Open to currently enrolled students worldwide. Teams of 2–5. No entry fee.",
    registrationDeadline: new Date("2026-10-08T23:59:00Z"),
    startsAt: new Date("2026-10-12T09:00:00Z"),
    endsAt: new Date("2026-10-26T23:59:00Z"),
    status: "open" as const,
  },
  {
    title: "Learning Futures Hackathon",
    tagline: "Make the next generation of learning more accessible.",
    description: "An online education technology hackathon focused on inclusive learning, feedback, tutoring, and tools that help educators personalize instruction. Teams have ten days to build and submit a demo.",
    domain: "Education",
    format: "online" as const,
    entryType: "free" as const,
    location: "Online",
    skillsRequired: ["Python", "AI", "UX research", "Web development"],
    minTeamSize: 1,
    maxTeamSize: 4,
    eligibilityText: "Students and recent graduates may participate. Solo builders and teams of up to four are welcome.",
    registrationDeadline: new Date("2026-10-11T23:59:00Z"),
    startsAt: new Date("2026-10-15T09:00:00Z"),
    endsAt: new Date("2026-10-25T23:59:00Z"),
    status: "open" as const,
  },
  {
    title: "Open Cities Data Challenge",
    tagline: "Turn public data into more livable cities.",
    description: "A hybrid innovation challenge for teams working on transportation, public services, sustainability, and equitable access to city resources. Project proposals are reviewed before the final build round.",
    domain: "Civic technology",
    format: "hybrid" as const,
    entryType: "free" as const,
    location: "Global / optional local showcase",
    skillsRequired: ["Data analysis", "Python", "Mapping", "Research"],
    minTeamSize: 2,
    maxTeamSize: 6,
    eligibilityText: "Open to students, community groups, and independent builders. Teams of 2–6.",
    registrationDeadline: new Date("2026-10-18T23:59:00Z"),
    startsAt: new Date("2026-10-24T09:00:00Z"),
    endsAt: new Date("2026-11-07T23:59:00Z"),
    status: "open" as const,
  },
  {
    title: "NextGen Health Builders — Campus Edition",
    tagline: "Prototype the future of preventive care.",
    description: "An in-person weekend build event connecting student developers with public-health mentors to create tools for prevention, wellbeing, and access.",
    domain: "Healthcare",
    format: "in-person" as const,
    entryType: "free" as const,
    location: "Boston, MA",
    skillsRequired: ["Machine learning", "Design", "Public health"],
    minTeamSize: 2,
    maxTeamSize: 4,
    eligibilityText: "For currently enrolled students able to attend in person in Boston. Teams of 2–4.",
    registrationDeadline: new Date("2026-10-05T23:59:00Z"),
    startsAt: new Date("2026-10-17T09:00:00Z"),
    endsAt: new Date("2026-10-19T23:59:00Z"),
    status: "open" as const,
  },
];

let seedInFlight: Promise<void> | undefined;
async function ensureDemoEvents() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "The event database is not available." });
  if (!seedInFlight) {
    seedInFlight = (async () => {
      const existing = await Event.findOne({}).lean();
      if (!existing) {
        for (const ev of demoEvents) {
          await Event.create(ev);
        }
      }
    })().finally(() => { seedInFlight = undefined; });
  }
  await seedInFlight;
  return db;
}

function requireDb(db: any) {
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "The database is not available." });
  return db;
}

export function canManageEvent(user: { id: number; role: string }, event: { organizerId: number | null }) {
  return user.role === "admin" || event.organizerId === user.id;
}

async function getEventOrThrow(eventId: number) {
  const db = requireDb(await getDb());
  const event = await Event.findOne({ id: eventId }).lean();
  if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
  return { db, event };
}

export function evaluateEligibility(event: any, teamSize?: number, profile?: { program: string | null; graduationYear: number | null; location: string | null }) {
  const reasons: string[] = [];
  if (event.status !== "open") reasons.push("Registration is not open.");
  if (event.resultsLocked || event.resultsPublished) reasons.push("Event participation is closed because results are locked or published.");
  if (new Date(event.registrationDeadline).getTime() <= Date.now()) reasons.push("The registration deadline has passed.");
  if (teamSize !== undefined && teamSize > 0 && (teamSize < event.minTeamSize || teamSize > event.maxTeamSize)) {
    reasons.push(`Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.`);
  }
  if (event.studentOnly && !profile?.program?.trim()) reasons.push("Complete a student profile to confirm student eligibility.");
  if (event.allowedRegions?.length) {
    const location = profile?.location?.trim().toLowerCase();
    if (!location) reasons.push("Add your location to check this event’s region requirement.");
    else if (!event.allowedRegions.some((region: string) => location.includes(region.toLowerCase()) || region.toLowerCase().includes(location))) reasons.push(`This event is limited to: ${event.allowedRegions.join(", ")}.`);
  }
  if ((event.minGraduationYear !== null && event.minGraduationYear !== undefined) || (event.maxGraduationYear !== null && event.maxGraduationYear !== undefined)) {
    if (profile?.graduationYear == null) reasons.push("Add your graduation year to check this event’s requirement.");
    else {
      if (event.minGraduationYear !== null && event.minGraduationYear !== undefined && profile.graduationYear < event.minGraduationYear) reasons.push(`Graduation year must be ${event.minGraduationYear} or later.`);
      if (event.maxGraduationYear !== null && event.maxGraduationYear !== undefined && profile.graduationYear > event.maxGraduationYear) reasons.push(`Graduation year must be ${event.maxGraduationYear} or earlier.`);
    }
  }
  return { eligible: reasons.length === 0, reasons, qualificationNote: "Free-text qualifications are organizer-provided; confirm any conditions not covered by structured checks with the organizer." };
}

async function calculateEventResults(db: any, eventId: number) {
  const entries = await Submission.find({ eventId }).lean();
  const results = [];
  for (const submission of entries) {
    const assignments = await JudgeAssignment.find({ submissionId: submission.id, conflictDeclared: false }).lean();
    const scores: number[] = [];
    for (const assignment of assignments) {
      const evaluation = await Evaluation.findOne({ assignmentId: assignment.id }).lean();
      if (evaluation) scores.push(evaluation.score);
    }
    results.push({ submission, averageScore: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null, evaluationCount: scores.length });
  }
  const scored = results.map(item => item.averageScore).filter((score): score is number => score !== null);
  const minimum = scored.length ? Math.min(...scored) : 0;
  const maximum = scored.length ? Math.max(...scored) : 0;
  return results.map(item => ({
    ...item,
    normalizedScore: item.averageScore === null ? null : maximum === minimum ? 50 : Math.round(((item.averageScore - minimum) / (maximum - minimum)) * 100),
  })).sort((a, b) => (b.normalizedScore ?? -1) - (a.normalizedScore ?? -1));
}

const intentSchema = {
  name: "hackathon_intent",
  strict: true,
  schema: {
    type: "object",
    properties: {
      domains: { type: "array", items: { type: "string" } },
      skills: { type: "array", items: { type: "string" } },
      format: { type: "string", enum: ["online", "in-person", "hybrid", "either"] },
      teamSize: { type: "integer", minimum: 0 },
      freeOnly: { type: "boolean" },
    },
    required: ["domains", "skills", "format", "teamSize", "freeOnly"],
    additionalProperties: false,
  },
};

async function getModelId() {
  try {
    const catalog = await listLLMModels();
    return catalog.data.find(model => model.id === "gpt-5-mini")?.id;
  } catch {
    return undefined;
  }
}

function fallbackIntent(prompt: string) {
  const lower = prompt.toLowerCase();
  const domains = ["healthcare", "education", "climate", "civic", "finance", "accessibility", "agriculture"]
    .filter(value => lower.includes(value));
  const skills = ["python", "machine learning", "ai", "data science", "design", "computer vision", "web development"]
    .filter(value => lower.includes(value));
  const sizeMatch = lower.match(/team of\s+(\d+)|team\s+(?:size\s*)?(\d+)|(\d+)\s+people/);
  const format = lower.includes("online") ? "online" : lower.includes("in person") || lower.includes("in-person") ? "in-person" : lower.includes("hybrid") ? "hybrid" : "either";
  return { domains, skills, format, teamSize: sizeMatch ? Number(sizeMatch[1] || sizeMatch[2] || sizeMatch[3]) : 0, freeOnly: /\bfree\b|no fee|no cost/.test(lower) };
}

async function extractIntent(prompt: string) {
  const model = await getModelId();
  try {
    const response = await invokeLLM({
      model,
      maxTokens: 240,
      responseFormat: { type: "json_schema", json_schema: intentSchema },
      messages: [
        { role: "system", content: "Extract only explicit hackathon search preferences from the message. Do not infer a constraint that was not stated. Use empty arrays when absent, format either when absent, teamSize 0 when not stated, and false for freeOnly unless the user explicitly asks for a free/no-fee event." },
        { role: "user", content: prompt.slice(0, 2000) },
      ],
    });
    const raw = response.choices[0]?.message.content;
    if (typeof raw !== "string") return fallbackIntent(prompt);
    const parsed = JSON.parse(raw) as ReturnType<typeof fallbackIntent>;
    return { ...parsed, teamSize: Number.isFinite(parsed.teamSize) ? Math.min(20, Math.max(0, parsed.teamSize)) : 0 };
  } catch (error) {
    console.warn("[IdeaForge] Intent extraction fallback:", error instanceof Error ? error.message : "unknown error");
    return fallbackIntent(prompt);
  }
}

function scoreEvent(event: any, intent: ReturnType<typeof fallbackIntent>, profile?: { skills: string[]; interests: string[]; program: string | null; graduationYear: number | null; location: string | null }) {
  const reasons: string[] = [];
  const caution: string[] = [];
  const domainText = `${event.domain} ${event.title} ${event.description}`.toLowerCase();
  const desiredDomains = intent.domains.map(value => value.toLowerCase());
  const domainHit = desiredDomains.some(value => domainText.includes(value));
  const requestedSkills = Array.from(new Set([...intent.skills, ...(profile?.skills ?? [])])).map(value => value.toLowerCase());
  const eventSkills = (event.skillsRequired ?? []).map((value: string) => value.toLowerCase());
  const skillHits = requestedSkills.filter(value => eventSkills.some((skill: string) => skill.includes(value) || value.includes(skill)));
  const interestHit = (profile?.interests ?? []).some(value => domainText.includes(value.toLowerCase()));
  let score = 48;
  if (desiredDomains.length) { score += domainHit ? 22 : -12; if (domainHit) reasons.push(`Strong fit for ${event.domain.toLowerCase()}.`); }
  if (requestedSkills.length) { score += Math.min(20, skillHits.length * 7); if (skillHits.length) reasons.push(`Uses ${skillHits.slice(0, 3).join(", ")} skills you mentioned or added to your profile.`); }
  else score += 8;
  if (interestHit) { score += 8; reasons.push("Aligns with an interest on your profile."); }
  if (intent.format !== "either") { if (event.format === intent.format || (intent.format === "online" && event.format === "hybrid")) { score += 8; reasons.push(`Available ${event.format === "hybrid" ? "online or in person" : "online"} as requested.`); } else score -= 22; }
  if (intent.freeOnly) { if (event.entryType === "free") { score += 8; reasons.push("No entry fee is listed."); } else score -= 35; }
  if (intent.teamSize) { if (intent.teamSize >= event.minTeamSize && intent.teamSize <= event.maxTeamSize) { score += 8; reasons.push(`Accepts teams of ${event.minTeamSize}–${event.maxTeamSize}.`); } else { score -= 30; caution.push(`Team size ${intent.teamSize} is outside the event range (${event.minTeamSize}–${event.maxTeamSize}).`); } }
  if (event.status === "open" && new Date(event.registrationDeadline).getTime() > Date.now()) reasons.push("Registration is open.");
  if (!reasons.length) reasons.push("This event is currently open and may be worth exploring.");
  const eligibility = evaluateEligibility(event, intent.teamSize || undefined, profile);
  return { score: Math.max(0, Math.min(99, Math.round(score))), eligible: eligibility.eligible, reasons, caution: [...caution, ...eligibility.reasons], event };
}

export const ideaForgeRouter = router({
  events: router({
    list: publicProcedure.input(z.object({ domain: z.string().optional(), format: z.enum(["online", "in-person", "hybrid"]).optional(), status: z.enum(["all", "open", "closed"]).optional(), studentOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
      await ensureDemoEvents();
      const now = new Date();
      const query: any = {};
      
      if (input?.status === "open") {
        query.status = "open";
        query.registrationDeadline = { $gt: now };
      } else if (input?.status === "closed") {
        query.$or = [{ status: "closed" }, { registrationDeadline: { $lte: now } }];
      } else {
        // Default to showing open events if not specified, or all if 'all'
        if (!input?.status) {
          query.status = "open";
          query.registrationDeadline = { $gt: now };
        }
      }

      if (input?.domain) query.domain = input.domain;
      if (input?.format) query.format = input.format;
      if (input?.studentOnly !== undefined) query.studentOnly = input.studentOnly;
      
      return Event.find(query).sort({ registrationDeadline: 1 }).lean();
    }),
    detail: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const { event } = await getEventOrThrow(input.id);
      const rounds = await EventRound.find({ eventId: input.id }).sort({ sequence: 1 }).lean();
      const count = await Registration.countDocuments({ eventId: input.id, status: "registered" });
      return { ...event, rounds, participantCount: count };
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(4).max(220), tagline: z.string().min(8).max(280), description: z.string().min(20), domain: z.string().min(2).max(100),
      format: z.enum(["online", "in-person", "hybrid"]), entryType: z.enum(["free", "paid"]), location: z.string().max(180).optional(),
      minTeamSize: z.number().int().min(1).max(20), maxTeamSize: z.number().int().min(1).max(20), eligibilityText: z.string().min(8),
      studentOnly: z.boolean().default(false), allowedRegions: z.array(z.string().min(1).max(100)).max(30).default([]),
      minGraduationYear: z.number().int().min(2020).max(2040).optional(), maxGraduationYear: z.number().int().min(2020).max(2040).optional(),
      registrationDeadline: z.string().datetime(), startsAt: z.string().datetime(), endsAt: z.string().datetime(), skillsRequired: z.array(z.string().min(1)).max(20),
    }).refine(data => data.minTeamSize <= data.maxTeamSize, { message: "Minimum team size must not exceed maximum team size." }).refine(data => new Date(data.registrationDeadline) < new Date(data.endsAt), { message: "Registration must close before the event ends." }).refine(data => data.minGraduationYear === undefined || data.maxGraduationYear === undefined || data.minGraduationYear <= data.maxGraduationYear, { message: "Minimum graduation year must not exceed maximum graduation year." })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      const event = new Event({ ...input, organizerId: ctx.user.id, registrationDeadline: new Date(input.registrationDeadline), startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt), status: "open" });
      await event.save();
      return { id: event.id };
    }),
    addRound: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), name: z.string().min(2).max(180), requirements: z.string().min(8), dueAt: z.string().datetime() })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can edit rounds." });
      if (event.resultsLocked || event.resultsPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Rounds cannot be edited after results are locked or published." });
      const count = await EventRound.countDocuments({ eventId: input.eventId });
      const round = new EventRound({ eventId: input.eventId, name: input.name, requirements: input.requirements, dueAt: new Date(input.dueAt), sequence: count + 1 });
      await round.save();
      return { success: true };
    }),
    organizerList: protectedProcedure.query(async ({ ctx }) => {
      await ensureDemoEvents();
      const own = await Event.find({ organizerId: ctx.user.id }).sort({ createdAt: -1 }).lean();
      const result = [];
      for (const event of own) {
        const regCount = await Registration.countDocuments({ eventId: event.id, status: "registered" });
        const subCount = await Submission.countDocuments({ eventId: event.id });
        result.push({ ...event, registrationCount: regCount, submissionCount: subCount });
      }
      return result;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const profile = await StudentProfile.findOne({ userId: ctx.user.id }).lean();
      return profile ?? null;
    }),
    save: protectedProcedure.input(z.object({ program: z.string().max(180).optional(), graduationYear: z.number().int().min(2020).max(2040).optional(), location: z.string().max(180).optional(), skills: z.array(z.string().min(1).max(80)).max(30), interests: z.array(z.string().min(1).max(80)).max(20) })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      await StudentProfile.findOneAndUpdate(
        { userId: ctx.user.id },
        { userId: ctx.user.id, program: input.program ?? null, graduationYear: input.graduationYear ?? null, location: input.location ?? null, skills: input.skills, interests: input.interests },
        { upsert: true, new: true }
      );
      return { success: true };
    }),
  }),
  discovery: router({
    recommend: publicProcedure.input(z.object({ prompt: z.string().min(3).max(6000) })).mutation(async ({ ctx, input }) => {
      await ensureDemoEvents();
      const profile = ctx.user ? await StudentProfile.findOne({ userId: ctx.user.id }).lean() : null;
      const intent = await extractIntent(input.prompt);
      const openEvents = await Event.find({ status: "open", registrationDeadline: { $gt: new Date() } }).lean();
      const matched = openEvents.map(event => scoreEvent(event, intent, profile ?? undefined)).filter(item => !intent.freeOnly || item.event.entryType === "free").sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score).slice(0, 5);
      const verified = matched.map(({ score, eligible, reasons, caution, event }) => ({ score, eligible, reasons, caution, event: { id: event.id, title: event.title, tagline: event.tagline, domain: event.domain, format: event.format, entryType: event.entryType, location: event.location, registrationDeadline: event.registrationDeadline, startsAt: event.startsAt, endsAt: event.endsAt, minTeamSize: event.minTeamSize, maxTeamSize: event.maxTeamSize, skillsRequired: event.skillsRequired, eligibilityText: event.eligibilityText } }));
      const fallback = verified.length ? `I found ${verified.length} events in the IdeaForge catalogue. ${verified.filter(item => item.eligible).length} pass the current status, deadline, and team-size checks. Here are your strongest matches.` : "I couldn't find an open event that matches those constraints in the current catalogue. Try broadening the domain or format.";
      let message = fallback;
      if (verified.length) {
        try {
          const model = await getModelId();
          const response = await invokeLLM({ model, maxTokens: 320, messages: [
            { role: "system", content: "You are IdeaForge, a concise hackathon discovery assistant. The event records below are the only source of event facts. Never invent events, deadlines, eligibility, awards, or rules. Eligibility flags and match scores were calculated by the backend and are authoritative; do not alter or contradict them. Refer to verified event names only. Mention a caveat if a candidate is not eligible. Ask at most one helpful follow-up question when useful. Keep to 2–4 sentences." },
            { role: "user", content: `Student request: ${input.prompt}\nExtracted filters: ${JSON.stringify(intent)}\nBackend-verified candidates: ${JSON.stringify(verified)}` },
          ] });
          const content = response.choices[0]?.message.content;
          if (typeof content === "string" && content.trim()) message = content.trim();
        } catch (error) {
          console.warn("[IdeaForge] Grounded explanation fallback:", error instanceof Error ? error.message : "unknown error");
        }
      }
      return { message, intent, matches: verified };
    }),
    eligibility: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), teamSize: z.number().int().min(1).max(20).optional() })).query(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      requireDb(await getDb());
      const profile = await StudentProfile.findOne({ userId: ctx.user.id }).lean();
      return evaluateEligibility(event, input.teamSize, profile ?? undefined);
    }),
  }),
  registration: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const rows = await Registration.find({ userId: ctx.user.id, status: "registered" }).sort({ createdAt: -1 }).lean();
      const result = [];
      for (const row of rows) {
        const event = await Event.findOne({ id: row.eventId }).lean();
        if (event) result.push({ ...row, event });
      }
      return result;
    }),
    register: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), teamSize: z.number().int().min(1).max(20).default(1) })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      const profile = await StudentProfile.findOne({ userId: ctx.user.id }).lean();
      const eligibility = evaluateEligibility(event, input.teamSize, profile ?? undefined);
      if (!eligibility.eligible) throw new TRPCError({ code: "PRECONDITION_FAILED", message: eligibility.reasons.join(" ") });
      const existing = await Registration.findOne({ eventId: event.id, userId: ctx.user.id, status: "registered" }).lean();
      if (existing) return { success: true, alreadyRegistered: true };
      const reg = new Registration({ eventId: event.id, userId: ctx.user.id, status: "registered" });
      await reg.save();
      return { success: true, alreadyRegistered: false };
    }),
  }),
  teams: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const memberships = await TeamMember.find({ userId: ctx.user.id }).lean();
      const teamIds = memberships.map(row => row.teamId);
      if (!teamIds.length) return [];
      return Team.find({ id: { $in: teamIds } }).lean();
    }),
    create: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), name: z.string().min(2).max(180) })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (event.resultsLocked || event.resultsPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This event is no longer accepting team registrations." });
      const registered = await Registration.findOne({ eventId: event.id, userId: ctx.user.id, status: "registered" }).lean();
      if (!registered) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Register for the event before creating a team." });
      const code = randomBytes(6).toString("hex").toUpperCase();
      const team = new Team({ eventId: event.id, ownerId: ctx.user.id, name: input.name, inviteCode: code });
      await team.save();
      const tm = new TeamMember({ teamId: team.id, userId: ctx.user.id, memberRole: "captain" });
      await tm.save();
      await Registration.updateOne({ eventId: event.id, userId: ctx.user.id }, { $set: { teamId: team.id } });
      return { id: team.id, inviteCode: code };
    }),
    join: protectedProcedure.input(z.object({ inviteCode: z.string().min(4).max(32) })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      const team = await Team.findOne({ inviteCode: input.inviteCode.toUpperCase() }).lean();
      if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Invite code not found." });
      const event = await Event.findOne({ id: team.eventId }).lean();
      if (!event || event.status !== "open" || event.resultsLocked || event.resultsPublished || new Date(event.registrationDeadline).getTime() <= Date.now()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This event is no longer accepting team members." });
      const existing = await TeamMember.findOne({ teamId: team.id, userId: ctx.user.id }).lean();
      if (existing) return { success: true, teamName: team.name, alreadyJoined: true };
      const registered = await Registration.findOne({ eventId: team.eventId, userId: ctx.user.id, status: "registered" }).lean();
      if (registered?.teamId && registered.teamId !== team.id) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "You’re already on another team for this event." });
      const profile = await StudentProfile.findOne({ userId: ctx.user.id }).lean();
      const eligibility = evaluateEligibility(event, undefined, profile ?? undefined);
      if (!eligibility.eligible) throw new TRPCError({ code: "PRECONDITION_FAILED", message: eligibility.reasons.join(" ") });
      const current = await TeamMember.countDocuments({ teamId: team.id });
      if (current >= event.maxTeamSize) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This team has reached its maximum size." });
      if (!registered) {
        const reg = new Registration({ eventId: team.eventId, userId: ctx.user.id, teamId: team.id, status: "registered" });
        await reg.save();
      } else {
        await Registration.updateOne({ id: registered.id }, { $set: { teamId: team.id } });
      }
      const tm = new TeamMember({ teamId: team.id, userId: ctx.user.id, memberRole: "member" });
      await tm.save();
      return { success: true, teamName: team.name };
    }),
  }),
  submissions: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const memberships = await TeamMember.find({ userId: ctx.user.id }).lean();
      if (!memberships.length) return [];
      const teamIds = memberships.map(row => row.teamId);
      return Submission.find({ teamId: { $in: teamIds } }).sort({ submittedAt: -1 }).lean();
    }),
    submit: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), teamId: z.number().int().positive(), title: z.string().min(3).max(220), summary: z.string().min(20).max(5000), repositoryUrl: z.string().url().optional().or(z.literal("")), demoUrl: z.string().url().optional().or(z.literal("")) })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (new Date(event.endsAt).getTime() < Date.now()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The submission deadline has passed." });
      if (event.resultsLocked) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The event’s results are locked; no further submissions or revisions can be made." });
      const membership = await TeamMember.findOne({ teamId: input.teamId, userId: ctx.user.id }).lean();
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Only a team member can submit for this team." });
      const team = await Team.findOne({ id: input.teamId, eventId: input.eventId }).lean();
      if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found for this event." });
      const membersCount = await TeamMember.countDocuments({ teamId: team.id });
      if (membersCount < event.minTeamSize || membersCount > event.maxTeamSize) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Submissions require ${event.minTeamSize}–${event.maxTeamSize} team members.` });
      const previous = await Submission.find({ teamId: team.id, eventId: event.id }).sort({ version: -1 }).limit(1).lean();
      const sub = new Submission({ eventId: event.id, teamId: team.id, createdBy: ctx.user.id, version: (previous[0]?.version ?? 0) + 1, title: input.title, summary: input.summary, repositoryUrl: input.repositoryUrl || null, demoUrl: input.demoUrl || null, status: "submitted" });
      await sub.save();
      return { success: true, version: (previous[0]?.version ?? 0) + 1 };
    }),
  }),
  judging: router({
    evaluateWithAI: protectedProcedure.input(z.object({ submissionId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "organizer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only organizers can trigger AI evaluation." });
      }
      const { evaluateSubmissionWithAI } = await import("./aiJudge");
      return await evaluateSubmissionWithAI(input.submissionId);
    }),
    joinAsJudge: protectedProcedure.mutation(async ({ ctx }) => {
      requireDb(await getDb());
      if (ctx.user.role === "admin" || ctx.user.role === "organizer") return { success: true, role: ctx.user.role };
      throw new TRPCError({ code: "FORBIDDEN", message: "Judging is restricted to event organizers only." });
    }),
    assignments: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const rows = await JudgeAssignment.find({ judgeId: ctx.user.id }).sort({ assignedAt: -1 }).lean();
      const result = [];
      for (const row of rows) {
        const submission = await Submission.findOne({ id: row.submissionId }).lean();
        const event = await Event.findOne({ id: row.eventId }).lean();
        if (submission && event) {
          const { createdBy: _submitterIdentity, ...blindSubmission } = submission;
          result.push({ assignment: row, submission: blindSubmission, event });
        }
      }
      return result;
    }),
    assign: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), submissionId: z.number().int().positive(), judgeId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can assign judges." });
      if (event.resultsLocked) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Results are locked; no further judge assignments can be made." });
      const submission = await Submission.findOne({ id: input.submissionId, eventId: input.eventId }).lean();
      if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found for this event." });
      const judge = await User.findOne({ id: input.judgeId }).lean();
      if (!judge) throw new TRPCError({ code: "NOT_FOUND", message: "Judge account not found." });
      if (judge.role !== "organizer" && judge.role !== "admin") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only event organizers can be assigned as judges." });
      const duplicate = await JudgeAssignment.findOne({ submissionId: submission.id, judgeId: judge.id }).lean();
      if (duplicate) return { success: true, alreadyAssigned: true };
      const ja = new JudgeAssignment({ eventId: event.id, submissionId: submission.id, judgeId: input.judgeId, conflictDeclared: false });
      await ja.save();
      return { success: true };
    }),
    declareConflict: protectedProcedure.input(z.object({ assignmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      const assignment = await JudgeAssignment.findOne({ id: input.assignmentId, judgeId: ctx.user.id }).lean();
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Judge assignment not found." });
      const event = await Event.findOne({ id: assignment.eventId }).lean();
      if (!event || event.resultsLocked) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The event’s results are locked; conflicts must be declared before locking." });
      await JudgeAssignment.updateOne({ id: assignment.id }, { $set: { conflictDeclared: true } });
      return { success: true };
    }),
    evaluate: protectedProcedure.input(z.object({ assignmentId: z.number().int().positive(), score: z.number().int().min(0).max(100), feedback: z.string().min(10).max(3000) })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      const assignment = await JudgeAssignment.findOne({ id: input.assignmentId, judgeId: ctx.user.id }).lean();
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Judge assignment not found." });
      if (assignment.conflictDeclared) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A conflicted judge cannot submit an evaluation." });
      const event = await Event.findOne({ id: assignment.eventId }).lean();
      if (!event || event.resultsLocked) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The event’s results are locked; no further scores can be submitted." });
      const existing = await Evaluation.findOne({ assignmentId: assignment.id }).lean();
      if (existing) await Evaluation.updateOne({ id: existing.id }, { $set: { score: input.score, feedback: input.feedback, submittedAt: new Date() } });
      else {
        const ev = new Evaluation({ assignmentId: assignment.id, score: input.score, feedback: input.feedback });
        await ev.save();
      }
      return { success: true };
    }),
    results: protectedProcedure.input(z.object({ eventId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const { db, event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can view event results." });
      return calculateEventResults(db, event.id);
    }),
    lockResults: protectedProcedure.input(z.object({ eventId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const { db, event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can lock results." });
      if (event.resultsPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Published results are already final." });
      const results = await calculateEventResults(db, event.id);
      if (!results.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "There are no submissions to lock." });
      if (results.some(item => item.averageScore === null)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Every submission needs at least one completed, non-conflicted evaluation before results can be locked." });
      await Event.updateOne({ id: event.id }, { $set: { resultsLocked: true } });
      return { success: true, locked: true };
    }),
    publishResults: protectedProcedure.input(z.object({ eventId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can publish results." });
      if (!event.resultsLocked) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Lock results after all reviews are complete before publishing." });
      await Event.updateOne({ id: event.id }, { $set: { resultsPublished: true } });
      return { success: true, published: true };
    }),
    publishedResults: protectedProcedure.input(z.object({ eventId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const { db, event } = await getEventOrThrow(input.eventId);
      if (!event.resultsPublished && !canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Results have not been published by the organizer." });
      return { published: event.resultsPublished, locked: event.resultsLocked, results: await calculateEventResults(db, event.id) };
    }),
  }),
  certificates: router({
    view: publicProcedure.input(z.object({ code: z.string().min(8).max(64) })).query(async ({ input }) => {
      requireDb(await getDb());
      const certificate = await Certificate.findOne({ code: input.code }).lean();
      if (!certificate) throw new TRPCError({ code: "NOT_FOUND", message: "Certificate not found." });
      const event = await Event.findOne({ id: certificate.eventId }).lean();
      const recipient = await User.findOne({ id: certificate.userId }).lean();
      return { certificate, event, recipientName: recipient?.name || "IdeaForge participant" };
    }),
    mine: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      const rows = await Certificate.find({ userId: ctx.user.id }).sort({ issuedAt: -1 }).lean();
      const result = [];
      for (const certificate of rows) {
        const event = await Event.findOne({ id: certificate.eventId }).lean();
        if (event) result.push({ ...certificate, event });
      }
      return result;
    }),
    issue: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), userId: z.number().int().positive(), achievement: z.string().min(3).max(160) })).mutation(async ({ ctx, input }) => {
      const { event } = await getEventOrThrow(input.eventId);
      if (!canManageEvent(ctx.user as any, event)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the event organizer can issue certificates." });
      if (!event.resultsPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Publish event results before issuing certificates." });
      const registration = await Registration.findOne({ eventId: event.id, userId: input.userId, status: "registered" }).lean();
      if (!registration) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Certificates can only be issued to a registered participant." });
      const code = `IF-${randomBytes(8).toString("hex").toUpperCase()}`;
      const cert = new Certificate({ eventId: event.id, userId: input.userId, code, achievement: input.achievement });
      await cert.save();
      return { success: true, code };
    }),
  }),
});
