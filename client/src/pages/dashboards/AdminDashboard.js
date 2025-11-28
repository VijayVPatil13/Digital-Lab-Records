import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import FacultyRegisterForm from '../../components/forms/FacultyRegisterForm';

const AdminDashboard = () => {
    const [faculties, setFaculties] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch faculty list on component mount
    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/list-faculty');
            setFaculties(res.data.faculties);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load faculty list.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFacultyCreated = (data) => {
        setMessage({ type: 'success', text: data.message || 'Faculty account created successfully.' });
        fetchFaculties(); // Refresh the list
    };

    const handleError = (error) => {
        if (error) setMessage(error);
    };

    const handleDeleteFaculty = async (facultyId) => {
        if (window.confirm('Are you sure you want to delete this faculty account?')) {
            try {
                const res = await api.delete(`/auth/delete-faculty/${facultyId}`);
                setMessage({ type: 'success', text: res.data.message });
                fetchFaculties(); // Refresh the list
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete faculty.' });
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>

            {message && (
                <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Faculty Registration Form */}
                <div>
                    <FacultyRegisterForm onSuccess={handleFacultyCreated} onError={handleError} />
                </div>

                {/* Faculty List */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Registered Faculty</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : faculties.length === 0 ? (
                        <p className="text-gray-500">No faculty accounts registered yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {faculties.map((faculty) => (
                                <div key={faculty._id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                    <div>
                                        <p className="font-medium text-gray-800">{faculty.firstName} {faculty.lastName}</p>
                                        <p className="text-sm text-gray-600">{faculty.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFaculty(faculty._id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
