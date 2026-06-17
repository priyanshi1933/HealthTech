import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function VideoConsult() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const appointmentRef = useRef<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [joining, setJoining] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
        appointmentRef.current = res.data.data;

        if (!res.data.data.roomId) {
          setError("This appointment does not have a video room. Please contact support.");
        }
      } catch {
        navigate("/appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const joinCall = () => {
    setJoining(true);
    setInWaitingRoom(false);

    // @ts-ignore
    if (window.JitsiMeetExternalAPI) {
      setTimeout(() => initJitsi(), 100);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      setTimeout(() => initJitsi(), 100);
    };
    script.onerror = () => {
      setError("Failed to load video service. Please check your internet connection.");
      setInWaitingRoom(true);
      setJoining(false);
    };
    document.body.appendChild(script);
  };

  const initJitsi = () => {
    const apt = appointmentRef.current;

    if (!jitsiContainer.current || !apt?.roomId) {
      setError("Unable to start video call. Room not found.");
      setInWaitingRoom(true);
      setJoining(false);
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName: apt.roomId,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: name || "User",
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: true,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        requireDisplayName: false,
        enableNoisyMicDetection: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: "",
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "closedcaptions",
          "desktop", "fullscreen", "fodeviceselection",
          "hangup", "chat", "recording", "raisehand",
          "videoquality", "filmstrip", "tileview", "settings",
        ],
      },
    };

    // @ts-ignore
    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);

    jitsiApi.addEventListener("videoConferenceJoined", () => {
      setJitsiLoaded(true);
      setJoining(false);
    });

    jitsiApi.addEventListener("readyToClose", () => {
      navigate(role === "doctor" ? "/appointments/doctor" : "/appointments");
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>

      {/* Waiting Room */}
      {inWaitingRoom && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          padding: "2rem",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "3rem",
            maxWidth: "520px",
            width: "100%",
            textAlign: "center" as const,
          }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}>
              {role === "doctor" ? "👨‍⚕️" : "🏥"}
            </div>

            <h2 style={{ color: "white", fontWeight: 800, marginBottom: "8px" }}>
              Waiting Room
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", fontSize: "0.95rem" }}>
              {role === "doctor"
                ? "Your patient is waiting. Join when ready."
                : "Please wait. The doctor will join shortly."}
            </p>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "1.5rem",
                color: "#fca5a5",
                fontSize: "0.88rem",
                fontWeight: 600,
              }}>
                ❌ {error}
              </div>
            )}

            {/* Appointment info */}
            <div style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "1.25rem",
              marginBottom: "2rem",
              textAlign: "left" as const,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                  {role === "doctor" ? "Patient" : "Doctor"}
                </span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                  {role === "doctor"
                    ? appointment?.patientId?.name
                    : `Dr. ${appointment?.doctorId?.userId?.name}`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Date</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                  {appointment?.slotTime && new Date(appointment.slotTime).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Time</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                  {appointment?.slotTimeLocal}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Duration</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                  {appointment?.duration} minutes
                </span>
              </div>
            </div>

            {/* Device check */}
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2rem",
              flexWrap: "wrap" as const,
            }}>
              {[
                { icon: "🎤", label: "Microphone" },
                { icon: "📷", label: "Camera (optional)" },
                { icon: "🌐", label: "Internet" },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "rgba(37,99,235,0.2)",
                  border: "1px solid rgba(37,99,235,0.4)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  textAlign: "center" as const,
                }}>
                  <div style={{ fontSize: "1.4rem" }}>{item.icon}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", marginTop: "4px" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={joinCall}
              disabled={joining || !appointment?.roomId}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: (joining || !appointment?.roomId)
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg,#2563eb,#06b6d4)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: (joining || !appointment?.roomId) ? "not-allowed" : "pointer",
                marginBottom: "12px",
              }}
            >
              {joining ? "Connecting..." : "Join Video Consultation"}
            </button>

            <button
              onClick={() => navigate(role === "doctor" ? "/appointments/doctor" : "/appointments")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Leave Waiting Room
            </button>
          </div>
        </div>
      )}

      {/* Video Call */}
      {!inWaitingRoom && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" as const }}>

          <div style={{
            background: "#1e293b",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ color: "white", fontWeight: 700 }}>
              HealthCare - Video Consultation
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {joining && (
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                  Connecting...
                </span>
              )}
              {jitsiLoaded && (
                <span style={{
                  background: "#10b981",
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: 600,
                }}>
                  Live
                </span>
              )}
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
                Room: {appointment?.roomId || "N/A"}
              </span>
            </div>
          </div>

          {error ? (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column" as const,
              color: "white",
              padding: "2rem",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
              <p style={{ color: "#fca5a5", fontWeight: 600, marginBottom: "1.5rem" }}>{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setInWaitingRoom(true);
                }}
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
                Back to Waiting Room
              </button>
            </div>
          ) : (
            <div ref={jitsiContainer} style={{ flex: 1, background: "#0f172a" }} />
          )}
        </div>
      )}
    </div>
  );
}