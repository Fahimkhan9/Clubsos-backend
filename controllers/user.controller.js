import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import crypto from "crypto";
import { Club } from "../models/club.model.js";
import { Invite } from "../models/invite.model.js";
import { sendEmail } from "../utils/sendForgotEmail.js";


/**
 * Create a new user account
 * @route POST /api/v1/users/signup
 */
export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const inviteToken = req.query.inviteToken || req.body.inviteToken;

  // Existing user check as usual
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  // If invite token present, validate and add user to club
  if (inviteToken) {
    const invite = await Invite.findOne({
      inviteToken,
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      throw new AppError("Invalid or expired invite token", 400);
    }

    const club = await Club.findById(invite.clubId);
    if (club) {
      club.members.push({
        user: user._id,
        role: invite.role,
        designation: invite.designation,
      });
      await club.save();
    }

    // Remove invite after use
    await Invite.deleteOne({ _id: invite._id });
  }

  // Continue with your token generation and response as before
  await user.updateLastActive();
  generateToken(res, user._id, "Account created successfully");
});
/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and check password
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  // Update last active and generate token
  await user.updateLastActive();
  generateToken(res, user._id, `Welcome back ${user.name}`);
});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/users/signout
 */
export const signOutUser = catchAsync(async (_, res) => {
  res.cookie("token", "", { secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "None",
      maxAge:0, });
  res.status(200).json({
    success: true,
    message: "Signed out successfully",
  });
});

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.id)
    

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
    },
  });
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, email, bio,batch,department } = req.body;
  const updateData = { name, email: email?.toLowerCase(), bio,batch,department  };


  // Handle avatar upload if provided
  if (req.file) {
    console.log(req.file)
   
    
    const avatarResult = await uploadMedia(req.file,'avatars');
    console.log("upload",avatarResult?.secure_url);
    
    updateData.avatar = avatarResult?.secure_url || req.file.path;
    // console.log(req.file);
    
    // Delete old avatar if it's not the default
    const user = await User.findById(req.id);
    if (user.avatar && user.avatar !== "default-avatar.png") {
      await deleteMediaFromCloudinary(user.avatar);
    }
  }

  // Update user and get updated document
  const updatedUser = await User.findByIdAndUpdate(req.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }
  console.log(updatedUser)
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.id).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Construct reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
  `;
console.log(resetUrl)
  try {
    await sendEmail(user.email, "Password Reset", message);

    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  } catch (err) {
    // Optional: clear the token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error(err);
    throw new AppError("Failed to send email. Try again later.", 500);
  }
});

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token and find user
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Set new password and clear token fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.id);

  // Delete avatar if not default
  if (user.avatar && user.avatar !== "default-avatar.png") {
    await deleteMediaFromCloudinary(user.avatar);
  }

  // Delete user
  await User.findByIdAndDelete(req.id);

  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
