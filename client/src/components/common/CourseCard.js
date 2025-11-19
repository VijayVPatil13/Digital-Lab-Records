// client/src/components/common/CourseCard.js
import React from 'react';

const CourseCard = ({ course, role, onActionClick, actionLabel }) => {
  const { name, code, section, facultyName } = course;

  const buttonStyle = role === 'Faculty' 
    ? 'bg-indigo-500 hover:bg-indigo-600' 
    : 'bg-green-500 hover:bg-green-600';

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 ${role === 'Faculty' ? 'border-indigo-500' : 'border-green-500'}`}>
      <div className="p-5">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-lg font-mono text-gray-600 mb-3">ID: **{code}** {section && `| Sec: ${section}`}</p>
        
        {role === 'Student' && facultyName && (
             <p className="text-sm text-gray-500 mb-4">Taught by: **{facultyName}**</p>
        )}

        <div className="mt-4">
          <button
            onClick={() => onActionClick(course)}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md transition duration-200 ${buttonStyle}`}
          >
            {actionLabel || 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;