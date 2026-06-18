import { Request,Response } from "express";
import { checkSymptoms } from "../services/symptomChecker.service";

export const analyzeSymptoms=async(req:Request,res:Response)=>{
    try {
        const {symptoms}=req.body;
        if(!symptoms || symptoms.trim().length<3){
            return res.status(400).json({
                success:false,
                message:"Please describe your symptoms (at least 3 characters)",
            });
        }
        const results=checkSymptoms(symptoms);
        if(results.length===0){
            return res.json({
                success:true,
                data:[],
                message:"No specific specialty found. Please consult a General Physician.",
                generalAdvice:true,
            });
        }
        res.json({
            success:true,
            data:results,
            message:`Found ${results.length} suggested specialt${results.length===1?"y":"ies"}`,
        });
    } catch (error:any) {
        res.status(500).json({success:false,message:error.message});
    }
}