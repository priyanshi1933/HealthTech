import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getProfile,
  verifyTwoFactor,
} from "../controllers/user.controller";
import {
  createProfile,
  updateProfile,
  getMyProfile,
  listDoctors,
  getSingleDoctor,
  pendingDoctors,
  allDoctorsAdmin,
  approveDoctorHandler,
  rejectDoctorHandler,
} from "../controllers/doctor.controller";
import {
  addRecurring,
  addBlock,
  getMyAvailabilityHandler,
  getDoctorAvailabilityHandler,
  deleteRecurring,
  deleteBlock,
  getSlotsForDate,
} from "../controllers/availability.controller";
import {
  book,
  myAppointments,
  doctorAppointments,
  cancel,
  complete,
  singleAppointment,
} from "../controllers/appointment.controller";
import { verifyToken, verifyAdmin, verifyDoctor } from "../middleware/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-2fa", verifyToken, verifyTwoFactor);
router.get("/profile", verifyToken, getProfile);
router.get("/users", verifyToken, verifyAdmin, getUsers);

// ── Doctor profile (specific) ───────────────────
router.get("/profile/me", verifyToken, verifyDoctor, getMyProfile);
router.post("/profile/create", verifyToken, verifyDoctor, createProfile);
router.put("/profile/update", verifyToken, verifyDoctor, updateProfile);

router.get("/admin/all", verifyToken, verifyAdmin, allDoctorsAdmin);
router.get("/admin/pending", verifyToken, verifyAdmin, pendingDoctors);
router.patch("/admin/approve/:id", verifyToken, verifyAdmin, approveDoctorHandler);
router.patch("/admin/reject/:id", verifyToken, verifyAdmin, rejectDoctorHandler);

router.get("/doctor", listDoctors);         


router.post("/availability/recurring", verifyToken, verifyDoctor, addRecurring);
router.post("/availability/block", verifyToken, verifyDoctor, addBlock);
router.get("/availability/me", verifyToken, verifyDoctor, getMyAvailabilityHandler);
router.get("/availability/:doctorId", getDoctorAvailabilityHandler);
router.delete("/availability/recurring/:id", verifyToken, verifyDoctor, deleteRecurring);
router.delete("/availability/block/:id", verifyToken, verifyDoctor, deleteBlock);
router.get("/slots", getSlotsForDate); // ?doctorId=xxx&date=2024-06-15

router.post("/appointments/book", verifyToken, book);
router.get("/appointments/my", verifyToken, myAppointments);
router.get("/appointments/doctor", verifyToken, verifyDoctor, doctorAppointments);
router.get("/appointments/:id", verifyToken, singleAppointment);
router.patch("/appointments/:id/cancel", verifyToken, cancel);
router.patch("/appointments/:id/complete", verifyToken, verifyDoctor, complete);

// ✅ /:id ALWAYS LAST
router.get("/:id", getSingleDoctor);

export default router;