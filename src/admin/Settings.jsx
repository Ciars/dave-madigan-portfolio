import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Lock, Save, Grid } from 'lucide-react';

export default function Settings() {
    const [headerSettings, setHeaderSettings] = useState({ title: 'Dave Madigan' });
    const [footerSettings, setFooterSettings] = useState({
        email: '',
        instagram_url: '',
        copyright_text: '© 2024 Dave Madigan',
        show_subscribe: true
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [password, setPassword] = useState('');

    // Fetch initial settings
    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('site_config')
                .select('header_settings, footer_settings')
                .eq('id', 1)
                .single();

            if (data) {
                if (data.header_settings) setHeaderSettings(data.header_settings);
                if (data.footer_settings) setFooterSettings(data.footer_settings);
            }
            setFetching(false);
        };
        fetchSettings();
    }, []);

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

    const handleSaveLayout = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('site_config')
            .update({
                header_settings: headerSettings,
                footer_settings: footerSettings
            })
            .eq('id', 1);

        if (error) {
            toast.error('Failed to save settings');
            console.error(error);
        } else {
            toast.success('Layout settings saved');
        }
        setLoading(false);
    };

    if (fetching) return <div className="p-12 text-center text-gray-500 font-mono text-[10px] uppercase tracking-widest">Loading configuration...</div>;

    return (
        <div className="space-y-12 pb-24">
            <div className="mb-12">
                <h1 className="font-serif text-4xl tracking-tight text-white mb-2">Studio Settings</h1>
                <p className="text-gray-500 text-sm">Fine-tune your platform's presence and security.</p>
            </div>

            {/* Layout Configuration */}
            <div className="bg-[#111111] p-10 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl max-w-2xl">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                        <Grid size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl text-white tracking-tight">Identity & Presence</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Layout Configuration</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Header */}
                    <div className="space-y-4 pb-10 border-b border-white/5">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Navigation Header</h4>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Public Site Title</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                value={headerSettings.title || ''}
                                onChange={(e) => setHeaderSettings({ ...headerSettings, title: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Footer Content</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Contact Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                    value={footerSettings.email || ''}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Instagram Path</label>
                                <input
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                    value={footerSettings.instagram_url || ''}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, instagram_url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Legal Attribution</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                value={footerSettings.copyright_text || ''}
                                onChange={(e) => setFooterSettings({ ...footerSettings, copyright_text: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <input
                                id="showSub"
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-white focus:ring-offset-0 focus:ring-white"
                                checked={footerSettings.show_subscribe ?? true}
                                onChange={(e) => setFooterSettings({ ...footerSettings, show_subscribe: e.target.checked })}
                            />
                            <label htmlFor="showSub" className="text-xs font-bold uppercase tracking-widest text-gray-400 cursor-pointer">Display Newsletter Subscription Section</label>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleSaveLayout}
                            disabled={loading}
                            className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
                        >
                            {loading ? 'Processing...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Reset */}
            <div className="bg-[#151515] p-10 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl max-w-md">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                        <Lock size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl text-white tracking-tight">Access Control</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Update Password</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="New Security Key"
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-white outline-none transition-all text-white placeholder-gray-700 font-mono text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!password || loading}
                        className="flex items-center justify-center gap-3 w-full bg-transparent border border-white/10 text-white p-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-20 shadow-xl"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Save size={18} />
                                Refresh Credentials
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
