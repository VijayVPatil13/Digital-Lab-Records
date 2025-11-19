// client/src/pages/dashboards/FacultyDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/common/CourseCard';
import EnrollmentApproval from '../../components/role-specific/EnrollmentApproval'; 
import api from '../../utils/api'; 
import { useNavigate } from 'react-router-dom'; 

const FacultyDashboard = () => {
    const { user, fullName } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [newCourseForm, setNewCourseForm] = useState({ name: '', code: '', section: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const fetchCourses = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/faculty/courses/taught/${user.id}`);
            setCourses(response.data.courses || []);
            setMessage(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load courses.' });
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]); 

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!newCourseForm.name || !newCourseForm.code) {
            setMessage({ type: 'error', text: 'Name and Course ID are required.' });
            return;
        }
        
        try {
            const response = await api.post('/faculty/courses', {
                ...newCourseForm,
                facultyId: user.id 
            });
            
            setMessage({ type: 'success', text: response.data.message || 'Course created successfully!' });
            setNewCourseForm({ name: '', code: '', section: '' });
            fetchCourses(); 
            
        } catch (error) {
            const msg = error.response?.data?.message || `Error creating course.`;
            setMessage({ type: 'error', text: msg });
        }
    };

    const handleManageSessions = (course) => {
        // Navigates to the Session Manager page
        navigate(`/faculty/course/${course.code}/sessions`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-3 flex items-center">
            Faculty Dashboard 🧑‍🏫
          </h1>
          <p className="text-lg text-gray-700">
            Welcome, **{fullName || 'Faculty Member'}**. Manage your courses and enrollments below.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
                  <span className="mr-2">➕</span> Add New Course (Unique ID)
                </h2>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <input
                    type="text"
                    value={newCourseForm.name}
                    onChange={(e) => setNewCourseForm({...newCourseForm, name: e.target.value})}
                    placeholder="Course Name (e.g., Data Structures)"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newCourseForm.code}
                    onChange={(e) => setNewCourseForm({...newCourseForm, code: e.target.value.toUpperCase()})}
                    placeholder="Unique Course ID (e.g., CSL37)"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newCourseForm.section}
                    onChange={(e) => setNewCourseForm({...newCourseForm, section: e.target.value})}
                    placeholder="Section (e.g., D)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    Create Course
                  </button>
                </form>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-600">
                <h2 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                  <span className="mr-2">🔔</span> Pending Enrollment Requests
                </h2>
                <EnrollmentApproval facultyId={user?.id} />
              </div>
            </div>
    
            <div className="lg:col-span-2 space-y-6">
                {message && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                    </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <p className='col-span-2 text-gray-500'>Loading your courses...</p>
                    ) : courses.length === 0 ? (
                        <p className='col-span-2 text-gray-500 italic'>You are not currently teaching any courses. Use the form on the left to create one.</p>
                    ) : (
                        courses.map(course => (
                            <CourseCard 
                                key={course.code} 
                                course={course} 
                                role="Faculty" 
                                onActionClick={handleManageSessions} 
                                actionLabel="Manage Sessions" 
                            />
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      );
};

export default FacultyDashboard;