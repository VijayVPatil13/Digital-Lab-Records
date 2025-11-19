// client/src/components/forms/CreateLabForm.js
import React, { useState } from 'react';
// This component should ideally be used inside a modal opened from the CourseCard

const CreateLabForm = ({ courseCode, facultyId }) => {
  const [labName, setLabName] = useState('');
  const [labDate, setLabDate] = useState(''); 
  const [startTime, setStartTime] = useState(''); 
  const [endTime, setEndTime] = useState(''); 
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    // Logic to submit the new lab session time window
    setMessage({ type: 'success', text: `Mock Lab Session set for ${labDate} at ${startTime}` });
  };

  // NOTE: This form is typically used inside a modal when managing a specific course.
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-semibold">Set New Lab Time</h3>
      {/* 1. Lab Title */}
      <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Lab Title" required className="w-full p-2 border rounded-md" />
      
      {/* 2. Lab Date */}
      <input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} required className="w-full p-2 border rounded-md" />

      {/* 3. Time Window */}
      <div className="flex space-x-2">
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-1/2 p-2 border rounded-md" />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-1/2 p-2 border rounded-md" />
      </div>

      <button type="submit" className="w-full p-2 bg-green-600 text-white rounded-md">
        Set Lab Time
      </button>

      {message && (
        <p className={`text-sm mt-3 p-2 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
};

export default CreateLabForm;