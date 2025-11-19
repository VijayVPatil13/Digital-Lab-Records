// client/src/components/role-specific/EnrollmentApproval.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api'; 

const EnrollmentApproval = ({ facultyId }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        if (!facultyId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/faculty/enrollment/pending/${facultyId}`);
            setRequests(response.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch pending requests:", err.response?.data?.message || err.message);
            setError("Could not load pending requests. Check backend route /api/faculty/enrollment/pending/:id");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [facultyId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId, newStatus) => {
        try {
            // Calls the PUT route on the backend to accept or reject
            const response = await api.put(`/faculty/enrollment/${requestId}`, { status: newStatus });
            
            alert(response.data.message); 
            
            fetchRequests(); 
        } catch (error) {
            const msg = error.response?.data?.message || `Failed to ${newStatus} request.`;
            alert(msg);
        }
    };

    if (loading) return <p className="text-sm text-gray-500">Loading pending requests...</p>;
    
    if (error) return <p className="text-sm text-red-600">⚠️ {error}</p>;

    return (
        <div className="space-y-3">
            <p className="text-md font-semibold text-gray-700">Pending Requests ({requests.length})</p>
            {requests.length === 0 ? (
                <p className="text-sm italic text-gray-500">No new enrollment requests pending.</p>
            ) : (
                requests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                        <div>
                            {/* Display Name and Email */}
                            <p className="font-medium text-sm">
                                **{request.studentName}**
                                {request.studentEmail && (
                                    <span className="text-xs text-gray-500 ml-2">({request.studentEmail})</span>
                                )}
                                requests:
                            </p>
                            {/* Display Course Details */}
                            <p className="text-xs text-indigo-700 font-mono">
                                **{request.courseCode}** ({request.courseName})
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleAction(request.id, 'approved')}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction(request.id, 'rejected')}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default EnrollmentApproval;