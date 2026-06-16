import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialty: string;
  qualifications: string[];
  experience: number;
  fee: number;
  languages: string[];
  bio: string;
  verifiedBadge: boolean;
  verificationStatus: string;
  verificationNote?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  isActive: boolean;
}

const DoctorSchema: Schema<IDoctor> = new Schema<IDoctor>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: { type: String, required: true, trim: true },
    qualifications: [{ type: String, required: true }],
    experience: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 },
    languages: [{ type: String, required: true }],
    bio: { type: String, trim: true, default: "" },
    verifiedBadge: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNote: { type: String, default: null },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);
