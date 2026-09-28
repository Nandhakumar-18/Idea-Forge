import mongoose, { Schema, Document, Model } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

async function getNextSequenceValue(sequenceName: string) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

function autoIncrementPlugin(schema: Schema, options: { modelName: string }) {
  schema.add({ id: { type: Number, unique: true } });
  schema.pre("save", async function() {
    if (this.isNew && this.id == null) {
      this.id = await getNextSequenceValue(options.modelName);
    }
  });
}

// Users
export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "student" | "organizer" | "judge" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const userSchema = new Schema<User>({
  openId: { type: String, required: true, unique: true, maxlength: 64 },
  name: { type: String, default: null },
  email: { type: String, maxlength: 320, default: null },
  loginMethod: { type: String, maxlength: 64, default: null },
  role: { type: String, enum: ["user", "student", "organizer", "judge", "admin"], default: "user", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  lastSignedIn: { type: Date, default: Date.now, required: true },
});
userSchema.plugin(autoIncrementPlugin, { modelName: "user" });
export const User = mongoose.models.User || mongoose.model<User>("User", userSchema);

export type InsertUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & { openId: string };

// Student Profiles
export interface StudentProfile {
  id: number;
  userId: number;
  program: string | null;
  graduationYear: number | null;
  location: string | null;
  skills: string[];
  interests: string[];
  updatedAt: Date;
}
const studentProfileSchema = new Schema<StudentProfile>({
  userId: { type: Number, required: true, unique: true },
  program: { type: String, maxlength: 180, default: null },
  graduationYear: { type: Number, default: null },
  location: { type: String, maxlength: 180, default: null },
  skills: { type: [String], required: true, default: [] },
  interests: { type: [String], required: true, default: [] },
  updatedAt: { type: Date, default: Date.now, required: true },
});
studentProfileSchema.plugin(autoIncrementPlugin, { modelName: "student_profile" });
export const StudentProfile = mongoose.models.StudentProfile || mongoose.model<StudentProfile>("StudentProfile", studentProfileSchema);

// Events
export interface Event {
  id: number;
  organizerId: number | null;
  title: string;
  tagline: string;
  description: string;
  domain: string;
  format: "online" | "in-person" | "hybrid";
  entryType: "free" | "paid";
  location: string | null;
  skillsRequired: string[];
  minTeamSize: number;
  maxTeamSize: number;
  eligibilityText: string;
  studentOnly: boolean;
  allowedRegions: string[] | null;
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  registrationDeadline: Date;
  submissions_close?: Date;
  startsAt: Date;
  endsAt: Date;
  status: "draft" | "open" | "closed";
  resultsLocked: boolean;
  resultsPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const eventSchema = new Schema<Event>({
  organizerId: { type: Number, default: null },
  title: { type: String, required: true, maxlength: 220 },
  tagline: { type: String, required: true, maxlength: 280 },
  description: { type: String, required: true },
  domain: { type: String, required: true, maxlength: 100 },
  format: { type: String, enum: ["online", "in-person", "hybrid"], required: true },
  entryType: { type: String, enum: ["free", "paid"], default: "free", required: true },
  location: { type: String, maxlength: 180, default: null },
  skillsRequired: { type: [String], required: true, default: [] },
  minTeamSize: { type: Number, default: 1, required: true },
  maxTeamSize: { type: Number, default: 5, required: true },
  eligibilityText: { type: String, required: true },
  studentOnly: { type: Boolean, default: false, required: true },
  allowedRegions: { type: [String], default: null },
  minGraduationYear: { type: Number, default: null },
  maxGraduationYear: { type: Number, default: null },
  registrationDeadline: { type: Date, required: true },
  submissions_close: { type: Date, required: false },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  status: { type: String, enum: ["draft", "open", "closed"], default: "open", required: true },
  resultsLocked: { type: Boolean, default: false, required: true },
  resultsPublished: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});
eventSchema.plugin(autoIncrementPlugin, { modelName: "event" });
export const Event = mongoose.models.Event || mongoose.model<Event>("Event", eventSchema);

// Event Rounds
export interface EventRound {
  id: number;
  eventId: number;
  name: string;
  sequence: number;
  requirements: string;
  dueAt: Date;
}
const eventRoundSchema = new Schema<EventRound>({
  eventId: { type: Number, required: true },
  name: { type: String, required: true, maxlength: 180 },
  sequence: { type: Number, required: true },
  requirements: { type: String, required: true },
  dueAt: { type: Date, required: true },
});
eventRoundSchema.plugin(autoIncrementPlugin, { modelName: "event_round" });
export const EventRound = mongoose.models.EventRound || mongoose.model<EventRound>("EventRound", eventRoundSchema);

// Registrations
export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  teamId: number | null;
  status: "registered" | "withdrawn";
  createdAt: Date;
}
const registrationSchema = new Schema<Registration>({
  eventId: { type: Number, required: true },
  userId: { type: Number, required: true },
  teamId: { type: Number, default: null },
  status: { type: String, enum: ["registered", "withdrawn"], default: "registered", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});
registrationSchema.plugin(autoIncrementPlugin, { modelName: "registration" });
export const Registration = mongoose.models.Registration || mongoose.model<Registration>("Registration", registrationSchema);

// Organizer Profiles
export interface OrganizerProfile {
  id: number;
  userId: number;
  organizationName: string | null;
  website: string | null;
  bio: string | null;
  updatedAt: Date;
}
const organizerProfileSchema = new Schema<OrganizerProfile>({
  userId: { type: Number, required: true, unique: true },
  organizationName: { type: String, maxlength: 180, default: null },
  website: { type: String, maxlength: 255, default: null },
  bio: { type: String, maxlength: 1000, default: null },
  updatedAt: { type: Date, default: Date.now, required: true },
});
organizerProfileSchema.plugin(autoIncrementPlugin, { modelName: "organizerProfile" });
export const OrganizerProfile = mongoose.models.OrganizerProfile || mongoose.model<OrganizerProfile>("OrganizerProfile", organizerProfileSchema);

// Teams
export interface Team {
  id: number;
  eventId: number;
  ownerId: number;
  name: string;
  inviteCode: string;
  createdAt: Date;
}
const teamSchema = new Schema<Team>({
  eventId: { type: Number, required: true },
  ownerId: { type: Number, required: true },
  name: { type: String, required: true, maxlength: 180 },
  inviteCode: { type: String, required: true, unique: true, maxlength: 32 },
  createdAt: { type: Date, default: Date.now, required: true },
});
teamSchema.plugin(autoIncrementPlugin, { modelName: "team" });
export const Team = mongoose.models.Team || mongoose.model<Team>("Team", teamSchema);

// Team Members
export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  memberRole: "captain" | "member";
  joinedAt: Date;
}
const teamMemberSchema = new Schema<TeamMember>({
  teamId: { type: Number, required: true },
  userId: { type: Number, required: true },
  memberRole: { type: String, enum: ["captain", "member"], default: "member", required: true },
  joinedAt: { type: Date, default: Date.now, required: true },
});
teamMemberSchema.plugin(autoIncrementPlugin, { modelName: "team_member" });
export const TeamMember = mongoose.models.TeamMember || mongoose.model<TeamMember>("TeamMember", teamMemberSchema);

// Submissions
export interface Submission {
  id: number;
  eventId: number;
  teamId: number;
  createdBy: number;
  version: number;
  title: string;
  summary: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  status: "draft" | "submitted";
  submittedAt: Date;
}
const submissionSchema = new Schema<Submission>({
  eventId: { type: Number, required: true },
  teamId: { type: Number, required: true },
  createdBy: { type: Number, required: true },
  version: { type: Number, default: 1, required: true },
  title: { type: String, required: true, maxlength: 220 },
  summary: { type: String, required: true },
  repositoryUrl: { type: String, maxlength: 500, default: null },
  demoUrl: { type: String, maxlength: 500, default: null },
  status: { type: String, enum: ["draft", "submitted"], default: "submitted", required: true },
  submittedAt: { type: Date, default: Date.now, required: true },
});
submissionSchema.plugin(autoIncrementPlugin, { modelName: "submission" });
export const Submission = mongoose.models.Submission || mongoose.model<Submission>("Submission", submissionSchema);

// Judge Assignments
export interface JudgeAssignment {
  id: number;
  eventId: number;
  judgeId: number;
  submissionId: number;
  conflictDeclared: boolean;
  assignedAt: Date;
}
const judgeAssignmentSchema = new Schema<JudgeAssignment>({
  eventId: { type: Number, required: true },
  judgeId: { type: Number, required: true },
  submissionId: { type: Number, required: true },
  conflictDeclared: { type: Boolean, default: false, required: true },
  assignedAt: { type: Date, default: Date.now, required: true },
});
judgeAssignmentSchema.plugin(autoIncrementPlugin, { modelName: "judge_assignment" });
export const JudgeAssignment = mongoose.models.JudgeAssignment || mongoose.model<JudgeAssignment>("JudgeAssignment", judgeAssignmentSchema);

// Evaluations
export interface Evaluation {
  id: number;
  assignmentId: number;
  score: number;
  feedback: string;
  submittedAt: Date;
}
const evaluationSchema = new Schema<Evaluation>({
  assignmentId: { type: Number, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now, required: true },
});
evaluationSchema.plugin(autoIncrementPlugin, { modelName: "evaluation" });
export const Evaluation = mongoose.models.Evaluation || mongoose.model<Evaluation>("Evaluation", evaluationSchema);

// Certificates
export interface Certificate {
  id: number;
  eventId: number;
  userId: number;
  code: string;
  achievement: string;
  issuedAt: Date;
}
const certificateSchema = new Schema<Certificate>({
  eventId: { type: Number, required: true },
  userId: { type: Number, required: true },
  code: { type: String, required: true, unique: true, maxlength: 64 },
  achievement: { type: String, required: true, maxlength: 160 },
  issuedAt: { type: Date, default: Date.now, required: true },
});
certificateSchema.plugin(autoIncrementPlugin, { modelName: "certificate" });
export const Certificate = mongoose.models.Certificate || mongoose.model<Certificate>("Certificate", certificateSchema);


// Dogfood Models
export interface DogfoodTrack {
  id: number;
  name: string;
}
const dogfoodTrackSchema = new Schema<DogfoodTrack>({
  name: { type: String, required: true },
});
dogfoodTrackSchema.plugin(autoIncrementPlugin, { modelName: "dogfood_track" });
export const DogfoodTrack = mongoose.models.DogfoodTrack || mongoose.model<DogfoodTrack>("DogfoodTrack", dogfoodTrackSchema);

export interface DogfoodJudge {
  id: number;
  name: string;
  email: string;
  tracks: number[];
}
const dogfoodJudgeSchema = new Schema<DogfoodJudge>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  tracks: { type: [Number], default: [] },
});
dogfoodJudgeSchema.plugin(autoIncrementPlugin, { modelName: "dogfood_judge" });
export const DogfoodJudge = mongoose.models.DogfoodJudge || mongoose.model<DogfoodJudge>("DogfoodJudge", dogfoodJudgeSchema);

