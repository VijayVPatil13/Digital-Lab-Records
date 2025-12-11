import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api'; 
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const EnrollmentApproval = ({ onActionProcessed }) => {
    const { userId } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); //  NEW MESSAGE STATE

    const fetchRequests = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/faculty/enrollment/pending`);
            setRequests(response.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch pending requests:", err.response?.data?.message || err.message);
            setError("Could not load pending requests. Ensure you teach at least one course.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // AUTO-HIDE MESSAGE AFTER 3 SECONDS
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    const handleAction = async (requestId, newStatus) => {
        try {
            await api.put(`/faculty/enrollment/${requestId}`, { status: newStatus });

            if (newStatus === 'approved') {
                setMessage({ type: 'success', text: 'Student enrollment successful' });
            } else {
                setMessage({ type: 'error', text: 'Enrollment rejected' });
            }

            fetchRequests(); 

            if (newStatus === 'approved' && onActionProcessed) {
                onActionProcessed();
            }

        } catch (error) {
            const msg = error.response?.data?.message || `Failed to ${newStatus} request.`;
            setMessage({ type: 'error', text: msg });
        }
    };

    const handleApproveAll = async () => {
        try {
            const response = await api.post('/faculty/enrollment/approve-all');

            setMessage({ type: 'success', text: response.data.message });

            fetchRequests();        // Refresh pending list
            onActionProcessed?.();  // Refresh dashboard badge count
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to approve all.';
            setMessage({ type: 'error', text: msg });
        }
    };


    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-sm text-red-600 p-3 rounded-lg bg-red-50">⚠️ {error}</p>;
    if (requests.length === 0 && !message) return null; 

    return (
        <div className="bg-yellow-50 p-4 rounded-xl shadow-md border border-yellow-200 space-y-4">

            {/* SUCCESS / ERROR MESSAGE BANNER */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm font-semibold border-l-4 ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-800 border-green-500'
                            : 'bg-red-50 text-red-800 border-red-500'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {requests.length > 0 && (
                <>
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">
                        🔔 Pending Enrollments ({requests.length})
                    </h2>

                    {requests.length > 0 && (
                        <button
                            onClick={handleApproveAll}
                            className="px-4 py-2 bg-green-700 text-white rounded-md shadow hover:bg-green-800 font-semibold"
                        >
                            Accept All Pending Enrollments
                        </button>
                    )}


                    <ul className="space-y-3">
                        {requests.map((req) => (
                            <li 
                                key={req._id} 
                                className="p-3 border-b flex justify-between items-center bg-white rounded-md shadow-sm"
                            >
                                <div className="text-sm space-y-1">
                                    <p className="font-medium text-gray-800">
                                        {req.student?.firstName && req.student?.lastName 
                                            ? `${req.student.firstName} ${req.student.lastName}` 
                                            : req.student?.email}
                                    </p>

                                    <p className="text-xs text-gray-600">
                                        Course: {req.course.code} - {req.course.name}
                                    </p>

                                    {/*  SECTION DISPLAY */}
                                    <p className="text-xs text-gray-600 font-semibold">
                                        Section: {req.section || req.course.section || '-'}
                                    </p>
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
                </>
            )}
        </div>
    );
};

export default EnrollmentApproval;
