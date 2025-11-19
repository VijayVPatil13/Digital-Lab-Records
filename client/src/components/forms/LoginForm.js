// client/src/components/forms/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onError, initialEmail, initialPassword }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  
  // Update state when initialEmail changes (i.e., when user clicks a role button)
  useEffect(() => {
    setEmail(initialEmail);
    setPassword(initialPassword);
  }, [initialEmail, initialPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check credentials.';
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">Email (Pre-filled for {email.split('@')[0].toUpperCase()})</label>
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