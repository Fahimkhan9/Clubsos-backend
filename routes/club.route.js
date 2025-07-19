import express from "express";
import {
  createClub,
  getMyClubs,
  test,
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
getMonthlyBudgetSummart
} from '../controllers/budget.controller.js'
import {
  isAuthenticated,
  restrictToClubRole,
} from "../middleware/auth.middleware.js";

import {
  validateClubCreate,
  validateClubUpdate,
  validateMemberInvite,
  validateMemberUpdate,      // you may create this
  commonValidations,
} from "../middleware/validation.middleware.js";
import upload from "../utils/multer.js";
import { createEvent, deleteEvent, getClubEvents, getEventById, updateEvent } from "../controllers/event.controller.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", validateClubCreate,upload.single('logo'), createClub);
router.get("/my", getMyClubs);
router.get('/mys',test)
router.get("/:clubId", commonValidations.objectId("clubId"), getClubById);
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

router.post(
  "/:clubId/invite",
  restrictToClubRole("admin","moderator"),
  commonValidations.objectId("clubId"),
  validateMemberInvite,
  inviteMemberToClub
);

router.post("/accept", acceptInvitation);

router.get(
  "/:clubId/members",
  commonValidations.objectId("clubId"),
  getMembersOfClub
);


router.delete(
  "/:clubId/members/:memberId",
  restrictToClubRole("admin"),
  commonValidations.objectId("clubId"),
  commonValidations.objectId("memberId"),
  removeMemberFromClub
);

// Update a member's role/designation (admin only)
router.patch(
  "/:clubId/members/:memberId",
  restrictToClubRole("admin"),
  commonValidations.objectId("clubId"),
  commonValidations.objectId("memberId"),
  // validateMemberUpdate,  // You can define this middleware for input validation
  updateMemberRole
);


// budget routes
router.post('/:clubId/budget', restrictToClubRole('admin','moderator'), createBudget);
router.get('/:clubId/budget', restrictToClubRole('admin','moderator'), getClubBudgets);
router.get('/:clubId/budget/summary', restrictToClubRole('admin','moderator'), getBudgetSummary);
router.patch(':clubId/budget/:id', restrictToClubRole('admin','moderator'), updateBudget);
router.delete(':clubId/budget/:id', restrictToClubRole('admin','moderator'), deleteBudget);
router.get('/:clubId/budget/monthly',getMonthlyBudgetSummart)

// event routes
router.post('/:clubId/event',restrictToClubRole('admin','moderator'),upload.array('attachments'),createEvent)

router.get('/:clubId/event',getClubEvents)
router.get('/event/:id',getEventById)
router.patch('/:clubId/event/:id',restrictToClubRole('admin','moderator'),updateEvent)
router.delete('/:clubId/event/:id',restrictToClubRole('admin','moderator'),deleteEvent)
export default router;
