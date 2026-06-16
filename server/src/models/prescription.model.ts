import mongoose, { Schema, Document } from "mongoose";

export interface IPrescription extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  instructions: string;
  followUpDate?: Date;
  pdfPath?: string;
  createdAt: Date;
}

const MedicineSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String, default: "" },
});

const PrescriptionSchema = new Schema<IPrescription>(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
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
    diagnosis: { type: String, required: true },
    medicines: [MedicineSchema],
    instructions: { type: String, default: "" },
    followUpDate: { type: Date, default: null },
    pdfPath: { type: String, default: null },
  },
  { timestamps: true },
);

export const PrescriptionModel = mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema,
);
