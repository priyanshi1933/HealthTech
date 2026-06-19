// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import api from "../Api/axios";

// export default function DoctorsList() {
//   const [doctors, setDoctors] = useState<any[]>([]);
//   const [specialty, setSpecialty] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const fetchDoctors = async (filter?: string) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/doctor", {
//         params: filter ? { specialty: filter } : {},
//       });
//       setDoctors(res.data.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const specialtyParam = searchParams.get("specialty");
//     if (specialtyParam) {
//       setSpecialty(specialtyParam);
//       fetchDoctors(specialtyParam); 
//     } else {
//       fetchDoctors();
//     }
//   }, []);

//   return (
//     <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
//       <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
//         {/* Header */}
//         <div
//           style={{
//             background: "linear-gradient(135deg,#2563eb,#06b6d4)",
//             borderRadius: "20px",
//             padding: "2.5rem",
//             color: "white",
//             marginBottom: "2rem",
//           }}
//         >
//           <h2 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>
//             Find a Doctor
//           </h2>
//           <p style={{ opacity: 0.85, marginBottom: "1.5rem" }}>
//             Browse from our verified healthcare professionals
//           </p>
//           <div style={{ display: "flex", gap: "10px" }}>
//             <input
//               placeholder="Search by specialty e.g. Cardiology"
//               value={specialty}
//               onChange={(e) => setSpecialty(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && fetchDoctors(specialty)}
//               style={{
//                 flex: 1,
//                 padding: "12px 18px",
//                 borderRadius: "12px",
//                 border: "none",
//                 fontSize: "1rem",
//                 outline: "none",
//               }}
//             />
//             <button
//               onClick={() => fetchDoctors(specialty)}
//               style={{
//                 padding: "12px 24px",
//                 borderRadius: "12px",
//                 border: "none",
//                 background: "white",
//                 color: "#2563eb",
//                 fontWeight: 700,
//                 cursor: "pointer",
//               }}
//             >
//               Search
//             </button>
//             {specialty && (
//               <button
//                 onClick={() => {
//                   setSpecialty("");
//                   fetchDoctors();
//                 }}
//                 style={{
//                   padding: "12px 18px",
//                   borderRadius: "12px",
//                   border: "2px solid rgba(255,255,255,0.5)",
//                   background: "transparent",
//                   color: "white",
//                   fontWeight: 600,
//                   cursor: "pointer",
//                 }}
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {loading ? (
//           <div style={{ textAlign: "center", padding: "4rem" }}>
//             <div className="spinner-border text-primary" />
//           </div>
//         ) : doctors.length === 0 ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "4rem",
//               background: "white",
//               borderRadius: "16px",
//             }}
//           >
//             <div style={{ fontSize: "3rem" }}>🔍</div>
//             <h5 style={{ color: "#64748b" }}>No doctors found</h5>
//           </div>
//         ) : (
//           <div className="row g-4">
//             {doctors.map((doc) => (
//               <div key={doc._id} className="col-md-6 col-lg-4">
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: "18px",
//                     padding: "1.5rem",
//                     boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//                     height: "100%",
//                     display: "flex",
//                     flexDirection: "column",
//                     transition: "transform 0.2s, box-shadow 0.2s",
//                   }}
//                   onMouseEnter={(e) => {
//                     (e.currentTarget as HTMLDivElement).style.transform =
//                       "translateY(-4px)";
//                     (e.currentTarget as HTMLDivElement).style.boxShadow =
//                       "0 8px 24px rgba(0,0,0,0.12)";
//                   }}
//                   onMouseLeave={(e) => {
//                     (e.currentTarget as HTMLDivElement).style.transform =
//                       "translateY(0)";
//                     (e.currentTarget as HTMLDivElement).style.boxShadow =
//                       "0 2px 12px rgba(0,0,0,0.06)";
//                   }}
//                 >
//                   {/* Top */}
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "12px",
//                       marginBottom: "1rem",
//                     }}
//                   >
//                     <img
//                       src={`https://ui-avatars.com/api/?name=${doc.userId?.name}&background=2563eb&color=fff&size=55`}
//                       style={{ borderRadius: "50%", width: 55, height: 55 }}
//                     />
//                     <div style={{ flex: 1 }}>
//                       <div style={{ fontWeight: 700, color: "#1e293b" }}>
//                         {doc.userId?.name}
//                       </div>
//                       <div
//                         style={{
//                           color: "#2563eb",
//                           fontSize: "0.85rem",
//                           fontWeight: 600,
//                         }}
//                       >
//                         {doc.specialty}
//                       </div>
//                     </div>
//                     {doc.verifiedBadge && (
//                       <span
//                         style={{
//                           background: "#d1fae5",
//                           color: "#065f46",
//                           fontSize: "0.7rem",
//                           padding: "3px 8px",
//                           borderRadius: "20px",
//                           fontWeight: 600,
//                         }}
//                       >
//                         ✅ Verified
//                       </span>
//                     )}
//                   </div>

//                   {/* Qualifications */}
//                   <div
//                     style={{
//                       display: "flex",
//                       flexWrap: "wrap",
//                       gap: "6px",
//                       marginBottom: "1rem",
//                     }}
//                   >
//                     {doc.qualifications.map((q: string) => (
//                       <span
//                         key={q}
//                         style={{
//                           background: "#eff6ff",
//                           color: "#2563eb",
//                           fontSize: "0.75rem",
//                           padding: "3px 10px",
//                           borderRadius: "20px",
//                           fontWeight: 600,
//                         }}
//                       >
//                         {q}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Stats */}
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-around",
//                       background: "#f8fafc",
//                       borderRadius: "12px",
//                       padding: "0.75rem",
//                       marginBottom: "1rem",
//                     }}
//                   >
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontWeight: 800, color: "#2563eb" }}>
//                         {doc.experience}yr
//                       </div>
//                       <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
//                         Experience
//                       </div>
//                     </div>
//                     <div style={{ width: "1px", background: "#e2e8f0" }} />
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontWeight: 800, color: "#2563eb" }}>
//                         ₹{doc.fee}
//                       </div>
//                       <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
//                         Fee
//                       </div>
//                     </div>
//                     <div style={{ width: "1px", background: "#e2e8f0" }} />
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontWeight: 800, color: "#2563eb" }}>
//                         {doc.languages.length}
//                       </div>
//                       <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
//                         Languages
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => navigate(`/doctors/${doc._id}`)}
//                     style={{
//                       marginTop: "auto",
//                       padding: "10px",
//                       borderRadius: "12px",
//                       border: "none",
//                       background: "linear-gradient(135deg,#2563eb,#06b6d4)",
//                       color: "white",
//                       fontWeight: 700,
//                       cursor: "pointer",
//                       width: "100%",
//                     }}
//                   >
//                     View Profile & Book
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../Api/axios";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchDoctors = async (filter?: string) => {
    setLoading(true);
    try {
      const res = await api.get("/doctor", {
        params: filter ? { specialty: filter } : {},
      });
      setDoctors(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const specialtyParam = searchParams.get("specialty");
    if (specialtyParam) {
      setSpecialty(specialtyParam);
      fetchDoctors(specialtyParam);
    } else {
      fetchDoctors();
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#06b6d4)",
          borderRadius: "16px",
          padding: "1.5rem",
          color: "white",
          marginBottom: "1.5rem",
        }}>
          <h2 style={{ fontWeight: 800, marginBottom: "4px", fontSize: "1.4rem" }}>
            Find a Doctor
          </h2>
          <p style={{ opacity: 0.85, marginBottom: "1rem", fontSize: "0.9rem" }}>
            Browse from our verified healthcare professionals
          </p>

          {/* Search — wraps on mobile */}
          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap" as const,
          }}>
            <input
              placeholder="Search by specialty e.g. Cardiology"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDoctors(specialty)}
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => fetchDoctors(specialty)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "white",
                color: "#2563eb",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
              }}
            >
              Search
            </button>
            {specialty && (
              <button
                onClick={() => { setSpecialty(""); fetchDoctors(); }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "2px solid rgba(255,255,255,0.5)",
                  background: "transparent",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap" as const,
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem",
            background: "white", borderRadius: "16px",
          }}>
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <h5 style={{ color: "#64748b" }}>No doctors found</h5>
          </div>
        ) : (
          <div className="row g-3">
            {doctors.map((doc) => (
              <div key={doc._id} className="col-12 col-sm-6 col-lg-4">
                <div style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column" as const,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Top — doctor info */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: "12px", marginBottom: "1rem",
                  }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${doc.userId?.name}&background=2563eb&color=fff&size=50`}
                      style={{ borderRadius: "50%", width: 50, height: 50, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, color: "#1e293b",
                        fontSize: "0.95rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}>
                        {doc.userId?.name}
                      </div>
                      <div style={{ color: "#2563eb", fontSize: "0.82rem", fontWeight: 600 }}>
                        {doc.specialty}
                      </div>
                    </div>
                    {doc.verifiedBadge && (
                      <span style={{
                        background: "#d1fae5", color: "#065f46",
                        fontSize: "0.68rem", padding: "2px 8px",
                        borderRadius: "20px", fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        ✅ Verified
                      </span>
                    )}
                  </div>

                  {/* Qualifications */}
                  <div style={{
                    display: "flex", flexWrap: "wrap" as const,
                    gap: "5px", marginBottom: "1rem",
                  }}>
                    {doc.qualifications.map((q: string) => (
                      <span key={q} style={{
                        background: "#eff6ff", color: "#2563eb",
                        fontSize: "0.72rem", padding: "2px 8px",
                        borderRadius: "20px", fontWeight: 600,
                      }}>
                        {q}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "0.6rem",
                    marginBottom: "1rem",
                  }}>
                    <div style={{ textAlign: "center" as const }}>
                      <div style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem" }}>
                        {doc.experience}yr
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.7rem" }}>Exp</div>
                    </div>
                    <div style={{ width: "1px", background: "#e2e8f0" }} />
                    <div style={{ textAlign: "center" as const }}>
                      <div style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem" }}>
                        ₹{doc.fee}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.7rem" }}>Fee</div>
                    </div>
                    <div style={{ width: "1px", background: "#e2e8f0" }} />
                    <div style={{ textAlign: "center" as const }}>
                      <div style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem" }}>
                        {doc.languages.length}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.7rem" }}>Lang</div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/doctors/${doc._id}`)}
                    style={{
                      marginTop: "auto",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                      width: "100%",
                      fontSize: "0.9rem",
                    }}
                  >
                    View Profile & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}