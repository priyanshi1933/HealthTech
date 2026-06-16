import { PrescriptionModel } from "../models/prescription.model";
import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { generatePrescriptionPDF } from "./pdf.service";
import { DateTime } from "luxon";

// ── Doctor writes prescription ────────────────────────────────
export const createPrescription = async (
  userId: string,
  data: {
    appointmentId: string;
    diagnosis: string;
    medicines: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes?: string;
    }[];
    instructions: string;
    followUpDate?: string;
  }
) => {
  // verify doctor
  const doctor = await DoctorModel.findOne({ userId })
    .populate("userId", "name");
  if (!doctor) throw new Error("Doctor profile not found");

  // verify appointment belongs to this doctor
  const appointment = await AppointmentModel.findById(data.appointmentId)
    .populate("patientId", "name email");
  if (!appointment) throw new Error("Appointment not found");
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new Error("Not authorized for this appointment");
  }
  if (appointment.status !== "completed") {
    throw new Error("Prescription can only be written for completed appointments");
  }

  // check already exists
  const existing = await PrescriptionModel.findOne({
    appointmentId: data.appointmentId,
  });
  if (existing) throw new Error("Prescription already written for this appointment");

  const patient = appointment.patientId as any;
  const doctorUser = doctor.userId as any;

  // create prescription
  const prescription = await PrescriptionModel.create({
    appointmentId: data.appointmentId,
    patientId: appointment.patientId,
    doctorId: doctor._id,
    diagnosis: data.diagnosis,
    medicines: data.medicines,
    instructions: data.instructions,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
  });

  // ✅ generate PDF
  const pdfPath = await generatePrescriptionPDF({
    prescriptionId: prescription._id.toString(),
    doctorName: doctorUser?.name || "Doctor",
    doctorSpecialty: doctor.specialty,
    patientName: patient.name,
    date: DateTime.now().toFormat("dd MMM yyyy"),
    diagnosis: data.diagnosis,
    medicines: data.medicines,
    instructions: data.instructions,
    followUpDate: data.followUpDate
      ? DateTime.fromISO(data.followUpDate).toFormat("dd MMM yyyy")
      : undefined,
  });

  // save pdf path
  await PrescriptionModel.findByIdAndUpdate(prescription._id, { pdfPath });

  return { ...prescription.toObject(), pdfPath };
};

// ── Get prescription by appointment ──────────────────────────
export const getPrescriptionByAppointment = async (
  appointmentId: string,
  userId: string,
  role: string
) => {
  const prescription = await PrescriptionModel.findOne({ appointmentId })
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    });

  if (!prescription) throw new Error("Prescription not found");

  // verify access
  const doctor = await DoctorModel.findOne({ userId });
  const isPatient = prescription.patientId._id.toString() === userId;
  const isDoctor = doctor?._id.toString() === prescription.doctorId._id.toString();
  const isAdmin = role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new Error("Not authorized to view this prescription");
  }

  return prescription;
};

// ── Get all prescriptions for patient ────────────────────────
export const getPatientPrescriptions = async (patientId: string) => {
  return await PrescriptionModel.find({ patientId })
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    })
    .populate("appointmentId", "slotTime slotTimeLocal")
    .sort({ createdAt: -1 });
};

// ── Get all prescriptions for doctor ─────────────────────────
export const getDoctorPrescriptions = async (userId: string) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor not found");

  return await PrescriptionModel.find({ doctorId: doctor._id })
    .populate("patientId", "name email")
    .populate("appointmentId", "slotTime slotTimeLocal")
    .sort({ createdAt: -1 });
};