import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  if (!role) return null;

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #2563eb, #06b6d4)",
        padding: "0 2rem",
        height: "65px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ color: "white", fontWeight: 800, fontSize: "1.3rem" }}>
          🏥 HealthCare
        </span>
      </Link>

      {/* Links by role */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {role === "patient" && (
          <>
            <NavLink to="/doctors">Find Doctors</NavLink>
            <NavLink to="/appointments">My Appointments</NavLink>
            <NavLink to="/prescriptions/my">My Prescriptions</NavLink> 
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}

        {role === "doctor" && (
          <>
            <NavLink to="/doctor/profile">My Profile</NavLink>
            <NavLink to="/doctor/availability">Availability</NavLink>
            <NavLink to="/appointments/doctor">Appointments</NavLink>
            <NavLink to="/prescriptions/doctor">Prescriptions</NavLink>
            <NavLink to="/doctors">Doctors</NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/doctors">Doctors</NavLink>
          </>
        )}

        {/* User info + logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50px",
            padding: "6px 14px",
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=2563eb&size=32`}
            style={{ borderRadius: "50%", width: 32, height: 32 }}
          />
          <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
            {name}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "0.7rem",
              padding: "2px 8px",
              borderRadius: "20px",
              textTransform: "capitalize",
            }}
          >
            {role}
          </span>
          <button
            onClick={logout}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "white",
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.85rem",
              cursor: "pointer",
              marginLeft: "4px",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        color: "rgba(255,255,255,0.85)",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "0.95rem",
        padding: "4px 0",
        borderBottom: "2px solid transparent",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
      }
    >
      {children}
    </Link>
  );
}
