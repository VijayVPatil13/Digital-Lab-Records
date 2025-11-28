// client/src/pages/dashboards/FacultyDashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/common/CourseCard';
import CourseForm from '../../components/forms/CourseForm';
import EnrollmentApproval from '../../components/role-specific/EnrollmentApproval'; // MUST be imported
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FacultyDashboard = () => {
  const { user, fullName, userId } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);

  // Fetch courses (and implicitly re-fetches when enrollment is approved)
  const fetchCourses = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/faculty/courses/taught`); 
      setCourses(response.data.courses || []);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load your courses. Check GET /api/faculty/courses/taught',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = async (courseData) => {
    setMessage(null);

    try {
      // POST to /api/faculty/courses (Faculty-restricted route)
      const response = await api.post('/faculty/courses', {
        name: courseData.name,
        code: courseData.code,
        section: courseData.section,
        description: courseData.description,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Course created successfully!',
      });

      setShowNewCourseForm(false);
      fetchCourses();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error creating course. Check if the course code is unique.';
      setMessage({ type: 'error', text: msg });
      throw error; 
    }
  };

  const handleManageSessions = (course) => {
    navigate(`/faculty/course/${course.code}/sessions`); 
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen rounded-xl">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
        Faculty Dashboard 
      </h1>

      <p className="text-lg text-gray-700 font-medium">
        Welcome, <span className="text-indigo-600 font-bold">{fullName || 'Faculty'}</span>. Manage your courses and pending enrollments.
      </p>

      {/* 🛑 FIX: Ensure the EnrollmentApproval component is rendered here */}
      <div className="py-4">
        <EnrollmentApproval onActionProcessed={fetchCourses} /> 
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewCourseForm((prev) => !prev)}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          {showNewCourseForm ? 'Cancel Creation' : '+ Create New Course'}
        </button>
      </div>

      {showNewCourseForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-indigo-500">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">New Course Details</h2>
          <CourseForm
            onSubmit={handleCreateCourse}
            onCancel={() => setShowNewCourseForm(false)}
          />
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-medium border-l-4 ${
            message.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-400'
              : 'bg-green-50 text-green-800 border-green-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2">Your Courses Taught</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <LoadingSpinner />
        ) : courses.length === 0 ? (
          <div className="col-span-3 bg-white p-8 rounded-xl text-center">
            <p className="text-gray-600 italic text-lg">
              You are not assigned to any courses yet.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.code || course._id}
              course={course}
              role="Faculty"
              onActionClick={handleManageSessions}
              actionLabel="Manage Sessions"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;