import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  slotTime: Date;
  slotTimeLocal: string;
  patientTimezone: string;
  doctorTimezone: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled";
  fee: number;
  paymentStatus: "pending" | "paid" | "refunded" | "partial_refund" | "no_refund";
  refundAmount: number;
  refundPercent: number;
  paymentId?: string;
  notes?: string;
  roomId?: string;
  cancelledBy?: "patient" | "doctor" | "admin";
  cancellationReason?: string;
  cancelledAt?: Date;
  rescheduledFrom?: mongoose.Types.ObjectId;
  rescheduledTo?: mongoose.Types.ObjectId;
  rescheduledAt?: Date;
  rescheduledBy?: "patient" | "doctor";
  originalSlotTime?: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    slotTime: { type: Date, required: true },
    slotTimeLocal: { type: String, required: true },
    patientTimezone: { type: String, default: "Asia/Kolkata" },
    doctorTimezone: { type: String, default: "Asia/Kolkata" },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rescheduled","missed"],
      default: "pending",
    },
    fee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "partial_refund", "no_refund"],
      default: "pending",
    },
    refundAmount: { type: Number, default: 0 },
    refundPercent: { type: Number, default: 0 },
    paymentId: { type: String, default: null },
    notes: { type: String, default: null },
    roomId: { type: String, default: null },
    cancelledBy: { type: String, enum: ["patient", "doctor", "admin"], default: null },
    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    rescheduledAt: { type: Date, default: null },
    rescheduledBy: { type: String, enum: ["patient", "doctor"], default: null },
    originalSlotTime: { type: Date, default: null },
  },
  { timestamps: true }
);

AppointmentSchema.index(
  { doctorId: 1, slotTime: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } }
);

export const AppointmentModel = mongoose.model<IAppointment>("Appointment", AppointmentSchema);