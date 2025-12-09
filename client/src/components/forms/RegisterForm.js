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
        role: 'Student'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // EMAIL VALIDATION FUNCTION
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu)$/i;
        return emailRegex.test(email);
    };

    // FULL NAME VALIDATION FUNCTION (First + Last Name)
    const isValidFullName = (name) => {
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onError(null);
        setIsSubmitting(true);

        //FULL NAME VALIDATION
        if (!isValidFullName(formData.fullName)) {
            onError({ type: 'error', text: 'Please enter first name and last name' });
            setIsSubmitting(false);
            return;
        }

        //EMAIL VALIDATION
        if (!isValidEmail(formData.email)) {
            onError({ type: 'error', text: 'Please enter valid email' });
            setIsSubmitting(false);
            return;
        }

        //ROLE VALIDATION
        if (formData.role === 'Admin') {
            onError({ type: 'error', text: 'Admin accounts must be created directly by an administrator.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            login(response.data.token, response.data.user);

            const role = response.data.user.role.toLowerCase();
            navigate(`/${role}/dashboard`, { replace: true });

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

            <div>
                <label className="block text-gray-700 font-medium mb-1">Role</label>
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="Student">Student</option>
                </select>
            </div>

            <button
                type="submit"
                className={`w-full p-3 rounded-lg font-semibold transition ${
                    isSubmitting 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Registering...' : 'Register & Login'}
            </button>
        </form>
    );
};

export default RegisterForm;
