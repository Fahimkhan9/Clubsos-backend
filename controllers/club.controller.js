import { Club } from "../models/club.model.js";
import {Invite} from '../models/invite.model.js';
import { AppError } from "../middleware/error.middleware.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
/**
 * Create a new club
 * @route POST /api/v1/clubs
 */
export const createClub = catchAsync(async (req, res) => {
  const { name, university, sessionYear, designation } = req.body;

  const existingClub = await Club.findOne({ name, university });
  if (existingClub) {
    throw new AppError("A club with this name already exists in this university", 400);
  }

  const club = await Club.create({ name, university, sessionYear, createdBy: req.id });

  
  club.members.push({
    user: req.id,
    role: "admin",
    designation,
    joinedAt: new Date(),
  });
  await club.save();

  res.status(201).json({
    success: true,
    message: "Club created successfully",
    data: club,
  });
});


/**
 * Get all clubs user is part of
 * @route GET /api/v1/clubs/my
 */
export const getMyClubs = catchAsync(async (req, res) => {
  // Instead of Membership, query Clubs where members.user === req.id
  const clubs = await Club.find({ "members.user": req.id });

  // Map clubs to include role & designation from members array
  const clubsWithRole = clubs.map(club => {
    const memberInfo = club.members.find(m => m.user.toString() === req.id.toString());
    return {
      ...club._doc,
      role: memberInfo?.role,
      designation: memberInfo?.designation,
    };
  });

  res.status(200).json({
    success: true,
    data: clubsWithRole,
  });
});


/**
 * Get a club by ID
 * @route GET /api/v1/clubs/:clubId
 */
export const getClubById = catchAsync(async (req, res) => {
  const club = await Club.findById(req.params.clubId);
  if (!club) {
    throw new AppError("Club not found", 404);
  }

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * @route PATCH /api/v1/clubs/:clubId
 * @desc Update club details
 */
export const updateClub = catchAsync(async (req, res) => {
  const { name, university, sessionYear, about } = req.body;
  const updateData = { name, university, sessionYear, about };

  // Handle logo file upload if provided
  if (req.file) {
    const club = await Club.findById(req.params.clubId);

    if (!club) throw new AppError("Club not found", 404);

    // Delete old logo if exists
    if (club.logo && club.logo !== "default-logo.png") {
      await deleteMediaFromCloudinary(club.logo);
    }

    const logoResult = await uploadMedia(req.file.path);
    updateData.logo = logoResult?.secure_url || req.file.path;
  }

  const updatedClub = await Club.findByIdAndUpdate(
    req.params.clubId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedClub) {
    throw new AppError("Club not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Club updated successfully",
    data: updatedClub,
  });
});

/**
 * Delete club (only admin)
 * @route DELETE /api/v1/clubs/:clubId
 */
export const deleteClub = catchAsync(async (req, res) => {
 

  const deletedClub=await Club.findByIdAndDelete(req.params.clubId);

  if (!deletedClub) {
    throw new AppError("Club not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Club deleted",
  });
});




/**
 * Invite a member to a club
 * @route POST /api/v1/clubs/:clubId/invite
 */
export const inviteMemberToClub = catchAsync(async (req, res) => {
  const { email, role, designation } = req.body;
  const { clubId } = req.params;

  // Validate role is one of allowed roles
  const validRoles = ["admin", "moderator", "member"];
  if (!validRoles.includes(role)) {
    throw new AppError("Invalid role specified", 400);
  }

  // Check club exists
  const club = await Club.findById(clubId);
  if (!club) {
    throw new AppError("Club not found", 404);
  }

  // Check if user with email exists
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    // Check if already member
    const alreadyMember = club.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) {
      throw new AppError("User is already a member of this club", 400);
    }

    // Add user as member in club
    club.members.push({
      user: user._id,
      role,
      designation,
      joinedAt: new Date(),
    });
    await club.save();

    // Add club to user's clubs array if not already present
    if (!user.clubs.includes(club._id)) {
      user.clubs.push(club._id);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `${user.name} added as ${role} to the club`,
    });
  }

  // User not found, create an invite

  // Check if invite already exists and valid
  const existingInvite = await Invite.findOne({
    email: email.toLowerCase(),
    clubId,
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    throw new AppError("An invitation is already pending for this user", 400);
  }

  // Create new invite
  const invite = await Invite.createInvite({ email, clubId, role, designation });

  // Send invitation email with inviteToken
  await sendInviteEmail(email, invite.inviteToken);

  res.status(200).json({
    success: true,
    message: `Invitation sent to ${email}.`,
  });
});

