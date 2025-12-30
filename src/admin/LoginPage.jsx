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
        <div className="flex justify-center items-center min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black p-6">
            <Toaster position="top-center" theme="dark" />
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl tracking-tighter mb-2">Dave Madigan</h1>
                    <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-500">Studio Management</p>
                </div>

                <div className="bg-[#111111] p-10 md:p-12 rounded-3xl shadow-2xl border border-white/5">
                    <h2 className="text-2xl font-serif mb-2 tracking-tight">Sign in</h2>
                    <p className="mb-10 text-gray-500 text-sm font-light">Enter your credentials to access the studio.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all text-sm"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all text-sm"
                                type="password"
                                placeholder="Security password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white text-black p-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#111111] px-4 text-gray-600">Alternative</span></div>
                        </div>
                        <button
                            onClick={handleMagicLink}
                            type="button"
                            className="w-full bg-transparent border border-white/10 text-white p-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            Request Magic Link
                        </button>
                    </div>
                </div>

                <p className="text-center mt-12 text-[10px] font-mono text-gray-700 uppercase tracking-widest opacity-50">
                    &copy; {new Date().getFullYear()} Dave Madigan Studio • Visionary platform
                </p>
            </div>
        </div>
    );
}

