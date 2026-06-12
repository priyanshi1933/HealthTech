import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function DoctorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/profile/me");
        setProfile(res.data.data);
      } catch {
        setNoProfile(true); // ✅ don't redirect, show message
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

  // ✅ No profile yet — show create prompt
  if (noProfile) return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "3rem",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        maxWidth: "450px",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👨‍⚕️</div>
        <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "0.5rem" }}>
          No Profile Yet
        </h3>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          You haven't created your doctor profile yet. Create one to get verified and start receiving patients.
        </p>
        <button
          onClick={() => navigate("/doctor/create-profile")}
          style={{
            padding: "12px 32px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            color: "white",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Create Profile
        </button>
      </div>
    </div>
  );

  const statusColor: any = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    approved: { bg: "#d1fae5", color: "#065f46" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2.5rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={`https://ui-avatars.com/api/?name=${profile.userId?.name}&background=2563eb&color=fff&size=70`}
                style={{ borderRadius: "50%", width: 70, height: 70 }}
              />
              <div>
                <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "4px" }}>
                  {profile.userId?.name}
                </h3>
                <p style={{ color: "#64748b", marginBottom: "6px" }}>{profile.userId?.email}</p>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: statusColor[profile.verificationStatus].bg,
                  color: statusColor[profile.verificationStatus].color,
                }}>
                  {profile.verificationStatus === "approved" && "✅ Verified"}
                  {profile.verificationStatus === "pending" && "⏳ Pending Verification"}
                  {profile.verificationStatus === "rejected" && "❌ Rejected"}
                </span>
              </div>
            </div>
            {profile.verifiedBadge && (
              <span style={{
                background: "#eff6ff",
                color: "#2563eb",
                padding: "6px 14px",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}>🏅 Verified Badge</span>
            )}
          </div>

          <hr style={{ borderColor: "#e2e8f0", marginBottom: "1.5rem" }} />

          {/* Details */}
          {[
            { label: "🏥 Specialty", value: profile.specialty },
            { label: "🎓 Qualifications", value: profile.qualifications.join(", ") },
            { label: "⏱ Experience", value: `${profile.experience} years` },
            { label: "💰 Consultation Fee", value: `₹${profile.fee}` },
            { label: "🗣 Languages", value: profile.languages.join(", ") },
            { label: "📝 Bio", value: profile.bio || "—" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex",
              padding: "0.75rem 0",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{ width: "200px", color: "#64748b", fontWeight: 600, fontSize: "0.9rem" }}>
                {item.label}
              </div>
              <div style={{ color: "#1e293b", fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}

          {/* Rejection note */}
        {/* Edit button — only if NOT rejected */}
{profile.verificationStatus !== "rejected" ? (
  <button
    onClick={() => navigate("/doctor/update-profile")}
    style={{
      marginTop: "1.5rem",
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg,#2563eb,#06b6d4)",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
      width: "100%",
      fontSize: "1rem",
    }}
  >
    ✏️ Edit Profile
  </button>
) : (
  <div style={{
    marginTop: "1.5rem",
    padding: "1rem",
    borderRadius: "12px",
    background: "#fee2e2",
    textAlign: "center",
    color: "#991b1b",
    fontWeight: 600,
  }}>
    🚫 Your profile has been rejected. You cannot edit it.
    <br />
    <span style={{ fontSize: "0.85rem", fontWeight: 400, marginTop: "4px", display: "block" }}>
      Please contact admin for further assistance.
    </span>
  </div>
)}

       

        </div>
      </div>
    </div>
  );
}