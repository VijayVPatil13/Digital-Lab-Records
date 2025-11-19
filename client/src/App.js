// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// --- Layout/Context Imports ---
import { AuthProvider } from './contexts/AuthContext'; 
import ProtectedRoute from './components/common/ProtectedRoute'; 
import Layout from './components/common/Layout'; // Corrected component name/path
import LoginPage from './pages/LoginPage'; // Assuming you have a separate Login page

// --- Page Imports ---
import StudentDashboard from './pages/dashboards/StudentDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import SessionManager from './pages/SessionManager';   
import SessionReview from './pages/SessionReview';   
import LabSubmission from './pages/LabSubmission';     

function App() {
    return (
        <AuthProvider>
            <Router> {/* Single, top-level Router */}
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* --- Protected Routes (Wrapped by Layout) --- */}
                    <Route element={<Layout />}>
                        
                        {/* STUDENT ROUTES */}
                        <Route 
                            path="/student/dashboard" 
                            element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/student/course/:courseId/labs" 
                            element={<ProtectedRoute role="Student"><LabSubmission /></ProtectedRoute>} 
                        />

                        {/* FACULTY ROUTES */}
                        <Route 
                            path="/faculty/dashboard" 
                            element={<ProtectedRoute role="Faculty"><FacultyDashboard /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/faculty/course/:courseId/sessions" 
                            element={<ProtectedRoute role="Faculty"><SessionManager /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/faculty/session/:sessionId/review" 
                            element={<ProtectedRoute role="Faculty"><SessionReview /></ProtectedRoute>} 
                        />

                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;