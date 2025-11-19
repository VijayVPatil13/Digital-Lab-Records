// client/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Retrieve stored full user data
          const storedUser = JSON.parse(localStorage.getItem('user_data')) || decoded;
          setUser(storedUser); 
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Invalid token:", e);
        logout();
      }
    }
    setLoading(false);
  }, [logout]); // FIX: Includes stable logout

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      
      const userData = {
        id: response.data.id,
        role: response.data.role,
        firstName: response.data.firstName, 
        lastName: response.data.lastName,   
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(userData)); 
      
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const role = userData.role.toLowerCase();
      navigate(`/${role}`);

    } catch (error) {
      console.error('Login failed:', error);
      logout(); 
      throw error;
    }
  };

  const value = {
    user,
    isAuth: !!user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'Admin',
    isFaculty: user?.role === 'Faculty',
    isStudent: user?.role === 'Student',
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);