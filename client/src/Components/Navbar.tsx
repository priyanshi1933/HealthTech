// import { useNavigate, Link, useLocation } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   const name = localStorage.getItem("name");

//   const location = useLocation();
//   if (!role || location.pathname.startsWith("/video")) return null;

//   if (!role) return null;

//   const logout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   return (
//     <nav
//       style={{
//         background: "linear-gradient(135deg, #2563eb, #06b6d4)",
//         padding: "0 2rem",
//         height: "65px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
//         position: "sticky",
//         top: 0,
//         zIndex: 999,
//       }}
//     >
//       {/* Logo */}
//       <Link to="/" style={{ textDecoration: "none" }}>
//         <span style={{ color: "white", fontWeight: 800, fontSize: "1.3rem" }}>
//           🏥 HealthCare
//         </span>
//       </Link>

//       {/* Links by role */}
//       <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
//         {role === "patient" && (
//           <>
//             <NavLink to="/doctors">Find Doctors</NavLink>
//             <NavLink to="/appointments">My Appointments</NavLink>
//             <NavLink to="/prescriptions/my">My Prescriptions</NavLink>
//             <NavLink to="/profile">Profile</NavLink>
//           </>
//         )}

//         {role === "doctor" && (
//           <>
//             <NavLink to="/doctor/profile">My Profile</NavLink>
//             <NavLink to="/doctor/availability">Availability</NavLink>
//             <NavLink to="/appointments/doctor">Appointments</NavLink>
//             <NavLink to="/prescriptions/doctor">Prescriptions</NavLink>
//             <NavLink to="/doctors">Doctors</NavLink>
//           </>
//         )}

//         {role === "admin" && (
//           <>
//             <NavLink to="/admin">Dashboard</NavLink>
//             <NavLink to="/doctors">Doctors</NavLink>
//           </>
//         )}

//         {/* User info + logout */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.75rem",
//             background: "rgba(255,255,255,0.15)",
//             borderRadius: "50px",
//             padding: "6px 14px",
//           }}
//         >
//           <img
//             src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=2563eb&size=32`}
//             style={{ borderRadius: "50%", width: 32, height: 32 }}
//           />
//           <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
//             {name}
//           </span>
//           <span
//             style={{
//               background: "rgba(255,255,255,0.2)",
//               color: "white",
//               fontSize: "0.7rem",
//               padding: "2px 8px",
//               borderRadius: "20px",
//               textTransform: "capitalize",
//             }}
//           >
//             {role}
//           </span>
//           <button
//             onClick={logout}
//             style={{
//               background: "rgba(255,255,255,0.2)",
//               border: "1px solid rgba(255,255,255,0.4)",
//               color: "white",
//               borderRadius: "20px",
//               padding: "4px 14px",
//               fontSize: "0.85rem",
//               cursor: "pointer",
//               marginLeft: "4px",
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
//   return (
//     <Link
//       to={to}
//       style={{
//         color: "rgba(255,255,255,0.85)",
//         textDecoration: "none",
//         fontWeight: 600,
//         fontSize: "0.95rem",
//         padding: "4px 0",
//         borderBottom: "2px solid transparent",
//         transition: "all 0.2s",
//       }}
//       onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
//       }
//     >
//       {children}
//     </Link>
//   );
// }

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "User";

  if (!role || location.pathname.startsWith("/video")) return null;

  const logout = () => {
    localStorage.clear();
    setIsOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #2563eb, #06b6d4)",
        padding: "0 1.5rem",
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
      <style>{`
        .nav-links-container {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 1.5rem;
        }
        .nav-menu-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          height: 100%;
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          flex-direction: column;
          gap: 5px;
          z-index: 1000;
        }
        .hamburger-bar {
          width: 25px;
          height: 3px;
          background-color: white;
          transition: all 0.3s ease;
        }
        @media (max-width: 992px) {
          .nav-links-container {
            position: fixed;
            top: 65px;
            left: 0;
            right: 0;
            height: auto; /* Drops fixed height to stop stretching container down */
            background: linear-gradient(135deg, #2563eb, #06b6d4);
            flex-direction: column;
            justify-content: flex-start; /* Groups items naturally towards the top */
            padding: 2rem 1.5rem;
            box-sizing: border-box;
            transform: ${isOpen ? "translateX(0)" : "translateX(100%)"};
            transition: transform 0.3s ease-in-out;
            align-items: stretch;
            gap: 2rem; /* Creates clean spacing between nav links and user block */
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          .nav-menu-links {
            flex-direction: column;
            align-items: flex-start;
            height: auto;
            gap: 1.5rem;
          }
          .hamburger-btn {
            display: flex;
          }
          .user-profile-box {
            width: 100%;
            box-sizing: border-box;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 10px 14px !important;
            background: rgba(255,255,255,0.1) !important;
            border-radius: 50px !important;
          }
          .logout-btn {
            width: auto !important;
            padding: 5px 14px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>

      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
        }}
        onClick={closeMenu}
      >
        <span style={{ color: "white", fontWeight: 800, fontSize: "1.3rem" }}>
          🏥 HealthCare
        </span>
      </Link>

      {/* Hamburger Menu Icon */}
      <button
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <div
          className="hamburger-bar"
          style={{
            transform: isOpen ? "rotate(45deg) translate(6px, 5px)" : "none",
          }}
        />
        <div className="hamburger-bar" style={{ opacity: isOpen ? 0 : 1 }} />
        <div
          className="hamburger-bar"
          style={{
            transform: isOpen ? "rotate(-45deg) translate(6px, -5px)" : "none",
          }}
        />
      </button>

      {/* Links and User Action Items */}
      <div className="nav-links-container">
        <div className="nav-menu-links">
          {role === "patient" && (
            <>
              <NavLink to="/doctors" onClick={closeMenu}>
                Find Doctors
              </NavLink>
              <NavLink to="/appointments" onClick={closeMenu}>
                My Appointments
              </NavLink>
              <NavLink to="/prescriptions/my" onClick={closeMenu}>
                My Prescriptions
              </NavLink>
              <NavLink to="/profile" onClick={closeMenu}>
                Profile
              </NavLink>
            </>
          )}

          {role === "doctor" && (
            <>
              <NavLink to="/doctor/profile" onClick={closeMenu}>
                My Profile
              </NavLink>
              <NavLink to="/doctor/availability" onClick={closeMenu}>
                Availability
              </NavLink>
              <NavLink to="/appointments/doctor" onClick={closeMenu}>
                Appointments
              </NavLink>
              <NavLink to="/prescriptions/doctor" onClick={closeMenu}>
                Prescriptions
              </NavLink>
              <NavLink to="/doctors" onClick={closeMenu}>
                Doctors
              </NavLink>
            </>
          )}

          {role === "admin" && (
            <>
              <NavLink to="/admin" onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/doctors" onClick={closeMenu}>
                Doctors
              </NavLink>
            </>
          )}
        </div>

        {/* User info + logout badge */}
        <div
          className="user-profile-box"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50px",
            padding: "6px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <img
              src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=2563eb&size=32`}
              style={{ borderRadius: "50%", width: 32, height: 32 }}
            />
            <div
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#2563eb",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <span
              style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}
            >
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
          </div>

          <button
            onClick={logout}
            className="logout-btn"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "white",
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.85rem",
              cursor: "pointer",
              marginLeft: "4px",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}

function NavLink({ to, children, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        color: "rgba(255,255,255,0.85)",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "1.05rem",
        padding: "4px 0",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
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
