import mongoose,{Schema,Document} from "mongoose";

export interface IAuditLog extends Document{
    action:string;
    performedBy:mongoose.Types.ObjectId;
    performedByRole:string;
    targetPatientId?:mongoose.Types.ObjectId;
    targetResourceId?:string;
    resourceType:string;
    ipAddress?:string;
    userAgent?:string;
    metadata?:any;
    createdAt:Date;
}

const AuditLogSchema=new Schema<IAuditLog>(
    {
        action:{type:String,required:true},
        performedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        performedByRole:{type:String,required:true},
        targetPatientId:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
        targetResourceId:{type:String,default:null},
        resourceType:{type:String,required:true},
        ipAddress:{type:String,default:null},
        userAgent:{type:String,default:null},
        metadata:{type:Schema.Types.Mixed,default:{}},
    },
    {timestamps:true}
)

AuditLogSchema.index({targetPatientId:1,createdAt:-1});
AuditLogSchema.index({performedBy:1,createdAt:-1});

export const AuditLogModel=mongoose.model<IAuditLog>("AuditLog",AuditLogSchema);