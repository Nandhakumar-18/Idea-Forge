import { connect, disconnect } from "mongoose";
import { User } from "./server/models";
import { ENV } from "./server/_core/env";

async function run() {
  await connect(ENV.databaseUrl);
  const res = await User.deleteMany({ name: { $nin: ["organizer", "judge_a", "judge_b", "participant"] } });
  console.log("Deleted extra users:", res.deletedCount);
  await disconnect();
}
run();
