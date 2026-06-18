import { useEffect, useState } from "react";
import api from "../../Api/axios";

const ACTION_LABELS: any = {
  VIEW_PRESCRIPTION: { label: "Viewed Prescription", icon: "💊", color: "#2563eb", bg: "#eff6ff" },
  DOWNLOAD_PRESCRIPTION_PDF: { label: "Downloaded PDF", icon: "📥", color: "#7c3aed", bg: "#f3e8ff" },
  VIEW_APPOINTMENT_RECORD: { label: "Viewed Appointment", icon: "📋", color: "#059669", bg: "#d1fae5" },
  VIEW_PATIENT_PROFILE: { label: "Viewed Profile", icon: "👤", color: "#d97706", bg: "#fef3c7" },
  VIEW_ALL_PATIENTS: { label: "Viewed All Patients", icon: "👥", color: "#dc2626", bg: "#fee2e2" },   
};

export default function WhoViewedMyData() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/audit/my-access");
        setLogs(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          marginBottom: "1.5rem",
          color: "white",
        }}>
          <h2 style={{ fontWeight: 800, marginBottom: "4px" }}>🔒 Who Viewed My Data</h2>
          <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.92rem" }}>
            Full audit trail of who accessed your medical records
          </p>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Total Accesses",
              value: logs.length,
              color: "#2563eb",
              icon: "🔍",
            },
            {
              label: "Prescription Views",
              value: logs.filter((l) => l.action === "VIEW_PRESCRIPTION").length,
              color: "#7c3aed",
              icon: "💊",
            },
            {
              label: "PDF Downloads",
              value: logs.filter((l) => l.action === "DOWNLOAD_PRESCRIPTION_PDF").length,
              color: "#059669",
              icon: "📥",
            },
            {
              label: "Appointment Views",
              value: logs.filter((l) => l.action === "VIEW_APPOINTMENT_RECORD").length,
              color: "#d97706",
              icon: "📋",
            },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div style={{
                background: "white",
                borderRadius: "14px",
                padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${s.color}`,
                textAlign: "center" as const,
              }}>
                <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: "#64748b", fontSize: "0.78rem" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Logs */}
        {logs.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "20px",
            padding: "3rem", textAlign: "center" as const,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h5 style={{ color: "#64748b" }}>No access logs yet</h5>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              When doctors or admins view your records, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            {logs.map((log, index) => {
              const actionInfo = ACTION_LABELS[log.action] || {
                label: log.action,
                icon: "🔍",
                color: "#64748b",
                bg: "#f8fafc",
              };
              return (
                <div key={log._id} style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: index < logs.length - 1 ? "1px solid #f1f5f9" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap" as const,
                }}>
                  {/* Action icon */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: "12px",
                    background: actionInfo.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", flexShrink: 0,
                  }}>
                    {actionInfo.icon}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" as const }}>
                      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>
                        {actionInfo.label}
                      </span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px",
                        fontSize: "0.72rem", fontWeight: 600,
                        background: actionInfo.bg, color: actionInfo.color,
                      }}>
                        {log.resourceType}
                      </span>
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "3px" }}>
                      By: <strong>{log.performedBy?.name}</strong>
                      &nbsp;({log.performedByRole})
                      &nbsp;·&nbsp;{log.performedBy?.email}
                    </div>
                  </div>

                  {/* Time */}
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