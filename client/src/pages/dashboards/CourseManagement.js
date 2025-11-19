// client/src/pages/dashboards/CourseManagement.js
import React from 'react';
import AdminEnrollmentForm from '../../components/role-specific/AdminEnrollmentForm';

const CourseManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Course & User Management </h1>
      <p className="text-gray-600">Administrative panel for setting up courses and faculty roles.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-xl font-medium mb-3">Create New Course</h2>
          <input className="border p-2 w-full mb-3" placeholder="Course Name (e.g., 'General Chemistry')" />
          <input className="border p-2 w-full mb-3" placeholder="Course Code (e.g., 'CHEM101')" />
          <button className="bg-blue-600 text-white p-2 rounded">Add Course</button>
        </div>
        
        <AdminEnrollmentForm />
      </div>
    </div>
  );
};

export default CourseManagement;