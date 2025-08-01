import express from "express";
import {
    authenticateUser,
    changeUserPassword,
    createUserAccount,
    deleteUserAccount,
    forgotPassword,
    getCurrentUserProfile,
    resetPassword,
    signOutUser,
    updateUserProfile
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignup, validateSignin, validatePasswordChange } from "../middleware/validation.middleware.js";

const router = express.Router();

// Auth routes
router.post("/register", validateSignup, createUserAccount);
router.post("/login", validateSignin, authenticateUser);
router.post("/logout", signOutUser);
// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch("/profile", 
    isAuthenticated, 
    upload.single("avatar"), 
    updateUserProfile
);

// Password management
router.patch("/change-password",
    isAuthenticated,
    validatePasswordChange,
    changeUserPassword
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Account management
router.delete("/account", isAuthenticated, deleteUserAccount);

export default router;