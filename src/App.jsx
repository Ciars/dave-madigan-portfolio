import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import WorkGrid from './components/WorkGrid';
import Exhibitions from './components/Exhibitions';
import Contact from './components/Contact';
import LoginPage from './admin/LoginPage';
import AdminLayout from './admin/AdminLayout';
import ArtworkManager from './admin/ArtworkManager';
import ExhibitionManager from './admin/ExhibitionManager';
import SubscriberManager from './admin/SubscriberManager';
import Settings from './admin/Settings';
import SiteManager from './admin/SiteManager';
import UserManager from './admin/UserManager';
import ForcePasswordReset from './admin/ForcePasswordReset';

function MainSite() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase.from('site_config').select('header_settings, footer_settings').eq('id', 1).single();
            if (data) setConfig(data);
        };
        fetchConfig();
    }, []);

    const header = config?.header_settings || {};
    const footer = config?.footer_settings || {};

    return (
        <main className="min-h-screen selection:bg-white selection:text-black bg-[#050505]">
            <Navigation title={header.title} />
            <Hero />
            <WorkGrid />
            <About />
            <Exhibitions />
            <Contact footerSettings={footer} />
        </main>
    );
}

const Overview = () => {
    const [stats, setStats] = useState({ artworks: 0, exhibitions: 0, subscribers: 0, topArtworks: [] });
    const [loading, setLoading] = useState(true);
    const [showAllArtworks, setShowAllArtworks] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            const [artworks, exhibitions, subscribers, topArtworks] = await Promise.all([
                supabase.from('artworks').select('id', { count: 'exact', head: true }),
                supabase.from('exhibitions').select('id', { count: 'exact', head: true }),
                supabase.from('subscribers').select('id', { count: 'exact', head: true }),
                supabase.from('artworks').select('title, view_count').order('view_count', { ascending: false }).limit(20)
            ]);

            setStats({
                artworks: artworks.count || 0,
                exhibitions: exhibitions.count || 0,
                subscribers: subscribers.count || 0,
                topArtworks: topArtworks.data || []
            });
            setLoading(false);
        };
        fetchStats();
    }, []);

    const visibleArtworks = showAllArtworks ? stats.topArtworks : stats.topArtworks.slice(0, 10);

    if (loading) return <div className="animate-pulse text-gray-500 font-mono text-xs uppercase tracking-widest">Compiling Studio Data...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl font-serif mb-10 tracking-tight">Studio Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="p-8 bg-[#111111] border border-white/5 rounded-3xl shadow-2xl group hover:border-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Managed Artworks</p>
                    <p className="text-4xl font-serif">{stats.artworks}</p>
                </div>
                <div className="p-8 bg-[#111111] border border-white/5 rounded-3xl shadow-2xl group hover:border-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Exhibitions History</p>
                    <p className="text-4xl font-serif">{stats.exhibitions}</p>
                </div>
                <div className="p-8 bg-[#151515] border border-white/5 rounded-3xl shadow-2xl group hover:border-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Newsletter Sync</p>
                    <p className="text-4xl font-serif">{stats.subscribers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 bg-[#111111] border border-white/5 rounded-3xl shadow-2xl">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 border-b border-white/5 pb-4">Most Popular Artworks</h3>
                    <div className="space-y-6">
                        {visibleArtworks.map((artwork, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-gray-700">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">{artwork.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-serif italic text-white">{artwork.view_count || 0}</span>
                                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">views</span>
                                </div>
                            </div>
                        ))}
                        {stats.topArtworks.length === 0 && <p className="text-xs text-gray-600 italic">No view data collected yet.</p>}

                        {stats.topArtworks.length > 10 && (
                            <button
                                onClick={() => setShowAllArtworks(!showAllArtworks)}
                                className="w-full pt-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors border-t border-white/5"
                            >
                                {showAllArtworks ? 'Show Less' : `Show All (${stats.topArtworks.length})`}
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-[#111111]/50 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-2">Insight Pipeline</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">More conversion metrics will appear here as visitors interact with your gallery.</p>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Site */}
                <Route path="/" element={<MainSite />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />

                {/* Force Password Reset (outside AdminLayout) */}
                <Route path="/admin/force-reset-password" element={<ForcePasswordReset onComplete={() => window.location.href = '/admin'} />} />

                {/* Secure Admin Area */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="dashboard" element={<Overview />} />
                    <Route path="site-content" element={<SiteManager />} />
                    <Route path="artworks" element={<ArtworkManager />} />
                    <Route path="exhibitions" element={<ExhibitionManager />} />
                    <Route path="subscribers" element={<SubscriberManager />} />
                    <Route path="users" element={<UserManager />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
