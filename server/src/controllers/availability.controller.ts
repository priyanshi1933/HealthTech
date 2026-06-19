import { Request, Response } from "express";
import {
  addRecurringSlot,
  addBlockDate,
  getMyAvailability,
  getDoctorAvailability,
  deleteRecurringSlot,
  deleteBlockDate,
  generateSlots,
  addLeaveWithCancellation,
  removeLeave,
  getDoctorLeaves,
} from "../services/availability.service";

export const addRecurring = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dayOfWeek, startTime, endTime, slotDuration, timezone } = req.body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek, startTime, endTime are required",
      });
    }

    const slot = await addRecurringSlot(userId, {
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      slotDuration: Number(slotDuration) || 30,
      timezone: timezone || "Asia/Kolkata",
    });

    res
      .status(201)
      .json({ success: true, message: "Recurring slot added", data: slot });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addBlock = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { blockDate, blockReason, timezone } = req.body;

    if (!blockDate) {
      return res
        .status(400)
        .json({ success: false, message: "blockDate is required" });
    }

    const block = await addBlockDate(userId, {
      blockDate,
      blockReason,
      timezone: timezone || "Asia/Kolkata",
    });

    res
      .status(201)
      .json({ success: true, message: "Date blocked", data: block });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyAvailabilityHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data = await getMyAvailability(userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDoctorAvailabilityHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getDoctorAvailability(String(req.params.doctorId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRecurring = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await deleteRecurringSlot(userId, String(req.params.id));
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBlock = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await deleteBlockDate(userId, String(req.params.id));
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSlotsForDate = async (req: Request, res: Response) => {
  try {
    const { doctorId, date, timezone } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const result = await generateSlots(
      String(doctorId),
      String(date),
      String(timezone || "Asia/Kolkata"),
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addLeave=async(req:Request,res:Response)=>{
  try {
    const userId=(req as any).user.id;
    const {blockDate,blockReason,timezone}=req.body;
    if(!blockDate){
      return res.status(400).json({
        success:false,
        message:"blockDate is required",
      });
    }
    const result=await addLeaveWithCancellation(userId,{
      blockDate,
      blockReason,
      timezone:timezone || "Asia/Kolkata",
    });
    res.status(201).json({
        success:true,
        message:`Leave added. ${result.cancelledAppointments} appointment(s) cancelled and patients notified.`,
        data:{
          block:result.block,
          cancelledAppointments:result.cancelledAppointments,
          notifiedPatients:result.notifiedPatients,
          emailPreviewUrls:result.emailPreviewUrls,
        },
    });
  } catch (error:any) {
    res.status(400).json({success:false,message:error.message});
  }
}

export const getLeaves=async(req:Request,res:Response)=>{
  try {
    const userId=(req as any).user.id;
    const leaves=await getDoctorLeaves(userId);
    res.json({success:true,data:leaves});
  } catch (error:any) {
    res.status(400).json({success:false,message:error.message});
  }
}

export const removeLeaveHandler=async(req:Request,res:Response)=>{
  try {
    const userId=(req as any).user.id;
    const result=await removeLeave(userId,String(req.params.id));
    res.json({success:true,...result});
  } catch (error:any) {
    res.status(400).json({success:false,message:error.message});
  }
}

