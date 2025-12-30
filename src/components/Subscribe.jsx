import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const Subscribe = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            if (error.code === '23505') {
                setStatus('exists');
            } else {
                setStatus('error');
            }
        } else {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="bento-card bg-[#0a0a0a] text-white max-w-2xl mx-auto p-12 text-center border-white/5">
            <span className="section-label text-gray-600">Newsletter</span>
            <h3 className="text-3xl font-serif mb-4">Join the Mailing List</h3>
            <p className="text-gray-400 mb-8 text-sm font-light">Get clear updates on new exhibitions and available works.</p>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 p-4 bg-[#111111] text-white placeholder-gray-600 rounded-full focus:outline-none focus:bg-[#161616] transition-all font-light text-sm border border-white/5"
                />
                <button
                    disabled={status === 'loading' || status === 'success'}
                    className="bg-white text-black px-8 py-4 rounded-full uppercase text-[10px] font-mono tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                    {status === 'loading' ? 'Processing...' : status === 'success' ? 'Joined' : 'Subscribe'}
                </button>
            </form>

            {status === 'success' && <p className="text-green-500 text-xs mt-6 font-mono uppercase tracking-widest">Thank you for subscribing.</p>}
            {status === 'exists' && <p className="text-amber-500 text-xs mt-6 font-mono uppercase tracking-widest">You are already on the list.</p>}
            {status === 'error' && <p className="text-red-500 text-xs mt-6 font-mono uppercase tracking-widest">Something went wrong.</p>}
        </div>
    );
};

export default Subscribe;
