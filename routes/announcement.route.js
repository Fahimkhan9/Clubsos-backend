import express from "express";
import {
  createAnnouncement,
  getClubAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import {isAuthenticated,restrictToClubRole} from '../middleware/auth.middleware.js'

const router = express.Router();
router.use(isAuthenticated);
router.post("/club/:clubId", restrictToClubRole("admin", "moderator"), createAnnouncement); // Create new announcement
router.get("/club/:clubId",  getClubAnnouncements); // Get all for a club
router.delete("/:id",  deleteAnnouncement); // Delete

export default router;
