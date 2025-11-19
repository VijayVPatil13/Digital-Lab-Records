// client/src/pages/SessionReview.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';

const SessionReview = () => {
    const { sessionId } = useParams();
    const [sessionTitle, setSessionTitle] = useState('');
    const [reviewData, setReviewData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [attendanceChanges, setAttendanceChanges] = useState({});

    const fetchReviewData = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            // Fetch combined data from the backend
            const response = await api.get(`/faculty/sessions/${sessionId}/review`);
            setSessionTitle(response.data.sessionTitle);
            setReviewData(response.data.reviewData);
            
            // Initialize attendance changes map
            const initialAttendance = response.data.reviewData.reduce((acc, item) => {
                acc[item.studentId] = item.attended;
                return acc;
            }, {});
            setAttendanceChanges(initialAttendance);

        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load session review data.' });
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchReviewData();
    }, [fetchReviewData]);

    const handleAttendanceToggle = (studentId, currentStatus) => {
        setAttendanceChanges(prev => ({
            ...prev,
            [studentId]: !currentStatus
        }));
    };

    const handleSaveAttendance = async () => {
        const attendanceUpdates = Object.keys(attendanceChanges).map(studentId => ({
            studentId,
            attended: attendanceChanges[studentId]
        }));

        try {
            const response = await api.put(`/faculty/sessions/${sessionId}/attendance`, { attendanceUpdates });
            setMessage({ type: 'success', text: response.data.message });
            fetchReviewData(); // Refresh data
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save attendance.' });
        }
    };

    if (loading) return <div className="p-4">Loading session review...</div>;
    if (message?.type === 'error') return <div className="p-4 text-red-600">{message.text}</div>;

    // Calculate total attendance and submissions for the footer
    const totalStudents = reviewData.length;
    const attendedCount = reviewData.filter(d => d.attended).length;
    const submittedCount = reviewData.filter(d => d.submitted).length;
    const attendancePercentage = totalStudents > 0 ? (attendedCount / totalStudents * 100).toFixed(1) : 0;


    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-purple-700 border-b pb-2">
                Review: {sessionTitle}
            </h1>
            
            <div className="flex justify-between items-center">
                <button onClick={handleSaveAttendance} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                    Save Attendance Changes
                </button>
                <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Download Report (PDF)
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reviewData.map((data) => (
                            <tr key={data.studentId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={attendanceChanges[data.studentId]} 
                                        onChange={() => handleAttendanceToggle(data.studentId, attendanceChanges[data.studentId])}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <span className={`ml-2 text-sm font-semibold ${attendanceChanges[data.studentId] ? 'text-green-600' : 'text-red-600'}`}>
                                        {attendanceChanges[data.studentId] ? 'Present' : 'Absent'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`font-semibold ${data.submitted ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {data.submitted ? 'Submitted' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {data.submissionTime ? moment(data.submissionTime).format('h:mm A') : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                    {data.grade !== null ? data.grade : 'N/G'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View Code</button>
                                    <button className="text-purple-600 hover:text-purple-900">Grade</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr>
                            <td colSpan="2" className="px-6 py-3 text-sm font-bold text-gray-700">Totals: {totalStudents} Students</td>
                            <td colSpan="1" className="px-6 py-3 text-sm font-bold text-gray-700">Submissions: {submittedCount}</td>
                            <td colSpan="3" className="px-6 py-3 text-right text-sm font-bold text-gray-700">Attendance: {attendedCount} ({attendancePercentage}%)</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SessionReview;