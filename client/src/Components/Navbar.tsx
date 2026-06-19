

// import { useState } from "react";
// import { useNavigate, Link, useLocation } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(false);

//   const role = localStorage.getItem("role");
//   const name = localStorage.getItem("name") || "User";

//   if (!role || location.pathname.startsWith("/video")) return null;

//   const logout = () => {
//     localStorage.clear();
//     setIsOpen(false);
//     navigate("/");
//   };

//   const toggleMenu = () => setIsOpen(!isOpen);
//   const closeMenu = () => setIsOpen(false);

//   return (
//     <nav
//       style={{
//         background: "linear-gradient(135deg, #2563eb, #06b6d4)",
//         padding: "0 1.5rem",
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
//       <style>{`
//         .nav-links-container {
//           display: flex;
//           align-items: center;
//           height: 100%;
//           gap: 1.5rem;
//         }
//         .nav-menu-links {
//           display: flex;
//           align-items: center;
//           gap: 1.5rem;
//           height: 100%;
//         }
//         .hamburger-btn {
//           display: none;
//           background: none;
//           border: none;
//           cursor: pointer;
//           flex-direction: column;
//           gap: 5px;
//           z-index: 1000;
//         }
//         .hamburger-bar {
//           width: 25px;
//           height: 3px;
//           background-color: white;
//           transition: all 0.3s ease;
//         }
//         @media (max-width: 992px) {
//           .nav-links-container {
//             position: fixed;
//             top: 65px;
//             left: 0;
//             right: 0;
//             height: auto; /* Drops fixed height to stop stretching container down */
//             background: linear-gradient(135deg, #2563eb, #06b6d4);
//             flex-direction: column;
//             justify-content: flex-start; /* Groups items naturally towards the top */
//             padding: 2rem 1.5rem;
//             box-sizing: border-box;
//             transform: ${isOpen ? "translateX(0)" : "translateX(100%)"};
//             transition: transform 0.3s ease-in-out;
//             align-items: stretch;
//             gap: 2rem; /* Creates clean spacing between nav links and user block */
//             border-bottom-left-radius: 16px;
//             border-bottom-right-radius: 16px;
//             box-shadow: 0 10px 25px rgba(0,0,0,0.2);
//           }
//           .nav-menu-links {
//             flex-direction: column;
//             align-items: flex-start;
//             height: auto;
//             gap: 1.5rem;
//           }
//           .hamburger-btn {
//             display: flex;
//           }
//           .user-profile-box {
//             width: 100%;
//             box-sizing: border-box;
//             flex-direction: row !important;
//             align-items: center !important;
//             justify-content: space-between !important;
//             padding: 10px 14px !important;
//             background: rgba(255,255,255,0.1) !important;
//             border-radius: 50px !important;
//           }
//           .logout-btn {
//             width: auto !important;
//             padding: 5px 14px !important;
//             font-size: 0.8rem !important;
//           }
//         }
//       `}</style>

//       {/* Logo */}
//       <Link
//         to="/"
//         style={{
//           textDecoration: "none",
//           display: "flex",
//           alignItems: "center",
//         }}
//         onClick={closeMenu}
//       >
//         <span style={{ color: "white", fontWeight: 800, fontSize: "1.3rem" }}>
//           🏥 HealthCare
//         </span>
//       </Link>

//       {/* Hamburger Menu Icon */}
//       <button
//         className="hamburger-btn"
//         onClick={toggleMenu}
//         aria-label="Toggle navigation"
//       >
//         <div
//           className="hamburger-bar"
//           style={{
//             transform: isOpen ? "rotate(45deg) translate(6px, 5px)" : "none",
//           }}
//         />
//         <div className="hamburger-bar" style={{ opacity: isOpen ? 0 : 1 }} />
//         <div
//           className="hamburger-bar"
//           style={{
//             transform: isOpen ? "rotate(-45deg) translate(6px, -5px)" : "none",
//           }}
//         />
//       </button>

//       {/* Links and User Action Items */}
//       <div className="nav-links-container">
//         <div className="nav-menu-links">
//           {role === "patient" && (
//             <>
//               <NavLink to="/doctors" onClick={closeMenu}>
//                 Find Doctors
//               </NavLink>
//               <NavLink to="/symptom-checker" onClick={closeMenu}>
//                 Symptom Checker
//               </NavLink>
//               <NavLink to="/appointments" onClick={closeMenu}>
//                 My Appointments
//               </NavLink>
//               <NavLink to="/prescriptions/my" onClick={closeMenu}>
//                 My Prescriptions
//               </NavLink>
//               <NavLink to="/my-data-access" onClick={closeMenu}>
//                 Who Viewed My Data
//               </NavLink>
//               <NavLink to="/profile" onClick={closeMenu}>
//                 Profile
//               </NavLink>
//             </>
//           )}

//           {role === "doctor" && (
//             <>
//               <NavLink to="/doctor/profile" onClick={closeMenu}>
//                 My Profile
//               </NavLink>
//               <NavLink to="/doctor/availability" onClick={closeMenu}>
//                 Availability
//               </NavLink>
//               <NavLink to="/doctor/leaves" onClick={closeMenu}>
//                 Leave
//               </NavLink>
//               <NavLink to="/appointments/doctor" onClick={closeMenu}>
//                 Appointments
//               </NavLink>
//               <NavLink to="/prescriptions/doctor" onClick={closeMenu}>
//                 Prescriptions
//               </NavLink>
//               <NavLink to="/my-activity" onClick={closeMenu}>
//                 My Activity
//               </NavLink>
//               <NavLink to="/doctors" onClick={closeMenu}>
//                 Doctors
//               </NavLink>
//             </>
//           )}

