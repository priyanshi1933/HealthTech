import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

const TIMEZONES = [
  { label: "India (IST) UTC+5:30", value: "Asia/Kolkata" },
  { label: "London (GMT) UTC+0", value: "Europe/London" },
  { label: "New York (EST) UTC-5", value: "America/New_York" },
  { label: "Dubai (GST) UTC+4", value: "Asia/Dubai" },
  { label: "Singapore (SGT) UTC+8", value: "Asia/Singapore" },
  { label: "Tokyo (JST) UTC+9", value: "Asia/Tokyo" },
  { label: "Sydney (AEST) UTC+10", value: "Australia/Sydney" },
];

export default function SingleDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slotsData, setSlotsData] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/${id}`);
        setDoctor(res.data.data);
      } catch {
        navigate("/doctors");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const fetchSlots = async () => {
    if (!date) return;
    setSlotsLoading(true);
    setSlotsData(null);
    setSelectedSlot(null);
    setBookingSuccess(null);
    try {
      const res = await api.get("/slots", {
        params: { doctorId: id, date, timezone },
      });
      setSlotsData(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to fetch slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const bookSlot = async () => {
    if (!selectedSlot) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    setBooking(true);
    try {
      const res = await api.post("/appointments/book", {
        doctorId: id,
        slotTimeUTC: selectedSlot.timeUTC,
        patientTimezone: timezone,
      });
      setBookingSuccess(res.data.data);
      setSelectedSlot(null);
      fetchSlots(); 
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>

        {/* Back */}
        <button
          onClick={() => navigate("/doctors")}
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "8px 16px",
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          ← Back to Doctors
        </button>

        {/* Doctor Card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <img
              src={`https://ui-avatars.com/api/?name=${doctor.userId?.name}&size=90&background=2563eb&color=fff`}
              style={{ borderRadius: "50%", width: 90, height: 90 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 0 }}>
                  {doctor.userId?.name}
                </h2>
                {doctor.verifiedBadge && (
                  <span style={{
                    background: "#d1fae5", color: "#065f46",
                    fontSize: "0.78rem", padding: "3px 10px",
                    borderRadius: "20px", fontWeight: 700,
                  }}>✅ Verified</span>
                )}
              </div>
              <p style={{ color: "#2563eb", fontWeight: 600, marginBottom: "8px" }}>
                {doctor.specialty}
              </p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  ⏱ {doctor.experience} yrs experience
                </span>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  🗣 {doctor.languages.join(", ")}
                </span>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  🎓 {doctor.qualifications.join(", ")}
                </span>
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg,#2563eb,#06b6d4)",
              borderRadius: "14px",
              padding: "1rem 1.5rem",
              textAlign: "center",
              color: "white",
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>₹{doctor.fee}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>per consultation</div>
            </div>
          </div>

          {doctor.bio && (
            <p style={{
              marginTop: "1rem",
              color: "#475569",
              background: "#f8fafc",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "0.92rem",
            }}>
              {doctor.bio}
            </p>
          )}
        </div>

        {/* Booking Success */}
      {bookingSuccess && (
  <div style={{
    background: "#d1fae5",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    border: "1px solid #6ee7b7",
  }}>
    <h5 style={{ color: "#065f46", fontWeight: 800, marginBottom: "8px" }}>
      ✅ Appointment Booked!
    </h5>
    <div style={{ color: "#047857", fontSize: "0.9rem", lineHeight: "1.8" }}>
      <div><strong>Payment ID:</strong> {bookingSuccess.paymentId}</div>
      <div><strong>Date:</strong> {new Date(bookingSuccess.slotTime).toLocaleDateString()}</div>
      <div><strong>Time:</strong> {bookingSuccess.slotTimeLocal} (Doctor's time)</div>
      <div><strong>Fee Paid:</strong> ₹{bookingSuccess.fee}</div>
      <div><strong>Status:</strong> {bookingSuccess.status}</div>
    </div>

    {/* ✅ email note for development */}
    <div style={{
      marginTop: "12px",
      background: "#ecfdf5",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "0.82rem",
      color: "#065f46",
      border: "1px dashed #6ee7b7",
    }}>
      📧 Confirmation email sent! Check your terminal for the
      <strong> Ethereal preview link</strong> to view the email.
    </div>

    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
      <button
        onClick={() => navigate("/appointments")}
        style={{
          padding: "8px 20px",
          borderRadius: "10px",
          border: "none",
          background: "#065f46",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        View My Appointments →
      </button>
    </div>
  </div>
)}

        {/* Slot Picker */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <h5 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "1.5rem" }}>
            📅 Book an Appointment
          </h5>

          {/* Date + Timezone */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  width: "100%",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
            <div className="col-md-6">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                🌍 Your Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  width: "100%",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
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
              padding: "10px 28px",
              borderRadius: "10px",
              border: "none",
              background: date
                ? "linear-gradient(135deg,#2563eb,#06b6d4)"
                : "#e2e8f0",
              color: date ? "white" : "#94a3b8",
              fontWeight: 700,
              cursor: date ? "pointer" : "not-allowed",
              marginBottom: "1.5rem",
            }}
          >
            {slotsLoading ? "Loading..." : "Check Available Slots"}
          </button>

          {/* Slots */}
          {slotsData && (
            <div>
              {slotsData.blocked ? (
                <div style={{
                  background: "#fee2e2",
                  borderRadius: "12px",
                  padding: "1rem",
                  color: "#991b1b",
                  fontWeight: 600,
                }}>
                  🚫 Doctor is unavailable on this date.
                  {slotsData.reason && <span> Reason: {slotsData.reason}</span>}
                </div>
              ) : slotsData.slots?.length === 0 ? (
                <div style={{
                  background: "#fef3c7",
                  borderRadius: "12px",
                  padding: "1rem",
                  color: "#92400e",
                  fontWeight: 600,
                }}>
                  ⚠️ {slotsData.message || "No slots available for this date"}
                </div>
              ) : (
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                      🌍 Showing times in <strong>{slotsData.patientTimezone}</strong>
                      {slotsData.patientTimezone !== slotsData.doctorTimezone && (
                        <span> (Doctor: {slotsData.doctorTimezone})</span>
                      )}
                    </p>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {slotsData.slots.filter((s: any) => s.available).length} slots available
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "1.5rem",
                  }}>
                    {slotsData.slots.map((slot: any) => (
                      <button
                        key={slot.timeUTC}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(
                          selectedSlot?.timeUTC === slot.timeUTC ? null : slot
                        )}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          border: selectedSlot?.timeUTC === slot.timeUTC
                            ? "2px solid #2563eb"
                            : "1px solid #e2e8f0",
                          background: !slot.available
                            ? "#f1f5f9"
                            : selectedSlot?.timeUTC === slot.timeUTC
                            ? "#eff6ff"
                            : "white",
                          color: !slot.available
                            ? "#94a3b8"
                            : selectedSlot?.timeUTC === slot.timeUTC
                            ? "#2563eb"
                            : "#1e293b",
                          fontWeight: 600,
                          cursor: slot.available ? "pointer" : "not-allowed",
                          fontSize: "0.9rem",
                          textDecoration: !slot.available ? "line-through" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {slot.time}
                        {!slot.available && (
                          <span style={{ fontSize: "0.7rem", marginLeft: "4px" }}>
                            booked
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected slot confirm */}
                  {selectedSlot && (
                    <div style={{
                      background: "#eff6ff",
                      borderRadius: "14px",
                      padding: "1.25rem",
                      border: "1px solid #bfdbfe",
                    }}>
                      <h6 style={{ fontWeight: 700, color: "#1e40af", marginBottom: "10px" }}>
                        Confirm Booking
                      </h6>
                      <div style={{ color: "#1e40af", fontSize: "0.9rem", lineHeight: "1.8" }}>
                        <div>👨‍⚕️ <strong>Doctor:</strong> {doctor.userId?.name}</div>
                        <div>📅 <strong>Date:</strong> {date}</div>
                        <div>⏰ <strong>Your Time:</strong> {selectedSlot.time} ({timezone})</div>
                        <div>⏰ <strong>Doctor's Time:</strong> {selectedSlot.timeDoctor} ({slotsData.doctorTimezone})</div>
                        <div>⏱ <strong>Duration:</strong> {selectedSlot.duration} min</div>
                        <div>💰 <strong>Fee:</strong> ₹{doctor.fee}</div>
                      </div>

                      {role !== "patient" ? (
                        <div style={{
                          marginTop: "12px",
                          padding: "10px",
                          background: "#fef3c7",
                          borderRadius: "10px",
                          color: "#92400e",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}>
                          ⚠️ Only patients can book appointments.
                          {!role && (
                            <span
                              onClick={() => navigate("/")}
                              style={{ marginLeft: "6px", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Login as patient
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={bookSlot}
                          disabled={booking}
                          style={{
                            marginTop: "12px",
                            padding: "10px 28px",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                            color: "white",
                            fontWeight: 700,
                            cursor: "pointer",
                            width: "100%",
                            fontSize: "1rem",
                          }}
                        >
                          {booking ? "Booking..." : `Confirm & Pay ₹${doctor.fee}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}