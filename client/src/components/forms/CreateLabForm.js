import React, { useState } from 'react';
import api from '../../utils/api'; 
import moment from 'moment';

const CreateLabForm = ({ courseCode, section, onSuccess, onError }) => {   // ✅ section added
  const [formData, setFormData] = useState({
      title: '',
      date: moment().utcOffset('+0530').format('YYYY-MM-DDTHH:mm'),
      startTime: moment().utcOffset('+0530').format('YYYY-MM-DDTHH:mm'),
      endTime: moment().utcOffset('+0530').add(2, 'hours').format('YYYY-MM-DDTHH:mm'),
      description: '',
      maxMarks: 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      onError(null);
      
      try {
          const payload = {
              title: formData.title,
              date: formData.date,
              startTime: formData.startTime,
              endTime: formData.endTime,
              description: formData.description,
              maxMarks: parseInt(formData.maxMarks),

              courseCode: courseCode,   // ✅ already present
              section: section,         // ✅ CRITICAL FIX (ADDED)
          };
          
          await api.post('/faculty/sessions', payload);

          onSuccess(`Lab Session '${formData.title}' created successfully!`);
          
          // Reset form
          setFormData({ 
              title: '', 
              date: moment().utcOffset('+0530').format('YYYY-MM-DDTHH:mm'),
              startTime: moment().utcOffset('+0530').format('YYYY-MM-DDTHH:mm'),
              endTime: moment().utcOffset('+0530').add(2, 'hours').format('YYYY-MM-DDTHH:mm'),
              description: '', 
              maxMarks: 10 
          });

      } catch (error) {
          const msg = error.response?.data?.message || 'Failed to create lab session.';
          onError({ type: 'error', text: msg });
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h3 className="text-xl font-bold text-indigo-700">
        Create New Lab Session {section ? `(Section ${section})` : ''}
      </h3>
      
      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lab Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Lab Title (e.g., Introduction to React)"
            required
            className="w-full p-2 border rounded-md"
          />
      </div>
      
      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Date/Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
      </div>

      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
      </div>

      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
      </div>

      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description/Instructions (Optional)"
            rows="3"
            className="w-full p-2 border rounded-md"
          />
      </div>

      <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
          <input
            type="number"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={handleChange}
            placeholder="Max Marks"
            required
            className="w-full p-2 border rounded-md"
            min="1"
          />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full p-3 font-semibold rounded-md transition ${
          isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {isSubmitting ? 'Creating Session...' : 'Set Lab Session'}
      </button>
    </form>
  );
};

export default CreateLabForm;
