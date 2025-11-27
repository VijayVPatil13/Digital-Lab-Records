// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';

// Page Imports
import StudentDashboard from './pages/dashboards/StudentDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard'; 
import SessionManager from './pages/SessionManager';
import SessionReview from './pages/SessionReview';
import LabSubmission from './pages/LabSubmission';
import CourseManagement from './pages/dashboards/CourseManagement';
import ErrorPage from './pages/ErrorPage'; 

function App() {
    return (
        <Router> 
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Protected Routes */}
                    <Route element={<Layout />}>
                        
                        {/* STUDENT ROUTES */}
                        <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
                        <Route path="/student/course/:courseCode/labs" element={<ProtectedRoute role="Student"><LabSubmission /></ProtectedRoute>} />

                        {/* FACULTY ROUTES */}
                        <Route path="/faculty/dashboard" element={<ProtectedRoute role="Faculty"><FacultyDashboard /></ProtectedRoute>} />
                        <Route path="/faculty/course/:courseCode/sessions" element={<ProtectedRoute role="Faculty"><SessionManager /></ProtectedRoute>} />
                        <Route path="/faculty/session/:sessionId/review" element={<ProtectedRoute role="Faculty"><SessionReview /></ProtectedRoute>} />
                        
                        {/* ADMIN ROUTES */}
                        <Route path="/admin/dashboard" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/courses" element={<ProtectedRoute role="Admin"><CourseManagement /></ProtectedRoute>} />
                        
                        {/* Error Route */}
                         <Route path="/error/:code" element={<ErrorPage />} />
                    </Route>
                     
                    <Route path="*" element={<Navigate to="/error/404" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;