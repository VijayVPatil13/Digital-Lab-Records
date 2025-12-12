// client/src/pages/LoginPage.js
import React, { useState } from 'react';
import LoginForm from '../components/forms/LoginForm'; 
import RegisterForm from '../components/forms/RegisterForm'; 

const LoginPage = () => {
    const [mode, setMode] = useState('login'); 
    const [selectedRole, setSelectedRole] = useState('student');
    const [authError, setAuthError] = useState(null);

    const isLogin = mode === 'login';

    const handleSuccessfulRegistration = () => {
        // Registration now logs in and redirects automatically (see RegisterForm.js)
        // This is kept for cleanup consistency, though it may not be called directly.
        setAuthError({ type: 'success', text: "Registration successful! You are now logged in." });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                <h1 className="flex items-center justify-center space-x-3 text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center border-b border-gray-200 pb-4">
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="w-12 h-12 rounded-lg shadow-sm"
                    />
                    <span>Digital Lab Records</span>
                </h1>

                {/* Mode Selector (Tabs) */}
                <div className="flex justify-around space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                        onClick={() => { setMode('login'); setAuthError(null); }}
                        className={`w-1/2 p-3 rounded-lg font-semibold transition ${isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setMode('register'); setAuthError(null); }}
                        className={`w-1/2 p-3 rounded-lg font-semibold transition ${!isLogin ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        Register
                    </button>
                </div>

                {/* Role Selector (Only for Login) */}
                {isLogin && (
                    <div className="flex justify-around space-x-2">
                        <button
                            onClick={() => {
                                setSelectedRole('faculty');
                                setAuthError(null);
                            }}
                            className={`w-1/4 p-3 rounded-lg font-medium text-sm transition ${selectedRole === 'faculty' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Faculty
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRole('student');
                                setAuthError(null);
                            }}
                            className={`w-1/3 p-3 rounded-lg font-medium text-sm transition ${selectedRole === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => { setSelectedRole('admin'); setAuthError(null); }}
                            className={`w-1/4 p-3 rounded-lg font-medium text-sm transition ${selectedRole === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Admin
                        </button>
                    </div>
                )}

                {/* Error/Success Display */}
                {authError && (
                    <div className={`p-4 rounded-lg text-sm font-medium border-l-4 ${authError.type === 'error' ? 'bg-red-50 text-red-800 border-red-400' : 'bg-green-50 text-green-800 border-green-400'}`}>
                        {authError.text || 'An unknown error occurred.'} 
                    </div>
                )}

                {/* Form Component */}
                {isLogin ? (
                    <LoginForm
                        onError={setAuthError}
                        selectedRole={selectedRole}
                    />
                ) : (
                    <RegisterForm
                        onError={setAuthError}
                        onSignupSuccess={handleSuccessfulRegistration}
                    />
                )}
            </div>
        </div>
    );
};

export default LoginPage;