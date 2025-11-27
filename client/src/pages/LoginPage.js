// client/src/pages/LoginPage.js
import React, { useState } from 'react';
import LoginForm from '../components/forms/LoginForm'; 
import RegisterForm from '../components/forms/RegisterForm'; 

const rolePresets = {
    faculty: { email: 'faculty@example.com', password: 'password123' },
    student: { email: 'student1@example.com', password: 'password123' },
    admin: { email: 'admin@example.com', password: 'password123' }
};

const LoginPage = () => {
    const [mode, setMode] = useState('login'); 
    const [selectedRole, setSelectedRole] = useState('student'); 
    const [authError, setAuthError] = useState(null);

    const preset = rolePresets[selectedRole];

    const isLogin = mode === 'login';

    const handleSuccessfulRegistration = () => {
        // Registration now logs in and redirects automatically (see RegisterForm.js)
        // This is kept for cleanup consistency, though it may not be called directly.
        setAuthError({ type: 'success', text: "Registration successful! You are now logged in." });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center border-b pb-4">
                    Digital Lab Records
                </h1>

                {/* Mode Selector (Tabs) */}
                <div className="flex justify-around space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => { setMode('login'); setAuthError(null); }}
                        className={`w-1/2 p-2 rounded-lg font-semibold transition ${isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setMode('register'); setAuthError(null); }}
                        className={`w-1/2 p-2 rounded-lg font-semibold transition ${!isLogin ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-white'}`}
                    >
                        Register
                    </button>
                </div>
                
                {/* Role Selector (Only for Login Presets) */}
                {isLogin && (
                    <div className="flex justify-around space-x-2">
                        {Object.keys(rolePresets).map((roleKey) => (
                            <button
                                key={roleKey}
                                onClick={() => {
                                    setSelectedRole(roleKey);
                                    setAuthError(null);
                                }}
                                className={`w-1/3 p-2 rounded-lg font-medium text-sm transition ${selectedRole === roleKey ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                            </button>
                        ))}
                    </div>
                )}


                {/* Error/Success Display */}
                {authError && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${authError.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {authError.text || 'An unknown error occurred.'} 
                    </div>
                )}

                {/* Form Component */}
                {isLogin ? (
                    <LoginForm
                        onError={setAuthError}
                        initialEmail={preset.email}
                        initialPassword={preset.password}
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