import { AvailabilityModel } from "../models/availability.model";
import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { sendCancellationEmail } from "./email.service";
import { calculateRefund } from "../utils/refundCalculator";
import { DateTime, Info } from "luxon";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getDoctorId = async (userId: string) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor profile not found");
  if (doctor.verificationStatus !== "approved") {
    throw new Error("Only verified doctors can set availability");
  }
  return doctor._id;
};

export const addRecurringSlot = async (
  userId: string,
  data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    timezone: string;
  },
) => {
  const doctorId = await getDoctorId(userId);

  if (!Info.isValidIANAZone(data.timezone)) {
    throw new Error("Invalid timezone");
  }

  if (data.startTime >= data.endTime) {
    throw new Error("Start time must be before end time");
  }

  const existing = await AvailabilityModel.findOne({
    doctorId,
    type: "recurring",
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    isActive: true,
  });
  if (existing)
    throw new Error(`Slot already exists for ${DAYS[data.dayOfWeek]}`);

  return await AvailabilityModel.create({
    doctorId,
    type: "recurring",
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    slotDuration: data.slotDuration,
    timezone: data.timezone,
  });
};

export const addBlockDate = async (
  userId: string,
  data: {
    blockDate: string;
    blockReason?: string;
    timezone: string;
  },
) => {
  const doctorId = await getDoctorId(userId);

  const dt = DateTime.fromISO(data.blockDate, { zone: data.timezone });
  if (!dt.isValid) throw new Error("Invalid date or timezone");

  const nowInDoctorTz = DateTime.now().setZone(data.timezone).startOf("day");
  if (dt.startOf("day") < nowInDoctorTz) {
    throw new Error("Cannot block a past date");
  }

  const blockDateUTC = dt.startOf("day").toUTC().toJSDate();

  const existing = await AvailabilityModel.findOne({
    doctorId,
    type: "block",
    blockDate: blockDateUTC,
    isActive: true,
  });
  if (existing) throw new Error("This date is already blocked");

  return await AvailabilityModel.create({
    doctorId,
    type: "block",
    blockDate: blockDateUTC,
    blockReason: data.blockReason || "Unavailable",
    timezone: data.timezone,
  });
};

export const getDoctorAvailability = async (doctorId: string) => {
  const recurring = await AvailabilityModel.find({
    doctorId,
    type: "recurring",
    isActive: true,
  }).sort({ dayOfWeek: 1, startTime: 1 });

  const blocks = await AvailabilityModel.find({
    doctorId,
    type: "block",
    isActive: true,
    blockDate: { $gte: new Date() },
  }).sort({ blockDate: 1 });

  return { recurring, blocks };
};

export const getMyAvailability = async (userId: string) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor profile not found");
  return getDoctorAvailability(doctor._id.toString());
};

export const deleteRecurringSlot = async (userId: string, slotId: string) => {
  const doctorId = await getDoctorId(userId);
  const slot = await AvailabilityModel.findOne({ _id: slotId, doctorId });
  if (!slot) throw new Error("Slot not found");
  await AvailabilityModel.findByIdAndUpdate(slotId, { isActive: false });
  return { message: "Slot removed" };
};

export const deleteBlockDate = async (userId: string, blockId: string) => {
  const doctorId = await getDoctorId(userId);
  const block = await AvailabilityModel.findOne({ _id: blockId, doctorId });
  if (!block) throw new Error("Block not found");
  await AvailabilityModel.findByIdAndUpdate(blockId, { isActive: false });
  return { message: "Block removed" };
};

export const generateSlots = async (
  doctorId: string,
  date: string,
  patientTimezone: string = "Asia/Kolkata",
) => {
  if (!Info.isValidIANAZone(patientTimezone)) {
    throw new Error("Invalid patient timezone");
  }

  const anyRule = await AvailabilityModel.findOne({
    doctorId,
    type: "recurring",
    isActive: true,
  });
  const doctorTimezone = anyRule?.timezone || "Asia/Kolkata";

  const doctorDate = DateTime.fromISO(date, { zone: doctorTimezone });
  if (!doctorDate.isValid) throw new Error("Invalid date");

  const todayInDoctorTz = DateTime.now().setZone(doctorTimezone).startOf("day");
  if (doctorDate.startOf("day") < todayInDoctorTz) {
    return {
      date,
      blocked: false,
      slots: [],
      message: "Cannot book past dates",
    };
  }

  const luxonWeekday = doctorDate.weekday;
  const dayOfWeek = luxonWeekday === 7 ? 0 : luxonWeekday;

  const startOfDay = doctorDate.startOf("day").toUTC().toJSDate();
  const endOfDay = doctorDate.endOf("day").toUTC().toJSDate();

  const isBlocked = await AvailabilityModel.findOne({
    doctorId,
    type: "block",
    isActive: true,
    blockDate: { $gte: startOfDay, $lte: endOfDay },
  });

  if (isBlocked) {
    return {
      date,
      doctorTimezone,
      patientTimezone,
      blocked: true,
      reason: isBlocked.blockReason,
      slots: [],
    };
  }

  const rules = await AvailabilityModel.find({
    doctorId,
    type: "recurring",
    dayOfWeek,
    isActive: true,
  });

  if (rules.length === 0) {
    return {
      date,
      doctorTimezone,
      patientTimezone,
      blocked: false,
      slots: [],
      message: "Doctor not available on this day",
    };
  }

  const bookedAppointments = await AppointmentModel.find({
    doctorId,
    slotTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed"] },
  });

  const bookedUTCTimes = new Set(
    bookedAppointments.map((a) => a.slotTime.toISOString()),
  );

  const slots: {
    time: string;
    timeDoctor: string;
    timeUTC: string;
    available: boolean;
    duration: number;
  }[] = [];

  for (const rule of rules) {
    const [startH, startM] = rule.startTime!.split(":").map(Number);
    const [endH, endM] = rule.endTime!.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = rule.slotDuration!;

    for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
      const slotInDoctorTz = doctorDate.set({
        hour: Math.floor(m / 60),
        minute: m % 60,
        second: 0,
        millisecond: 0,
      });

      const slotInPatientTz = slotInDoctorTz.setZone(patientTimezone);
      const slotInUTC = slotInDoctorTz.toUTC();

      if (slotInUTC < DateTime.now().toUTC()) continue;

      const isBooked = bookedUTCTimes.has(slotInUTC.toJSDate().toISOString());

      slots.push({
        time: slotInPatientTz.toFormat("HH:mm"),
        timeDoctor: slotInDoctorTz.toFormat("HH:mm"),
        timeUTC: slotInUTC.toISO()!,
        available: !isBooked,
        duration,
      });
    }
  }

  const unique = slots.filter(
    (s, i, arr) => arr.findIndex((x) => x.timeUTC === s.timeUTC) === i,
  );

  return {
    date,
    doctorTimezone,
    patientTimezone,
    blocked: false,
    slots: unique.sort((a, b) => a.timeUTC.localeCompare(b.timeUTC)),
  };
};

