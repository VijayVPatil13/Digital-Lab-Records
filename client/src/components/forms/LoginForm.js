// client/src/components/forms/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; 

const LoginForm = ({ onError, initialEmail = '', initialPassword = '', selectedRole = 'student' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only update if initial values change, allows user to type
    if (initialEmail) setEmail(initialEmail);
    if (initialPassword) setPassword(initialPassword);
  }, [initialEmail, initialPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(null);
    setIsSubmitting(true);
    
    try {
      // If logging in as admin use the admin-login endpoint
      const endpoint = selectedRole === 'admin' ? '/auth/admin-login' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      const { token, user } = response.data; 

      login(token, user); 
      
      const role = user.role.toLowerCase();
      // Redirect based on role
      navigate(`/${role}/dashboard`, { replace: true });
      
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check credentials and ensure server is running.';
      onError({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-lg" 
          required 
          disabled={isSubmitting} 
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-lg" 
          required 
          disabled={isSubmitting} 
        />
      </div>
      <button
        type="submit"
        className={`w-full p-3 rounded-lg text-white font-semibold transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;