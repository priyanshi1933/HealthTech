import { Request,Response } from "express";
import path from "path";
import fs from "fs";
import { createPrescription,getPrescriptionByAppointment,getPatientPrescriptions,getDoctorPrescriptions } from "../services/prescription.service";

export const writePrescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { appointmentId, diagnosis, medicines, instructions, followUpDate } = req.body;

    if (!appointmentId || !diagnosis || !medicines?.length) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, diagnosis and medicines are required",
      });
    }

    const prescription = await createPrescription(userId, {
      appointmentId,
      diagnosis,
      medicines,
      instructions,
      followUpDate,
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Get prescription by appointment ──────────────────────────
export const getByAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const prescription = await getPrescriptionByAppointment(
      String(req.params.appointmentId),
      userId,
      role
    );
    res.json({ success: true, data: prescription });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ── Patient: my prescriptions ─────────────────────────────────
export const myPrescriptions = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.id;
    const prescriptions = await getPatientPrescriptions(patientId);
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Doctor: my prescriptions ──────────────────────────────────
export const doctorPrescriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const prescriptions = await getDoctorPrescriptions(userId);
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Download PDF ──────────────────────────────────────────────
export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const prescription = await getPrescriptionByAppointment(
      String(req.params.appointmentId),
      userId,
      role
    );

    if (!prescription.pdfPath) {
      return res.status(404).json({ success: false, message: "PDF not found" });
    }

    if (!fs.existsSync(prescription.pdfPath)) {
      return res.status(404).json({ success: false, message: "PDF file missing" });
    }

    const fileName = path.basename(prescription.pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    fs.createReadStream(prescription.pdfPath).pipe(res);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};