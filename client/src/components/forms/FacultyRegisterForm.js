import React, { useState } from 'react';
import api from '../../utils/api';

const FacultyRegisterForm = ({ onSuccess, onError }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onError) onError(null);
        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/register-faculty', formData);
            setFormData({ fullName: '', email: '', password: '' });
            if (onSuccess) onSuccess(response.data);
        } catch (error) {
            const msg = error.response?.data?.message || 'Server error during faculty registration.';
            if (onError) onError({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Register Faculty Account</h2>
            <p className="text-gray-600 text-sm mb-4">Create a new faculty account for the system.</p>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
            </div>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
            </div>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
            </div>
            <button
                type="submit"
                className={`w-full p-3 rounded-lg font-semibold transition text-white shadow-md ${
                    isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : '+ Create Faculty Account'}
            </button>
        </form>
    );
};

export default FacultyRegisterForm;
