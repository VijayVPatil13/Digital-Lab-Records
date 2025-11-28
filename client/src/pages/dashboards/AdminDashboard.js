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
        <div className="max-w-6xl mx-auto p-4 space-y-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen rounded-xl">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>

            {message && (
                <div className={`p-4 rounded-lg border-l-4 ${message.type === 'error' ? 'bg-red-50 text-red-800 border-red-400' : 'bg-green-50 text-green-800 border-green-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Faculty Registration Form */}
                <div>
                    <FacultyRegisterForm onSuccess={handleFacultyCreated} onError={handleError} />
                </div>

                {/* Faculty List */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-purple-500 pb-2">Registered Faculty</h2>
                    {loading ? (
                        <p className="text-gray-500 italic">Loading...</p>
                    ) : faculties.length === 0 ? (
                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                            <p className="text-gray-500 italic">No faculty accounts registered yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {faculties.map((faculty) => (
                                <div key={faculty._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition">
                                    <div>
                                        <p className="font-semibold text-gray-800">{faculty.firstName} {faculty.lastName}</p>
                                        <p className="text-sm text-gray-600">{faculty.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFaculty(faculty._id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition shadow-md"
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
