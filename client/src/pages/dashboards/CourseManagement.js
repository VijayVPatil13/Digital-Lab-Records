// client/src/pages/dashboards/CourseManagement.js (Admin Course List)

import React, { useEffect, useState } from "react";
import api from "../../utils/api"; 
import CourseCard from "../../components/common/CourseCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TabbedContainer from "../../components/common/TabbedContainer";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming GET /api/courses returns all courses (General/Admin endpoint)
      const response = await api.get("/courses"); 
      
      // Map the data to include instructor name for CourseCard
      const mappedCourses = response.data.map(c => ({
        ...c,
        instructorName: c.faculty.fullName || 'Unassigned', // Requires backend to populate 'faculty'
        studentsCount: c.students.length
      }));
      
      setCourses(mappedCourses);
    } catch (err) {
      setError("Failed to load all courses. Check backend /api/courses route.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const CourseList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
            <LoadingSpinner />
        ) : courses.length === 0 ? (
            <p className="italic">No courses found in the system.</p>
        ) : (
            courses.map((course) => (
            <CourseCard 
                key={course.code || course._id} 
                course={course} 
                role="Admin"
                actionLabel="View Details (Admin)" 
                onActionClick={() => alert(`Course: ${course.name} (Code: ${course.code})`)}
            />
            ))
        )}
    </div>
  );

  const tabs = [
    { key: 'list', label: 'All Courses', content: <CourseList /> },
    { key: 'enroll', label: 'Admin Enrollment', content: <AdminEnrollmentForm /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-blue-700 border-b pb-3">Course Management</h1>
      
      {error && <div className="p-4 bg-red-100 text-red-800 rounded">{error}</div>}
      
      <TabbedContainer tabs={tabs} />
    </div>
  );
};

export default CourseManagement;