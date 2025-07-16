import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  type: { type: String, enum: ["seminar", "workshop", "competition", "other"] },
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attachments: [{
    name: String,
    url: String,
    fileType: String, // e.g., pdf, image
  }],
}, { timestamps: true });



export const Event=mongoose.Model('Event',eventSchema)