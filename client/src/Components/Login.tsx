import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", {
        email,
        password,
        ...(showOtp && { totpToken: otp }),
      });

      // Doctor password ok but OTP not submitted yet
      if (res.data.requiresTwoFactor) {
        setShowOtp(true);
        setLoading(false);
        return;
      }

      // Save token + role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name); 

      // ✅ Navigate based on role
      const role = res.data.role;
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "doctor") {
        navigate("/doctor/profile");
      } else {
        navigate("/doctors");
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center">
      <div className="container">
        <div className="card auth-card mx-auto" style={{ maxWidth: "500px" }}>
          <div className="right-panel">

            <h2 className="fw-bold text-center mb-1">Welcome Back</h2>
            <p className="text-center text-muted mb-4">Login to continue</p>

            {error && (
              <div className="alert alert-danger py-2">{error}</div>
            )}

            <input
              className="form-control mb-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {showOtp && (
              <div>
                <p className="text-muted small mb-2">
                  Enter the 6-digit code from Google Authenticator
                </p>
                <input
                  className="form-control mb-3"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={login}
              disabled={loading}
              className="btn btn-main text-white w-100"
            >
              {loading
                ? "Please wait..."
                : showOtp
                ? "Verify & Login"
                : "Login"}
            </button>

            <div className="text-center mt-4">
              <p className="mb-0 text-muted">
                Don't have an account?
                <Link to="/register" className="ms-2 fw-semibold text-primary">
                  Create Account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}