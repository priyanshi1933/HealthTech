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
import { verifyToken, verifyAdmin, verifyDoctor } from "../middleware/auth";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-2fa", verifyToken, verifyTwoFactor);
router.get("/profile", verifyToken, getProfile);
router.get("/users", verifyToken, verifyAdmin, getUsers);

// ── Doctor profile (specific — before /:id) ───────────────────
router.get("/profile/me", verifyToken, verifyDoctor, getMyProfile);
router.post("/profile/create", verifyToken, verifyDoctor, createProfile);
router.put("/profile/update", verifyToken, verifyDoctor, updateProfile);

// ── Admin (specific — before /:id) ────────────────────────────
router.get("/admin/all", verifyToken, verifyAdmin, allDoctorsAdmin);
router.get("/admin/pending", verifyToken, verifyAdmin, pendingDoctors);
router.patch("/admin/approve/:id", verifyToken, verifyAdmin, approveDoctorHandler);
router.patch("/admin/reject/:id", verifyToken, verifyAdmin, rejectDoctorHandler);

// ── Public doctors ────────────────────────────────────────────
router.get("/doctor", listDoctors);          // ?specialty=Cardiology

// ✅ /:id ALWAYS LAST
router.get("/:id", getSingleDoctor);

export default router;