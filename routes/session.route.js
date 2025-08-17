import express from "express";
import {
  getActiveSessions,
  logoutSpecificSession,
  logoutAllSessions,
} from "../controllers/session.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getActiveSessions);
router.delete("/:id", logoutSpecificSession);
router.delete("/", logoutAllSessions);

export default router;
