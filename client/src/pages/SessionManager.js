// client/src/pages/SessionManager.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import ReviewTable from '../components/role-specific/ReviewTable'; // New component for review

const SessionManager = () => {
    const { courseId } = useParams(); 
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState({ title: '', date: '', startTime: '18:00', endTime: '20:00' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const combineDateTime = (date, time) => {
        // Creates a UTC date object from local date/time strings
        return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toISOString();
    };

    const fetchSessions = async () => {
        if (!courseId) return;
        try {
            // Fetch sessions for the manager view
            const response = await api.get(`/faculty/sessions/course/${courseId}`);
            setSessions(response.data.sessions || []);
            // TODO: Fetch Course details (name, code) separately here if needed
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load sessions.' });
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [courseId]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const startTimeISO = combineDateTime(newSession.date, newSession.startTime);
        const endTimeISO = combineDateTime(newSession.date, newSession.endTime);
        
        try {
            const response = await api.post('/faculty/sessions', {
                courseId,
                title: newSession.title,
                startTime: startTimeISO,
                endTime: endTimeISO,
            });

            setMessage({ type: 'success', text: response.data.message });
            setNewSession({ title: '', date: '', startTime: '18:00', endTime: '20:00' });
            fetchSessions(); 
            
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create session.' });
        } finally {
            setLoading(false);
        }
    };
    
    // Navigate to the specific session review page
    const handleReviewClick = (sessionId) => {
        navigate(`/faculty/session/${sessionId}/review`);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-indigo-700 border-b pb-2">
                Manage Lab Sessions 🧪
            </h1>

            {/* --- 1. Create Session Form --- */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-indigo-500">
                <h2 className="text-2xl font-semibold mb-4">Add New Lab Session (Timing)</h2>
                <form onSubmit={handleCreateSession} className="space-y-4">
                    <input 
                        type="text" 
                        value={newSession.title}
                        onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                        placeholder="Session Title (e.g., Lab 1: Recursion)"
                        required
                        className="w-full p-2 border rounded"
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <input 
                            type="date" 
                            value={newSession.date}
                            onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                            required
                            className="p-2 border rounded"
                        />
                        <input 
                            type="time" 
                            value={newSession.startTime}
                            onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                            required
                            className="p-2 border rounded"
                        />
                         <input 
                            type="time" 
                            value={newSession.endTime}
                            onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                            required
                            className="p-2 border rounded"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                        Create Session
                    </button>
                </form>
                {message && <p className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>}
            </div>

            {/* --- 2. List of Sessions --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Existing Sessions</h2>
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <p>No sessions created yet.</p>
                    ) : (
                        sessions.map(session => (
                            <div key={session._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">{session.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {moment(session.startTime).format('MMM D, h:mm A')} - {moment(session.endTime).format('h:mm A')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleReviewClick(session._id)}
                                    className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                                >
                                    Review Submissions
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionManager;