import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Api/axios";

export default function WritePrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    diagnosis: "",
    instructions: "",
    followUpDate: "",
  });

  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", notes: "" },
  ]);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
      } catch {
        navigate("/appointments/doctor");
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "", notes: "" },
    ]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.diagnosis.trim()) return setError("Diagnosis is required");
    if (medicines.some((m) => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      return setError("Please fill all medicine fields");
    }

    setLoading(true);
    try {
      await api.post("/prescriptions/write", {
        appointmentId,
        diagnosis: form.diagnosis,
        medicines,
        instructions: form.instructions,
        followUpDate: form.followUpDate || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to write prescription");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
    background: "white",
  };

  const labelStyle = {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#64748b",
    display: "block" as const,
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "3rem",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        maxWidth: "450px",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
          Prescription Written!
        </h3>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          The e-prescription has been created and PDF generated successfully.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => navigate(`/prescriptions/view/${appointmentId}`)}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg,#2563eb,#06b6d4)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View Prescription
          </button>
          <button
            onClick={() => navigate("/appointments/doctor")}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#64748b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          marginBottom: "1.5rem",
          color: "white",
        }}>
          <h2 style={{ fontWeight: 800, marginBottom: "4px" }}>Write Prescription</h2>
          {appointment && (
            <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.92rem" }}>
              Patient: <strong>{appointment.patientId?.name}</strong> &nbsp;|&nbsp;
              Date: <strong>{new Date(appointment.slotTime).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}</strong>
            </p>
          )}
        </div>

        {error && (
          <div style={{
            background: "#fee2e2", borderRadius: "10px",
            padding: "12px 16px", marginBottom: "1rem",
            color: "#991b1b", fontWeight: 600,
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={submit}>

          {/* Diagnosis */}
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "1.5rem", marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
              Diagnosis
            </h6>
            <label style={labelStyle}>Diagnosis *</label>
            <textarea
              rows={3}
              style={{ ...inputStyle }}
              placeholder="Enter diagnosis..."
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              required
            />
          </div>

          {/* Medicines */}
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "1.5rem", marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h6 style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Prescribed Medicines
              </h6>
              <button
                type="button"
                onClick={addMedicine}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                + Add Medicine
              </button>
            </div>

            {medicines.map((med, index) => (
              <div key={index} style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "1.25rem",
                marginBottom: "1rem",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #2563eb",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "0.9rem" }}>
                    Medicine {index + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "6px",
                        padding: "2px 10px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label style={labelStyle}>Medicine Name *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Amlodipine"
                      value={med.name}
                      onChange={(e) => updateMedicine(index, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Dosage *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. 5mg"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Frequency *</label>
                    <select
                      style={inputStyle}
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      required
                    >
                      <option value="">Select frequency</option>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Four times daily</option>
                      <option>Every 6 hours</option>
                      <option>Every 8 hours</option>
                      <option>Every 12 hours</option>
                      <option>As needed</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Duration *</label>
                    <select
                      style={inputStyle}
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      required
                    >
                      <option value="">Select duration</option>
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                      <option>10 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>Ongoing</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Notes (optional)</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Take after food"
                      value={med.notes}
                      onChange={(e) => updateMedicine(index, "notes", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions & Follow Up */}
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "1.5rem", marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
              Additional Information
            </h6>

            <div className="row g-3">
              <div className="col-12">
                <label style={labelStyle}>Instructions</label>
                <textarea
                  rows={3}
                  style={inputStyle}
                  placeholder="e.g. Avoid salt. Exercise 30 min daily. Monitor BP weekly."
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label style={labelStyle}>Follow-up Date (optional)</label>
                <input
                  type="date"
                  style={inputStyle}
                  min={new Date().toISOString().split("T")[0]}
                  value={form.followUpDate}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {loading ? "Generating PDF..." : "Write Prescription & Generate PDF"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/appointments/doctor")}
              style={{
                padding: "14px 24px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}