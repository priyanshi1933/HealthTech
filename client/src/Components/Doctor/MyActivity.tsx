import { useEffect, useState } from "react";
import api from "../../Api/axios";

const ACTION_LABELS: any = {
  VIEW_PRESCRIPTION: { label: "Viewed Prescription", icon: "💊", color: "#2563eb" },
  DOWNLOAD_PRESCRIPTION_PDF: { label: "Downloaded PDF", icon: "📥", color: "#7c3aed" },
  VIEW_APPOINTMENT_RECORD: { label: "Viewed Appointment", icon: "📋", color: "#059669" },
};

export default function MyActivity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/audit/my-activity");
        setLogs(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === "all"
    ? logs
    : logs.filter((l) => l.action === filter);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>My Activity Log</h2>
          <p style={{ color: "#64748b" }}>Records of patient data you have accessed</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" as const }}>
          {[
            { label: "All", value: "all" },
            { label: "Prescriptions", value: "VIEW_PRESCRIPTION" },
            { label: "PDF Downloads", value: "DOWNLOAD_PRESCRIPTION_PDF" },
            { label: "Appointments", value: "VIEW_APPOINTMENT_RECORD" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "6px 18px", borderRadius: "20px", border: "none",
                fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                background: filter === f.value
                  ? "linear-gradient(135deg,#2563eb,#06b6d4)" : "#e2e8f0",
                color: filter === f.value ? "white" : "#64748b",
              }}
            >
              {f.label}
              <span style={{
                marginLeft: "6px",
                background: filter === f.value ? "rgba(255,255,255,0.3)" : "#d1d5db",
                padding: "1px 6px", borderRadius: "10px", fontSize: "0.72rem",
              }}>
                {f.value === "all" ? logs.length : logs.filter((l) => l.action === f.value).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "20px",
            padding: "3rem", textAlign: "center" as const,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <h5 style={{ color: "#64748b" }}>No activity yet</h5>
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            {filtered.map((log, index) => {
              const actionInfo = ACTION_LABELS[log.action] || {
                label: log.action, icon: "🔍", color: "#64748b",
              };
              return (
                <div key={log._id} style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: index < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  display: "flex", alignItems: "center",
                  gap: "1rem", flexWrap: "wrap" as const,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "10px",
                    background: "#f8fafc", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", flexShrink: 0,
                  }}>
                    {actionInfo.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>
                      {actionInfo.label}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "2px" }}>
                      Patient: <strong>{log.targetPatientId?.name || "Unknown"}</strong>
                      &nbsp;·&nbsp;{log.targetPatientId?.email}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                    <div style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.85rem" }}>
                      {new Date(log.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                      {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}