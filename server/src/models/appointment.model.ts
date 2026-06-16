import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  slotTime: Date;
  slotTimeLocal: string;
  patientTimezone: string;
  doctorTimezone: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "refunded";
  fee: number;
  paymentStatus: "pending" | "paid" | "refunded";
  roomId?: string
  paymentId?: string;
  notes?: string;
  cancelledBy?: "patient" | "doctor" | "admin";
  cancellationReason?: string;
  cancelledAt?: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotTime: { type: Date, required: true },
    slotTimeLocal: { type: String, required: true },
    patientTimezone: { type: String, default: "Asia/Kolkata" },
    doctorTimezone: { type: String, default: "Asia/Kolkata" },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
      default: "pending",
    },
    fee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    roomId: { type: String, default: null },
    paymentId: { type: String, default: null },
    notes: { type: String, default: null },
    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: null,
    },
    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AppointmentSchema.index(
  { doctorId: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  },
);

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema,
);
