import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { AvailabilityModel } from "../models/availability.model";
import { DateTime } from "luxon";
import { sendBookingConfirmation, sendCancellationEmail } from "./email.service";
import { UserModel } from "../models/user.model";

export const bookAppointment = async (
  patientId: string,
  data: {
    doctorId: string;
    slotTimeUTC: string;
    patientTimezone: string;
  }
) => {
  const doctor = await DoctorModel.findById(data.doctorId)
    .populate("userId", "name email");
  if (!doctor) throw new Error("Doctor not found");
  if (doctor.verificationStatus !== "approved") {
    throw new Error("Doctor is not verified");
  }

  // ✅ get patient details for email
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
    .toString(36).substr(2, 9).toUpperCase()}`;

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
  });

  // ✅ send confirmation email
  const doctorUser = doctor.userId as any;
  const slotInPatientTz = DateTime.fromJSDate(slotTime)
    .setZone(data.patientTimezone);

  sendBookingConfirmation(patient.email, {
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

  return appointment;
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

  return await AppointmentModel.find({ doctorId: doctor._id })
    .populate("patientId", "name email")
    .sort({ slotTime: 1 });
};

export const cancelAppointment = async (
  appointmentId: string,
  userId: string,
  role: string,
  reason?: string
) => {
  const appointment = await AppointmentModel.findById(appointmentId)
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    });

  if (!appointment) throw new Error("Appointment not found");
  if (appointment.status === "cancelled") throw new Error("Already cancelled");
  if (appointment.status === "completed") throw new Error("Cannot cancel completed");

  if (role === "patient") {
    if (appointment.patientId._id.toString() !== userId) {
      throw new Error("Not authorized");
    }
  } else if (role === "doctor") {
    const doctor = await DoctorModel.findOne({ userId });
    if (doctor?._id.toString() !== appointment.doctorId._id.toString()) {
      throw new Error("Not authorized");
    }
  } else if (role !== "admin") {
    throw new Error("Not authorized");
  }

  const updated = await AppointmentModel.findByIdAndUpdate(
    appointmentId,
    {
      status: "cancelled",
      paymentStatus: "refunded",
      cancelledBy: role as "patient" | "doctor" | "admin",
      cancellationReason: reason || "No reason provided",
      cancelledAt: new Date(),
    },
    { new: true }
  );

  // ✅ send cancellation email
  const patient = appointment.patientId as any;
  const doctor = appointment.doctorId as any;
  const slotInPatientTz = DateTime.fromJSDate(appointment.slotTime)
    .setZone(appointment.patientTimezone);

  sendCancellationEmail(patient.email, {
    patientName: patient.name,
    doctorName: doctor?.userId?.name || "Doctor",
    date: slotInPatientTz.toFormat("dd MMM yyyy"),
    time: slotInPatientTz.toFormat("HH:mm"),
    fee: appointment.fee,
    cancelledBy: role,
    reason: reason || "No reason provided",
  });

  return updated;
};

export const completeAppointment = async (
  appointmentId: string,
  userId: string
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
    { new: true }
  );
};

export const getAppointmentById = async (
  appointmentId: string,
  userId: string,
  role: string
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
  const isDoctor = doctor?._id.toString() === appointment.doctorId._id.toString();
  const isAdmin = role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new Error("Not authorized to view this appointment");
  }

  return appointment;
};