//           {role === "admin" && (
//             <>
//               <NavLink to="/admin" onClick={closeMenu}>
//                 Dashboard
//               </NavLink>
//               <NavLink to="/admin/audit" onClick={closeMenu}>
//                 Audit Trail
//               </NavLink>
//               <NavLink to="/doctors" onClick={closeMenu}>
//                 Doctors
//               </NavLink>
//             </>
//           )}

//           {!role && (
//             <NavLink to="/symptom-checker" onClick={closeMenu}>
//               Symptom Checker
//             </NavLink>
//           )}
//         </div>

//         {/* User info + logout badge */}
//         <div
//           className="user-profile-box"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.75rem",
//             background: "rgba(255,255,255,0.15)",
//             borderRadius: "50px",
//             padding: "6px 14px",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
//             <img
//               src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=2563eb&size=32`}
//               style={{ borderRadius: "50%", width: 32, height: 32 }}
//             />
//             <div
//               style={{
//                 display: "none",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: 32,
//                 height: 32,
//                 borderRadius: "50%",
//                 backgroundColor: "white",
//                 color: "#2563eb",
//                 fontSize: "0.8rem",
//                 fontWeight: 700,
//               }}
//             >
//               {name.charAt(0).toUpperCase()}
//             </div>

//             <span
//               style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}
//             >
//               {name}
//             </span>
//             <span
//               style={{
//                 background: "rgba(255,255,255,0.2)",
//                 color: "white",
//                 fontSize: "0.7rem",
//                 padding: "2px 8px",
//                 borderRadius: "20px",
//                 textTransform: "capitalize",
//               }}
//             >
//               {role}
//             </span>
//           </div>

//           <button
//             onClick={logout}
//             className="logout-btn"
//             style={{
//               background: "rgba(255,255,255,0.2)",
//               border: "1px solid rgba(255,255,255,0.4)",
//               color: "white",
//               borderRadius: "20px",
//               padding: "4px 14px",
//               fontSize: "0.85rem",
//               cursor: "pointer",
//               marginLeft: "4px",
//               transition: "background 0.2s",
//               whiteSpace: "nowrap",
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// interface NavLinkProps {
//   to: string;
//   children: React.ReactNode;
//   onClick: () => void;
// }

// function NavLink({ to, children, onClick }: NavLinkProps) {
//   return (
//     <Link
//       to={to}
//       onClick={onClick}
//       style={{
//         color: "rgba(255,255,255,0.85)",
//         textDecoration: "none",
//         fontWeight: 600,
//         fontSize: "1.05rem",
//         padding: "4px 0",
//         transition: "all 0.2s",
//         display: "flex",
//         alignItems: "center",
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
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const [menuOpen, setMenuOpen] = useState(false);

  if (!role || location.pathname.startsWith("/video")) return null;

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinks = () => {
    if (role === "patient") return [
      { to: "/doctors", label: "Find Doctors" },
      { to: "/symptom-checker", label: "Symptom Checker" },
      { to: "/appointments", label: "My Appointments" },
      { to: "/prescriptions/my", label: "My Prescriptions" },
      { to: "/my-data-access", label: "Who Viewed My Data" },
      { to: "/profile", label: "Profile" },
    ];
    if (role === "doctor") return [
      { to: "/doctor/profile", label: "My Profile" },
      { to: "/doctor/availability", label: "Availability" },
      { to: "/doctor/leaves", label: "Leave" },
      { to: "/appointments/doctor", label: "Appointments" },
      { to: "/prescriptions/doctor", label: "Prescriptions" },
      { to: "/my-activity", label: "My Activity" },
      { to: "/doctors", label: "Doctors" },
    ];
    if (role === "admin") return [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/audit", label: "Audit Trail" },
      { to: "/doctors", label: "Doctors" },
    ];
    return [];
  };

  return (
    <>
      <nav style={{
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
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: "1.2rem" }}>
            🏥 HealthCare
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.2rem",
          // hide on mobile
          flexWrap: "nowrap",
        }} className="desktop-nav">
          {navLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? "white" : "rgba(255,255,255,0.8)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.88rem",
                borderBottom: location.pathname === link.to ? "2px solid white" : "2px solid transparent",
                paddingBottom: "2px",
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* User pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50px", padding: "5px 12px",
          }}>
            <img
              src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=2563eb&size=28`}
              style={{ borderRadius: "50%", width: 28, height: 28 }}
            />
            <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
              {name}
            </span>
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white", borderRadius: "20px",
                padding: "3px 12px", fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.6rem",
            cursor: "pointer",
            display: "none", // shown via CSS
            padding: "4px 8px",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: "65px",
          left: 0,
          right: 0,
          background: "white",
          zIndex: 998,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          borderRadius: "0 0 16px 16px",
          padding: "1rem",
          display: "flex",
          flexDirection: "column" as const,
          gap: "4px",
        }}>
          {/* User info */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", marginBottom: "8px",
            background: "#f8fafc", borderRadius: "10px",
          }}>
            <img
              src={`https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff&size=36`}
              style={{ borderRadius: "50%", width: 36, height: 36 }}
            />
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{name}</div>
              <div style={{
                fontSize: "0.72rem", color: "white",
                background: "#2563eb", padding: "1px 8px",
                borderRadius: "20px", display: "inline-block",
                textTransform: "capitalize" as const,
              }}>{role}</div>
            </div>
          </div>

          {/* Nav links */}
          {navLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                color: location.pathname === link.to ? "#2563eb" : "#475569",
                background: location.pathname === link.to ? "#eff6ff" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              marginTop: "8px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: "#fee2e2",
              color: "#ef4444",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              textAlign: "left" as const,
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Overlay to close menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0,
            zIndex: 997, background: "rgba(0,0,0,0.3)",
          }}
        />
      )}
    </>
  );
}