// client/src/pages/dashboards/AdminDashboard.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Admin Portal ⚙️
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Welcome, **Admin** (User ID: {user?.id || 'Preview Mode'}). This area is protected.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/courses" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500 block">
            <h2 className="text-xl font-medium mb-3 text-blue-800">Course & Enrollment</h2>
            <p className="text-gray-700">Add, edit, and assign Faculty/Students to courses.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;