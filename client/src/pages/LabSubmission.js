// client/src/pages/LabSubmission.js (Uses isSubmissionOpen)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SubmissionBox = ({ lab, onSubmissionSuccess, onError }) => {
    const { userId, isSubmissionOpen } = useAuth(); // Get global state
    const [code, setCode] = useState(lab.submissionDetails?.submittedCode || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    // submissionDetails is always present in the API response; check submissionId to know if an actual submission exists
    const hasSubmitted = !!lab.submissionDetails?.submissionId;
    
    // Check if current time exceeds endTime
    const isSessionExpired = lab.endTime && moment().isAfter(moment(lab.endTime));
    const isFormDisabled = hasSubmitted || isSubmitting || isSessionExpired; 

    useEffect(() => {
        setCode(lab.submissionDetails?.submittedCode || '');
        setMessage(null); 
    }, [lab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        onError(null);
        
        try {
            if (hasSubmitted) {
                setMessage({ type: 'warning', text: 'You have already submitted this lab.' });
                setIsSubmitting(false);
                return;
            }
            
            const payload = {
                sessionId: lab._id, 
                studentId: userId,
                submittedCode: code
            };
            
            await api.post('/submissions', payload); 
            
            setMessage({ type: 'success', text: 'Lab submitted successfully!' });
            onSubmissionSuccess(); 

        } catch (error) {
            const msg = error.response?.data?.message || 'Error processing submission.';
            onError({ type: 'error', text: msg });
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const gradeDetails = lab.submissionDetails && (
        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
            <p className="font-semibold text-lg text-indigo-800">Grade: {lab.submissionDetails.marks} / {lab.maxMarks}</p>
            <p className="text-sm">Feedback: {lab.submissionDetails.feedback || 'No feedback yet.'}</p>
            <p className="text-xs text-gray-500">Submitted: {moment(lab.submissionDetails.submittedAt).format('MMM D, YYYY h:mm A')}</p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600 space-y-4">
            <h3 className="text-xl font-bold text-green-700">Lab Submission: {lab.title}</h3>
            
            {gradeDetails}

            {/* Global variable check for form visibility/interactivity */}
            {!isSubmissionOpen && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg font-semibold">
                    Submissions are currently closed by the instructor.
                </div>
            )}

            {isSessionExpired && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg font-semibold">
                    This lab session has ended. No more submissions are accepted.
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="Paste your code or lab notes here..."
                    rows="15" 
                    required
                    disabled={isFormDisabled} 
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
                
                <button
                    type="submit"
                    disabled={isFormDisabled} 
                    className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : hasSubmitted ? 'Submitted (Read-Only)' : 'Submit Lab Work'}
                </button>
            </form>
        </div>
    );
};


const LabSessionCard = ({ lab, isSelected, onClick }) => {
    const cardClass = isSelected ? 'bg-green-100 ring-4 ring-green-500' : 'bg-white hover:bg-gray-50';
    const hasGrade = lab.submissionDetails && lab.submissionDetails.marks !== undefined && lab.submissionDetails.marks !== null;
    const statusColor = hasGrade || lab.submissionStatus === 'Submitted' ? 'text-green-600' : 'text-red-600';
    const statusText = hasGrade ? `Graded: ${lab.submissionDetails.marks}/${lab.maxMarks}` : (lab.submissionStatus || 'Pending');

    const start = lab.startTime ? moment(lab.startTime).format('MMM D, YYYY h:mm A') : '—';
    const end = lab.endTime ? moment(lab.endTime).format('MMM D, YYYY h:mm A') : '—';

    return (
        <div 
            onClick={() => onClick(lab)}
            className={`p-4 border rounded-lg cursor-pointer transition ${cardClass}`}
        >
            <p className="font-bold">{lab.title}</p>
            <p className="text-sm text-gray-600">Start: {start}</p>
            <p className="text-sm text-gray-600">End: {end}</p>
            <p className={`text-xs font-semibold ${statusColor}`}>{statusText}</p>
            <p className="text-xs text-gray-500">Max Marks: {lab.maxMarks ?? 'N/A'}</p>
        </div>
    );
};


const LabSubmission = () => {
    const { courseCode } = useParams();
    const [course, setCourse] = useState(null);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLab, setSelectedLab] = useState(null);
    
    const fetchLabsAndSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/student/labs/${courseCode}`);
            const { course, labs } = response.data;
            
            setCourse(course);
            setLabs(labs);

            const newSelection = labs.find(lab => lab._id === selectedLab?._id) || labs[0];
            setSelectedLab(newSelection || null);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load lab sessions.');
        } finally {
            setLoading(false);
        }
    }, [courseCode, selectedLab?._id]);

    useEffect(() => {
        fetchLabsAndSubmissions();
    }, [fetchLabsAndSubmissions]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded max-w-7xl mx-auto">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-green-700 border-b pb-3">
                Lab Submissions for: **{course?.name}** ({courseCode})
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Lab Sessions</h2>
                    {labs.map((lab) => (
                        <LabSessionCard 
                            key={lab._id} 
                            lab={lab} 
                            isSelected={selectedLab?._id === lab._id}
                            onClick={setSelectedLab}
                        />
                    ))}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {selectedLab && (
                        <SubmissionBox 
                            lab={selectedLab} 
                            onSubmissionSuccess={fetchLabsAndSubmissions}
                            onError={setError}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabSubmission;