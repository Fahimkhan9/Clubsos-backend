import { Attendance } from "../models/attendance.model.js";
import { catchAsync } from "../middleware/error.middleware.js";

// ✅ Add or update attendance for multiple members
export const markAttendance = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const { records } = req.body; // [{ memberId, status }, ...]

  const results = await Promise.all(records.map(async ({ memberId, status }) => {
    return Attendance.findOneAndUpdate(
      { event: eventId, member: memberId },
      { status, timestamp: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
  }));

  res.status(200).json({ success: true, data: results });
});

// ✅ Get attendance for a specific event
export const getEventAttendance = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  const attendance = await Attendance.find({ event: eventId })
    .populate("member", "name email");

  res.status(200).json({ success: true, data: attendance });
});

// ✅ (Optional) Get all attendance records of a member
export const getMemberAttendance = catchAsync(async (req, res) => {
  const { memberId } = req.params;

  const attendance = await Attendance.find({ member: memberId })
    .populate("event", "title date");

  res.status(200).json({ success: true, data: attendance });
});
