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

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [message]);


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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen rounded-xl">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
        Student Dashboard 
      </h1>
      <p className="text-lg text-gray-700 font-medium">
        Welcome, <span className="text-green-600 font-bold">{fullName || 'Student'}</span>. View your enrolled classes or join a new one.
      </p>

      {/* Message Display (For errors or enrollment status) */}
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

      <div className="space-y-8">

        {/* Join Course Section */}
        <div className="w-full">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-3 text-2xl">🔗</span> Join New Course
            </h2>

            <form onSubmit={handleJoinCourse} className="space-y-4">
              <input
                type="text"
                value={joinCourseCode}
                onChange={(e) => setJoinCourseCode(e.target.value)}
                placeholder="Enter Course Code (e.g., CSL37)"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                disabled={joinLoading}
              />

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full p-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 shadow-md"
              >
                {joinLoading ? 'Requesting...' : 'Join Course'}
              </button>
            </form>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="w-full space-y-4">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
            Enrolled Courses
          </h2>

          <div>
            {loading ? (
              <LoadingSpinner />
            ) : courses.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center">
                <p className="text-gray-600 italic text-lg">
                  You are not enrolled in any approved courses yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.code || course._id}
                    course={course}
                    role="Student"
                    onActionClick={handleAccessLabs}
                    actionLabel="Access Labs"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;