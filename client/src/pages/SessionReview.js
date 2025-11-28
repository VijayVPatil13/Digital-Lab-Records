// client/src/pages/SessionReview.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ReviewTable = ({ studentData, session, onGrade, navigate }) => {
    // Local state to manage grade changes before saving to server
    const [grades, setGrades] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Initialize grades state from fetched submission data
        const initialGrades = {};
        studentData.forEach(item => {
            initialGrades[item.student._id] = {
                marks: item.submission.marks || 0,
                feedback: item.submission.feedback || '',
                submissionId: item.submission._id,
                hasSubmitted: item.hasSubmitted,
                isSubmitting: false,
            };
        });
        setGrades(initialGrades);
    }, [studentData]);

    const handleChange = (studentId, field, value) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleGradeSubmission = async (studentId) => {
        const gradeInfo = grades[studentId];
        
        if (!gradeInfo.hasSubmitted || !gradeInfo.submissionId) {
            setMessage({ type: 'error', text: `Student has no submission to grade.` });
            return;
        }

        if (gradeInfo.marks < 0 || gradeInfo.marks > session.maxMarks) {
            setMessage({ type: 'error', text: `Marks must be between 0 and ${session.maxMarks}.` });
            return;
        }

        setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], isSubmitting: true } }));
        setMessage(null);

        try {
            // PUT to /api/submissions/grade/:submissionId
            const response = await api.put(`/submissions/grade/${gradeInfo.submissionId}`, {
                marks: parseFloat(gradeInfo.marks),
                feedback: gradeInfo.feedback
            });
            setMessage({ type: 'success', text: `Grade saved for ${studentData.find(s => s.student._id === studentId).student.fullName}.` });
            onGrade(studentId, response.data.submission);

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving grade.' });
        } finally {
            setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], isSubmitting: false } }));
        }
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                </div>
            )}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks (Max: {session.maxMarks})</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentData.map(item => {
                            const studentId = item.student._id;
                            const gradeInfo = grades[studentId] || {};

                            return (
                                <tr key={studentId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.student.fullName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.hasSubmitted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.hasSubmitted ? 'Submitted' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <input
                                            type="number"
                                            value={gradeInfo.marks}
                                            onChange={(e) => handleChange(studentId, 'marks', e.target.value)}
                                            min="0"
                                            max={session.maxMarks}
                                            disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                            className="w-16 border rounded p-1 text-center"
                                        />
                                    </td>
                                    {/* Feedback */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <input
                                            type="text"
                                            value={gradeInfo.feedback}
                                            onChange={(e) => handleChange(studentId, 'feedback', e.target.value)}
                                            disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                            placeholder="Add feedback"
                                            className="w-full border rounded p-1"
                                        />
                                    </td>
                                    {/* Action */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleGradeSubmission(studentId)}
                                                disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                                className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {gradeInfo.isSubmitting ? 'Saving...' : 'Save Grade'}
                                            </button>

                                            <button
                                                onClick={() => item.submission && item.submission._id && navigate(`/faculty/submission/${item.submission._id}`)}
                                                disabled={!item.hasSubmitted}
                                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                Open
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SessionReview = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [reviewList, setReviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();

    const fetchReviewData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/faculty/review/${sessionId}`);
            setSession(response.data.session);
            // If navigation state contains an updatedSubmission, merge it into the returned reviewList
            const returnedList = response.data.reviewList || [];
            const updatedSubmission = location.state?.updatedSubmission;
            if (updatedSubmission) {
                const merged = returnedList.map(item => {
                    if (item.submission && String(item.submission._id) === String(updatedSubmission._id)) {
                        return { ...item, submission: updatedSubmission, hasSubmitted: true };
                    }
                    return item;
                });
                setReviewList(merged);
                // Replace history state so this only applies once
                try { navigate(`/faculty/session/${sessionId}/review`, { replace: true }); } catch(e) {}
            } else {
                setReviewList(returnedList);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load session review data.');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchReviewData();
    }, [fetchReviewData]);
    
    const updateReviewListOnGrade = (studentId, updatedSubmission) => {
        setReviewList(prevList => prevList.map(item => {
            if (item.student._id === studentId) {
                return { 
                    ...item, 
                    submission: updatedSubmission,
                    hasSubmitted: true
                };
            }
            return item;
        }));
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded max-w-6xl mx-auto">Error: {error}</div>;
    if (!session) return <div className="text-center">Session not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-indigo-700">
                Review Session: {session.title}
            </h1>
            <p className="text-gray-600">Course: {session.course.name} ({session.course.code}) | Date: {moment(session.date).format('MMM D, YYYY h:mm A')}</p>
            <p className="text-sm border-l-4 border-indigo-500 pl-3 italic">{session.description}</p>
            
            <ReviewTable studentData={reviewList} session={session} onGrade={updateReviewListOnGrade} navigate={navigate} />
        </div>
    );
};

export default SessionReview;