import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const EnrolledStudents = ({ courseCode, section }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get(
                    `/faculty/courses/${courseCode}/${section}/students`
                );
                setStudents(res.data.students || []);
            } catch (err) {
                console.error('Failed to fetch students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [courseCode, section]);

    if (loading) return <LoadingSpinner />;

    if (students.length === 0) {
        return <p className="italic text-gray-500">No enrolled students.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
                <thead className="bg-indigo-100">
                    <tr>
                        <th className="p-2 text-left">USN</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Section</th>

                        {/* ✅ NEW COLUMN */}
                        <th className="p-2 text-left">
                            Assignments Submitted
                        </th>

                        <th className="p-2 text-left">Average Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, i) => (
                        <tr key={i} className="border-t">
                            <td className="p-2">{s.usn}</td>
                            <td className="p-2">{s.name}</td>
                            <td className="p-2">{s.section}</td>

                            {/* ✅ NEW CELL */}
                            <td className="p-2 font-medium">
                                {s.assignmentsSubmitted ?? 0}
                            </td>

                            <td className="p-2 font-semibold">
                                {s.averageMarks}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EnrolledStudents;
