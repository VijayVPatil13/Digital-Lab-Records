// client/src/components/common/Layout.js

import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <Link to="/login" className="text-xl font-bold text-indigo-700">Digital Lab Records</Link>
                {/* NOTE: Replace this placeholder with your actual AuthContext-based Role/Logout component */}
                <div className="text-sm">Role: Faculty | <button className="text-red-600">Logout</button></div>
            </header>
            
            <main className="p-4">
                <Outlet /> {/* Renders the current dashboard/page */}
            </main>
        </div>
    );
};

export default Layout;