import { catchAsync } from "../middleware/error.middleware.js";
import { Event } from "../models/event.model.js";
import { uploadMedia } from "../utils/cloudinary.js";



// 📌 Create an Event
export const createEvent = catchAsync(async (req, res) => {
  const { title, description, date, type, organizers } = req.body;
  const { clubId } = req.params;

  const attachments = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadMedia(file, `clubs/${clubId}/events`);
      attachments.push({
        name: file.originalname,
        url: result.secure_url,
        fileType: file.mimetype,
      });
    }
  }

  const event = await Event.create({
    title,
    description,
    date,
    type,
    club: clubId,
    organizers,
    attachments,
  });

  res.status(201).json({ success: true, data: event });

});


// 📌 Get All Active Events for a Club
export const getClubEvents = catchAsync(async (req, res) => {
  const { clubId } = req.params;

  const events = await Event.find({ club: clubId, isArchived: false })
    .populate("organizers", "name email")
    .sort({ date: -1 });

  res.json({ success: true, data: events });
});


// 📌 Get a Single Event by ID
export const getEventById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).populate("organizers", "name email");

  if (!event) return res.status(404).json({ success: false, message: "Event not found" });

  res.json({ success: true, data: event });
});

// 📌 Update Event
export const updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updated = await Event.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) return res.status(404).json({ success: false, message: "Event not found" });

  res.json({ success: true, data: updated });
});

// 📌 Delete Event
export const deleteEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deleted = await Event.findByIdAndDelete(id);

  if (!deleted) return res.status(404).json({ success: false, message: "Event not found" });

  res.json({ success: true, message: "Event deleted" });
});

export const getUpcomingEvents = catchAsync(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ensure comparison is from midnight today

  const events = await Event.find({ date: { $gte: today } })
    .populate("organizers", "name email") // Adjust path if your model differs
    .sort({ date: 1 }); // Soonest events first

  res.status(200).json({ success: true, data: events });
});

// 📌 Get Archived Events
export const getArchivedEvents = catchAsync(async (req, res) => {
  const { clubId } = req.params;

  const events = await Event.find({ club: clubId, isArchived: true })
    .populate("organizers", "name email")
    .sort({ date: -1 });

  res.json({ success: true, data: events });
});
// set event to archived
export const archieveEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByIdAndUpdate(id, { isArchived: true }, { new: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });  
  res.json({ success: true, data: event });
})