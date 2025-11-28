import React, { useState } from 'react';
import api from '../../utils/api';

const AdminDashboard = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const res = await api.post('/auth/register-admin', form);
            setMessage({ type: 'success', text: res.data.message });
            setForm({ fullName: '', email: '', password: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create admin.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>
            <p className="text-gray-600">Create Admin Accounts</p>

            {message && (
                <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleCreateAdmin} className="bg-white p-6 rounded shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full p-3 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full p-3 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full p-3 border rounded" />
                </div>

                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                    {loading ? 'Creating...' : 'Create Admin'}
                </button>
            </form>
        </div>
    );
};

export default AdminDashboard;
