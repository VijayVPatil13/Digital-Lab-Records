// client/src/components/common/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            
            <main className="p-4 pt-20">
                <Outlet />
            </main>

            <footer className="p-4 text-center text-sm text-gray-500 border-t mt-8">
                Digital Lab Records System © 2025
            </footer>
        </div>
    );
};

export default Layout;