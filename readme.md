# ClubOS 🎉

ClubOS is a full-stack web application designed to manage university or community clubs, events, and members efficiently. Built with **Next.js (frontend)** and **Express + MongoDB (backend)**.

---

## ✨ Features

### 👤 User Management

- ✅ **User Registration & Login**
  - Secure JWT-based authentication.
  - `inviteToken` support for invited users.
- 🛠️ **Profile Update**
  - Change name, bio, avatar, and other info.
- 🔐 **Change Password**
  - Change current password from dashboard.
- ❓ **Forgot/Reset Password**
  - Send password reset email using **Resend**.
  - Reset password using secure token.

---

### 🏛️ Club Management

- 🏗️ **Create a Club**
  - Input name, university, session year, designation, about, and club logo.
- 🙋‍♂️ **Join/Invite Members**
  - Invite via link (no email needed).
  - Role-based access (admin, moderator, member).
- 👥 **Manage Members**
  - View member list with roles and designations.
  - Promote/demote/kick members.

---

### 📅 Events

- 📌 **Create Events**
  - Add title, description, date, and organizers.
- 🗓️ **View Upcoming Events**
  - Sorted by date.
  - Only future events shown.
- ✅ **Mark Attendance**
  - Role-based access to mark attendance.
  - Export to CSV supported.

---

### 📋 Tasks (Project Board)

- 🎯 **Create Tasks**
  - Assign to members with `assignedTo`, `assignedBy`.
  - Link to an event.
- 🖱️ **Drag & Drop Board**
  - Built with `dnd-kit` or `react-beautiful-dnd`.
  - Status columns: To Do, In Progress, Done.
- 👀 **View Task Details**
  - Click to open dialog with full task info.
- 🙋‍♂️ **My Tasks Filter**
  - Filter to show only your assigned tasks.

---

### 💰 Budget Management

- 💸 **Track Club Budgets**
  - Add income or expenses with description.
  - Filter by club or date.
- 📊 **Dashboard Summary**
  - Total balance, recent entries, charts (optional).

---

### 🧭 Dashboard Overview

- 🏠 **Dashboard Home**
  - Summary of all essentials:
    - Number of clubs joined.
    - Upcoming events.
    - Assigned tasks.
    - Quick links.

---

## 🛠️ Tech Stack

| Area         | Tech                                                  |
|--------------|-------------------------------------------------------|
| Frontend     | Next.js, TailwindCSS, ShadCN UI, React Hook Form      |
| Backend      | Express.js, MongoDB, Mongoose, JWT                    |
| State        | SWR (with Axios)                                      |
| Auth         | JWT (access token & refresh token)                    |
| File Upload  | Multer (logo/image upload)                            |
| Email        | Resend (email for password reset)                     |
| File Storage | Cloudinary                                            |

---



