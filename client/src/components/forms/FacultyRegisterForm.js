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
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-800">Register Faculty Account</h2>
            <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg"
                />
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg"
                />
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg"
                />
            </div>
            <button
                type="submit"
                className={`w-full p-3 rounded-lg font-semibold transition ${
                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Faculty Account'}
            </button>
        </form>
    );
};

export default FacultyRegisterForm;
