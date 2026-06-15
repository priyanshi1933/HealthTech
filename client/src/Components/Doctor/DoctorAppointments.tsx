import { useEffect, useState } from "react";
import api from "../../Api/axios";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const complete = async (id: string) => {
    setCompletingId(id);
    try {
      await api.patch(`/appointments/${id}/complete`);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setCompletingId(null);
    }
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    setCancellingId(id);
    try {
      await api.patch(`/appointments/${id}/cancel`, {
        reason: "Cancelled by doctor",
      });
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const statusStyle: any = {
    confirmed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    completed: { bg: "#eff6ff", color: "#1e40af" },
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
          <p style={{ color: "#64748b" }}>Manage patient appointments</p>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: "Total", value: appointments.length, color: "#2563eb" },
            { label: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length, color: "#10b981" },
            { label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: "#6366f1" },
            { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div style={{
                background: "white", borderRadius: "14px", padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: `4px solid ${s.color}`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: "#64748b", fontSize: "0.82rem" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {["all", "confirmed", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 18px", borderRadius: "20px", border: "none",
                fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                background: filter === f
                  ? "linear-gradient(135deg,#2563eb,#06b6d4)" : "#e2e8f0",
                color: filter === f ? "white" : "#64748b",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "16px", padding: "3rem",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "3rem" }}>📭</div>
            <h5 style={{ color: "#64748b" }}>No appointments found</h5>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map((apt) => (
              <div key={apt._id} style={{
                background: "white", borderRadius: "16px", padding: "1.5rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>

                  {/* Patient info */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${apt.patientId?.name}&background=06b6d4&color=fff&size=50`}
                      style={{ borderRadius: "50%", width: 50, height: 50 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{apt.patientId?.name}</div>
                      <div style={{ color: "#64748b", fontSize: "0.82rem" }}>{apt.patientId?.email}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        Patient TZ: {apt.patientTimezone}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: "4px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
                    height: "fit-content",
                    background: statusStyle[apt.status]?.bg,
                    color: statusStyle[apt.status]?.color,
                  }}>
                    {apt.status}
                  </span>
                </div>

                <hr style={{ borderColor: "#f1f5f9", margin: "1rem 0" }} />

                <div className="row g-2" style={{ fontSize: "0.88rem" }}>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>DATE</div>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(apt.slotTime).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>TIME</div>
                    <div style={{ fontWeight: 600 }}>{apt.slotTimeLocal}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{apt.doctorTimezone}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>DURATION</div>
                    <div style={{ fontWeight: 600 }}>{apt.duration} min</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>FEE</div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>₹{apt.fee}</div>
                  </div>
                </div>

                {/* Actions */}
                {apt.status === "confirmed" && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button
                      onClick={() => complete(apt._id)}
                      disabled={completingId === apt._id}
                      style={{
                        padding: "8px 20px", borderRadius: "10px", border: "none",
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        color: "white", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {completingId === apt._id ? "..." : "✅ Mark Complete"}
                    </button>
                    <button
                      onClick={() => cancel(apt._id)}
                      disabled={cancellingId === apt._id}
                      style={{
                        padding: "8px 20px", borderRadius: "10px",
                        border: "1px solid #fecaca", background: "white",
                        color: "#ef4444", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {cancellingId === apt._id ? "..." : "❌ Cancel"}
                    </button>
                  </div>
                )}

                {apt.status === "cancelled" && apt.cancellationReason && (
                  <div style={{
                    marginTop: "10px", background: "#fee2e2", borderRadius: "8px",
                    padding: "8px 12px", fontSize: "0.82rem", color: "#991b1b",
                  }}>
                    Cancelled by {apt.cancelledBy} — {apt.cancellationReason}
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