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
        <main className="bg-[#050505] min-h-screen text-[#e5e5e5] selection:bg-white selection:text-black">
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
    <div>
        <h2 className="text-3xl font-serif mb-6">Welcome back, Dave.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total Artworks</p>
                <p className="text-3xl font-serif">24</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Exhibitions</p>
                <p className="text-3xl font-serif">12</p>
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

                {/* Admin Auth */}
                <Route path="/admin" element={<LoginPage />} />

                {/* Secure Admin Area */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<Overview />} />
                    <Route path="site-content" element={<SiteManager />} />
                    <Route path="artworks" element={<ArtworkManager />} />
                    <Route path="exhibitions" element={<ExhibitionManager />} />
                    <Route path="subscribers" element={<SubscriberManager />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
