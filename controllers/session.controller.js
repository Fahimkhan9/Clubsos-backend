import { Session } from "../models/session.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Get all active sessions of the logged-in user
 * @route GET /api/v1/sessions
 */
export const getActiveSessions = catchAsync(async (req, res) => {
  const sessions = await Session.find({ user: req.id, valid: true }).select(
    "-token"
  ); // don't send token
  res.status(200).json({ success: true, sessions });
});

/**
 * Logout from specific session
 * @route DELETE /api/v1/sessions/:id
 */
export const logoutSpecificSession = catchAsync(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    user: req.id,
    valid: true,
  });

  if (!session) throw new AppError("Session not found", 404);

  session.valid = false;
  await session.save();

  res.status(200).json({ success: true, message: "Logged out from session" });
});

/**
 * Logout from all devices
 * @route DELETE /api/v1/sessions
 */
export const logoutAllSessions = catchAsync(async (req, res) => {
  await Session.updateMany({ user: req.id, valid: true }, { valid: false });
  res
    .status(200)
    .cookie("token", "", { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge:0,
     })
    .json({ success: true, message: "Logged out from all devices" });
});
