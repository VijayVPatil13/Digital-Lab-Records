// client/src/pages/dashboards/LabReview.js
import React, { useState } from 'react';
import FacultyReviewModal from '../../components/role-specific/FacultyReviewModal';

const mockSubmissions = [
  { id: 1, student: 'Alice Smith', lab: 'Titration 1', text: 'The titration result was very precise...', grade: null },
  { id: 2, student: 'Bob Johnson', lab: 'Spectroscopy', text: 'I observed absorption at 450nm and 600nm...', grade: 'A-' },
];

const LabReview = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Pending Lab Submissions </h1>
      <p className="text-gray-600">Select a submission to grade and provide feedback.</p>
      
      <div className="bg-white shadow rounded-lg">
        {mockSubmissions.map(sub => (
          <div key={sub.id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50">
            <div>
              <p className="font-semibold">{sub.lab} - {sub.student}</p>
              <p className="text-sm text-gray-500">{sub.text.substring(0, 70)}...</p>
            </div>
            {sub.grade ? (
                <span className="text-sm text-green-600 font-bold">Graded ({sub.grade})</span>
            ) : (
                <button 
                  onClick={() => setSelectedSubmission(sub)}
                  className="bg-yellow-600 text-white p-2 rounded text-sm hover:bg-yellow-700"
                >
                  Review
                </button>
            )}
          </div>
        ))}
      </div>

      <FacultyReviewModal 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

export default LabReview;