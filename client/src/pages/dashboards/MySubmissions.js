// client/src/pages/dashboards/MySubmissions.js
import React from 'react';
import SubmissionForm from '../../components/forms/SubmissionForm';

const mockLabs = [
  { id: 101, name: 'Titration 1', submitted: true, status: 'Reviewed', endDate: '2026-01-15' },
  { id: 102, name: 'Spectroscopy', submitted: false, status: 'Pending', endDate: '2026-02-01' },
];

const MySubmissions = () => {
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Lab Sessions </h1>
      <p className="text-gray-600">View available labs and manage your submissions.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockLabs.map(lab => (
          <div key={lab.id} className="bg-white p-5 shadow rounded-lg border-t-4 border-cyan-600">
            <h3 className="text-xl font-semibold mb-2">{lab.name}</h3>
            <p className="text-sm text-gray-600 mb-3">Due: {lab.endDate}</p>
            
            {lab.submitted ? (
              <p className="text-green-600 font-medium">Status: {lab.status}</p>
            ) : (
              <SubmissionForm labId={lab.id} submission={{ status: 'Not Submitted' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySubmissions;