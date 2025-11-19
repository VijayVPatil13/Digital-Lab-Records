// client/src/pages/LabSubmission.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // To get studentId
import api from '../utils/api';
import moment from 'moment';

const LabSubmission = () => {
    const { user } = useAuth();
    // Assuming navigation is to /student/course/:courseId/labs
    const { courseId } = useParams(); 
    const [sessions, setSessions] = useState([]); 
    const [submissionForm, setSubmissionForm] = useState({ sessionId: '', code: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchActiveSessions = async () => {
        try {
            // Calls the new route to get sessions currently open for submission
            const response = await api.get(`/student/sessions/active/${courseId}`);
            setSessions(response.data.sessions || []);
        } catch (error) {
             setMessage({ type: 'error', text: 'Failed to fetch active sessions.' });
        }
    };
    
    useEffect(() => {
        fetchActiveSessions();
    }, [courseId]);

    const handleSubmission = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (!submissionForm.sessionId || !submissionForm.code) {
            setMessage({ type: 'error', text: 'Please select a session and paste your code.' });
            setLoading(false);
            return;
        }

        try {
            // Calls the new route to submit code
            const response = await api.post('/student/submissions', {
                sessionId: submissionForm.sessionId,
                studentId: user.id, // Get student ID from context
                submittedCode: submissionForm.code,
            });

            setMessage({ type: 'success', text: response.data.message });
            setSubmissionForm({ sessionId: '', code: '' });
            
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Submission failed. Check if time window is open.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-green-700 border-b pb-2">
                Lab Submissions 💻
            </h1>

            {/* --- Submission Form --- */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-500">
                <h2 className="text-2xl font-semibold mb-4">Submit Lab Work</h2>
                {sessions.length === 0 && <p className="text-red-500">No active lab sessions available for submission right now.</p>}

                <form onSubmit={handleSubmission} className="space-y-4">
                    {/* Select Session Dropdown */}
                    <select
                        value={submissionForm.sessionId}
                        onChange={(e) => setSubmissionForm({...submissionForm, sessionId: e.target.value})}
                        required
                        className="w-full p-2 border rounded"
                        disabled={sessions.length === 0}
                    >
                        <option value="">Select Active Lab Session</option>
                        {sessions.map(session => (
                            <option key={session._id} value={session._id}>
                                {session.title} (Closes: {moment(session.endTime).format('h:mm A')})
                            </option>
                        ))}
                    </select>
                    
                    {/* Code Submission Area */}
                    <textarea 
                        value={submissionForm.code}
                        onChange={(e) => setSubmissionForm({...submissionForm, code: e.target.value})}
                        placeholder="Paste your code here..."
                        rows="10"
                        required
                        className="w-full p-2 border rounded font-mono text-sm"
                    />

                    <button type="submit" disabled={loading || sessions.length === 0} className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                        Submit Code
                    </button>
                </form>
                {message && <p className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>}
            </div>
        </div>
    );
};

export default LabSubmission;