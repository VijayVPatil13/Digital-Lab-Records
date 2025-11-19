// client/src/pages/dashboards/StudentDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/common/CourseCard';
import api from '../../utils/api'; 
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, fullName } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [joinCourseCode, setJoinCourseCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const fetchCourses = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/student/courses/enrolled/${user.id}`);
            setCourses(response.data.courses || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load enrolled courses.' });
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleJoinCourse = async (e) => {
        e.preventDefault();
        setMessage(null);
        
        if (!joinCourseCode) {
            setMessage({ type: 'error', text: 'Please enter a Unique Course ID.' });
            return;
        }
        
        try {
            const response = await api.post('/student/enroll', {
                courseCode: joinCourseCode.toUpperCase(),
                studentId: user.id 
            });
            
            setMessage({ type: 'success', text: response.data.message || 'Enrollment request sent successfully!' });
            setJoinCourseCode('');
            
        } catch (error) {
            const msg = error.response?.data?.message || `Network error. Could not send request.`;
            setMessage({ type: 'error', text: msg });
        }
    };

    const handleAccessSessions = (course) => {
        // Navigates to the Lab Submission Page
        navigate(`/student/course/${course.code}/labs`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-3 flex items-center">
            Student Dashboard 🎓
          </h1>
          <p className="text-lg text-gray-700">
            Welcome, **{fullName || 'Student'}**. Access your enrolled classes or join a new one.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
                <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center">
                  <span className="mr-2">🔗</span> Join New Course
                </h2>
                <form onSubmit={handleJoinCourse} className="space-y-4">
                  <input
                    type="text"
                    value={joinCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Enter Unique Course ID (e.g., CSL37)"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Join Course
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {message && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                    </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800">Your Enrolled Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <p className='col-span-2 text-gray-500'>Loading your courses...</p>
                    ) : courses.length === 0 ? (
                        <p className='col-span-2 text-gray-500 italic'>You are not enrolled in any courses. Use the form to join one!</p>
                    ) : (
                        courses.map(course => (
                            <CourseCard 
                                key={course.code} 
                                course={course} 
                                role="Student" 
                                onActionClick={handleAccessSessions} 
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