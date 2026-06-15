import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document {
  doctorId: mongoose.Types.ObjectId;
  type: "recurring" | "block";
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  timezone?: string;          
  blockDate?: Date;
  blockReason?: string;
  isActive: boolean;
}

const AvailabilitySchema: Schema<IAvailability> = new Schema<IAvailability>(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    type: {
      type: String,
      enum: ["recurring", "block"],
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6, default: null },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    slotDuration: { type: Number, default: 30 },
    timezone: { type: String, default: "Asia/Kolkata" }, 
    blockDate: { type: Date, default: null },
    blockReason: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AvailabilityModel = mongoose.model<IAvailability>(
  "Availability",
  AvailabilitySchema
);