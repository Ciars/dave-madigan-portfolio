import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Image, Calendar, Users, LogOut, Menu, X, Settings, Globe } from 'lucide-react';
import { Toaster } from 'sonner';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Guard: Check if user is logged in
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin');
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
        navigate('/admin');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/site-content', label: 'Site Content', icon: Globe },
        { path: '/admin/artworks', label: 'Artworks', icon: Image },
        { path: '/admin/exhibitions', label: 'Exhibitions', icon: Calendar },
        { path: '/admin/subscribers', label: 'Subscribers', icon: Users },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-black selection:text-white">
            <Toaster position="top-right" />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 inset-x-0 bg-white border-b border-gray-100 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
                <span className="font-serif text-lg">Dave Madigan <span className="text-gray-400 font-sans text-xs uppercase tracking-widest ml-1">Admin</span></span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white border-r border-gray-100 flex flex-col z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-auto
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-8 hidden lg:block">
                    <h1 className="font-serif text-2xl tracking-tight">Dave Madigan</h1>
                    <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">Admin Panel</p>
                </div>

                {/* Mobile Menu Title adjustments */}
                <div className="p-6 lg:hidden mt-14">
                    <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Navigation</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-black text-white shadow-lg shadow-black/10'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 lg:p-12 pt-20 lg:pt-12 w-full max-w-[100vw] overflow-x-hidden">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
