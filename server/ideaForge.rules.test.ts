import { describe, expect, it } from "vitest";
import { canManageEvent, evaluateEligibility } from "./ideaForge";

const eventRecord = (overrides: Record<string, unknown> = {}) => ({
  status: "open",
  registrationDeadline: new Date(Date.now() + 86_400_000),
  minTeamSize: 2,
  maxTeamSize: 5,
  studentOnly: false,
  allowedRegions: null,
  minGraduationYear: null,
  maxGraduationYear: null,
  ...overrides,
}) as never;

describe("deterministic eligibility", () => {
  it("accepts an open event before deadline when the team size is in range", () => {
    const result = evaluateEligibility(eventRecord(), 4);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("rejects an event whose registration is closed", () => {
    const result = evaluateEligibility(eventRecord({ status: "closed" }), 4);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("Registration is not open.");
  });

  it("rejects an expired registration deadline", () => {
    const result = evaluateEligibility(eventRecord({ registrationDeadline: new Date(Date.now() - 1_000) }), 4);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("The registration deadline has passed.");
  });

  it("rejects a team size outside the published range", () => {
    const result = evaluateEligibility(eventRecord(), 6);
    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toContain("between 2 and 5");
  });

  it("can identify non-status free-text qualifications as needing organizer confirmation", () => {
    const result = evaluateEligibility(eventRecord(), 4);
    expect(result.qualificationNote).toMatch(/confirm.*organizer/i);
  });

  it("requires a saved program for student-only events", () => {
    const result = evaluateEligibility(eventRecord({ studentOnly: true }), 4, null as never);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("Complete a student profile to confirm student eligibility.");
  });

  it("rejects a student outside the event's allowed regions", () => {
    const result = evaluateEligibility(eventRecord({ allowedRegions: ["Canada"] }), 4, { program: "CS", graduationYear: 2027, location: "Boston, MA" });
    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toContain("Canada");
  });

  it("checks graduation-year bounds against the saved profile", () => {
    const result = evaluateEligibility(eventRecord({ minGraduationYear: 2026, maxGraduationYear: 2029 }), 4, { program: "CS", graduationYear: 2031, location: "US" });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("Graduation year must be 2029 or earlier.");
  });
});

describe("organizer access", () => {
  const event = { organizerId: 8 };
  it("allows an event owner to manage their event", () => expect(canManageEvent({ id: 8, role: "student" }, event)).toBe(true));
  it("allows administrators to manage all events", () => expect(canManageEvent({ id: 99, role: "admin" }, event)).toBe(true));
  it("does not let another organizer access an event by role alone", () => expect(canManageEvent({ id: 9, role: "organizer" }, event)).toBe(false));
});
