import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function ForcePasswordReset({ onComplete }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setUpdating(true);
        const toastId = toast.loading('Updating password...');

        try {
            // Update password
            const { error: passwordError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (passwordError) throw passwordError;

            // Update profile to clear must_reset_password flag
            const { data: { user } } = await supabase.auth.getUser();
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({ must_reset_password: false })
                .eq('id', user.id);

            if (profileError) throw profileError;

            toast.success('Password updated successfully!', { id: toastId });
            onComplete();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(`Failed: ${error.message}`, { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                        <Lock className="text-amber-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-serif mb-2">Password Reset Required</h1>
                    <p className="text-gray-600">You must change your temporary password before continuing.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                    <p className="text-sm text-amber-800">
                        Create a strong password with at least 8 characters.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="Enter new password"
                            required
                            minLength={8}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                        />
                    </div>

                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                    )}

                    <button
                        type="submit"
                        disabled={updating || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
