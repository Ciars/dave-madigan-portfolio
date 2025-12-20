import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Lock, Save } from 'lucide-react';

export default function Settings() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password updated successfully');
            setPassword('');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-serif">Settings</h2>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Lock size={20} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-lg">Update Password</h3>
                        <p className="text-sm text-gray-500">Set a new password for your account.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!password || loading}
                        className="flex items-center justify-center gap-2 w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : (
                            <>
                                <Save size={18} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
