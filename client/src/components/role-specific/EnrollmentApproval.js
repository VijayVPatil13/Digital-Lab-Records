// client/src/components/role-specific/EnrollmentApproval.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api'; 
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const EnrollmentApproval = ({ onActionProcessed }) => {
    const { userId } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        // Only attempt to fetch if the user ID is available
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // GET to /api/faculty/enrollment/pending (relies on JWT for user ID)
            const response = await api.get(`/faculty/enrollment/pending`);
            
            // Assuming the server returns an array of detailed requests (including student/course objects)
            setRequests(response.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch pending requests:", err.response?.data?.message || err.message);
            // This error typically happens if the Faculty user isn't assigned to any courses.
            setError("Could not load pending requests. Ensure you teach at least one course.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId, newStatus) => {
        try {
            // PUT to /api/faculty/enrollment/:requestId to update status
            await api.put(`/faculty/enrollment/${requestId}`, { status: newStatus });
            
            alert(`Enrollment request ${newStatus} successfully.`); 
            
            // Refresh the list immediately to remove the processed request
            fetchRequests(); 
            
            // If approved, trigger the parent dashboard (FacultyDashboard) 
            // to reload its list of courses/student counts.
            if (newStatus === 'approved' && onActionProcessed) {
                onActionProcessed();
            }

        } catch (error) {
            const msg = error.response?.data?.message || `Failed to ${newStatus} request.`;
            alert(msg);
        }
    };

    if (loading) return <LoadingSpinner />;
    
    // Only display if there's an error OR requests exist
    if (error) return <p className="text-sm text-red-600 p-3 rounded-lg bg-red-50">⚠️ {error}</p>;
    
    // Crucial logic: Hide the component entirely if there are no pending requests.
    if (requests.length === 0) return null; 

    return (
        <div className="bg-yellow-50 p-4 rounded-xl shadow-md border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">
                🔔 Pending Enrollments ({requests.length})
            </h2>
            <ul className="space-y-3">
                {requests.map((req) => (
                    <li key={req._id} className="p-3 border-b flex justify-between items-center bg-white rounded-md shadow-sm">
                        <div className="text-sm">
                            <p className="font-medium text-gray-800">
                                {req.student?.firstName && req.student?.lastName 
                                    ? `${req.student.firstName} ${req.student.lastName}`
                                    : req.student?.email}                                
                            </p>

                            <p className="text-xs text-gray-500">Course: {req.course.code} - {req.course.name}</p>
                        </div>
                        <div className="space-x-2 flex items-center">
                            <button
                                onClick={() => handleAction(req._id, 'approved')}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction(req._id, 'rejected')}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EnrollmentApproval;