import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ReviewTable = ({ studentData, session, onGrade, navigate }) => {
    const [grades, setGrades] = useState({});
    const [message, setMessage] = useState(null);

    // ✅ NEW STATES FOR BULK GRADE (NON-BREAKING)
    const [bulkMarks, setBulkMarks] = useState('');
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    useEffect(() => {
        const initialGrades = {};

        studentData.forEach(item => {
            const submission = item.submission || {};
            const marksVal = submission.marks ?? '';
            const isGraded = !!submission.isReviewed;

            initialGrades[item.student._id] = {
                marks: marksVal,
                feedback: submission.feedback || '',
                submissionId: submission._id,
                hasSubmitted: !!item.hasSubmitted,
                isGraded,
                isSubmitting: false,
            };
        });

        setGrades(initialGrades);
    }, [studentData]);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    const handleChange = (studentId, field, value) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    // ✅ ORIGINAL INDIVIDUAL GRADING (UNCHANGED)
    const handleGradeSubmission = async (studentId) => {
        const gradeInfo = grades[studentId];

        if (!gradeInfo.hasSubmitted || !gradeInfo.submissionId) {
            setMessage({ type: 'error', text: 'Student has no submission to grade.' });
            return;
        }

        if (gradeInfo.marks === '' || isNaN(gradeInfo.marks)) {
            setMessage({ type: 'error', text: 'Please enter numeric marks.' });
            return;
        }

        const numericMarks = parseFloat(gradeInfo.marks);

        if (numericMarks < 0 || numericMarks > session.maxMarks) {
            setMessage({ type: 'error', text: `Marks must be between 0 and ${session.maxMarks}.` });
            return;
        }

        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], isSubmitting: true }
        }));

        try {
            const response = await api.put(`/submissions/grade/${gradeInfo.submissionId}`, {
                marks: numericMarks,
                feedback: gradeInfo.feedback
            });

            setMessage({
                type: 'success',
                text: `Marks saved for ${
                    studentData.find(s => s.student._id === studentId).student.fullName
                }`
            });

            onGrade(studentId, response.data.submission);

            setGrades(prev => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    marks: response.data.submission.marks,
                    feedback: response.data.submission.feedback || '',
                    isGraded: true,
                    isSubmitting: false,
                }
            }));

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error saving grade.'
            });
            setGrades(prev => ({
                ...prev,
                [studentId]: { ...prev[studentId], isSubmitting: false }
            }));
        }
    };

    // ✅✅✅ NEW: BULK GRADE (NON-BREAKING ADDITION)
    const handleGradeAll = async () => {
        if (bulkMarks === '' || isNaN(bulkMarks)) {
            setMessage({ type: 'error', text: 'Enter valid marks first.' });
            return;
        }

        const numericMarks = Number(bulkMarks);

        if (numericMarks < 0 || numericMarks > session.maxMarks) {
            setMessage({ type: 'error', text: `Marks must be between 0 and ${session.maxMarks}` });
            return;
        }

        const studentsToGrade = studentData.filter(
            item => item.hasSubmitted && !item.submission?.isReviewed
        );

        if (studentsToGrade.length === 0) {
            setMessage({ type: 'error', text: 'No submitted students to grade.' });
            return;
        }

        setIsBulkSubmitting(true);

        try {
            await Promise.all(
                studentsToGrade.map(item =>
                    api.put(`/submissions/grade/${item.submission._id}`, {
                        marks: numericMarks,
                        feedback: ''
                    })
                )
            );

            studentsToGrade.forEach(item => {
                onGrade(item.student._id, {
                    ...item.submission,
                    marks: numericMarks,
                    isReviewed: true
                });
            });

            setMessage({
                type: 'success',
                text: 'Graded All Students with Submitted Status'
            });

            setBulkMarks('');

        } catch (error) {
            setMessage({ type: 'error', text: 'Bulk grading failed.' });
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">

            {/* ✅ ORIGINAL MESSAGE BANNER */}
            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium border-l-4 ${
                    message.type === 'error'
                        ? 'bg-red-50 text-red-800 border-red-400'
                        : 'bg-green-50 text-green-800 border-green-400'
                }`}>
                    {message.text}
                </div>
            )}

            {/* ✅ ORIGINAL TABLE (UNCHANGED) */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Marks (Max: {session.maxMarks})</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Feedback</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {studentData.map(item => {
                            const studentId = item.student._id;
                            const gradeInfo = grades[studentId] || {};

                            const status = gradeInfo.isGraded
                                ? 'graded'
                                : gradeInfo.hasSubmitted
                                ? 'submitted'
                                : 'pending';

                            const cls =
                                status === 'graded'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'submitted'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-yellow-100 text-yellow-800';

                            const text =
                                status === 'graded'
                                    ? 'Graded'
                                    : status === 'submitted'
                                    ? 'Submitted'
                                    : 'Pending';

                            return (
                                <tr key={studentId} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.student.fullName}
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}>
                                            {text}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <input
                                            type="number"
                                            value={gradeInfo.marks}
                                            onChange={(e) => handleChange(studentId, 'marks', e.target.value)}
                                            min="0"
                                            max={session.maxMarks}
                                            disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                            className="w-20 border border-gray-300 rounded-lg p-2 text-center focus:ring-2 focus:ring-indigo-500 transition"
                                        />
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <input
                                            type="text"
                                            value={gradeInfo.feedback}
                                            onChange={(e) => handleChange(studentId, 'feedback', e.target.value)}
                                            disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                            placeholder="Add feedback"
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition"
                                        />
                                    </td>

                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleGradeSubmission(studentId)}
                                                disabled={!item.hasSubmitted || gradeInfo.isSubmitting}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
                                            >
                                                {gradeInfo.isSubmitting ? 'Saving...' : 'Save'}
                                            </button>

                                            <button
                                                onClick={() =>
                                                    item.submission &&
                                                    item.submission._id &&
                                                    navigate(`/faculty/submission/${item.submission._id}`)
                                                }
                                                disabled={!item.hasSubmitted}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition disabled:opacity-50 shadow-md"
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

            {/* ✅✅✅ NEW "GRADE ALL" SECTION ADDED AT THE END (NON-BREAKING) */}
            <div className="flex justify-end items-center space-x-3 pt-4 border-t">
                <input
                    type="number"
                    value={bulkMarks}
                    onChange={(e) => setBulkMarks(e.target.value)}
                    placeholder="Enter Marks"
                    min="0"
                    max={session.maxMarks}
                    className="w-32 border border-gray-300 rounded-lg p-2 text-center"
                />

                <button
                    onClick={handleGradeAll}
                    disabled={isBulkSubmitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-md"
                >
                    {isBulkSubmitting ? 'Grading...' : 'Grade All'}
                </button>
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

            const returnedList = response.data.reviewList || [];
            const updatedSubmission = location.state?.updatedSubmission;

            if (updatedSubmission) {
                const merged = returnedList.map(item => {
                    if (item.submission && String(item.submission._id) === String(updatedSubmission._id)) {
                        return {
                            ...item,
                            submission: { ...updatedSubmission, isReviewed: true },
                            hasSubmitted: true
                        };
                    }
                    return item;
                });

                setReviewList(merged);
                navigate(`/faculty/session/${sessionId}/review`, { replace: true });

            } else {
                setReviewList(returnedList);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load session review data.');
        } finally {
            setLoading(false);
        }
    }, [sessionId, navigate, location.state]);

    useEffect(() => {
        fetchReviewData();
    }, [fetchReviewData]);

    const updateReviewListOnGrade = (studentId, updatedSubmission) => {
        setReviewList(prevList =>
            prevList.map(item =>
                item.student._id === studentId
                    ? { ...item, submission: updatedSubmission, hasSubmitted: true }
                    : item
            )
        );
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 bg-red-50 text-red-800 rounded-lg max-w-6xl mx-auto border border-red-200">Error: {error}</div>;
    if (!session) return <div className="text-center text-gray-600">Session not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen rounded-xl">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Review Session: {session.title}
            </h1>

            <ReviewTable
                studentData={reviewList}
                session={session}
                onGrade={updateReviewListOnGrade}
                navigate={navigate}
            />
        </div>
    );
};

export default SessionReview;
