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
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl">Subscribers</h1>
                    <p className="text-gray-500 mt-1 text-sm">Grow your audience.</p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-black to-zinc-800 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest mb-1">Total Audience</p>
                    <p className="text-5xl font-serif">{String(subscribers.length).padStart(2, '0')}</p>
                </div>
                <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Users size={32} className="text-white" />
                </div>
            </div>

            {/* Actions */}
            <div className="border border-gray-100 bg-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-medium text-lg">Newsletter List</h3>
                    <p className="text-gray-500 text-sm">Copy all email addresses to your clipboard to send a mass update via your email client.</p>
                </div>
                <button
                    onClick={copyAllEmails}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Addresses'}
                </button>
            </div>

            {/* Recent List */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Signups</h4>
                </div>
                <ul className="divide-y divide-gray-50">
                    {subscribers.map(sub => (
                        <li key={sub.id} className="px-6 py-4 flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900">{sub.email}</span>
                            <span className="text-gray-400 font-mono text-xs">{new Date(sub.created_at).toLocaleDateString()}</span>
                        </li>
                    ))}
                    {subscribers.length === 0 && (
                        <li className="px-6 py-8 text-center text-gray-400 text-sm italic">No subscribers yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
