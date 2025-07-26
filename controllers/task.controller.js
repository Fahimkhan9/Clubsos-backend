import { AppError, catchAsync } from '../middleware/error.middleware.js';
import { Task } from '../models/task.model.js';

// Create a new task
export const createTask = catchAsync(async (req, res) => {
  const { title, dueDate, status, event, assignedTo } = req.body;
console.log(req.body);

  if (!title || !event) {
    throw new AppError("Validation failed: title and event are required", 400);
  }

  const assignedBy = req.user._id;

  const task = await Task.create({ title, dueDate, status, event, assignedTo, assignedBy });

  res.status(201).json({ success: true, data: task });
});

// Get all tasks for a given event
export const getEventTasks = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  const tasks = await Task.find({ event: eventId })
    .populate("assignedTo", "name email")
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: tasks });
});

// Get all tasks by club ID
export const getTasksByClub = catchAsync(async (req, res) => {
  const { clubId } = req.params;

  const tasks = await Task.find()
    .populate({
      path: "event",
      match: { club: clubId },
      select: "_id name club",
    })
    .populate("assignedTo", "name email")
    .populate("assignedBy", "name email");

  const filteredTasks = tasks.filter(task => task.event !== null);

  res.status(200).json({ success: true, data: filteredTasks });
});

// Get a single task by ID
export const getTaskById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate("assignedTo", "name email")
    .populate("assignedBy", "name email");

  if (!task) throw new AppError("Task not found", 404);

  res.status(200).json({ success: true, data: task });
});

// Update a task
export const updateTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, dueDate, status, assignedTo } = req.body;

  const task = await Task.findById(id);
  if (!task) throw new AppError("Task not found", 404);

  if (title !== undefined) task.title = title;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (status !== undefined) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  await task.save();

  res.status(200).json({ success: true, data: task });
});

// Delete a task
export const deleteTask = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Task not found", 404);

  res.status(200).json({ success: true, message: "Task deleted" });
});
