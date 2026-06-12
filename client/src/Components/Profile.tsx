import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setUser(res.data.data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);



  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div className="container py-5">
      <div className="card profile-card p-5 mx-auto" style={{ maxWidth: "700px" }}>

        <div className="text-center mb-4">
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&size=100&background=2563eb&color=fff`}
            className="rounded-circle mb-3"
            width={100}
            height={100}
          />
          <h2 className="fw-bold">{user.name}</h2>
          <span className={`badge ${user.role === "doctor" ? "bg-success" : user.role === "admin" ? "bg-danger" : "bg-primary"}`}>
            {user.role}
          </span>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Email</div>
          <div className="col-sm-8">{user.email}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Member Since</div>
          <div className="col-sm-8">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-sm-4 text-muted fw-semibold">2FA Status</div>
          <div className="col-sm-8">
            {user.twoFactorEnabled ? (
              <span className="text-success fw-semibold">Enabled ✅</span>
            ) : (
              <span className="text-danger fw-semibold">Disabled ❌</span>
            )}
          </div>
        </div>

       

      </div>
    </div>
  );
}