export interface DogfoodTeam {
  id: number;
  name: string;
  members: string[];
}
const dogfoodTeamSchema = new Schema<DogfoodTeam>({
  name: { type: String, required: true },
  members: { type: [String], default: [] },
});
dogfoodTeamSchema.plugin(autoIncrementPlugin, { modelName: "dogfood_team" });
export const DogfoodTeam = mongoose.models.DogfoodTeam || mongoose.model<DogfoodTeam>("DogfoodTeam", dogfoodTeamSchema);

export interface DogfoodProject {
  id: number;
  team: number;
  track: number;
  title: string;
  summary: string;
  repo_url: string;
  submitted_at: Date;
}
const dogfoodProjectSchema = new Schema<DogfoodProject>({
  team: { type: Number, required: true },
  track: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  repo_url: { type: String, required: true },
  submitted_at: { type: Date, default: Date.now },
});
dogfoodProjectSchema.plugin(autoIncrementPlugin, { modelName: "dogfood_project" });
export const DogfoodProject = mongoose.models.DogfoodProject || mongoose.model<DogfoodProject>("DogfoodProject", dogfoodProjectSchema);

export interface DogfoodScore {
  id: number;
  judge: number;
  project: number;
  criteria: Map<string, number>;
  comment: string;
}
const dogfoodScoreSchema = new Schema<DogfoodScore>({
  judge: { type: Number, required: true },
  project: { type: Number, required: true },
  criteria: { type: Map, of: Number, default: {} },
  comment: { type: String, required: true },
});
dogfoodScoreSchema.plugin(autoIncrementPlugin, { modelName: "dogfood_score" });
export const DogfoodScore = mongoose.models.DogfoodScore || mongoose.model<DogfoodScore>("DogfoodScore", dogfoodScoreSchema);
