import express from "express";
import {
  createClub,
  getMyClubs,
  getMyClubsV2,
  getClubById,
  updateClub,
  deleteClub,
  inviteMemberToClub,
  acceptInvitation,
  removeMemberFromClub,
  updateMemberRole,
  getMembersOfClub,
} from "../controllers/club.controller.js";

import {
  createBudget,
  getClubBudgets,
  getBudgetSummary,
  deleteBudget,
  updateBudget,
  getMonthlyBudgetSummary,
} from "../controllers/budget.controller.js";

import {
  isAuthenticated,
  restrictToClubRole,
} from "../middleware/auth.middleware.js";

import {
  validateClubCreate,
  validateClubUpdate,
  validateMemberInvite,
  validateMemberUpdate,
  commonValidations,
} from "../middleware/validation.middleware.js";

import upload from "../utils/multer.js";

import {
  createEvent,
  deleteEvent,
  getClubEvents,
  getEventById,
  updateEvent,
  getUpcomingEvents,
} from "../controllers/event.controller.js";

const router = express.Router();

router.use(isAuthenticated);

// === CLUB ROUTES ===
router.post("/", upload.single("logo"), createClub);
router.get("/my", getMyClubs);
router.get("/mys", getMyClubsV2);
router.post("/accept", acceptInvitation);

// === EVENT ROUTES ===
router.get("/event/upcoming", getUpcomingEvents);
router.get("/event/:id", getEventById);
router.post(
  "/:clubId/event",
  restrictToClubRole("admin", "moderator"),
  upload.array("attachments"),
  createEvent
);
router.get("/:clubId/event", getClubEvents);
router.patch(
  "/:clubId/event/:id",
  restrictToClubRole("admin", "moderator"),
  updateEvent
);
router.delete(
  "/:clubId/event/:id",
  restrictToClubRole("admin", "moderator"),
  deleteEvent
);

// === BUDGET ROUTES ===
router.post(
  "/:clubId/budget",
  restrictToClubRole("admin", "moderator"),
  createBudget
);
router.get(
  "/:clubId/budget",
  restrictToClubRole("admin", "moderator"),
  getClubBudgets
);
router.get("/:clubId/budget/monthly", getMonthlyBudgetSummary);
router.get(
  "/:clubId/budget/summary",
  restrictToClubRole("admin", "moderator"),
  getBudgetSummary
);
router.patch(
  "/:clubId/budget/:id",
  restrictToClubRole("admin", "moderator"),
  updateBudget
);
router.delete(
  "/:clubId/budget/:id",
  restrictToClubRole("admin", "moderator"),
  deleteBudget
);

// === MEMBER ROUTES ===
router.get(
  "/:clubId/members",
  commonValidations.objectId("clubId"),
  getMembersOfClub
);
router.post(
  "/:clubId/invite",
  restrictToClubRole("admin", "moderator"),
  commonValidations.objectId("clubId"),
  validateMemberInvite,
  inviteMemberToClub
);
router.delete(
  "/:clubId/members/:memberId",
  restrictToClubRole("admin"),
  commonValidations.objectId("clubId"),
  commonValidations.objectId("memberId"),
  removeMemberFromClub
);
router.patch(
  "/:clubId/members/:memberId",
  restrictToClubRole("admin"),
  commonValidations.objectId("clubId"),
  commonValidations.objectId("memberId"),
  updateMemberRole
);

// === GENERIC CLUB ROUTES (LAST!) ===
router.get(
  "/:clubId",
  commonValidations.objectId("clubId"),
  getClubById
);
router.patch(
  "/:clubId",
  restrictToClubRole("admin", "moderator"),
  commonValidations.objectId("clubId"),
  validateClubUpdate,
  updateClub
);
router.delete(
  "/:clubId",
  restrictToClubRole("admin"),
  commonValidations.objectId("clubId"),
  deleteClub
);

export default router;