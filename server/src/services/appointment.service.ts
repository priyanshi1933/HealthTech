import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { AvailabilityModel } from "../models/availability.model";
import { DateTime } from "luxon";
import {
  sendBookingConfirmation,
  sendCancellationEmail,
} from "./email.service";
import { UserModel } from "../models/user.model";
import { calculateRefund } from "../utils/refundCalculator";
import { PrescriptionModel } from "../models/prescription.model";
import crypto from "crypto";

export const bookAppointment = async (
  patientId: string,
  data: {
    doctorId: string;
    slotTimeUTC: string;
    patientTimezone: string;
  },
): Promise<{ appointment: any; emailPreviewUrl: string | null }> => {
  const roomId = `health-${crypto.randomBytes(6).toString("hex")}`;
  const doctor = await DoctorModel.findById(data.doctorId).populate(
    "userId",
    "name email",
  );
  if (!doctor) throw new Error("Doctor not found");
  if (doctor.verificationStatus !== "approved") {
    throw new Error("Doctor is not verified");
  }

  const patient = await UserModel.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const slotTime = new Date(data.slotTimeUTC);
  if (isNaN(slotTime.getTime())) throw new Error("Invalid slot time");
  if (slotTime < new Date()) throw new Error("Cannot book a past slot");

  const anyRule = await AvailabilityModel.findOne({
    doctorId: data.doctorId,
    type: "recurring",
    isActive: true,
  });
  const doctorTimezone = anyRule?.timezone || "Asia/Kolkata";
  const slotTimeLocal = DateTime.fromJSDate(slotTime)
    .setZone(doctorTimezone)
    .toFormat("HH:mm");

  const existing = await AppointmentModel.findOne({
    doctorId: data.doctorId,
    slotTime,
    status: { $in: ["pending", "confirmed"] },
  });
  if (existing) throw new Error("Slot already booked. Please choose another.");

  const paymentId = `PAY_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  const appointment = await AppointmentModel.create({
    patientId,
    doctorId: data.doctorId,
    slotTime,
    slotTimeLocal,
    patientTimezone: data.patientTimezone,
    doctorTimezone,
    duration: anyRule?.slotDuration || 30,
    fee: doctor.fee,
    status: "confirmed",
    paymentStatus: "paid",
    paymentId,
    roomId,
  });

  const appointmentObj = appointment.toObject();

  const doctorUser = doctor.userId as any;
  const slotInPatientTz = DateTime.fromJSDate(slotTime).setZone(
    data.patientTimezone,
  );

  const emailPreviewUrl = await sendBookingConfirmation(patient.email, {
    patientName: patient.name,
    doctorName: doctorUser?.name || "Doctor",
    specialty: doctor.specialty,
    date: slotInPatientTz.toFormat("dd MMM yyyy"),
    time: slotInPatientTz.toFormat("HH:mm"),
    timezone: data.patientTimezone,
    duration: anyRule?.slotDuration || 30,
    fee: doctor.fee,
    paymentId,
  });

  return { appointment: appointmentObj, emailPreviewUrl };
};

export const getPatientAppointments = async (patientId: string) => {
  return await AppointmentModel.find({ patientId })
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ slotTime: -1 });
};

export const getDoctorAppointments = async (userId: string) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor profile not found");

  const appointments = await AppointmentModel.find({ doctorId: doctor._id })
    .populate("patientId", "name email")
    .sort({ slotTime: 1 });

  const appointmentIds = appointments.map((a) => a._id);
  const prescriptions = await PrescriptionModel.find({
    appointmentId: { $in: appointmentIds },
  }).select("appointmentId");

  const prescribedIds = new Set(
    prescriptions.map((p) => p.appointmentId.toString()),
  );

  return appointments.map((apt) => ({
    ...apt.toObject(),
    hasPrescription: prescribedIds.has(apt._id.toString()),
  }));
};

export const cancelAppointment = async (
  appointmentId: string,
  userId: string,
  role: string,
  reason?: string,
): Promise<{
  appointment: any;
  emailPreviewUrl: string | null;
  refundInfo: any;
}> => {
  const existingAppointment = await AppointmentModel.findById(appointmentId)
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    });

  if (!existingAppointment) throw new Error("Appointment not found");
  if (existingAppointment.status === "cancelled")
    throw new Error("Already cancelled");
  if (existingAppointment.status === "completed")
    throw new Error("Cannot cancel completed appointment");
  if (existingAppointment.status === "rescheduled")
    throw new Error("Cannot cancel a rescheduled appointment");

  if (role === "patient") {
    if (existingAppointment.patientId._id.toString() !== userId) {
      throw new Error("Not authorized");
    }
  } else if (role === "doctor") {
    const doctor = await DoctorModel.findOne({ userId });
    if (
      doctor?._id.toString() !== existingAppointment.doctorId._id.toString()
    ) {
      throw new Error("Not authorized");
    }
  } else if (role !== "admin") {
    throw new Error("Not authorized");
  }

  const refundInfo = calculateRefund(
    existingAppointment.slotTime,
    existingAppointment.fee,
    role,
  );

  const updated = await AppointmentModel.findByIdAndUpdate(
    appointmentId,
    {
      status: "cancelled",
      paymentStatus: refundInfo.paymentStatus,
      refundAmount: refundInfo.refundAmount,
      refundPercent: refundInfo.refundPercent,
      cancelledBy: role as "patient" | "doctor" | "admin",
      cancellationReason: reason || "No reason provided",
      cancelledAt: new Date(),
    },
    { new: true },
  );

  const patient = existingAppointment.patientId as any;
  const doctor = existingAppointment.doctorId as any;
  const slotInPatientTz = DateTime.fromJSDate(
    existingAppointment.slotTime,
  ).setZone(existingAppointment.patientTimezone);

  const emailPreviewUrl = await sendCancellationEmail(patient.email, {
    patientName: patient.name,
    doctorName: doctor?.userId?.name || "Doctor",
    date: slotInPatientTz.toFormat("dd MMM yyyy"),
    time: slotInPatientTz.toFormat("HH:mm"),
    fee: existingAppointment.fee,
    cancelledBy: role,
    reason: reason || "No reason provided",
    refundAmount: refundInfo.refundAmount,
    refundPercent: refundInfo.refundPercent,
    refundMessage: refundInfo.message,
  });

  return { appointment: updated, emailPreviewUrl, refundInfo };
};

export const completeAppointment = async (
  appointmentId: string,
  userId: string,
) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor not found");

  const appointment = await AppointmentModel.findOne({
    _id: appointmentId,
    doctorId: doctor._id,
  });
  if (!appointment) throw new Error("Appointment not found");
  if (appointment.status !== "confirmed") {
    throw new Error("Only confirmed appointments can be completed");
  }

  return await AppointmentModel.findByIdAndUpdate(
    appointmentId,
    { status: "completed" },
    { new: true },
  );
};

export const getAppointmentById = async (
  appointmentId: string,
  userId: string,
  role: string,
) => {
  const appointment = await AppointmentModel.findById(appointmentId)
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email" },
    });

  if (!appointment) throw new Error("Appointment not found");

  const doctor = await DoctorModel.findOne({ userId });
  const isPatient = appointment.patientId._id.toString() === userId;
  const isDoctor =
    doctor?._id.toString() === appointment.doctorId._id.toString();
  const isAdmin = role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new Error("Not authorized to view this appointment");
  }

  return appointment;
};

export const rescheduleAppointment = async (
  appointmentId: string,
  userId: string,
  role: string,
  data: {
    newSlotTimeUTC: string;
    reason?: string;
  },
): Promise<{ oldAppointment: any; newAppointment: any }> => {
  const existing = await AppointmentModel.findById(appointmentId)
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    });

  if (!existing) throw new Error("Appointment not found");
  if (existing.status !== "confirmed" && existing.status !== "pending") {
    throw new Error(
      "Only confirmed or pending appointments can be rescheduled",
    );
  }

  const doctor = await DoctorModel.findOne({ userId });
  const isPatient = existing.patientId._id.toString() === userId;
  const isDoctor = doctor?._id.toString() === existing.doctorId._id.toString();

  if (!isPatient && !isDoctor) throw new Error("Not authorized to reschedule");

  const newSlotTime = new Date(data.newSlotTimeUTC);
  if (isNaN(newSlotTime.getTime())) throw new Error("Invalid slot time");
  if (newSlotTime < new Date())
    throw new Error("Cannot reschedule to a past slot");

  
  const slotConflict = await AppointmentModel.findOne({
    doctorId: existing.doctorId,
    slotTime: newSlotTime,
    status: { $in: ["pending", "confirmed"] },
    _id: { $ne: appointmentId },
  });
  if (slotConflict) throw new Error("New slot is already booked");

  const anyRule = await AvailabilityModel.findOne({
    doctorId: existing.doctorId,
    type: "recurring",
    isActive: true,
  });
  const doctorTimezone = anyRule?.timezone || "Asia/Kolkata";
  const newSlotTimeLocal = DateTime.fromJSDate(newSlotTime)
    .setZone(doctorTimezone)
    .toFormat("HH:mm");

  await AppointmentModel.findByIdAndUpdate(appointmentId, {
    status: "rescheduled",
    rescheduledAt: new Date(),
    rescheduledBy: role as "patient" | "doctor",
    originalSlotTime: existing.slotTime,
  });

  const newRoomId = `health-${crypto.randomBytes(6).toString("hex")}`;

  const newAppointment = await AppointmentModel.create({
    patientId: existing.patientId,
    doctorId: existing.doctorId,
    slotTime: newSlotTime,
    slotTimeLocal: newSlotTimeLocal,
    patientTimezone: existing.patientTimezone,
    doctorTimezone,
    duration: existing.duration,
    fee: existing.fee,
    status: "confirmed",
    paymentStatus: "paid",
    paymentId: existing.paymentId,
    roomId: newRoomId,
    rescheduledFrom: existing._id,
  });

  await AppointmentModel.findByIdAndUpdate(appointmentId, {
    rescheduledTo: newAppointment._id,
  });

  return { oldAppointment: existing, newAppointment };
};
