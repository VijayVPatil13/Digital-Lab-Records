import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SubmissionDetail = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchSubmission = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/submissions/id/${submissionId}`);
            setSubmission(res.data.submission);
            setMarks(res.data.submission.isReviewed ? res.data.submission.marks : '');
            setFeedback(res.data.submission.feedback ?? '');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load submission.');
        } finally {
            setLoading(false);
        }
    }, [submissionId]);

    useEffect(() => { fetchSubmission(); }, [fetchSubmission]);

    const handleSave = async () => {
        if (marks === '' && feedback.trim() === '') {
            return; 
        }

        if (marks !== '' && isNaN(marks)) {
            setError('Please enter valid numeric marks.');
            return;
        }

        if (marks === '') {
            return; 
        }

        const numericMarks = marks !== '' ? parseFloat(marks) : null;

        if (
            numericMarks !== null &&
            submission.session &&
            submission.session.maxMarks &&
            (numericMarks < 0 || numericMarks > submission.session.maxMarks)
        ) {
            setError(`Marks must be between 0 and ${submission.session.maxMarks}`);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await api.put(`/submissions/grade/${submission._id.toString()}`, { 
                marks: numericMarks, 
                feedback 
            });

            setSubmission(res.data.submission);

            const sessionId = res.data.submission.session._id;
            navigate(`/faculty/session/${sessionId}/review`, {
                state: { updatedSubmission: res.data.submission }
            });


        } catch (err) {
            setError(err.response?.data?.message || 'Error saving grade.');
        } finally {
            setSaving(false);
        }
    };


    const handleClear = () => {
        setMarks('');
        setFeedback('');
        setError(null);
    };


    if (loading) return <LoadingSpinner />;
    if (!submission) return <div className="p-4 text-gray-600">Submission not found.</div>;

    const student = submission.student || {};
    const session = submission.session || {};
    const course = session.course || submission.course || {};

    const isSaveDisabled = marks === '';

    return (
        <div className="max-w-7xl mx-auto p-4 min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
            >
                ← Back to Review
            </button>

            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Submission Detail
            </h1>

            {/* MAIN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Student Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Student</h2>
                        <p className="text-gray-700 text-lg font-semibold">
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-800">{student.usn}</p>
                    </div>

                    {/* Session Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Session</h2>
                        <p className="font-semibold text-gray-900">{session.title}</p>
                        <p className="text-sm text-gray-700">
                            Course: <span className="font-semibold text-indigo-600">{course.name}</span> ({course.code})
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Start: {session.startTime ? moment(session.startTime).format('MMM D, YYYY h:mm A') : '—'}
                        </p>
                        <p className="text-sm text-gray-600">
                            End: {session.endTime ? moment(session.endTime).format('MMM D, YYYY h:mm A') : '—'}
                        </p>
                        {session.description && (
                            <p className="text-sm text-gray-700 italic mt-3 bg-gray-50 p-3 rounded">
                                {session.description}
                            </p>
                        )}
                    </div>

                    {/* Grade Status */}
                    <div
                        className={`p-6 rounded-2xl shadow-lg border-l-4 ${
                            submission.isReviewed
                                ? 'bg-green-50 border-green-500'
                                : 'bg-yellow-50 border-yellow-500'
                        }`}
                    >
                        <h2 className="font-bold text-lg text-gray-800 mb-2">Grade Status</h2>
                        {submission.isReviewed ? (
                            <>
                                <p className="text-3xl font-extrabold text-green-700">
                                    {submission.marks}/{session.maxMarks ?? 'N/A'}
                                </p>
                                {submission.feedback && (
                                    <p className="text-sm mt-3 italic bg-white p-3 rounded-lg">
                                        Feedback: {submission.feedback}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-yellow-700 font-semibold">⧗ Pending Review</p>
                        )}
                    </div>

                    {/* Grading Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Grading</h2>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Marks (Max: {session.maxMarks ?? 'N/A'})
                            </label>
                            <input
                                type="number"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Feedback
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || marks === ''}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-semibold shadow"
                            >
                                {saving ? 'Saving...' : '✓ Save Grade'}
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold shadow"
                            >
                                ✕ Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN — SUBMISSION CODE */}
                <div className="lg:col-span-7">
                    <div className="sticky top-4 h-[calc(100vh-2rem)] bg-gray-900 rounded-2xl shadow-xl flex flex-col">
                        <div className="px-5 py-3 border-b border-gray-700 text-gray-100 font-bold">
                            Submitted Code
                        </div>

                        <pre className="flex-1 overflow-y-auto p-5 text-sm text-gray-100 font-mono whitespace-pre-wrap">
                            {submission.submittedCode || 'No code submitted'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;
