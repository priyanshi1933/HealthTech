import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

const URGENCY_CONFIG: any = {
  high: { bg: "#fee2e2", color: "#991b1b", label: "Urgent", icon: "🔴" },
  medium: { bg: "#fef3c7", color: "#92400e", label: "Moderate", icon: "🟡" },
  low: { bg: "#d1fae5", color: "#065f46", label: "Non-urgent", icon: "🟢" },
};

const COMMON_SYMPTOMS = [
  "Chest pain", "Headache", "Fever", "Cough",
  "Back pain", "Stomach ache", "Skin rash", "Anxiety",
  "Diabetes", "Eye problem", "Ear pain", "Tooth pain",
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generalAdvice, setGeneralAdvice] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);
    try {
      const res = await api.post("/symptom-checker", { symptoms });
      setResults(res.data.data);
      setGeneralAdvice(res.data.generalAdvice || false);
      setSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const addSymptom = (s: string) => {
    setSymptoms((prev) =>
      prev ? `${prev}, ${s.toLowerCase()}` : s.toLowerCase()
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "20px", padding: "2.5rem",
          marginBottom: "1.5rem", color: "white", textAlign: "center" as const,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🩺</div>
          <h2 style={{ fontWeight: 800, marginBottom: "8px" }}>Symptom Checker</h2>
          <p style={{ opacity: 0.85, marginBottom: 0, fontSize: "0.95rem" }}>
            Describe your symptoms and we'll suggest the right specialist for you
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: "#fef3c7", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "1.5rem",
          display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <p style={{ margin: 0, color: "#92400e", fontSize: "0.85rem", lineHeight: "1.6" }}>
            <strong>Disclaimer:</strong> This symptom checker is for informational purposes only
            and does not constitute medical advice. Always consult a qualified doctor for diagnosis and treatment.
          </p>
        </div>

        {/* Input */}
        <div style={{
          background: "white", borderRadius: "16px",
          padding: "1.5rem", marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <label style={{
            fontSize: "0.85rem", fontWeight: 700, color: "#1e293b",
            display: "block", marginBottom: "8px",
          }}>
            Describe your symptoms
          </label>
          <textarea
            rows={4}
            placeholder="e.g. I have chest pain, shortness of breath and feel dizzy..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                check();
              }
            }}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: "12px", border: "1px solid #e2e8f0",
              fontSize: "0.95rem", outline: "none", resize: "none" as const,
              lineHeight: "1.6", fontFamily: "inherit",
            }}
          />

          {/* Common symptoms quick-add */}
          <div style={{ marginTop: "12px", marginBottom: "16px" }}>
            <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "8px", fontWeight: 600 }}>
              Quick add common symptoms:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
              {COMMON_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  style={{
                    padding: "4px 12px", borderRadius: "20px",
                    border: "1px solid #e2e8f0", background: "#f8fafc",
                    color: "#475569", fontSize: "0.8rem",
                    cursor: "pointer", fontWeight: 500,
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fee2e2", borderRadius: "8px",
              padding: "10px 14px", color: "#991b1b",
              fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px",
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={check}
              disabled={!symptoms.trim() || loading}
              style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                background: symptoms.trim()
                  ? "linear-gradient(135deg,#2563eb,#06b6d4)" : "#e2e8f0",
                color: symptoms.trim() ? "white" : "#94a3b8",
                fontWeight: 700, fontSize: "1rem",
                cursor: symptoms.trim() ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Analyzing..." : "Check Symptoms"}
            </button>
            {symptoms && (
              <button
                onClick={() => {
                  setSymptoms("");
                  setResults([]);
                  setSearched(false);
                }}
                style={{
                  padding: "12px 20px", borderRadius: "12px",
                  border: "1px solid #e2e8f0", background: "white",
                  color: "#64748b", fontWeight: 600, cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {generalAdvice || results.length === 0 ? (
              <div style={{
                background: "white", borderRadius: "16px",
                padding: "2rem", textAlign: "center" as const,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍⚕️</div>
                <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                  General Consultation Recommended
                </h5>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                  Based on your symptoms, we recommend consulting a General Physician
                  who can assess your condition and refer you to a specialist if needed.
                </p>
                <button
                  onClick={() => navigate("/doctors")}
                  style={{
                    padding: "10px 28px", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                    color: "white", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Find a Doctor
                </button>
              </div>
            ) : (
              <div>
                <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
                  Suggested Specialties ({results.length})
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {results.map((result, index) => {
                    const urgency = URGENCY_CONFIG[result.urgency];
                    return (
                      <div key={index} style={{
                        background: "white", borderRadius: "16px",
                        padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        border: index === 0 ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", flexWrap: "wrap" as const, gap: "1rem",
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              {index === 0 && (
                                <span style={{
                                  background: "#2563eb", color: "white",
                                  fontSize: "0.7rem", padding: "2px 8px",
                                  borderRadius: "20px", fontWeight: 700,
                                }}>
                                  Best Match
                                </span>
                              )}
                              <span style={{
                                background: urgency.bg, color: urgency.color,
                                fontSize: "0.75rem", padding: "3px 10px",
                                borderRadius: "20px", fontWeight: 700,
                              }}>
                                {urgency.icon} {urgency.label}
                              </span>
                            </div>
                            <h5 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "4px" }}>
                              {result.specialty}
                            </h5>
                            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "10px" }}>
                              {result.description}
                            </p>

                            {/* Matched keywords */}
                            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                              <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600 }}>
                                Matched:
                              </span>
                              {result.matchedKeywords.map((kw: string) => (
                                <span key={kw} style={{
                                  background: "#eff6ff", color: "#2563eb",
                                  padding: "2px 8px", borderRadius: "20px",
                                  fontSize: "0.75rem", fontWeight: 600,
                                }}>
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Confidence + action */}
                          <div style={{ textAlign: "center" as const, minWidth: "120px" }}>
                            <div style={{
                              width: 70, height: 70, borderRadius: "50%",
                              background: `conic-gradient(#2563eb ${result.confidence * 3.6}deg, #e2e8f0 0deg)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              margin: "0 auto 8px",
                              boxShadow: "inset 0 0 0 10px white",
                            }}>
                              <span style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.9rem" }}>
                                {result.confidence}%
                              </span>
                            </div>
                            <div style={{ color: "#64748b", fontSize: "0.72rem", marginBottom: "10px" }}>
                              match confidence
                            </div>
                            <button
                              onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(result.specialty)}`)}
                              style={{
                                padding: "8px 16px", borderRadius: "10px", border: "none",
                                background: index === 0
                                  ? "linear-gradient(135deg,#2563eb,#06b6d4)"
                                  : "#f1f5f9",
                                color: index === 0 ? "white" : "#475569",
                                fontWeight: 700, cursor: "pointer",
                                fontSize: "0.82rem", width: "100%",
                              }}
                            >
                              Find {result.specialty} Doctor
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* General advice */}
                <div style={{
                  marginTop: "1rem", background: "#f8fafc",
                  borderRadius: "12px", padding: "1rem",
                  color: "#64748b", fontSize: "0.85rem", lineHeight: "1.6",
                }}>
                  💡 <strong>Tip:</strong> If your symptoms are severe or worsening, please visit an emergency room immediately.
                  This tool is not a substitute for professional medical advice.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}