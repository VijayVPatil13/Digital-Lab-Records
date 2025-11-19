// client/src/components/role-specific/FacultyReviewModal.js
import React from 'react';

const FacultyReviewModal = ({ submission, onClose }) => {
  if (!submission) return null;
  
  // Logic to handle PATCH to /api/faculty/review/:subId
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-4">Review Submission #{submission.id}</h3>
        <p className="mb-4">Student Work: **{submission.text.substring(0, 50)}...**</p>
        <input className="border p-2 w-full mb-3" placeholder="Grade (e.g., A+, 95%)" />
        <textarea className="border p-2 w-full h-24 mb-4" placeholder="Feedback for student"></textarea>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-300 p-2 rounded">Cancel</button>
          <button className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700">Submit Review</button>
        </div>
      </div>
    </div>
  );
};

export default FacultyReviewModal;