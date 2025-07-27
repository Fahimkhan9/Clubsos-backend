// routes/task.route.js
import express from 'express';
import {
  createTask,
  getEventTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks
} from '../controllers/task.controller.js';
import { getTasksByClub } from '../controllers/task.controller.js';
import {isAuthenticated} from '../middleware/auth.middleware.js'

const router = express.Router();


router.use(isAuthenticated)
// POST /api/tasks - Create a new task
router.post('/', createTask);
router.get('/my',getMyTasks)
// GET /api/tasks/event/:eventId - Get tasks for a specific event
router.get('/event/:eventId', getEventTasks);

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', getTaskById);

// GET /api/tasks/club/:clubId - Get tasks for all events in a club
router.get('/club/:clubId', getTasksByClub);



// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);
export default router;
