import { useEffect, useState } from "react";
import api from "../../Api/axios";

const ACTION_LABELS: any = {
  VIEW_PRESCRIPTION: {
    label: "Viewed Prescription",
    icon: "💊",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  DOWNLOAD_PRESCRIPTION_PDF: {
    label: "Downloaded PDF",
    icon: "📥",
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  VIEW_APPOINTMENT_RECORD: {
    label: "Viewed Appointment",
    icon: "📋",
    color: "#059669",
    bg: "#d1fae5",
  },
  VIEW_PATIENT_PROFILE: {
    label: "Viewed Profile",
    icon: "👤",
    color: "#d97706",
    bg: "#fef3c7",
  },
  VIEW_ALL_PATIENTS: {
    label: "Viewed All Patients",
    icon: "👥",
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

export default function AuditDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resourceType: "",
    performedByRole: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.resourceType) params.resourceType = filters.resourceType;
      if (filters.performedByRole)
        params.performedByRole = filters.performedByRole;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get("/audit/all", { params });
      setLogs(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>Audit Trail</h2>
          <p style={{ color: "#64748b" }}>
            Monitor all PII access and sensitive actions
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div className="row g-3">
            <div className="col-md-3">
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Resource Type
              </label>
              <select
                style={{ ...inputStyle, width: "100%" }}
                value={filters.resourceType}
                onChange={(e) =>
                  setFilters({ ...filters, resourceType: e.target.value })
                }
              >
                <option value="">All Resources</option>
                <option value="prescription">Prescription</option>
                <option value="appointment">Appointment</option>
                <option value="patient_profile">Patient Profile</option>
              </select>
            </div>
            <div className="col-md-3">
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Role
              </label>
              <select
                style={{ ...inputStyle, width: "100%" }}
                value={filters.performedByRole}
                onChange={(e) =>
                  setFilters({ ...filters, performedByRole: e.target.value })
                }
              >
                <option value="">All Roles</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                From Date
              </label>
              <input
                type="date"
                style={{ ...inputStyle, width: "100%" }}
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="col-md-2">
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                To Date
              </label>
              <input
                type="date"
                style={{ ...inputStyle, width: "100%" }}
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div
              className="col-md-2"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              <button
                onClick={fetchLogs}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Logs", value: logs.length, color: "#2563eb" },
            {
              label: "Doctor Actions",
              value: logs.filter((l) => l.performedByRole === "doctor").length,
              color: "#059669",
            },
            {
              label: "Admin Actions",
              value: logs.filter((l) => l.performedByRole === "admin").length,
              color: "#d97706",
            },
            {
              label: "PDF Downloads",
              value: logs.filter(
                (l) => l.action === "DOWNLOAD_PRESCRIPTION_PDF",
              ).length,
              color: "#7c3aed",
            },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: `4px solid ${s.color}`,
                  textAlign: "center" as const,
                }}
              >
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Log Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "3rem",
              textAlign: "center" as const,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <h5 style={{ color: "#64748b" }}>No audit logs found</h5>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                padding: "12px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              <span>Action</span>
              <span>Performed By</span>
              <span>Patient Accessed</span>
              <span>Resource</span>
              <span>Time</span>
            </div>

            {logs.map((log, index) => {
              const actionInfo = ACTION_LABELS[log.action] || {
                label: log.action.replace(/_/g, " "),
                icon: "🔍",
                color: "#64748b",
                bg: "#f8fafc",
              };

              return (
                <div
                  key={log._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom:
                      index < logs.length - 1 ? "1px solid #f1f5f9" : "none",
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  {/* ✅ use actionInfo */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        background: actionInfo.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {actionInfo.icon}
                    </span>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      {actionInfo.label}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      {log.performedBy?.name}
                    </div>
                    <div style={{ marginTop: "2px" }}>
                      <span
                        style={{
                          padding: "1px 6px",
                          borderRadius: "10px",
                          background:
                            log.performedByRole === "doctor"
                              ? "#d1fae5"
                              : log.performedByRole === "admin"
                                ? "#fee2e2"
                                : "#eff6ff",
                          color:
                            log.performedByRole === "doctor"
                              ? "#065f46"
                              : log.performedByRole === "admin"
                                ? "#991b1b"
                                : "#1e40af",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        {log.performedByRole}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      {log.targetPatientId?.name || "—"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {log.targetPatientId?.email || ""}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: actionInfo.bg,
                        color: actionInfo.color,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      {log.resourceType}
                    </span>
                  </div>

                  <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                    <div>
                      {new Date(log.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div>
                      {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
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
