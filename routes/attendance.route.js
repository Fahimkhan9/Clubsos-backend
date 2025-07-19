import express from "express";
import {
  markAttendance,
  getEventAttendance,
  getMemberAttendance
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Mark or update attendance for an event
router.post("/:eventId", markAttendance);

// Get all attendance for a specific event
router.get("/event/:eventId", getEventAttendance);

// (Optional) Get attendance record for a specific member
router.get("/member/:memberId", getMemberAttendance);

export default router;
