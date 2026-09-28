const mongoose = require('mongoose');
const ENV = require('dotenv').config().parsed;

async function run() {
  await mongoose.connect(ENV.DATABASE_URL);
  
  // Get models
  const Event = mongoose.models.Event || mongoose.model("Event", new mongoose.Schema({
    organizerId: Number, title: String, tagline: String, description: String, domain: String, format: String, entryType: String, location: String, minTeamSize: Number, maxTeamSize: Number, eligibilityText: String, studentOnly: Boolean, allowedRegions: [String], minGraduationYear: Number, maxGraduationYear: Number, skillsRequired: [String], registrationDeadline: Date, startsAt: Date, endsAt: Date, status: String, resultsLocked: Boolean, aiJudgingEnabled: Boolean, maxTeamCount: Number
  }));
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
    openId: String, name: String, email: String, loginMethod: String, role: String, createdAt: Date, updatedAt: Date, lastSignedIn: Date
  }));
  
  // 1. Delete all events
  await Event.deleteMany({});
  console.log('Deleted all events');

  // 2. Find the organizer
  const organizer = await User.findOne({ role: 'organizer' });
  if (!organizer) {
    console.error('No organizer found');
    process.exit(1);
  }

  // 3. Create a new event
  const event = await Event.create({
    organizerId: organizer.id || 1,
    title: 'Future AI Hackathon 2026',
    tagline: 'Build the next generation of AI tools.',
    description: 'A 72-hour hackathon for building AI-powered solutions. You can build anything from healthcare to education.',
    domain: 'AI',
    format: 'online',
    entryType: 'free',
    location: 'Online',
    minTeamSize: 1,
    maxTeamSize: 4,
    eligibilityText: 'Anyone can join',
    studentOnly: false,
    allowedRegions: [],
    skillsRequired: ['AI', 'Machine Learning'],
    registrationDeadline: new Date(Date.now() + 86400000 * 7),
    startsAt: new Date(Date.now() + 86400000 * 8),
    endsAt: new Date(Date.now() + 86400000 * 10),
    status: 'open',
    resultsLocked: false,
    aiJudgingEnabled: true,
    maxTeamCount: null
  });
  console.log('Created new event: Future AI Hackathon 2026');

  // 4. Create a judge
  await User.deleteMany({ role: 'judge' });
  await User.create({
    openId: 'judge_tester_' + Date.now(),
    name: 'Test Judge',
    email: 'judge@example.com',
    role: 'judge',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date()
  });
  console.log('Created judge with email: judge@example.com');
  
  mongoose.connection.close();
}

run().catch(console.error);
