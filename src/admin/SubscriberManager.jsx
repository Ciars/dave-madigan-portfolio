import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Users, Check } from 'lucide-react';

export default function SubscriberManager() {
    const [subscribers, setSubscribers] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchSubscribers = async () => {
            const { data } = await supabase
                .from('subscribers')
                .select('*')
                .order('created_at', { ascending: false });
            setSubscribers(data || []);
        };
        fetchSubscribers();
    }, []);

    const copyAllEmails = () => {
        const emails = subscribers.map(s => s.email).join(', ');
        navigator.clipboard.writeText(emails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="font-serif text-4xl tracking-tight mb-2 text-white">Subscribers</h1>
                    <p className="text-gray-500 text-sm">Grow your audience and sync with your newsletter.</p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-[#111111] border border-white/5 p-10 rounded-[2rem] shadow-2xl flex items-center justify-between group">
                <div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Audience</p>
                    <p className="text-6xl font-serif text-white">{String(subscribers.length).padStart(2, '0')}</p>
                </div>
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                    <Users size={32} className="text-white opacity-40" />
                </div>
            </div>

            {/* Actions */}
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="font-serif text-xl text-white mb-2">Newsletter Registry</h3>
                    <p className="text-gray-500 text-sm max-w-md">Sync your subscriber list by copying all active email addresses to your clipboard.</p>
                </div>
                <button
                    onClick={copyAllEmails}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied' : 'Sync Addresses'}
                </button>
            </div>

            {/* Recent List */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-5 border-b border-white/5 bg-[#151515]">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Recent Accessions</h4>
                </div>
                <ul className="divide-y divide-white/5">
                    {subscribers.map(sub => (
                        <li key={sub.id} className="px-8 py-5 flex justify-between items-center text-sm group hover:bg-white/5 transition-colors">
                            <span className="font-medium text-white group-hover:translate-x-1 transition-transform">{sub.email}</span>
                            <span className="text-gray-600 font-mono text-[10px] uppercase tracking-tighter">{new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </li>
                    ))}
                    {subscribers.length === 0 && (
                        <li className="px-8 py-12 text-center text-gray-600 text-[10px] font-mono uppercase tracking-widest italic">Awaiting audience...</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
