import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: { type: Number, required: true },
  category: { type: String }, // e.g. design, logistics, etc.
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // optional
  clubId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Budget = mongoose.model('Budget', budgetSchema);
