import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useNavigate } from "react-router-dom";

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate=useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/prescriptions/my");
        setPrescriptions(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const downloadPDF = async (appointmentId: string, patientName: string) => {
    try {
      const res = await api.get(`/prescriptions/${appointmentId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription_${patientName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF");
    }
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
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>My Prescriptions</h2>
          <p style={{ color: "#64748b" }}>View and download your e-prescriptions</p>
        </div>

        {prescriptions.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "20px",
            padding: "3rem", textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💊</div>
            <h5 style={{ color: "#64748b" }}>No prescriptions yet</h5>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {prescriptions.map((p) => (
              <div key={p._id} style={{
                background: "white", borderRadius: "16px",
                padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: "50%",
                      background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 800, fontSize: "1.1rem",
                    }}>
                      Rx
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>
                        Dr. {p.doctorId?.userId?.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {p.doctorId?.specialty}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  {/* <button
                    onClick={() => downloadPDF(
                      p.appointmentId?._id || p.appointmentId,
                      p.patientId?.name || "patient"
                    )}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      height: "fit-content",
                    }}
                  >
                    Download PDF
                  </button> */}
                   <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/prescriptions/view/${p.appointmentId?._id || p.appointmentId}`,
                        )
                      } // ✅ new
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        border: "1px solid #bfdbfe",
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        height: "fit-content",
                      }}
                    >
                      View Prescription
                    </button>
                    <button
                      onClick={() =>
                        downloadPDF(p.appointmentId?._id || p.appointmentId,
                      p.patientId?.name || "patient")
                      }
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        height: "fit-content",
                      }}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <hr style={{ borderColor: "#f1f5f9", margin: "1rem 0" }} />

                {/* Diagnosis */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                    DIAGNOSIS
                  </div>
                  <div style={{
                    background: "#eff6ff", borderRadius: "8px",
                    padding: "8px 12px", color: "#1e40af", fontWeight: 600,
                  }}>
                    {p.diagnosis}
                  </div>
                </div>

                {/* Medicines */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px" }}>
                    MEDICINES ({p.medicines.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {p.medicines.map((med: any, i: number) => (
                      <div key={i} style={{
                        background: "#f8fafc", borderRadius: "8px",
                        padding: "10px 14px", borderLeft: "3px solid #2563eb",
                        display: "flex", flexWrap: "wrap", gap: "12px",
                        alignItems: "center",
                      }}>
                        <span style={{ fontWeight: 700, color: "#1e293b", minWidth: "120px" }}>
                          {med.name}
                        </span>
                        <span style={{
                          background: "#eff6ff", color: "#2563eb",
                          padding: "2px 8px", borderRadius: "20px",
                          fontSize: "0.78rem", fontWeight: 600,
                        }}>
                          {med.dosage}
                        </span>
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {med.frequency}
                        </span>
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {med.duration}
                        </span>
                        {med.notes && (
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                            ({med.notes})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {p.instructions && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                      INSTRUCTIONS
                    </div>
                    <div style={{ color: "#475569", fontSize: "0.9rem" }}>
                      {p.instructions}
                    </div>
                  </div>
                )}

                {/* Follow up */}
                {p.followUpDate && (
                  <div style={{
                    background: "#fef3c7", borderRadius: "8px",
                    padding: "8px 14px", color: "#92400e",
                    fontSize: "0.88rem", fontWeight: 600,
                  }}>
                    Follow-up: {new Date(p.followUpDate).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
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