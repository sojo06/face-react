// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute component
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <>
            <Toaster position="top-center" reverseOrder={false} />

    <Router>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protect student route */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
          />

        {/* Protect teacher route */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
          />

        {/* Default route */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
      </>
  );
};

export default App;
