import express from "express";
import {
  createClub,
  getMyClubs,
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

const router = express.Router();

router.use(isAuthenticated);

router.post("/", validateClubCreate,upload.single('logo'), createClub);
router.get("/my", getMyClubs);
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
  restrictToClubRole("admin","moderator"),
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

export default router;
