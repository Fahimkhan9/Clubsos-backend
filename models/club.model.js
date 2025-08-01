import mongoose from 'mongoose'

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo:{type:String,default:'default-logo.png'},
  about:{type:String},
  university: { type: String, required: true },
  sessionYear: { type: String, required: true }, // e.g., 2024-2025
    members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: {
        type: String,
        enum: ["admin", "member",'moderator'],
        default: "member",
      },
      designation: {
        type: String, // NOT ENUM — allow anything like "President", "Lead Dev"
      },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });


export const Club=mongoose.model('Club',clubSchema)