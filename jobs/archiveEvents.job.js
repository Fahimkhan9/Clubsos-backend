import cron from "node-cron";
import { Event } from "../models/event.model.js";

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      { date: { $lt: now }, isArchived: false },
      { $set: { isArchived: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Archived ${result.modifiedCount} past events`);
    }
  } catch (error) {
    console.error("Error archiving events:", error);
  }
});
