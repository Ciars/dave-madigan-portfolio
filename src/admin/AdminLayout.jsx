import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Image, Calendar, Users, LogOut, Menu, X, Settings, Globe, UserSquare } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Guard: Check if user is logged in
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            // Check if user needs to reset password
            try {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('must_reset_password')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (!error && profile?.must_reset_password) {
                    navigate('/admin/force-reset-password');
                }
            } catch (error) {
                // Profile might not exist yet for existing users, that's okay
                console.log('No profile found, skipping password reset check');
            }
        };
        checkUser();
    }, [navigate]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/site-content', label: 'Site Content', icon: Globe },
        { path: '/admin/artworks', label: 'Artworks', icon: Image },
        { path: '/admin/exhibitions', label: 'Exhibitions', icon: Calendar },
        { path: '/admin/subscribers', label: 'Subscribers', icon: Users },
        { path: '/admin/users', label: 'Admin Users', icon: UserSquare },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black">
            <Toaster position="top-right" theme="dark" />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 inset-x-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 z-50 px-6 py-4 flex items-center justify-between">
                <span className="font-serif text-xl tracking-tight">Dave Madigan</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-[#111111] border-r border-white/5 flex flex-col z-50 w-72 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 lg:static lg:h-screen lg:inset-auto
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full'}
            `}>
                <div className="p-10 hidden lg:block">
                    <h1 className="font-serif text-3xl tracking-tighter leading-none mb-1">Dave Madigan</h1>
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Studio Management</p>
                </div>

                <div className="p-8 lg:hidden mt-20">
                    <p className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">Navigation</p>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-white text-black shadow-xl shadow-white/5 scale-[1.02]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-6 py-4 text-sm font-medium text-red-500 rounded-xl hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                    <div className="mt-6 px-6">
                        <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">v1.2.0 • Visionary Platform</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-14 pt-28 lg:pt-14 w-full max-w-[100vw] overflow-x-hidden overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

