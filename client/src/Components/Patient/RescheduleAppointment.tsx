import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";

const TIMEZONES = [
  { label: "India (IST) UTC+5:30", value: "Asia/Kolkata" },
  { label: "London (GMT) UTC+0", value: "Europe/London" },
  { label: "New York (EST) UTC-5", value: "America/New_York" },
  { label: "Dubai (GST) UTC+4", value: "Asia/Dubai" },
];

export default function RescheduleAppointment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slotsData, setSlotsData] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
      } catch {
        navigate("/appointments");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [appointmentId]);

  const fetchSlots = async () => {
    if (!date) return;
    setSlotsLoading(true);
    setSlotsData(null);
    setSelectedSlot(null);
    try {
      const doctorId = appointment?.doctorId?._id || appointment?.doctorId;
      const res = await api.get("/slots", {
        params: { doctorId, date, timezone },
      });
      setSlotsData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const reschedule = async () => {
    if (!selectedSlot) return;
    setRescheduling(true);
    setError("");
    try {
      await api.patch(`/appointments/${appointmentId}/reschedule`, {
        newSlotTimeUTC: selectedSlot.timeUTC,
        reason: reason || "Rescheduled by patient",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reschedule failed");
    } finally {
      setRescheduling(false);
    }
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "white", borderRadius: "20px", padding: "3rem",
        textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        maxWidth: "420px",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
          Appointment Rescheduled!
        </h3>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Your appointment has been rescheduled. A new confirmation has been sent.
        </p>
        <button
          onClick={() => navigate("/appointments")}
          style={{
            padding: "10px 24px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            color: "white", fontWeight: 700, cursor: "pointer", width: "100%",
          }}
        >
          View My Appointments
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "16px", padding: "1.5rem 2rem",
          marginBottom: "1.5rem", color: "white",
        }}>
          <h2 style={{ fontWeight: 800, marginBottom: "4px" }}>Reschedule Appointment</h2>
          {appointment && (
            <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.92rem" }}>
              Dr. <strong>{appointment.doctorId?.userId?.name}</strong> &nbsp;|&nbsp;
              Current: <strong>{new Date(appointment.slotTime).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })} at {appointment.slotTimeLocal}</strong>
            </p>
          )}
        </div>

        {error && (
          <div style={{
            background: "#fee2e2", borderRadius: "10px",
            padding: "12px 16px", marginBottom: "1rem",
            color: "#991b1b", fontWeight: 600,
          }}>
            ❌ {error}
          </div>
        )}

        {/* Refund Policy */}
        <div style={{
          background: "white", borderRadius: "16px",
          padding: "1.5rem", marginBottom: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
            Reschedule Policy
          </h6>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { rule: "Free reschedule", detail: "More than 24 hours before appointment", color: "#065f46", bg: "#d1fae5" },
              { rule: "Free reschedule", detail: "2-24 hours before (no extra charge)", color: "#92400e", bg: "#fef3c7" },
              { rule: "Not allowed", detail: "Less than 2 hours before appointment", color: "#991b1b", bg: "#fee2e2" },
            ].map((item) => (
              <div key={item.rule + item.detail} style={{
                display: "flex", gap: "12px", alignItems: "center",
                background: item.bg, borderRadius: "8px", padding: "10px 14px",
              }}>
                <span style={{ fontWeight: 700, color: item.color, minWidth: "120px", fontSize: "0.85rem" }}>
                  {item.rule}
                </span>
                <span style={{ color: item.color, fontSize: "0.85rem" }}>{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Picker */}
        <div style={{
          background: "white", borderRadius: "16px",
          padding: "1.5rem", marginBottom: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
            Select New Date & Time
          </h6>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                New Date
              </label>
              <input
                type="date"
                style={inputStyle}
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                Timezone
              </label>
              <select
                style={inputStyle}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchSlots}
            disabled={!date || slotsLoading}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: date ? "linear-gradient(135deg,#2563eb,#06b6d4)" : "#e2e8f0",
              color: date ? "white" : "#94a3b8",
              fontWeight: 700, cursor: date ? "pointer" : "not-allowed",
              marginBottom: "1rem",
            }}
          >
            {slotsLoading ? "Loading..." : "Check Available Slots"}
          </button>

          {/* Slots */}
          {slotsData && (
            <div>
              {slotsData.blocked ? (
                <div style={{ background: "#fee2e2", borderRadius: "10px", padding: "12px", color: "#991b1b", fontWeight: 600 }}>
                  Doctor unavailable on this date. Reason: {slotsData.reason}
                </div>
              ) : slotsData.slots?.length === 0 ? (
                <div style={{ background: "#fef3c7", borderRadius: "10px", padding: "12px", color: "#92400e", fontWeight: 600 }}>
                  No slots available for this date
                </div>
              ) : (
                <div>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "10px" }}>
                    Showing times in <strong>{slotsData.patientTimezone}</strong>
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px", marginBottom: "1rem" }}>
                    {slotsData.slots.map((slot: any) => (
                      <button
                        key={slot.timeUTC}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(
                          selectedSlot?.timeUTC === slot.timeUTC ? null : slot
                        )}
                        style={{
                          padding: "8px 16px", borderRadius: "10px",
                          border: selectedSlot?.timeUTC === slot.timeUTC
                            ? "2px solid #2563eb" : "1px solid #e2e8f0",
                          background: !slot.available ? "#f1f5f9"
                            : selectedSlot?.timeUTC === slot.timeUTC ? "#eff6ff" : "white",
                          color: !slot.available ? "#94a3b8"
                            : selectedSlot?.timeUTC === slot.timeUTC ? "#2563eb" : "#1e293b",
                          fontWeight: 600, fontSize: "0.9rem",
                          cursor: slot.available ? "pointer" : "not-allowed",
                          textDecoration: !slot.available ? "line-through" : "none",
                        }}
                      >
                        {slot.time}
                        {!slot.available && <span style={{ fontSize: "0.7rem", marginLeft: "4px" }}>booked</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reason + Confirm */}
        {selectedSlot && (
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
              Confirm Reschedule
            </h6>

            <div style={{
              background: "#eff6ff", borderRadius: "10px",
              padding: "12px 16px", marginBottom: "1rem",
              color: "#1e40af", fontSize: "0.9rem", lineHeight: "1.8",
            }}>
              <div>Old slot: <strong>{new Date(appointment.slotTime).toLocaleDateString("en-IN")} at {appointment.slotTimeLocal}</strong></div>
              <div>New slot: <strong>{date} at {selectedSlot.time} ({timezone})</strong></div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                Reason for rescheduling (optional)
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. Schedule conflict"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={reschedule}
                disabled={rescheduling}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                  color: "white", fontWeight: 700, cursor: "pointer",
                }}
              >
                {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
              <button
                onClick={() => navigate("/appointments")}
                style={{
                  padding: "12px 20px", borderRadius: "10px",
                  border: "1px solid #e2e8f0", background: "white",
                  color: "#64748b", fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}