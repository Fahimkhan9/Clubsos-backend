
import mongoose from 'mongoose'
const archiveSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  zipUrl: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exportedAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const Archieve=mongoose.Model('Archieve',archiveSchema)