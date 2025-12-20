import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const Subscribe = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                setStatus('exists');
            } else {
                setStatus('error');
            }
        } else {
            setStatus('success');
            setEmail('');
        }
    };

    return (
        <div className="mt-12 p-8 border border-white/10 bg-[#111111] max-w-xl mx-auto text-center">
            <h3 className="text-xl font-serif mb-4 text-white">Join the Mailing List</h3>
            <p className="text-gray-400 mb-6 text-sm">Get clear updates on new exhibitions and available works.</p>

            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
                <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 p-2 bg-[#050505] text-white border border-white/10 focus:border-white outline-none transition-colors"
                />
                <button
                    disabled={status === 'loading' || status === 'success'}
                    className="bg-white text-black px-6 py-2 uppercase text-xs tracking-widest hover:bg-gray-200 disabled:opacity-50"
                >
                    {status === 'loading' ? '...' : status === 'success' ? 'Joined' : 'Join'}
                </button>
            </form>

            {status === 'success' && <p className="text-green-600 text-xs mt-4">Thank you for subscribing.</p>}
            {status === 'exists' && <p className="text-amber-600 text-xs mt-4">You are already on the list.</p>}
            {status === 'error' && <p className="text-red-600 text-xs mt-4">Something went wrong. Please try again.</p>}
        </div>
    );
};

export default Subscribe;
