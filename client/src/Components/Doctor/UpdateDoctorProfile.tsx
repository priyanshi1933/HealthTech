import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function UpdateDoctorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    specialty: "",
    qualifications: "",
    experience: "",
    fee: "",
    languages: "",
    bio: "",
  });

 useEffect(() => {
  const fetch = async () => {
    try {
      const res = await api.get("/profile/me");
      const p = res.data.data;

      // ✅ block rejected doctors from editing
      if (p.verificationStatus === "rejected") {
        navigate("/doctor/profile");
        return;
      }

      setForm({
        specialty: p.specialty,
        qualifications: p.qualifications.join(", "),
        experience: String(p.experience),
        fee: String(p.fee),
        languages: p.languages.join(", "),
        bio: p.bio,
      });
    } catch {
      navigate("/doctor/profile");
    } finally {
      setFetching(false);
    }
  };
  fetch();
}, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put("/profile/update", {
        specialty: form.specialty,
        qualifications: form.qualifications.split(",").map((q) => q.trim()),
        experience: Number(form.experience),
        fee: Number(form.fee),
        languages: form.languages.split(",").map((l) => l.trim()),
        bio: form.bio,
      });
      alert("Profile updated successfully!");
      navigate("/doctor/profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div className="container py-5">
      <div className="card profile-card p-5 mx-auto" style={{ maxWidth: "700px" }}>
        <h2 className="fw-bold mb-1">Update Profile</h2>
        <p className="text-muted mb-4">Update your doctor profile details.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Specialty</label>
            <input
              className="form-control"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Qualifications
              <span className="text-muted fw-normal ms-1">(comma separated)</span>
            </label>
            <input
              className="form-control"
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Experience (years)</label>
              <input
                type="number"
                className="form-control"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-control"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Languages
              <span className="text-muted fw-normal ms-1">(comma separated)</span>
            </label>
            <input
              className="form-control"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages:e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Bio</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="d-flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-main text-white w-100">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => navigate("/doctor/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}