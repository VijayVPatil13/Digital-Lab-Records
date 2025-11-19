// client/src/pages/LoginPage.js
import React, { useState } from 'react';
import LoginForm from '../components/forms/LoginForm';
import SignupForm from '../components/forms/SignupForm'; 

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [currentRole, setCurrentRole] = useState('Student'); 
  const [isLoginView, setIsLoginView] = useState(true); 

  const rolePresets = {
    'Student': 'student@lab.edu',
    'Faculty': 'faculty@lab.edu',
    'Admin': 'admin@lab.edu',
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Digital Lab System
        </h2>

        {/* --- View Toggle Button (Login <-> Sign Up) --- */}
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(null);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 transition"
          >
            {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
          </button>
        </div>
        
        {error && <p className="text-red-500 mb-4 text-center border p-2 bg-red-50 rounded text-sm">{error}</p>}
        
        {isLoginView ? (
          <>
            {/* --- Role Selection Buttons for Login --- */}
            <div className="mb-6 flex justify-around p-2 bg-gray-100 rounded-lg">
              {Object.keys(rolePresets).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role);
                    setError(null);
                  }}
                  className={`py-2 px-4 rounded-lg font-semibold transition ${
                    currentRole === role
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  Login as {role}
                </button>
              ))}
            </div>
            {/* --- End Role Selection Buttons --- */}

            <LoginForm 
              onError={setError} 
              initialEmail={rolePresets[currentRole]}
              initialPassword="securePass123" 
            />
          </>
        ) : (
          <SignupForm 
            onError={setError} 
            onSignupSuccess={() => setIsLoginView(true)} 
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;