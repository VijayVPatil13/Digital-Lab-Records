// client/src/components/forms/SignupForm.js
import React, { useState } from 'react';
import api from '../../utils/api'; // Use the configured Axios instance

const SignupForm = ({ onError, onSignupSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Student', // Default new user to Student
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(null);
    setIsSubmitting(true);

    // Admin registration is typically done internally, so restrict to Faculty/Student
    if (form.role === 'Admin') {
        onError("Admin accounts cannot be created via public registration.");
        setIsSubmitting(false);
        return;
    }

    try {
      // Send data to the new registration endpoint
      await api.post('/auth/register', form);
      
      // Success: Notify user and switch back to login view
      alert("Registration successful! Please log in."); // Using alert() temporarily
      onSignupSuccess();
      
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Check if email is already in use.';
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input name="firstName" placeholder="First Name" onChange={handleChange} required className="p-3 border rounded-lg" />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="p-3 border rounded-lg" />
      </div>

      <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="p-3 border rounded-lg w-full" />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="p-3 border rounded-lg w-full" />
      
      <div className="flex items-center space-x-4">
        <label className="text-gray-700 font-medium">Register As:</label>
        <select 
          name="role" 
          value={form.role} 
          onChange={handleChange} 
          className="p-2 border rounded-lg"
          required
        >
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
        </select>
      </div>

      <button
        type="submit"
        className={`w-full p-3 rounded-lg text-white font-semibold transition ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;