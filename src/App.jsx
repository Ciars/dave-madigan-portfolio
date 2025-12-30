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

// Placeholder for the Overview Dashboard
const Overview = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-4xl font-serif mb-10 tracking-tight">Studio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#111111] border border-white/5 rounded-3xl shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Managed Artworks</p>
                <p className="text-4xl font-serif">24</p>
            </div>
            <div className="p-8 bg-[#111111] border border-white/5 rounded-3xl shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Exhibitions History</p>
                <p className="text-4xl font-serif">12</p>
            </div>
            <div className="p-8 bg-[#151515] border border-white/5 rounded-3xl shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Newsletter Sync</p>
                <p className="text-4xl font-serif">84</p>
            </div>
        </div>
    </div>
);

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
