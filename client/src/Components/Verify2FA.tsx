import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Verify2FA() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const verify = async () => {
    try {
      const jwtToken = localStorage.getItem("token");

      console.log("JWT:", jwtToken);

      const res = await axios.post(
        "http://localhost:3000/verify-2fa",
        {
          token: otp,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      console.log(res.data);

      if (res.data.success) {
        alert(res.data.message);

        navigate("/");
      }
    } catch (err: any) {
      console.log("ERROR:", err.response?.data);

      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center">
      <div className="container">
        <div className="card auth-card mx-auto" style={{ maxWidth: "500px" }}>
          <div className="right-panel">
            <h2 className="fw-bold">Enable 2FA</h2>

            <p>Enter OTP from Google Authenticator</p>

            <input
              className="form-control mb-3"
              placeholder="123456"
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="btn btn-success w-100" onClick={verify}>
              Verify OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
