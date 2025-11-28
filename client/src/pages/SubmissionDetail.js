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
            setMarks(res.data.submission.marks ?? '');
            setFeedback(res.data.submission.feedback ?? '');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load submission.');
        } finally {
            setLoading(false);
        }
    }, [submissionId]);

    useEffect(() => { fetchSubmission(); }, [fetchSubmission]);

    const handleSave = async () => {
        if (marks === '' || isNaN(marks)) {
            setError('Please enter valid marks.');
            return;
        }
        const numericMarks = parseFloat(marks);
        if (submission.session && submission.session.maxMarks && (numericMarks < 0 || numericMarks > submission.session.maxMarks)) {
            setError(`Marks must be between 0 and ${submission.session.maxMarks}`);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const res = await api.put(`/submissions/grade/${submission._id}`, { marks: numericMarks, feedback });
            setSubmission(res.data.submission);
            setError(null);
            // After saving, navigate back to the session review and pass updated submission in state
            const sessionId = res.data.submission.session;
            navigate(`/faculty/session/${sessionId}/review`, { state: { updatedSubmission: res.data.submission } });
            return;
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving grade.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 bg-red-50 text-red-800 rounded-lg max-w-4xl mx-auto border border-red-200">Error: {error}</div>;
    if (!submission) return <div className="p-4 text-gray-600">Submission not found.</div>;

    const student = submission.student || {};
    const session = submission.session || {};
    const course = session.course || submission.course || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen rounded-xl">
            <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">← Back to Review</button>

            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Submission Detail</h1>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Student</h2>
                <p className="text-lg text-gray-700"><span className="font-semibold">{student.firstName} {student.lastName}</span> <span className="text-gray-600">({student.email})</span></p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Session</h2>
                <p className="text-lg font-bold text-gray-900">{session.title}</p>
                <p className="text-gray-700">Course: <span className="font-semibold text-indigo-600">{course.name}</span> ({course.code})</p>
                <p className="text-sm text-gray-600">Start: {session.startTime ? moment(session.startTime).format('MMM D, YYYY h:mm A') : '—'}</p>
                <p className="text-sm text-gray-600">End: {session.endTime ? moment(session.endTime).format('MMM D, YYYY h:mm A') : '—'}</p>
                <p className="text-sm text-gray-700 italic mt-2 bg-gray-50 p-3 rounded">{session.description}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-gray-500">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Submitted Code</h2>
                <pre className="whitespace-pre-wrap p-4 bg-gray-900 text-gray-100 rounded-xl max-h-96 overflow-y-auto font-mono text-sm">{submission.submittedCode || 'No code submitted'}</pre>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg border-t-4 ${
                submission.marks !== undefined && submission.marks !== null && submission.marks >= 0
                    ? 'bg-green-50 border-green-500'
                    : 'bg-yellow-50 border-yellow-500'
            }`}>
                <h2 className="font-bold text-lg mb-3 text-gray-800">Grade Status</h2>
                {submission.marks !== undefined && submission.marks !== null && submission.marks >= 0 ? (
                    <div>
                        <p className="text-3xl font-extrabold text-green-700">{submission.marks}/{session.maxMarks ?? 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-2">✓ Graded</p>
                        {submission.feedback && <p className="text-sm mt-3 italic text-gray-700 bg-white p-3 rounded-lg">Feedback: {submission.feedback}</p>}
                    </div>
                ) : (
                    <div>
                        <p className="text-xl font-bold text-yellow-700">⧗ Pending Review</p>
                        <p className="text-sm text-gray-600 mt-1">This submission has not been graded yet.</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Grading</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Marks (Max: {session.maxMarks ?? 'N/A'})</label>
                        <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                        <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                </div>

                {error && <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

                <div className="pt-3 flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition shadow-md font-semibold">
                        {saving ? 'Saving...' : '✓ Save Grade'}
                    </button>
                    <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition shadow-md font-semibold">
                        ← Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;
