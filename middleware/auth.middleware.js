
import { Club } from "../models/club.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
// Checks if user is logged in via token in cookies
export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError("You are not logged in", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.userId;

    const user = await User.findById(req.id);
    if (!user) throw new AppError("User not found", 404);

    // Check if session is valid
    const session = await Session.findOne({ user: req.id, token, valid: true });
    if (!session) throw new AppError("Session expired. Please login again.", 401);

    req.user = user;
    req.session = session;

    // Update lastActive of session
    session.lastActive = Date.now();
    await session.save();

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") throw new AppError("Invalid token", 401);
    else if (error.name === "TokenExpiredError")
      throw new AppError("Token expired", 401);
    throw error;
  }
});

/**
 * Role-based middleware that checks if the authenticated user
 * has one of the allowed roles in the specific club
 */
export const restrictToClubRole = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    const clubId = req.params.clubId || req.body.clubId || req.query.clubId;

    if (!clubId) {
      throw new AppError("Club ID is required for role-based access", 400);
    }

    const club = await Club.findById(clubId);
    if (!club) {
      throw new AppError("Club not found", 404);
    }

    const member = club.members.find((m) => m.user.toString() === req.id);

    if (!member) {
      throw new AppError("You are not a member of this club", 403);
    }

    if (!allowedRoles.includes(member.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    // Pass additional info to downstream controllers if needed
    req.club = club;
    req.clubRole = member.role;
    req.clubDesignation = member.designation;

    next();
  });
};
