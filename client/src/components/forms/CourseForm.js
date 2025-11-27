// client/src/components/forms/CourseForm.js
import React, { useState } from 'react';

const CourseForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'code' ? value.toUpperCase().trim() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onCancel(); // Close modal or clear form on success
        } catch (error) {
            // Error handling is managed by the parent component's onSubmit prop
            // Re-throw to allow parent to catch for message display
            throw error; 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Course Name</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Unique Course ID (e.g., CSL37)</label>
                <input 
                    type="text" 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    required 
                    maxLength="10"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md uppercase"
                    disabled={isSubmitting}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating...' : 'Save Course'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;