import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import Verify2FA from "./Components/Verify2FA";
import DoctorsList from "./Components/DoctorsList";
import SingleDoctor from "./Components/SingleDoctor";
import CreateDoctorProfile from "./Components/Doctor/CreateDoctorProfile";
import DoctorProfile from "./Components/Doctor/DoctorProfile";
import UpdateDoctorProfile from "./Components/Doctor/UpdateDoctorProfile";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/Navbar";
import Availability from "./Components/Doctor/Availability";
import MyAppointments from "./Components/Patient/MyAppointments";
import DoctorAppointments from "./Components/Doctor/DoctorAppointments";
import WritePrescription from "./Components/Doctor/WritePrescription";
import MyPrescriptions from "./Components/Patient/MyPrescriptions";
import DoctorPrescriptions from "./Components/Doctor/DoctorPrescriptions";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<DoctorsList />} />
        <Route path="/doctors/:id" element={<SingleDoctor />} />

        <Route
          path="/verify-2fa"
          element={
            <ProtectedRoute>
              <Verify2FA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/doctor"
          element={
            <ProtectedRoute>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/create-profile"
          element={
            <ProtectedRoute>
              <CreateDoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/update-profile"
          element={
            <ProtectedRoute>
              <UpdateDoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/write/:appointmentId"
          element={
            <ProtectedRoute>
              <WritePrescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/my"
          element={
            <ProtectedRoute>
              <MyPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/doctor"
          element={
            <ProtectedRoute>
              <DoctorPrescriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
