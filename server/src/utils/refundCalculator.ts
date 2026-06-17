import { DateTime } from "luxon";

export interface RefundResult {
  refundPercent: number;
  refundAmount: number;
  paymentStatus: "refunded" | "partial_refund" | "no_refund";
  message: string;
}

export const calculateRefund = (
  slotTime: Date,
  fee: number,
  cancelledBy: string
): RefundResult => {
  if (cancelledBy === "doctor" || cancelledBy === "admin") {
    return {
      refundPercent: 100,
      refundAmount: fee,
      paymentStatus: "refunded",
      message: "Full refund initiated — cancelled by doctor/admin",
    };
  }

  const now = DateTime.now().toUTC();
  const slot = DateTime.fromJSDate(slotTime).toUTC();
  const hoursUntilSlot = slot.diff(now, "hours").hours;

  if (hoursUntilSlot > 24) {
    return {
      refundPercent: 100,
      refundAmount: fee,
      paymentStatus: "refunded",
      message: "Full refund — cancelled more than 24 hours before appointment",
    };
  } else if (hoursUntilSlot > 2) {
    const refundAmount = Math.round(fee * 0.5);
    return {
      refundPercent: 50,
      refundAmount,
      paymentStatus: "partial_refund",
      message: `50% refund (₹${refundAmount}) — cancelled 2-24 hours before appointment`,
    };
  } else {
    return {
      refundPercent: 0,
      refundAmount: 0,
      paymentStatus: "no_refund",
      message: "No refund — cancelled less than 2 hours before appointment",
    };
  }
};