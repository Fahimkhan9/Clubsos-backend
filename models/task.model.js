// models/task.model.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "in_progress", "done"],
    default: "pending",
  },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
