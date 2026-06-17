import { Request,Response } from "express";
import { getPatientAccessLogs,getUserActivityLogs,getAllAuditLogs } from "../services/auditLog.service";

export const myAccessLogs=async(req:Request,res:Response)=>{
    try {
        const patientId=(req as any).user.id;
        const logs=await getPatientAccessLogs(patientId);
        res.json({success:true,count:logs.length,data:logs});
    } catch (error:any) {
        res.status(500).json({success:false,message:error.message});
    }
}

export const myActivityLogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const logs = await getUserActivityLogs(userId);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: all logs with filters ───────────────────────────────
export const allAuditLogs = async (req: Request, res: Response) => {
  try {
    const { resourceType, performedByRole, startDate, endDate } = req.query;
    const logs = await getAllAuditLogs({
      resourceType: resourceType as string,
      performedByRole: performedByRole as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: logs for a specific patient ─────────────────────────
export const patientAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await getPatientAccessLogs(String(req.params.patientId));
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};