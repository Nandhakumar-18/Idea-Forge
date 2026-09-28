import mongoose from "mongoose";
import { User, InsertUser } from "./models";
import { ENV } from './_core/env';

let isConnected = false;

export async function getDb() {
  if (!isConnected && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Connecting to URL:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@"));
      await mongoose.connect(process.env.DATABASE_URL, { serverSelectionTimeoutMS: 5000 });
      console.log("[Database] Connected successfully!");
      isConnected = true;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      isConnected = false;
    }
  }
  return isConnected ? mongoose.connection : null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(field => {
      const value = user[field];
      if (value !== undefined) {
        updateSet[field] = value ?? null;
      }
    });

    if (user.lastSignedIn !== undefined) {
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      updateSet.role = 'admin';
    }

    if (!updateSet.lastSignedIn) {
      updateSet.lastSignedIn = new Date();
    }

    const existingUser = await User.findOne({ openId: user.openId }).lean();

    if (!existingUser) {
      // Find the next sequence value manually for new users
      const Counter = mongoose.model("Counter");
      const sequenceDoc = await Counter.findOneAndUpdate(
        { _id: "user" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      updateSet.id = sequenceDoc.seq;
    }

    await User.findOneAndUpdate(
      { openId: user.openId },
      { $set: updateSet, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await User.findOne({ openId }).lean();
  return result || undefined;
}
