import { AppointmentModel } from "../models/appointment.model";
import { DateTime } from "luxon";

export const checkMissedAppointments=async()=>{
    try {
        const now=DateTime.now().toUTC().toJSDate();
        const confirmedAppointments=await AppointmentModel.find({
            status:"confirmed",
            slotTime:{$lt:now},
        });
        for(const apt of confirmedAppointments){
            const slotEnd=DateTime.fromJSDate(apt.slotTime)
                .plus({minutes:apt.duration})
                .toUTC();
            if(slotEnd.plus({minutes:5}).toJSDate()<new Date()){
                await AppointmentModel.findByIdAndUpdate(apt._id,{
                    status:"missed",
                });
                console.log(`⚠️ Appointment ${apt._id} marked as missed`);
            }
        }
    } catch (err) {
        console.error("Missed Appointment check error:",err);
    }
}