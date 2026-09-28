import 'dotenv/config';
import mongoose from 'mongoose';
import { Event, User } from './server/models.ts';

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  
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
    organizerId: organizer.id,
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
