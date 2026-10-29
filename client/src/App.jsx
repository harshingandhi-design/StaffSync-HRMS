import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardDispatcher from './pages/DashboardDispatcher';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import EmployeeDirectory from './pages/EmployeeDirectory';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TrainingsPage from './pages/TrainingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Application Shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardDispatcher />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leaves" element={<LeavePage />} />
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr', 'admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
