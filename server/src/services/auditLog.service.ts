import { AuditLogModel } from "../models/auditLog.model";
import { Request } from "express";

interface LogParams{
    action:string;
    performedBy:string;
    performedByRole:string;
    targetPatientId?:string;
    targetResourceId?:string;
    resourceType:string;
    req?:Request;
    metadata?:any;
}

export const logAccess = async (params: LogParams) => {
  try {
    await AuditLogModel.create({
      action: params.action,
      performedBy: params.performedBy,
      performedByRole: params.performedByRole,
      targetPatientId: params.targetPatientId || undefined,   
      targetResourceId: params.targetResourceId || undefined, 
      resourceType: params.resourceType,
      ipAddress: params.req?.ip || params.req?.socket.remoteAddress || undefined, 
      userAgent: params.req?.headers["user-agent"] || undefined, 
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error("Audit log failed (non-critical):", err);
  }
};

export const getPatientAccessLogs=async(patientId:string)=>{
    return await AuditLogModel.find({targetPatientId:patientId})
        .populate("performedBy","name email role")
        .sort({createdAt:-1})
        .limit(200);
}

export const getUserActivityLogs=async(userId:string)=>{
    return await AuditLogModel.find({performedBy:userId})
        .populate("targetPatientId","name email")
        .sort({createdAt:-1})
        .limit(200);
}

export const getAllAuditLogs=async(filters:{
    resourceType?:string;
    performedByRole?:string;
    startDate?:string;
    endDate?:string;
})=>{
    const query:any={};
    if(filters.resourceType) query.resourceType=filters.resourceType;
    if(filters.performedByRole) query.performedByRole=filters.performedByRole;
    if(filters.startDate || filters.endDate){
        query.createdAt={};
        if(filters.startDate) query.createdAt.$gte=new Date(filters.startDate);
        if(filters.endDate) query.createdAt.$lte=new Date(filters.endDate);
    }
    return await AuditLogModel.find(query)
        .populate("performedBy","name email role")
        .populate("targetPatientId","name email")
        .sort({createdAt:-1})
        .limit(500);
};