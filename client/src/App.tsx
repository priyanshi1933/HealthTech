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
import VideoConsult from "./Components/VideoConsult";
import RescheduleAppointment from "./Components/Patient/RescheduleAppointment";
import WhoViewedMyData from "./Components/Patient/WhoViewedMyData";
import MyActivity from "./Components/Doctor/MyActivity";
import AuditDashboard from "./Components/Admin/AuditDashboard";
import ViewPrescription from "./Components/ViewPrescription";
import SymptomChecker from "./Components/SymptomChecker";
import LeaveManagement from "./Components/Doctor/LeaveManagement";

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
          path="/appointments/:appointmentId/reschedule"
          element={
            <ProtectedRoute>
              <RescheduleAppointment />
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
          path="/doctor/leaves"
          element={
            <ProtectedRoute>
              <LeaveManagement />
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
          path="/prescriptions/view/:appointmentId"
          element={
            <ProtectedRoute>
              <ViewPrescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:appointmentId"
          element={
            <ProtectedRoute>
              <VideoConsult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-data-access"
          element={
            <ProtectedRoute>
              <WhoViewedMyData />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-activity"
          element={
            <ProtectedRoute>
              <MyActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute>
              <AuditDashboard />
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

        <Route
          path="/symptom-checker"
          element={
            <ProtectedRoute>
              <SymptomChecker />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
