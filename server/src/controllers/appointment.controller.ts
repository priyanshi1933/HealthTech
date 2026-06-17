import { Request, Response } from "express";
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
  getAppointmentById,
  rescheduleAppointment,
} from "../services/appointment.service";
import { logAccess } from "../services/auditLog.service";

export const book = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.id;
    const { doctorId, slotTimeUTC, patientTimezone } = req.body;

    if (!doctorId || !slotTimeUTC) {
      return res.status(400).json({
        success: false,
        message: "doctorId and slotTimeUTC are required",
      });
    }

    const { appointment, emailPreviewUrl } = await bookAppointment(patientId, {
      doctorId,
      slotTimeUTC,
      patientTimezone: patientTimezone || "Asia/Kolkata",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
      emailPreviewUrl,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked. Please choose another.",
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const myAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.id;
    const appointments = await getPatientAppointments(patientId);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const doctorAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const appointments = await getDoctorAppointments(userId);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { reason } = req.body;

    const { appointment, emailPreviewUrl, refundInfo } = await cancelAppointment(
      String(req.params.id),
      userId,
      role,
      reason
    );

    res.json({
      success: true,
      message: "Appointment cancelled",
      data: appointment,
      emailPreviewUrl,
      refundInfo, 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const complete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const appointment = await completeAppointment(
      String(req.params.id),
      userId,
    );
    res.json({
      success: true,
      message: "Appointment completed",
      data: appointment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const singleAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const appointment = await getAppointmentById(
      String(req.params.id),
      userId,
      role,
    );
    if (role === "doctor") {
      await logAccess({
        action: "VIEW_APPOINTMENT_RECORD",
        performedBy: userId,
        performedByRole: role,
        targetPatientId: (appointment.patientId as any)._id.toString(),
        targetResourceId: appointment._id.toString(),
        resourceType: "appointment",
        req,
      });
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reschedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { newSlotTimeUTC, reason } = req.body;

    if (!newSlotTimeUTC) {
      return res.status(400).json({
        success: false,
        message: "newSlotTimeUTC is required",
      });
    }

    const result = await rescheduleAppointment(
      String(req.params.id),
      userId,
      role,
      { newSlotTimeUTC, reason }
    );

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
