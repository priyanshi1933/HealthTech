import { Request, Response } from "express";
import {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfileByUserId,
  getAllApprovedDoctors,
  getDoctorById,
  getPendingDoctors,
  getAllDoctorsAdmin,
  approveDoctor,
  rejectDoctor,
} from "../services/doctor.service";

// ── Doctor: create profile ────────────────────────────────────
export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { specialty, qualifications, experience, fee, languages, bio } =
      req.body;

    if (!specialty || !qualifications || !experience || !fee || !languages) {
      return res.status(400).json({
        success: false,
        message:
          "specialty, qualifications, experience, fee, languages are required",
      });
    }

    const profile = await createDoctorProfile(userId, {
      specialty,
      qualifications,
      experience,
      fee,
      languages,
      bio,
    });

    res.status(201).json({
      success: true,
      message: "Profile created. Awaiting admin verification.",
      data: profile,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Doctor: update own profile ────────────────────────────────
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await updateDoctorProfile(userId, req.body);

    res.json({ success: true, message: "Profile updated", data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Doctor: get own profile ───────────────────────────────────
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getDoctorProfileByUserId(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ── Public: list approved doctors ────────────────────────────
export const listDoctors = async (req: Request, res: Response) => {
  try {
    const specialty = req.query.specialty as string | undefined;
    const doctors = await getAllApprovedDoctors(specialty);
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Public: single doctor ─────────────────────────────────────
export const getSingleDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorById(String(req.params.id)); // ✅ fix
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ── Admin: pending doctors list ───────────────────────────────
export const pendingDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await getPendingDoctors();
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: all doctors ────────────────────────────────────────
export const allDoctorsAdmin = async (req: Request, res: Response) => {
  try {
    const doctors = await getAllDoctorsAdmin();
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: approve ────────────────────────────────────────────
export const approveDoctorHandler = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const doctor = await approveDoctor(String(req.params.id), adminId); // ✅ fix
    res.json({ success: true, message: "Doctor approved", data: doctor });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Admin: reject ─────────────────────────────────────────────
export const rejectDoctorHandler = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Rejection note/reason is required",
      });
    }

    const doctor = await rejectDoctor(String(req.params.id), adminId, note); // ✅ fix
    res.json({ success: true, message: "Doctor rejected", data: doctor });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
