// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode'; 
import api from '../utils/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    // NEW GLOBAL STATE: Controls if students can submit work
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(true); 

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.clear();
        delete api.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const decodedToken = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;
                
                if (decodedToken.exp < currentTime) {
                    console.warn("Auth token expired. Logging out.");
                    logout();
                } else {
                    const userData = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(userData);
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                }
            } catch (e) {
                console.error("Error processing stored auth data:", e);
                logout(); 
            }
        }
        setIsLoading(false);
    }, []); 

    const contextValue = {
        user,
        token,
        isLoading,
        userId: user?.id || user?._id,
        fullName: user?.fullName, 
        role: user?.role, 
        login,
        logout,
        isSubmissionOpen, 
        setIsSubmissionOpen, // Exposes setter for Navbar toggle
    };

    if (isLoading) {
        return <div className="text-center p-8 text-xl text-indigo-600 font-medium">Loading Application...</div>; 
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};