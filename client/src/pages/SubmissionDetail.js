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
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded max-w-4xl mx-auto">Error: {error}</div>;
    if (!submission) return <div className="p-4">Submission not found.</div>;

    const student = submission.student || {};
    const session = submission.session || {};
    const course = session.course || submission.course || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <button onClick={() => navigate(-1)} className="text-sm text-indigo-600">&larr; Back</button>

            <h1 className="text-2xl font-bold">Submission Detail</h1>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Student</h2>
                <p>{student.firstName} {student.lastName} ({student.email})</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Session</h2>
                <p className="font-bold">{session.title}</p>
                <p>Course: {course.name} ({course.code})</p>
                <p>Start: {session.startTime ? moment(session.startTime).format('MMM D, YYYY h:mm A') : '—'}</p>
                <p>End: {session.endTime ? moment(session.endTime).format('MMM D, YYYY h:mm A') : '—'}</p>
                <p className="text-sm text-gray-600">{session.description}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Submitted Code</h2>
                <pre className="whitespace-pre-wrap p-3 bg-gray-50 rounded max-h-96 overflow-y-auto">{submission.submittedCode || 'No code submitted'}</pre>
            </div>

            <div className={`p-6 rounded shadow border-l-4 ${
                submission.marks !== undefined && submission.marks !== null && submission.marks >= 0
                    ? 'bg-green-50 border-green-500'
                    : 'bg-yellow-50 border-yellow-500'
            }`}>
                <h2 className="font-semibold text-lg mb-2">Grade Status</h2>
                {submission.marks !== undefined && submission.marks !== null && submission.marks >= 0 ? (
                    <div>
                        <p className="text-2xl font-bold text-green-700">{submission.marks}/{session.maxMarks ?? 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-1">Status: Graded</p>
                        {submission.feedback && <p className="text-sm mt-2 italic text-gray-700">Feedback: {submission.feedback}</p>}
                    </div>
                ) : (
                    <div>
                        <p className="text-lg font-semibold text-yellow-700">Pending Review</p>
                        <p className="text-sm text-gray-600 mt-1">This submission has not been graded yet.</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow space-y-3">
                <h2 className="font-semibold">Grading</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Marks (Max: {session.maxMarks ?? 'N/A'})</label>
                        <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Feedback</label>
                        <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full border rounded p-2" />
                    </div>
                </div>

                {error && <div className="text-sm text-red-700">{error}</div>}

                <div className="pt-3">
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Grade'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;
