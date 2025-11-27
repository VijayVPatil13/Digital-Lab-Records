// client/src/components/role-specific/AdminEnrollmentForm.js
import React, { useState } from 'react';
import api from '../../utils/api';

const AdminEnrollmentForm = () => {
    const [facultyId, setFacultyId] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsSubmitting(true);
        
        // This relies on an Admin endpoint to enroll faculty in a course, 
        // which you'd need to implement in the AdminController if needed.
        try {
            // Placeholder/Example API call (assuming this endpoint exists on your server):
            // await api.post('/admin/enroll-faculty', { facultyId, courseCode }); 
            
            setMessage({ type: 'success', text: `Mock: Faculty ID ${facultyId} enrolled in ${courseCode}.` });
            setFacultyId('');
            setCourseCode('');

        } catch (error) {
            const msg = error.response?.data?.message || 'Admin enrollment failed.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-xl font-medium mb-3 text-blue-700">Enroll Faculty in Course</h2>
            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    className="border p-2 w-full rounded" 
                    placeholder="Faculty User ID (e.g., MongoDB ID)" 
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <input 
                    className="border p-2 w-full rounded" 
                    placeholder="Course Code (e.g., CSL37)" 
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : 'Perform Enrollment'}
                </button>
            </form>
        </div>
    );
};

export default AdminEnrollmentForm;