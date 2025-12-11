// client/src/pages/SessionManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import TabbedContainer from '../components/common/TabbedContainer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateLabForm from '../components/forms/CreateLabForm'; // Assuming the functional version is used

// ... (NewSessionForm component uses CreateLabForm logic but simplified here) ...

// SessionManager Component (Parent)
const SessionManager = () => {
    const { courseCode, section } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);


    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(
            `/faculty/sessions/course/${courseCode}/${section}`
            );
            setSessions(response.data.sessions);
            setCourse(response.data.course);
            setMessage(null);
        } catch (error) {
            setMessage({
            type: 'error',
            text: error.response?.data?.message || 'Failed to load sessions.'
            });
        } finally {
            setLoading(false);
        }
    }, [courseCode, section]);


    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]); 

    const handleNewSessionSuccess = (msg) => {
        setMessage({ type: 'success', text: msg });
        fetchSessions();

        //After 3 seconds → go back to "All Sessions" tab
        setTimeout(() => {
            setMessage(null);

            // Force tab switch by reloading tab container via key
            const listTabBtn = document.querySelector('[data-tab="list"]');
            if (listTabBtn) {
                listTabBtn.click();
            }

        }, 3000);
    };

    const handleReviewClick = (sessionId) => {
        navigate(`/faculty/session/${sessionId}/review`);
    };

    const SessionList = () => (
        <div className="space-y-4">
            {loading ? (
                <LoadingSpinner />
            ) : sessions.length === 0 ? (
                <p className="italic text-gray-500">No lab sessions created yet.</p>
            ) : (
                sessions.map(session => (
                    <div key={session._id} className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center shadow-sm">
                        <div>
                            <p className="font-bold text-lg">{session.title}</p>
                            <p className="text-sm text-gray-600">Date: {moment(session.date).format('MMM D, YYYY h:mm A')}</p>
                            <p className="text-xs text-gray-500">Max Marks: {session.maxMarks}</p>
                        </div>
                        <button 
                            onClick={() => handleReviewClick(session._id)}
                            className="px-4 py-2 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition"
                        >
                            Review & Grade
                        </button>
                    </div>
                ))
            )}
        </div>
    );

    const tabs = [
        { key: 'list', label: 'All Sessions', content: <SessionList /> },
        { 
            key: 'new', 
            label: 'Create New Session', 
            content: <CreateLabForm 
                courseCode={courseCode} 
                section={section}
                onSuccess={handleNewSessionSuccess} 
                onError={setMessage} 
                />
        },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-indigo-700">
                Manage Sessions for "{course?.name || courseCode}"
            </h1>
            <p className="text-gray-600">Course ID: {courseCode}</p>
            <p className="text-gray-600">Section: {section}</p>

            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            <TabbedContainer tabs={tabs} />
        </div>
    );
};

export default SessionManager;