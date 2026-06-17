import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

function AppointmentTimer({
  slotTime,
  duration,
}: {
  slotTime: string;
  duration: number;
}) {
  const [status, setStatus] = useState<
    "upcoming" | "live" | "ending" | "missed"
  >("upcoming");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(slotTime).getTime();
      const end = start + duration * 60 * 1000;
      const graceEnd = end + 5 * 60 * 1000; 

      if (now < start) {
        setStatus("upcoming");
        const diff = start - now;
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        setTimeLeft(hrs > 0 ? `in ${hrs}h ${mins % 60}m` : `in ${mins}m`);
      } else if (now >= start && now < end) {
        setStatus("live");
        const diff = end - now;
        const mins = Math.floor(diff / 60000);
        setTimeLeft(`${mins}m left`);
      } else if (now >= end && now < graceEnd) {
        setStatus("ending");
        const diff = graceEnd - now;
        const secs = Math.floor(diff / 1000);
        setTimeLeft(`closing in ${secs}s`);
      } else {
        setStatus("missed");
        setTimeLeft("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slotTime, duration]);

  if (status === "upcoming") {
    return (
      <span
        style={{
          fontSize: "0.78rem",
          color: "#64748b",
          fontWeight: 600,
        }}
      >
        🕐 Starts {timeLeft}
      </span>
    );
  }

  if (status === "live") {
    return (
      <span
        style={{
          fontSize: "0.78rem",
          color: "#059669",
          fontWeight: 700,
          background: "#d1fae5",
          padding: "3px 10px",
          borderRadius: "20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        🟢 Live now — {timeLeft}
      </span>
    );
  }

  if (status === "ending") {
    return (
      <span
        style={{
          fontSize: "0.78rem",
          color: "#dc2626",
          fontWeight: 700,
          background: "#fee2e2",
          padding: "3px 10px",
          borderRadius: "20px",
          animation: "pulse 1s infinite",
        }}
      >
        ⚠️ Window {timeLeft}
      </span>
    );
  }

  return null; 
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelEmailUrl, setCancelEmailUrl] = useState<string | null>(null);
  const [emailPreviews, setEmailPreviews] = useState<{ [id: string]: string }>(
    {},
  );
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("emailPreviews") || "{}");
    setEmailPreviews(stored);
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id: string) => {
    if (
      !confirm(
        "Cancel this appointment? Refund will be calculated based on cancellation policy.",
      )
    )
      return;
    setCancellingId(id);
    try {
      const res = await api.patch(`/appointments/${id}/cancel`, {
        reason: "Cancelled by patient",
      });

      setCancelEmailUrl(res.data.emailPreviewUrl ?? null);

      if (res.data.emailPreviewUrl) {
        const stored = JSON.parse(
          localStorage.getItem("emailPreviews") || "{}",
        );
        stored[`cancel_${id}`] = res.data.emailPreviewUrl;
        localStorage.setItem("emailPreviews", JSON.stringify(stored));
        setEmailPreviews(stored);
      }

      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  const statusStyle: any = {
    confirmed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    completed: { bg: "#eff6ff", color: "#1e40af" },
    rescheduled: { bg: "#f3e8ff", color: "#6b21a8" },
    missed: { bg: "#fed7aa", color: "#9a3412" },
  };

  const paymentStyle: any = {
    paid: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    refunded: { bg: "#f3e8ff", color: "#6b21a8" },
    partial_refund: { bg: "#fef3c7", color: "#92400e" },
    no_refund: { bg: "#fee2e2", color: "#991b1b" },
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>My Appointments</h2>
          <p style={{ color: "#64748b" }}>View and manage your appointments</p>
        </div>

        {/* Cancellation email banner */}
        {cancelEmailUrl && (
          <div
            style={{
              background: "#f3e8ff",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap" as const,
              gap: "8px",
            }}
          >
            <span
              style={{ color: "#6b21a8", fontWeight: 600, fontSize: "0.9rem" }}
            >
              📧 Cancellation email sent!
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={cancelEmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  background: "#6b21a8",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                📬 View Email
              </a>
              <button
                onClick={() => setCancelEmailUrl(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d8b4fe",
                  background: "white",
                  color: "#6b21a8",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "3rem",
              textAlign: "center" as const,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
            <h5 style={{ color: "#64748b" }}>No appointments yet</h5>
            <button
              onClick={() => navigate("/doctors")}
              style={{
                marginTop: "1rem",
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Find a Doctor
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: "1rem",
            }}
          >
            {appointments.map((apt) => (
              <div
                key={apt._id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Header: doctor + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap" as const,
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${apt.doctorId?.userId?.name}&background=2563eb&color=fff&size=50`}
                      style={{ borderRadius: "50%", width: 50, height: 50 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>
                        {apt.doctorId?.userId?.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {apt.doctorId?.specialty}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        background: statusStyle[apt.status]?.bg,
                        color: statusStyle[apt.status]?.color,
                      }}
                    >
                      {apt.status}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        background: paymentStyle[apt.paymentStatus]?.bg,
                        color: paymentStyle[apt.paymentStatus]?.color,
                      }}
                    >
                      {apt.paymentStatus}
                    </span>
                  </div>
                </div>

                <hr style={{ borderColor: "#f1f5f9", margin: "1rem 0" }} />

                {/* Details grid */}
                <div
                  className="row g-2"
                  style={{ fontSize: "0.88rem", color: "#475569" }}
                >
                  <div className="col-6 col-md-3">
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      DATE
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(apt.slotTime).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      TIME
                    </div>
                    <div style={{ fontWeight: 600 }}>{apt.slotTimeLocal}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {apt.doctorTimezone}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      DURATION
                    </div>
                    <div style={{ fontWeight: 600 }}>{apt.duration} min</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      FEE
                    </div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>
                      ₹{apt.fee}
                    </div>
                  </div>
                </div>

                {/* Payment ID */}
                {apt.paymentId && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                    }}
                  >
                    Payment ID: {apt.paymentId}
                  </div>
                )}

                {/* Confirmation email */}
                {emailPreviews[apt._id] && (
                  <div style={{ marginTop: "10px" }}>
                    <a
                      href={emailPreviews[apt._id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 16px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      📬 View Confirmation Email
                    </a>
                  </div>
                )}

                {/* Join video call */}
                {apt.status === "confirmed" && apt.roomId && (
                  <button
                    onClick={() => navigate(`/video/${apt._id}`)}
                    style={{
                      marginTop: "10px",
                      padding: "8px 20px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg,#10b981,#059669)",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    Join Video Call
                  </button>
                )}

                {/* Cancellation email link */}
                {apt.status === "cancelled" &&
                  emailPreviews[`cancel_${apt._id}`] && (
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={emailPreviews[`cancel_${apt._id}`]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "6px 16px",
                          borderRadius: "8px",
                          background: "#6b21a8",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        📬 View Cancellation Email
                      </a>
                    </div>
                  )}

                {/* Reschedule + Cancel (only one set) */}
                {(apt.status === "confirmed" || apt.status === "pending") && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "1rem",
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/appointments/${apt._id}/reschedule`)
                      }
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        border: "1px solid #bfdbfe",
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.88rem",
                      }}
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => cancel(apt._id)}
                      disabled={cancellingId === apt._id}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        border: "1px solid #fecaca",
                        background: "#fff",
                        color: "#ef4444",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.88rem",
                      }}
                    >
                      {cancellingId === apt._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}

                {/* Refund info */}
                {apt.status === "cancelled" &&
                  apt.refundAmount !== undefined && (
                    <div
                      style={{
                        marginTop: "10px",
                        background:
                          apt.refundPercent === 100
                            ? "#d1fae5"
                            : apt.refundPercent === 50
                              ? "#fef3c7"
                              : "#fee2e2",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "0.82rem",
                        color:
                          apt.refundPercent === 100
                            ? "#065f46"
                            : apt.refundPercent === 50
                              ? "#92400e"
                              : "#991b1b",
                        fontWeight: 600,
                      }}
                    >
                      Refund: ₹{apt.refundAmount} ({apt.refundPercent}%)
                      {apt.refundPercent === 100 && " — Full refund initiated"}
                      {apt.refundPercent === 50 && " — 50% partial refund"}
                      {apt.refundPercent === 0 &&
                        " — No refund (cancelled too late)"}
                    </div>
                  )}

                {/* Cancellation reason */}
                {apt.status === "cancelled" && apt.cancellationReason && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                    }}
                  >
                    Reason: {apt.cancellationReason}
                  </div>
                )}

                {/* Rescheduled badge */}
                {apt.status === "rescheduled" && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#eff6ff",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "0.82rem",
                      color: "#1e40af",
                      fontWeight: 600,
                    }}
                  >
                    This appointment was rescheduled
                    {apt.rescheduledAt &&
                      ` on ${new Date(apt.rescheduledAt).toLocaleDateString()}`}
                  </div>
                )}

                {apt.status === "missed" && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#fed7aa",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      color: "#9a3412",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ⚠️ You missed this appointment. The consultation window has
                    closed.
                  </div>
                )}
                {apt.status === "confirmed" && (
                  <div style={{ marginTop: "8px" }}>
                    <AppointmentTimer
                      slotTime={apt.slotTime}
                      duration={apt.duration}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
