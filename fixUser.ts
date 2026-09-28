import "dotenv/config";
import { getDb } from "./server/db.ts";
import { User } from "./server/models.ts";

getDb().then(() => User.updateOne({ openId: "mock-user-123" }, { $set: { id: 999 } }))
  .then(() => { console.log("Fixed User"); process.exit(0); });
