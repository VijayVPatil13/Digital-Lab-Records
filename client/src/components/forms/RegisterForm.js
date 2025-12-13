// client/src/components/forms/RegisterForm.js
import React, { useState } from 'react';
import api from '../../utils/api'; 
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ onError, onSignupSuccess }) => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        usn: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu)$/i;
        return emailRegex.test(email);
    };

    // Full name validation
    const isValidFullName = (name) => {
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onError(null);
        setIsSubmitting(true);

        if (!isValidFullName(formData.fullName)) {
            onError({ type: 'error', text: 'Please enter first and last name' });
            setIsSubmitting(false);
            return;
        }

        if (!isValidEmail(formData.email)) {
            onError({ type: 'error', text: 'Please enter a valid email' });
            setIsSubmitting(false);
            return;
        }

        if (!formData.usn.trim()) {
            onError({ type: 'error', text: 'USN is required' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                usn: formData.usn,
                role: 'Student' // enforced
            });

            login(response.data.token, response.data.user);

            navigate('/student/dashboard', { replace: true });

            if (onSignupSuccess) onSignupSuccess();

        } catch (error) {
            const msg = error.response?.data?.message || 'Server error during registration.';
            onError({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

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
                <label className="block text-gray-700 font-medium mb-1">USN</label>
                <input
                    type="text"
                    name="usn"
                    value={formData.usn}
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
                disabled={isSubmitting}
                className={`w-full p-3 rounded-lg font-semibold transition ${
                    isSubmitting
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                } text-white`}
            >
                {isSubmitting ? 'Registering...' : 'Register & Login'}
            </button>

        </form>
    );
};

export default RegisterForm;
