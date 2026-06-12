import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function SingleDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/${id}`);
        setDoctor(res.data.data);
      } catch {
        navigate("/doctors");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div className="container py-5">
      <div className="card profile-card p-5 mx-auto" style={{ maxWidth: "750px" }}>

        <button
          className="btn btn-outline-secondary mb-4"
          style={{ width: "fit-content" }}
          onClick={() => navigate("/doctors")}
        >
          ← Back to Doctors
        </button>

        <div className="d-flex align-items-center mb-4">
          <img
            src={`https://ui-avatars.com/api/?name=${doctor.userId?.name}&size=90&background=2563eb&color=fff`}
            className="rounded-circle me-4"
            width={90}
            height={90}
          />
          <div>
            <h2 className="fw-bold mb-1">{doctor.userId?.name}</h2>
            <p className="text-muted mb-1">{doctor.specialty}</p>
            {doctor.verifiedBadge && (
              <span className="badge bg-success">✅ Verified Doctor</span>
            )}
          </div>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Qualifications</div>
          <div className="col-sm-8">{doctor.qualifications.join(", ")}</div>
        </div>
        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Experience</div>
          <div className="col-sm-8">{doctor.experience} years</div>
        </div>
        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Consultation Fee</div>
          <div className="col-sm-8 fw-bold text-primary">₹{doctor.fee}</div>
        </div>
        <div className="row mb-3">
          <div className="col-sm-4 text-muted fw-semibold">Languages</div>
          <div className="col-sm-8">{doctor.languages.join(", ")}</div>
        </div>
        <div className="row mb-4">
          <div className="col-sm-4 text-muted fw-semibold">Bio</div>
          <div className="col-sm-8">{doctor.bio || "—"}</div>
        </div>

        <button className="btn btn-main text-white w-100 py-2">
          Book Appointment
        </button>

      </div>
    </div>
  );
}