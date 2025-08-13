import { Announcement } from "../models/announcement.model.js";

import { AppError,catchAsync } from "../middleware/error.middleware.js";

// 📌 Create an announcement
export const createAnnouncement = catchAsync(async (req, res) => {
  const { title, message, expiresAt, priority } = req.body;
  const { clubId } = req.params;

  if (!clubId || !title || !message) {
    throw new AppError("clubId, title, and message are required", 400);
  }

  const announcement = await Announcement.create({
    club: clubId,
    title,
    message,
    expiresAt,
    priority: priority || "medium", // default if not provided
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: announcement,
  });
});



// 📌 Get announcements for a club (with optional expiry filter)
export const getClubAnnouncements = catchAsync(async (req, res) => {
  const { clubId } = req.params;

  const now = new Date();
  const announcements = await Announcement.find({
    club: clubId,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: announcements,
  });
});

// 📌 Delete an announcement
export const deleteAnnouncement = catchAsync(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  // Optional: only creator or admin can delete
  if (
    announcement.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized to delete this announcement", 403);
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
  });
});
