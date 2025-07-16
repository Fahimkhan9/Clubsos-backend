import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "in_progress", "done"],
    default: "pending",
  },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });



export const Task=mongoose.Model('Task',taskSchema)