import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './server/models.ts';

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  const judges = await User.find({ role: 'judge' });
  console.log('Judges:', judges);
  mongoose.connection.close();
}

run().catch(console.error);
