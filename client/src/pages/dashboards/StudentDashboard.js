// client/src/pages/dashboards/StudentDashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/common/CourseCard';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner'; 

const StudentDashboard = () => {
  const { user, fullName } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [joinCourseCode, setJoinCourseCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  // CRITICAL FIX: Fetch ONLY courses the student is approved for.
  const fetchEnrolledCourses = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ✅ CORRECT ENDPOINT: GET to /api/student/courses/enrolled 
      // This is the correct, student-role-restricted endpoint.
      const response = await api.get(`/student/courses/enrolled`); 
      
      setCourses(response.data.courses || []);
      setMessage(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load enrolled courses.';
      
      if (error.response?.status === 403) {
          // If a 403 occurs here, it means the token or role check failed, 
          // or the user is somehow trying to access the route as another role.
          setMessage({ 
              type: 'error', 
              text: "Authorization Mismatch: You may have stale token data. Please log out and log back in." 
          });
      } else {
          setMessage({ type: 'error', text: msg });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    setMessage(null);
    setJoinLoading(true);

    if (!joinCourseCode) {
      setMessage({ type: 'error', text: 'Please enter a course code.' });
      setJoinLoading(false);
      return;
    }

    try {
        // POST to /api/student/enroll to request enrollment
        const response = await api.post('/student/enroll', { courseCode: joinCourseCode });
        setMessage({ type: 'success', text: response.data.message });
        
        // Minor delay before refreshing courses to see approved ones (if approved immediately)
        setTimeout(fetchEnrolledCourses, 500); 

    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to submit enrollment request.';
        setMessage({ type: 'error', text: msg });
    } finally {
        setJoinCourseCode('');
        setJoinLoading(false);
    }
  };

  const handleAccessLabs = (course) => {
    // Navigates using the course's CODE for URL lookup
    navigate(`/student/course/${course.code}/labs`); 
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-3 flex items-center">
        Student Dashboard 🎓
      </h1>

      <p className="text-lg text-gray-700">
        Welcome, {fullName || 'Student'}. View your enrolled classes or join a new one.
      </p>

      {/* Message Display (For errors or enrollment status) */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Join Course Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
            <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center">
              <span className="mr-2">🔗</span> Join New Course
            </h2>

            <form onSubmit={handleJoinCourse} className="space-y-4">
              <input
                type="text"
                value={joinCourseCode}
                onChange={(e) => setJoinCourseCode(e.target.value)}
                placeholder="Enter Course Code (e.g., CSL37)"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                disabled={joinLoading}
              />

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {joinLoading ? 'Requesting...' : 'Join Course'}
              </button>
            </form>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Enrolled Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <LoadingSpinner />
            ) : courses.length === 0 ? (
              <p className="col-span-2 text-gray-500 italic">
                You are not enrolled in any approved courses yet.
              </p>
            ) : (
              courses.map((course) => (
                <CourseCard
                  key={course.code || course._id}
                  course={course}
                  role="Student"
                  onActionClick={handleAccessLabs}
                  actionLabel="Access Labs"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;