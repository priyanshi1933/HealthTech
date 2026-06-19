import { useState } from "react";
import axios from "axios";
import { FaUserMd } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [qrCode, setQrCode] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/register", form);

      console.log(res.data);

      localStorage.setItem("token", res.data.token);

      if (form.role === "doctor" && res.data.twoFactor) {
        setQrCode(res.data.twoFactor.qrCode);

        setIsDoctor(true);

        alert("Doctor registered successfully. Please scan the QR code.");

        return;
      }

      alert("Registration Successful");
      navigate("/");
    } catch (err: any) {
      console.log(err.response?.data);

      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page d-flex align-items-center min-vh-100">
      <div className="container">
        <div
          className="card shadow-lg border-0 overflow-hidden"
          style={{
            maxWidth: "950px",
            margin: "auto",
            borderRadius: "20px",
          }}
        >
          <div className="row g-0">
            {/* Left Side */}
            <div
              className="col-md-5 d-none d-md-flex text-white flex-column justify-content-center align-items-center p-4"
              style={{ background: "linear-gradient(135deg,#0d6efd,#20c997)" }}
            >
              <FaUserMd size={120} />

              <h1 className="fw-bold mt-4">Telemedicine</h1>

              <p className="text-center mt-3">
                Secure healthcare platform for doctors and patients.
              </p>
            </div>

            {/* Right Side */}
            <div className="col-md-7 p-5">
              <h2 className="fw-bold mb-2">Create Account</h2>

              <p className="text-muted mb-4">Register to continue</p>

              <form onSubmit={submit}>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />

                <select
                  className="form-select mb-4"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="patient">Patient</option>

                  <option value="doctor">Doctor</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                >
                  Register
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?
                  <Link to="/" className="ms-2 text-decoration-none fw-bold">
                    Login
                  </Link>
                </p>
              </div>

              {/* QR Code Section */}
              {qrCode && isDoctor && (
                <div className="mt-5 text-center">
                  <h4 className="fw-bold">Scan QR Code</h4>

                  <p className="text-muted">
                    Open Google Authenticator and scan this QR.
                  </p>

                  <img
                    src={qrCode}
                    alt="QR Code"
                    width={250}
                    className="img-fluid border rounded p-2 shadow-sm"
                  />

                  <div className="mt-4">
                    <button
                      className="btn btn-success px-4"
                      onClick={() => navigate("/verify-2fa")}
                    >
                      Continue to Verify OTP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