/**
 * Accept an invitation to join a club
 * User must be authenticated, inviteToken in body
 * @route POST /api/v1/invites/accept
 */
export const acceptInvitation = catchAsync(async (req, res) => {
  const { inviteToken } = req.body;
  const userId = req.id;

  if (!inviteToken) {
    throw new AppError("Invite token is required", 400);
  }

  // Find invite by token and check expiry
  const invite = await Invite.findOne({
    inviteToken,
    expiresAt: { $gt: new Date() },
  });

  if (!invite) {
    throw new AppError("Invalid or expired invite token", 400);
  }

  // Get current user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if invite email matches user's email
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new AppError("This invitation is not for your email", 403);
  }

  // Find club
  const club = await Club.findById(invite.clubId);
  if (!club) {
    throw new AppError("Club not found", 404);
  }

  // Check if already a member
  const isAlreadyMember = club.members.some(
    (m) => m.user.toString() === user._id.toString()
  );

  if (isAlreadyMember) {
    // Clean up invite anyway
    await Invite.deleteOne({ _id: invite._id });
    return res.status(200).json({
      success: true,
      message: "You are already a member of this club",
    });
  }

  // Add user as member to club
  club.members.push({
    user: user._id,
    role: invite.role,
    designation: invite.designation,
    joinedAt: new Date(),
  });
  await club.save();

  // Add club to user's clubs array if not present
  if (!user.clubs.includes(club._id)) {
    user.clubs.push(club._id);
    await user.save();
  }

  // Delete invite
  await Invite.deleteOne({ _id: invite._id });

  res.status(200).json({
    success: true,
    message: `You have successfully joined the club "${club.name}"`,
  });
});

/**
 * Remove a member from a club (admin only)
 * @route DELETE /api/v1/clubs/:clubId/members/:memberId
 */
export const removeMemberFromClub = catchAsync(async (req, res) => {
  const { clubId, memberId } = req.params;
  const userId = req.id; // current logged in user

  const club = await Club.findById(clubId);
  if (!club) throw new AppError("Club not found", 404);

  // Check if requester is admin of the club
  const requesterMembership = club.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!requesterMembership || requesterMembership.role !== "admin") {
    throw new AppError("Unauthorized: Only admins can remove members", 403);
  }

  // Prevent removing self (optional)
  if (memberId === userId.toString()) {
    throw new AppError("Admins cannot remove themselves", 400);
  }

  // Check if member exists
  const memberIndex = club.members.findIndex(
    (m) => m.user.toString() === memberId.toString()
  );
  if (memberIndex === -1) {
    throw new AppError("Member not found in this club", 404);
  }

  // Remove member from club members array
  club.members.splice(memberIndex, 1);
  await club.save();

  // Also remove club reference from user's clubs array
  const user = await User.findById(memberId);
  if (user) {
    user.clubs = user.clubs.filter(
      (clubRef) => clubRef.toString() !== clubId.toString()
    );
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});

/**
 * Update a member's role and designation (admin only)
 * @route PATCH /api/v1/clubs/:clubId/members/:memberId
 * @body { role, designation }
 */
export const updateMemberRole = catchAsync(async (req, res) => {
  const { clubId, memberId } = req.params;
  const { role, designation } = req.body;
  const userId = req.id; // current logged in user

  const validRoles = ["admin", "moderator", "member"];
  if (role && !validRoles.includes(role)) {
    throw new AppError("Invalid role specified", 400);
  }

  const club = await Club.findById(clubId);
  if (!club) throw new AppError("Club not found", 404);

  // Check if requester is admin of the club
  const requesterMembership = club.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!requesterMembership || requesterMembership.role !== "admin") {
    throw new AppError("Unauthorized: Only admins can update member roles", 403);
  }

  // Find member to update
  const member = club.members.find(
    (m) => m.user.toString() === memberId.toString()
  );
  if (!member) {
    throw new AppError("Member not found in this club", 404);
  }

  // Prevent demoting last admin (optional)
  if (member.role === "admin" && role !== "admin") {
    // Check if there is another admin
    const otherAdmins = club.members.filter(
      (m) => m.role === "admin" && m.user.toString() !== memberId.toString()
    );
    if (otherAdmins.length === 0) {
      throw new AppError("Cannot remove admin role from the last admin", 400);
    }
  }

  // Update role and designation if provided
  if (role) member.role = role;
  if (designation !== undefined) member.designation = designation;

  await club.save();

  res.status(200).json({
    success: true,
    message: "Member updated successfully",
    data: member,
  });
});
