import { DoctorModel } from "../models/doctor.model";
import { UserModel } from "../models/user.model";

// ── Doctor: create profile after registration ─────────────────
export const createDoctorProfile = async (
  userId: string,
  data: {
    specialty: string;
    qualifications: string[];
    experience: number;
    fee: number;
    languages: string[];
    bio?: string;
  }
) => {
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "doctor") {
    throw new Error("Only doctors can create a profile");
  }

  const existing = await DoctorModel.findOne({ userId });
  if (existing) throw new Error("Doctor profile already exists");

  return await DoctorModel.create({ userId, ...data });
};

// ── Doctor: update own profile ────────────────────────────────
export const updateDoctorProfile = async (
  userId: string,
  data: Partial<{
    specialty: string;
    qualifications: string[];
    experience: number;
    fee: number;
    languages: string[];
    bio: string;
  }>
) => {
  const profile = await DoctorModel.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!profile) throw new Error("Doctor profile not found");
  return profile;
};

// ── Doctor: get own profile ───────────────────────────────────
export const getDoctorProfileByUserId = async (userId: string) => {
  const profile = await DoctorModel.findOne({ userId })
    .populate("userId", "name email");
  if (!profile) throw new Error("Doctor profile not found");
  return profile;
};

// ── Public: all approved doctors (optional specialty filter) ──
export const getAllApprovedDoctors = async (specialty?: string) => {
  const filter: any = { verificationStatus: "approved", isActive: true };
  if (specialty) filter.specialty = new RegExp(specialty, "i");

  return await DoctorModel.find(filter)
    .populate("userId", "name email")
    .select("-verificationNote -verifiedBy -verifiedAt");
};

// ── Public: single doctor by doctorId ─────────────────────────
export const getDoctorById = async (doctorId: string) => {
  const doctor = await DoctorModel.findById(doctorId)
    .populate("userId", "name email")
    .select("-verificationNote -verifiedBy -verifiedAt");
  if (!doctor) throw new Error("Doctor not found");
  return doctor;
};

// ── Admin: all pending doctors ────────────────────────────────
export const getPendingDoctors = async () => {
  return await DoctorModel.find({ verificationStatus: "pending" })
    .populate("userId", "name email createdAt");
};

// ── Admin: all doctors (any status) ──────────────────────────
export const getAllDoctorsAdmin = async () => {
  return await DoctorModel.find()
    .populate("userId", "name email createdAt")
    .populate("verifiedBy", "name email");
};

// ── Admin: approve doctor ─────────────────────────────────────
export const approveDoctor = async (doctorId: string, adminId: string) => {
  const doctor = await DoctorModel.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");
  if (doctor.verificationStatus === "approved") {
    throw new Error("Doctor is already approved");
  }

  return await DoctorModel.findByIdAndUpdate(
    doctorId,
    {
      $set: {
        verificationStatus: "approved",
        verifiedBadge: true,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        verificationNote: null,
      },
    },
    { new: true }
  ).populate("userId", "name email");
};

// ── Admin: reject doctor ──────────────────────────────────────
export const rejectDoctor = async (
  doctorId: string,
  adminId: string,
  note: string
) => {
  const doctor = await DoctorModel.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  return await DoctorModel.findByIdAndUpdate(
    doctorId,
    {
      $set: {
        verificationStatus: "rejected",
        verifiedBadge: false,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        verificationNote: note,
      },
    },
    { new: true }
  ).populate("userId", "name email");
};