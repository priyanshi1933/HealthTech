import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function VideoConsult() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [joining, setJoining] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
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

    // ✅ load Jitsi script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);
  };

  const initJitsi = () => {
    if (!jitsiContainer.current || !appointment?.roomId) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: appointment.roomId,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: name || "User",
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: true, // ✅ camera off by default
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
        SHOW_POWERED_BY: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop", // ✅ screen share works without camera
          "fullscreen",
          "hangup",
          "chat", // ✅ text chat works without camera
          "raisehand",
          "tileview",
          "settings",
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

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Waiting Room */}
      {inWaitingRoom && (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "3rem",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Waiting room header */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "2rem",
              }}
            >
              {role === "doctor" ? "👨‍⚕️" : "🏥"}
            </div>

            <h2
              style={{ color: "white", fontWeight: 800, marginBottom: "8px" }}
            >
              Waiting Room
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                marginBottom: "2rem",
                fontSize: "0.95rem",
              }}
            >
              {role === "doctor"
                ? "Your patient is waiting. Join when ready."
                : "Please wait. The doctor will join shortly."}
            </p>

            {/* Appointment info */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "1.25rem",
                marginBottom: "2rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  {role === "doctor" ? "Patient" : "Doctor"}
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {role === "doctor"
                    ? appointment?.patientId?.name
                    : `Dr. ${appointment?.doctorId?.userId?.name}`}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  Date
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {new Date(appointment?.slotTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  Time
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {appointment?.slotTimeLocal}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  Duration
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {appointment?.duration} minutes
                </span>
              </div>
            </div>

            {/* Device check reminder */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              {/* Device check — update camera item */}
              {[
                { icon: "🎤", label: "Microphone", ok: true },
                { icon: "📷", label: "Camera", ok: false }, // ✅ show as optional
                { icon: "🌐", label: "Internet", ok: true },
                { icon: "💬", label: "Chat", ok: true }, // ✅ add chat option
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: item.ok
                      ? "rgba(37,99,235,0.2)"
                      : "rgba(100,116,139,0.2)",
                    border: item.ok
                      ? "1px solid rgba(37,99,235,0.4)"
                      : "1px solid rgba(100,116,139,0.3)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    textAlign: "center" as const,
                  }}
                >
                  <div style={{ fontSize: "1.4rem" }}>{item.icon}</div>
                  <div
                    style={{
                      color: item.ok
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(100,116,139,0.7)",
                      fontSize: "0.72rem",
                      marginTop: "4px",
                    }}
                  >
                    {item.label}
                  </div>
                  {!item.ok && (
                    <div style={{ color: "#64748b", fontSize: "0.65rem" }}>
                      optional
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={joinCall}
              disabled={joining}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: joining
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg,#2563eb,#06b6d4)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: joining ? "not-allowed" : "pointer",
                marginBottom: "12px",
              }}
            >
              {joining ? "Connecting..." : "Join Video Consultation"}
            </button>

            <button
              onClick={() =>
                navigate(
                  role === "doctor" ? "/appointments/doctor" : "/appointments",
                )
              }
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
        <div
          style={{ height: "100vh", display: "flex", flexDirection: "column" }}
        >
          {/* Top bar */}
          <div
            style={{
              background: "#1e293b",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ color: "white", fontWeight: 700 }}>
              HealthCare - Video Consultation
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {joining && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  Connecting...
                </span>
              )}
              {jitsiLoaded && (
                <span
                  style={{
                    background: "#10b981",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontWeight: 600,
                  }}
                >
                  Live
                </span>
              )}
              <span
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}
              >
                Room: {appointment?.roomId}
              </span>
            </div>
          </div>

          {/* Jitsi container */}
          <div
            ref={jitsiContainer}
            style={{ flex: 1, background: "#0f172a" }}
          />
        </div>
      )}
    </div>
  );
}
