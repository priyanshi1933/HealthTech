import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function CreateDoctorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    specialty: "",
    qualifications: "",
    experience: "",
    fee: "",
    languages: "",
    bio: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/profile/create", {
        specialty: form.specialty,
        qualifications: form.qualifications.split(",").map((q) => q.trim()),
        experience: Number(form.experience),
        fee: Number(form.fee),
        languages: form.languages.split(",").map((l) => l.trim()),
        bio: form.bio,
      });
      alert("Profile created! Awaiting admin verification.");
      navigate("/doctor/profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card profile-card p-5 mx-auto" style={{ maxWidth: "700px" }}>
        <h2 className="fw-bold mb-1">Create Doctor Profile</h2>
        <p className="text-muted mb-4">Fill in your details. Admin will verify your profile.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Specialty</label>
            <input
              className="form-control"
              placeholder="e.g. Cardiology"
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
              placeholder="e.g. MBBS, MD"
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
                placeholder="e.g. 8"
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
                placeholder="e.g. 500"
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
              placeholder="e.g. English, Hindi"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Bio</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Write a short bio..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-main text-white w-100"
          >
            {loading ? "Submitting..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}