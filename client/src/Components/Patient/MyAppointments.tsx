import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

 const cancel = async (id: string) => {
  if (!confirm("Are you sure you want to cancel? A refund will be initiated.")) return;
  setCancellingId(id);
  try {
    await api.patch(`/appointments/${id}/cancel`, {
      reason: "Cancelled by patient",
    });
    // ✅ show note
    alert("Appointment cancelled. Refund initiated.\nCheck terminal for cancellation email preview.");
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
    refunded: { bg: "#f3e8ff", color: "#6b21a8" },
  };

  const paymentStyle: any = {
    paid: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    refunded: { bg: "#f3e8ff", color: "#6b21a8" },
  };

  if (loading) return (
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

        {appointments.length === 0 ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {appointments.map((apt) => (
              <div key={apt._id} style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>

                  {/* Doctor info */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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

                  {/* Status badges */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700,
                      background: statusStyle[apt.status]?.bg,
                      color: statusStyle[apt.status]?.color,
                    }}>
                      {apt.status}
                    </span>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700,
                      background: paymentStyle[apt.paymentStatus]?.bg,
                      color: paymentStyle[apt.paymentStatus]?.color,
                    }}>
                      {apt.paymentStatus}
                    </span>
                  </div>
                </div>

                <hr style={{ borderColor: "#f1f5f9", margin: "1rem 0" }} />

                {/* Details */}
                <div className="row g-2" style={{ fontSize: "0.88rem", color: "#475569" }}>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600 }}>DATE</div>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(apt.slotTime).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600 }}>TIME</div>
                    <div style={{ fontWeight: 600 }}>{apt.slotTimeLocal}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{apt.doctorTimezone}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600 }}>DURATION</div>
                    <div style={{ fontWeight: 600 }}>{apt.duration} min</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600 }}>FEE</div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>₹{apt.fee}</div>
                  </div>
                </div>

                {/* Payment ID */}
                {apt.paymentId && (
                  <div style={{
                    marginTop: "10px",
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                  }}>
                    Payment ID: {apt.paymentId}
                  </div>
                )}

                {/* Cancellation info */}
                {apt.status === "cancelled" && (
                  <div style={{
                    marginTop: "10px",
                    background: "#fee2e2",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    color: "#991b1b",
                  }}>
                    Cancelled by {apt.cancelledBy} — {apt.cancellationReason}
                  </div>
                )}

                {/* Cancel button */}
                {(apt.status === "confirmed" || apt.status === "pending") && (
                  <button
                    onClick={() => cancel(apt._id)}
                    disabled={cancellingId === apt._id}
                    style={{
                      marginTop: "1rem",
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
                    {cancellingId === apt._id ? "Cancelling..." : "Cancel Appointment"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}