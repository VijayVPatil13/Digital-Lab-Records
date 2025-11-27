// client/src/components/common/CourseCard.js

import React from 'react';
import moment from 'moment';

const CourseCard = ({ course, role, onActionClick, actionLabel }) => {
  const { name, code, section, students, createdAt, faculty } = course; 
  
  const instructorName = faculty ? faculty.fullName : 'N/A';
  const studentsCount = students ? students.length : course.studentsCount || 0;

  const buttonStyle = role === 'Faculty' 
    ? 'bg-indigo-500 hover:bg-indigo-600' 
    : 'bg-green-500 hover:bg-green-600';

  const addedDate = moment(createdAt).format('MMM D, YYYY');

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 ${role === 'Faculty' ? 'border-indigo-500' : 'border-green-500'}`}>
      <div className="p-5 space-y-3">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name || "Untitled Course"}</h3>
        
        <div className="flex justify-between text-sm text-gray-600">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
            <span className="font-medium text-gray-700">Sec: {section || 'A'}</span>
        </div>

        <div className="text-sm text-gray-700 space-y-1 pt-2 border-t mt-3">
            <p>Instructor: <span className="font-semibold text-gray-800">{instructorName}</span></p>
            <p>Students: <span className="font-semibold">{studentsCount}</span></p>
            <p className="text-xs text-gray-500">Added: {addedDate}</p>
        </div>


        <div className="mt-4">
          <button
            onClick={() => onActionClick(course)}
            className={`w-full p-3 text-white font-semibold rounded-lg shadow-md transition duration-200 ${buttonStyle}`}
          >
            {actionLabel || 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;