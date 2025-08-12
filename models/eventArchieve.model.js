import mongoose from "mongoose";

const eventArchiveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ["seminar", "workshop", "competition", "other"],
    default: "other",
  },
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attachments: [
    {
      name: String,
      url: String,
      fileType: String,
    },
  ],
}, { timestamps: true });

export const EventArchive = mongoose.model("EventArchive", eventArchiveSchema);
