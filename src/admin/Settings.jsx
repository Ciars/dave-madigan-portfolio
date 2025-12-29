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

    if (fetching) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-3xl font-serif">Settings</h2>

            {/* Layout Configuration */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Grid size={20} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-lg">Layout Configuration</h3>
                        <p className="text-sm text-gray-500">Customize the site header and footer.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-3 pb-6 border-b border-gray-100">
                        <h4 className="font-medium text-sm text-gray-900">Header</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Site Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition-colors"
                                value={headerSettings.title || ''}
                                onChange={(e) => setHeaderSettings({ ...headerSettings, title: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900">Footer</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition-colors"
                                    value={footerSettings.email || ''}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Instagram URL</label>
                                <input
                                    type="url"
                                    className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition-colors"
                                    value={footerSettings.instagram_url || ''}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, instagram_url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Copyright Text</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition-colors"
                                value={footerSettings.copyright_text || ''}
                                onChange={(e) => setFooterSettings({ ...footerSettings, copyright_text: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="showSub"
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                checked={footerSettings.show_subscribe ?? true}
                                onChange={(e) => setFooterSettings({ ...footerSettings, show_subscribe: e.target.checked })}
                            />
                            <label htmlFor="showSub" className="text-sm text-gray-700">Show specific Subscribe Form section</label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSaveLayout}
                            disabled={loading}
                            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Reset */}
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
