import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/admin/dashboard');
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                navigate('/admin/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Try password login
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Welcome back!');
            // Navigation happens automatically via onAuthStateChange
        }
        setLoading(false);
    };

    const handleMagicLink = async () => {
        if (!email) {
            toast.error('Please enter your email first.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Check your email for the magic link!');
        }
        setLoading(false);
    }

    return (
        <div className="flex justify-center items-center h-screen bg-[#FDFBF7]">
            <Toaster position="top-center" />
            <div className="w-full max-w-md p-8 md:p-12">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-3xl mb-2">Dave Madigan</h1>
                    <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Portfolio Admin</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                    <h2 className="text-xl font-medium mb-2">Sign in</h2>
                    <p className="mb-8 text-gray-500 text-sm font-light">Enter your email to receive a magic link.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In with Password'}
                        </button>
                    </form>

                    <div className="mt-4 flex flex-col gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
                        </div>
                        <button
                            onClick={handleMagicLink}
                            type="button"
                            className="w-full bg-white border border-gray-200 text-black p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Sign In with Magic Link
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-gray-300">
                    &copy; 2024 Dave Madigan
                </p>
            </div>
        </div>
    );
}
