// models/invite.model.js
import mongoose from "mongoose";
import crypto from "crypto";

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  role: { type: String, required: true, enum: ["admin", "moderator", "member"] },
  designation: { type: String },
  inviteToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Generate a random token and set expiry (e.g., 7 days)
inviteSchema.statics.createInvite = async function(data) {
  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = new this({
    email: data.email,
    clubId: data.clubId,
    role: data.role,
    designation: data.designation,
    inviteToken: token,
    expiresAt,
  });

  await invite.save();
  return invite;
};

export const Invite = mongoose.model("Invite", inviteSchema);
