import { useEffect, useState } from "react";
import api from "../../Api/axios";

const TIMEZONES = [
  { label: "India (IST) UTC+5:30", value: "Asia/Kolkata" },
  { label: "London (GMT) UTC+0", value: "Europe/London" },
  { label: "New York (EST) UTC-5", value: "America/New_York" },
  { label: "Dubai (GST) UTC+4", value: "Asia/Dubai" },
];

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    blockDate: "",
    blockReason: "",
    timezone: "Asia/Kolkata",
  });

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const showMsg = (msg: string, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  const addLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.blockDate) return showMsg("Please select a date", true);
    setSaving(true);
    setResult(null);
    try {
      const res = await api.post("/leaves/add", form);
      setResult(res.data.data);
      showMsg(res.data.message);
      setForm({ blockDate: "", blockReason: "", timezone: "Asia/Kolkata" });
      fetchLeaves();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed to add leave", true);
    } finally {
      setSaving(false);
    }
  };

  const removeLeave = async (id: string) => {
    if (
      !confirm(
        "Remove this leave? This will NOT restore cancelled appointments.",
      )
    )
      return;
    setRemovingId(id);
    try {
      await api.delete(`/leaves/${id}`);
      showMsg("Leave removed");
      fetchLeaves();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed", true);
    } finally {
      setRemovingId(null);
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

  const labelStyle = {
    fontSize: "0.82rem",
    fontWeight: 600 as const,
    color: "#64748b",
    display: "block" as const,
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            borderRadius: "16px",
            padding: "1.5rem 2rem",
            marginBottom: "1.5rem",
            color: "white",
          }}
        >
          <h2 style={{ fontWeight: 800, marginBottom: "4px" }}>
            Leave Management
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.92rem" }}>
            Add leave dates — all appointments on those days will be
            automatically cancelled and patients notified
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            ❌ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* Result banner */}
        {/* {result && (
          <div style={{
            background: "white", borderRadius: "14px",
            padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
              Leave Added Successfully
            </h6>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" as const }}>
              <div style={{
                background: "#fee2e2", borderRadius: "10px",
                padding: "10px 16px", textAlign: "center" as const,
              }}>
                <div style={{ fontWeight: 800, color: "#ef4444", fontSize: "1.4rem" }}>
                  {result.cancelledAppointments}
                </div>
                <div style={{ color: "#991b1b", fontSize: "0.78rem" }}>Appointments Cancelled</div>
              </div>
              <div style={{
                background: "#fef3c7", borderRadius: "10px",
                padding: "10px 16px", textAlign: "center" as const,
              }}>
                <div style={{ fontWeight: 800, color: "#d97706", fontSize: "1.4rem" }}>
                  {result.notifiedPatients.length}
                </div>
                <div style={{ color: "#92400e", fontSize: "0.78rem" }}>Patients Notified</div>
              </div>
            </div>

            {result.notifiedPatients.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600, marginBottom: "6px" }}>
                  NOTIFIED:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                  {result.notifiedPatients.map((email: string) => (
                    <span key={email} style={{
                      background: "#eff6ff", color: "#2563eb",
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "0.78rem", fontWeight: 600,
                    }}>
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )} */}
        {result && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h6
              style={{
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "12px",
              }}
            >
              Leave Added Successfully
            </h6>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap" as const,
              }}
            >
              <div
                style={{
                  background: "#fee2e2",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center" as const,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#ef4444",
                    fontSize: "1.4rem",
                  }}
                >
                  {result.cancelledAppointments}
                </div>
                <div style={{ color: "#991b1b", fontSize: "0.78rem" }}>
                  Appointments Cancelled
                </div>
              </div>
              <div
                style={{
                  background: "#fef3c7",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center" as const,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#d97706",
                    fontSize: "1.4rem",
                  }}
                >
                  {result.notifiedPatients.length}
                </div>
                <div style={{ color: "#92400e", fontSize: "0.78rem" }}>
                  Patients Notified
                </div>
              </div>
            </div>

            {/* Notified patient emails */}
            {result.notifiedPatients.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  NOTIFIED PATIENTS:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap" as const,
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {result.notifiedPatients.map((email: string) => (
                    <span
                      key={email}
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Email preview URLs — for doctor to verify (dev/test only) */}
            {result.emailPreviewUrls?.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "8px",
                    color: "#64748b",
                    fontSize: "0.78rem",
                    border: "1px dashed #e2e8f0",
                  }}
                >
                  📋 <strong>Dev Only:</strong> Click below to verify
                  cancellation emails sent to patients
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {result.emailPreviewUrls.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "#6b21a8",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "fit-content",
                      }}
                    >
                      📬 Email to {result.notifiedPatients[i]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="row g-4">
          {/* Left — Add Leave Form */}
          <div className="col-md-5">
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h6
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "1.25rem",
                }}
              >
                Add Leave Date
              </h6>
              <form onSubmit={addLeave}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Date *</label>
                  <input
                    type="date"
                    style={inputStyle}
                    min={new Date().toISOString().split("T")[0]}
                    value={form.blockDate}
                    onChange={(e) =>
                      setForm({ ...form, blockDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Reason</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. Medical Conference, Personal Leave"
                    value={form.blockReason}
                    onChange={(e) =>
                      setForm({ ...form, blockReason: e.target.value })
                    }
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Timezone</label>
                  <select
                    style={inputStyle}
                    value={form.timezone}
                    onChange={(e) =>
                      setForm({ ...form, timezone: e.target.value })
                    }
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warning */}
                <div
                  style={{
                    background: "#fef3c7",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "16px",
                    color: "#92400e",
                    fontSize: "0.82rem",
                  }}
                >
                  ⚠️ All confirmed appointments on this date will be{" "}
                  <strong>automatically cancelled</strong> and patients will be{" "}
                  <strong>notified via email</strong> with a full refund.
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: saving
                      ? "#e2e8f0"
                      : "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: saving ? "#94a3b8" : "white",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Processing..." : "Add Leave & Cancel Appointments"}
                </button>
              </form>
            </div>
          </div>

          {/* Right — Upcoming Leaves */}
          <div className="col-md-7">
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h6
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "1rem",
                }}
              >
                Upcoming Leaves ({leaves.length})
              </h6>

              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="spinner-border text-primary" />
                </div>
              ) : leaves.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#64748b",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                    📅
                  </div>
                  <p>No upcoming leaves</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {leaves.map((leave) => (
                    <div
                      key={leave._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff7f7",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "#ef4444" }}>
                          {new Date(leave.blockDate).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.85rem",
                            marginTop: "2px",
                          }}
                        >
                          {leave.blockReason || "Leave"}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {leave.timezone}
                        </div>
                      </div>
                      <button
                        onClick={() => removeLeave(leave._id)}
                        disabled={removingId === leave._id}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          border: "1px solid #fecaca",
                          background: "white",
                          color: "#ef4444",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        {removingId === leave._id ? "..." : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
