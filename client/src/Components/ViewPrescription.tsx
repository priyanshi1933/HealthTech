import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function ViewPrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetch = async () => {
      try {
        // ✅ this GET call triggers the audit log automatically
        const res = await api.get(`/prescriptions/${appointmentId}`);
        setPrescription(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Prescription not found");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [appointmentId]);

  const downloadPDF = async () => {
    try {
      const res = await api.get(`/prescriptions/${appointmentId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription_${appointmentId}.pdf`;
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

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "white", borderRadius: "20px", padding: "3rem",
        textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        maxWidth: "400px",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <h5 style={{ color: "#991b1b" }}>{error}</h5>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "1rem", padding: "10px 24px", borderRadius: "10px",
            border: "none", background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            color: "white", fontWeight: 700, cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "16px", padding: "1.5rem 2rem",
          marginBottom: "1.5rem", color: "white",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap" as const, gap: "1rem",
        }}>
          <div>
            <h2 style={{ fontWeight: 800, marginBottom: "4px" }}>E-Prescription</h2>
            <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.9rem" }}>
              {new Date(prescription.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={downloadPDF}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                border: "2px solid rgba(255,255,255,0.5)",
                background: "transparent", color: "white",
                fontWeight: 700, cursor: "pointer", fontSize: "0.88rem",
              }}
            >
              Download PDF
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                border: "none", background: "rgba(255,255,255,0.2)",
                color: "white", fontWeight: 700, cursor: "pointer",
                fontSize: "0.88rem",
              }}
            >
              Back
            </button>
          </div>
        </div>

        <div style={{
          background: "white", borderRadius: "16px",
          padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>

          {/* Doctor + Patient info */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div style={{
                background: "#f8fafc", borderRadius: "12px",
                padding: "1rem", borderLeft: "4px solid #2563eb",
              }}>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  DOCTOR
                </div>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  Dr. {prescription.doctorId?.userId?.name}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  {prescription.doctorId?.specialty}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div style={{
                background: "#f8fafc", borderRadius: "12px",
                padding: "1rem", borderLeft: "4px solid #06b6d4",
              }}>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  PATIENT
                </div>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  {prescription.patientId?.name}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  {prescription.patientId?.email}
                </div>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "#f1f5f9", margin: "1.5rem 0" }} />

          {/* Diagnosis */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase" as const }}>
              Diagnosis
            </div>
            <div style={{
              background: "#eff6ff", borderRadius: "10px",
              padding: "12px 16px", color: "#1e40af", fontWeight: 600,
            }}>
              {prescription.diagnosis}
            </div>
          </div>

          {/* Medicines */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase" as const }}>
              Prescribed Medicines ({prescription.medicines.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {prescription.medicines.map((med: any, i: number) => (
                <div key={i} style={{
                  background: i % 2 === 0 ? "#f8fafc" : "white",
                  borderRadius: "10px", padding: "12px 16px",
                  borderLeft: "4px solid #2563eb",
                  border: "1px solid #e2e8f0",
                  borderLeftWidth: "4px",
                  borderLeftColor: "#2563eb",
                }}>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "10px", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#1e293b", minWidth: "130px" }}>
                      {i + 1}. {med.name}
                    </span>
                    <span style={{
                      background: "#eff6ff", color: "#2563eb",
                      padding: "2px 10px", borderRadius: "20px",
                      fontSize: "0.78rem", fontWeight: 600,
                    }}>
                      {med.dosage}
                    </span>
                    <span style={{ color: "#475569", fontSize: "0.85rem" }}>
                      {med.frequency}
                    </span>
                    <span style={{ color: "#475569", fontSize: "0.85rem" }}>
                      {med.duration}
                    </span>
                    {med.notes && (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontStyle: "italic" }}>
                        Note: {med.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {prescription.instructions && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase" as const }}>
                Instructions
              </div>
              <div style={{
                background: "#f8fafc", borderRadius: "10px",
                padding: "12px 16px", color: "#475569",
                fontSize: "0.9rem", lineHeight: "1.7",
              }}>
                {prescription.instructions}
              </div>
            </div>
          )}

          {/* Follow up */}
          {prescription.followUpDate && (
            <div style={{
              background: "#fef3c7", borderRadius: "10px",
              padding: "12px 16px", color: "#92400e", fontWeight: 600,
            }}>
              Follow-up Date: {new Date(prescription.followUpDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          )}

          {/* Audit note for doctors */}
          {role === "doctor" && (
            <div style={{
              marginTop: "1.5rem",
              background: "#f0fdf4", borderRadius: "10px",
              padding: "10px 14px", color: "#166534",
              fontSize: "0.8rem", fontWeight: 500,
              border: "1px solid #bbf7d0",
            }}>
              Your access to this prescription has been logged for compliance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}