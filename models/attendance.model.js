import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent', 'excused'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

attendanceSchema.index({ event: 1, member: 1 }, { unique: true }); // prevent duplicates

export const Attendance = mongoose.model('Attendance', attendanceSchema);
