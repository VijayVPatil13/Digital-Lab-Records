// client/src/components/common/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, role, fullName, logout, isSubmissionOpen, setIsSubmissionOpen } = useAuth();
    const navigate = useNavigate();

    const dashboardPath = role ? `/${role.toLowerCase()}/dashboard` : '/login';

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (!user) {
        return (
            <header className="bg-indigo-600 text-white shadow-lg fixed top-0 left-0 w-full z-10">
                <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                    <Link to="/login" className="text-xl font-bold">
                        Digital Lab Records
                    </Link>
                    <Link to="/login" className="px-4 py-1 border border-white rounded hover:bg-white hover:text-indigo-600 transition">
                        Login
                    </Link>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-indigo-600 text-white shadow-lg fixed top-0 left-0 w-full z-10">
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                <Link to={dashboardPath} className="text-xl font-bold">
                    DLR - {role}
                </Link>
                
                <nav className="flex items-center space-x-4">
                    {/* Faculty Toggle Control */}
                    {role === 'Faculty' && (
                         <div className="flex items-center space-x-2 border border-white rounded-md px-3 py-1">
                            <label className="text-sm">Submissions:</label>
                            <button
                                onClick={() => setIsSubmissionOpen(prev => !prev)}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition ${isSubmissionOpen ? 'bg-green-300 text-green-900 hover:bg-green-400' : 'bg-red-300 text-red-900 hover:bg-red-400'}`}
                            >
                                {isSubmissionOpen ? 'OPEN' : 'CLOSED'}
                            </button>
                        </div>
                    )}

                    <Link to={dashboardPath} className="hover:text-indigo-200 transition">
                        Dashboard
                    </Link>
                    
                    <div className="text-sm border-l pl-4 flex items-center space-x-2">
                        <span>**{fullName}** ({role})</span>
                        <button 
                            onClick={handleLogout} 
                            className="text-red-300 hover:text-red-100 transition font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;