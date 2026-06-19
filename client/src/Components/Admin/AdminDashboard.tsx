import { useEffect, useState } from "react";
import api from "../../Api/axios";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [rejectNote, setRejectNote] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const url = tab === "pending" ? "/admin/pending" : "/admin/all";
      const res = await api.get(url);
      setDoctors(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [tab]);

  const approve = async (id: string) => {
    setActionLoading(id + "approve");
    try {
      await api.patch(`/admin/approve/${id}`);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id: string) => {
    const note = rejectNote[id];
    if (!note?.trim()) return alert("Please enter a rejection reason");
    setActionLoading(id + "reject");
    try {
      await api.patch(`/admin/reject/${id}`, { note });
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: doctors.length,
    pending: doctors.filter((d) => d.verificationStatus === "pending").length,
    approved: doctors.filter((d) => d.verificationStatus === "approved").length,
    rejected: doctors.filter((d) => d.verificationStatus === "rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>Admin Dashboard</h2>
          <p style={{ color: "#64748b" }}>Manage and verify doctor profiles</p>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Total Doctors",
              value: stats.total,
              color: "#2563eb",
              icon: "👨‍⚕️",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "#f59e0b",
              icon: "⏳",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "#10b981",
              icon: "✅",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "#ef4444",
              icon: "❌",
            },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="d-flex gap-2 mb-4">
            {(["pending", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 24px",
                  borderRadius: "50px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    tab === t
                      ? "linear-gradient(135deg,#2563eb,#06b6d4)"
                      : "#f1f5f9",
                  color: tab === t ? "white" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                {t === "pending" ? "⏳ Pending" : "📋 All Doctors"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : doctors.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#64748b",
              }}
            >
              <div style={{ fontSize: "3rem" }}>🔍</div>
              <h5>No doctors found</h5>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    border: "1px solid #e2e8f0",
                    marginBottom:"1rem",
                    
                  }}
                >
                  <div style={{
                    display:"flex",
                    flexWrap:"wrap" as const,
                    gap:"1rem",
                    alignItems:"center",
                    justifyContent:"space-between"
                  }}>
                  {/* Avatar + Info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${doc.userId?.name}&background=2563eb&color=fff&size=50`}
                      style={{ borderRadius: "50%", width: 50, height: 50 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>
                        {doc.userId?.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {doc.userId?.email}
                      </div>
                      <div style={{ marginTop: "4px" }}>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background:
                              doc.verificationStatus === "approved"
                                ? "#d1fae5"
                                : doc.verificationStatus === "rejected"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                            color:
                              doc.verificationStatus === "approved"
                                ? "#065f46"
                                : doc.verificationStatus === "rejected"
                                  ? "#991b1b"
                                  : "#92400e",
                          }}
                        >
                          {doc.verificationStatus === "approved" &&
                            "✅ Approved"}
                          {doc.verificationStatus === "pending" && "⏳ Pending"}
                          {doc.verificationStatus === "rejected" &&
                            "❌ Rejected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    style={{
                      color: "#475569",
                      fontSize: "0.88rem",
                      lineHeight: "1.8",
                    }}
                  >
                    <div>
                      🏥 <strong>Specialty:</strong> {doc.specialty}
                    </div>
                    <div>
                      🎓 <strong>Qualifications:</strong>{" "}
                      {doc.qualifications.join(", ")}
                    </div>
                    <div>
                      ⏱ <strong>Experience:</strong> {doc.experience} yrs
                      &nbsp;|&nbsp; 💰 <strong>Fee:</strong> ₹{doc.fee}
                    </div>
                    <div>
                      🗣 <strong>Languages:</strong> {doc.languages.join(", ")}
                    </div>
                  </div>

                  {/* Actions */}
                  {doc.verificationStatus === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        minWidth: "200px",
                      }}
                    >
                      <button
                        onClick={() => approve(doc._id)}
                        disabled={actionLoading === doc._id + "approve"}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          border: "none",
                          background: "linear-gradient(135deg,#10b981,#059669)",
                          color: "white",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {actionLoading === doc._id + "approve"
                          ? "..."
                          : "✅ Approve"}
                      </button>
                      <input
                        placeholder="Rejection reason..."
                        value={rejectNote[doc._id] || ""}
                        onChange={(e) =>
                          setRejectNote({
                            ...rejectNote,
                            [doc._id]: e.target.value,
                          })
                        }
                        style={{
                          padding: "7px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.85rem",
                        }}
                      />
                      <button
                        onClick={() => reject(doc._id)}
                        disabled={actionLoading === doc._id + "reject"}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          border: "none",
                          background: "linear-gradient(135deg,#ef4444,#dc2626)",
                          color: "white",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {actionLoading === doc._id + "reject"
                          ? "..."
                          : "❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
