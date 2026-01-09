import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Key, Loader2, AlertCircle, X } from 'lucide-react';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Modals state
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        const toastId = toast.loading('Revoking access...');
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
                        userId: userToDelete.id
                    })
                }
            );

            const { error } = await response.json();
            if (error) throw error;

            toast.success('Access revoked', { id: toastId });
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(`Failed: ${error.message || error}`, { id: toastId });
        } finally {
            setIsDeleting(false);
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
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-serif tracking-tight text-white mb-2">Admin Team</h2>
                    <p className="text-gray-500 text-sm">Control access to your studio management platform.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-white/5 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            {/* Users List */}
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#151515] border-b border-white/5 text-white">
                        <tr>
                            <th className="text-left px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Member</th>
                            <th className="text-left px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Security State</th>
                            <th className="text-left px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Joined</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-6 font-medium text-white">{user.email}</td>
                                <td className="px-8 py-6">
                                    {user.must_reset_password ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">
                                            <Key size={12} /> Pending Reset
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-4 py-1.5 bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                                            Verified
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-sm text-gray-500 font-mono text-[11px]">
                                    {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => setUserToDelete(user)}
                                        className="text-gray-600 hover:text-red-500 transition-all p-3 hover:bg-red-500/10 rounded-full"
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-700">Awaiting membership...</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111111] md:rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 md:p-12 border border-white/5 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-serif text-white tracking-tight">Onboard Member</h3>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1 text-left">Identity Management</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><X size={20} /></button>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-10 flex gap-4">
                            <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                            <p className="text-xs text-amber-200/80 leading-relaxed text-left">
                                Important: You must manually share these credentials. The member will be required to establish a permanent security key upon their first entry.
                            </p>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Email Address</label>
                                    <input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                        placeholder="member@visionary.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Ephemeral Password</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newUserPassword}
                                            onChange={(e) => setNewUserPassword(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white font-mono text-sm placeholder-gray-700"
                                            placeholder="Min 8 characters"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white transition-all group"
                                            title="Generate secure key"
                                        >
                                            <Key size={20} className="group-active:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-20 order-1 sm:order-2 active:scale-[0.98] shadow-xl shadow-white/5"
                                >
                                    {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Establish Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6" onClick={() => setUserToDelete(null)}>
                    <div
                        className="bg-[#111111] rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-red-500/20 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                                <Trash2 className="text-red-500" size={32} />
                            </div>

                            <h3 className="text-3xl font-serif text-white mb-3">Revoke Access?</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                You are about to permanently remove <span className="text-white font-medium">{userToDelete.email}</span> from the studio platform. This action cannot be reversed.
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isDeleting}
                                    className="w-full bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-20 shadow-xl shadow-red-500/10"
                                >
                                    {isDeleting ? 'Processing...' : 'Confirm Revocation'}
                                </button>
                                <button
                                    onClick={() => setUserToDelete(null)}
                                    disabled={isDeleting}
                                    className="w-full bg-white/5 text-gray-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