export const addLeaveWithCancellation = async (
  userId: string,
  data: {
    blockDate: string;
    blockReason?: string;
    timezone: string;
  },
): Promise<{
  block: any;
  cancelledAppointments: number;
  notifiedPatients: string[];
  emailPreviewUrls: string[]; 
}> => {
  const doctorId = await getDoctorId(userId);
  const dt = DateTime.fromISO(data.blockDate, { zone: data.timezone });
  if (!dt.isValid) throw new Error("Invalid date or timezone");
  const nowInDoctorTz = DateTime.now().setZone(data.timezone).startOf("day");
  if (dt.startOf("day") < nowInDoctorTz) {
    throw new Error("Cannot block a past date");
  }
  const blockDateUTC = dt.startOf("day").toUTC().toJSDate();
  const existing = await AvailabilityModel.findOne({
    doctorId,
    type: "block",
    blockDate: blockDateUTC,
    isActive: true,
  });
  if (existing) throw new Error("This date is already blocked");
  const block = await AvailabilityModel.create({
    doctorId,
    type: "block",
    blockDate: blockDateUTC,
    blockReason: data.blockReason || "Doctor on leave",
    timezone: data.timezone,
  });
  const startOfDay = dt.startOf("day").toUTC().toJSDate();
  const endOfDay = dt.endOf("day").toUTC().toJSDate();
  const affectedAppointments = await AppointmentModel.find({
    doctorId,
    slotTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("patientId", "name email")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name" },
    });
  const notifiedPatients: string[] = [];
  const emailPreviewUrls: string[] = [];
  for (const apt of affectedAppointments) {
    console.log(
      `Processing appointment ${apt._id} for patient ${(apt.patientId as any).email}`,
    );
    const refundInfo = calculateRefund(apt.slotTime, apt.fee, "doctor");
    console.log("Refund info:", refundInfo);
    await AppointmentModel.findByIdAndUpdate(apt._id, {
      status: "cancelled",
      paymentStatus: refundInfo.paymentStatus,
      refundAmount: refundInfo.refundAmount,
      refundPercent: refundInfo.refundPercent,
      cancelledBy: "doctor",
      cancellationReason: data.blockReason || "Doctor on leave",
      cancelledAt: new Date(),
    });
    const patient = apt.patientId as any;
    const doctor = apt.doctorId as any;
    console.log("Patient email:", patient.email); 
    console.log("Doctor name:", doctor?.userId?.name); 

    const slotInPatientTz = DateTime.fromJSDate(apt.slotTime).setZone(
      apt.patientTimezone,
    );
    const emailUrl=await sendCancellationEmail(patient.email, {
      patientName: patient.name,
      doctorName: doctor?.userId?.name || "Doctor",
      date: slotInPatientTz.toFormat("dd MMM yyyy"),
      time: slotInPatientTz.toFormat("HH:mm"),
      fee: apt.fee,
      cancelledBy: "doctor",
      reason: data.blockReason || "Doctor on leave",
      refundAmount: refundInfo.refundAmount,
      refundPercent: refundInfo.refundPercent,
      refundMessage: refundInfo.message,
    });
    console.log("Email preview URL:", emailUrl);
    if (emailUrl) emailPreviewUrls.push(emailUrl);
    notifiedPatients.push(patient.email);
    console.log(
      `Cancelled appointment ${apt._id} and notified ${patient.email}`,
    );
  }
  return {
    block,
    cancelledAppointments: affectedAppointments.length,
    notifiedPatients,
    emailPreviewUrls,
  };
};

export const removeLeave = async (userId: string, blockId: string) => {
  const doctorId = await getDoctorId(userId);
  const block = await AvailabilityModel.findOne({ _id: blockId, doctorId });
  if (!block) throw new Error("Leave not found");
  await AvailabilityModel.findByIdAndUpdate(blockId, { isActive: false });
  return { mesage: "Leave removed" };
};

export const getDoctorLeaves = async (userId: string) => {
  const doctor = await DoctorModel.findOne({ userId });
  if (!doctor) throw new Error("Doctor profile not found");
  return await AvailabilityModel.find({
    doctorId: doctor._id,
    type: "block",
    isActive: true,
    blockDate: { $gte: new Date() },
  }).sort({ blockDate: 1 });
};
