import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Key, Loader2, AlertCircle } from 'lucide-react';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'list' })
                }
            );

            const { data, error } = await response.json();
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        const toastId = toast.loading('Creating user...');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'create',
                        email: newUserEmail,
                        password: newUserPassword
                    })
                }
            );

            const { data, error } = await response.json();
            if (error) throw error;

            toast.success('User created! Share the credentials manually.', { id: toastId });
            setShowModal(false);
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(`Failed: ${error.message || error}`, { id: toastId });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId, email) => {
        if (!window.confirm(`Delete user "${email}"? This cannot be undone.`)) return;

        const toastId = toast.loading('Deleting user...');
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'delete',
                        userId
                    })
                }
            );

            const { error } = await response.json();
            if (error) throw error;

            toast.success('User deleted', { id: toastId });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(`Failed: ${error.message || error}`, { id: toastId });
        }
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewUserPassword(password);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" size={32} /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif">Admin Users</h2>
                    <p className="text-gray-500 text-sm">Manage admin panel access</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={20} /> Add User
                </button>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-500">Email</th>
                            <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-500">Created</th>
                            <th className="text-right px-6 py-4 text-xs font-bold uppercase text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.must_reset_password ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                            <Key size={12} /> Needs Password Reset
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.email)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-2"
                                        title="Delete user"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    No users yet. Add your first admin user.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-serif mb-6">Add Admin User</h3>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-amber-800">
                                You'll need to manually share the email and temporary password with the new user. They'll be forced to change it on first login.
                            </p>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-black transition-colors"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Temporary Password</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-black transition-colors font-mono text-sm"
                                        placeholder="Enter or generate"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                        title="Generate password"
                                    >
                                        <Key size={18} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
