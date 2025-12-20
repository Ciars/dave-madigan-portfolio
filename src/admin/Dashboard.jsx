import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ArtworkManager from './ArtworkManager';
import ExhibitionManager from './ExhibitionManager';
// import MailingList from './MailingList'; // We'll add this later

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [currentView, setCurrentView] = useState('artworks');
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate('/admin');
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate('/admin');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    if (!session) {
        return <div className="p-10">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tighter">ADMIN</h2>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setCurrentView('artworks')}
                        className={`w-full text-left px-4 py-2 rounded ${currentView === 'artworks' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                        Artworks
                    </button>
                    <button
                        onClick={() => setCurrentView('exhibitions')}
                        className={`w-full text-left px-4 py-2 rounded ${currentView === 'exhibitions' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                        Exhibitions
                    </button>
                    {/* <button
            onClick={() => setCurrentView('subscribers')}
            className={`w-full text-left px-4 py-2 rounded ${currentView === 'subscribers' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Mailing List
          </button> */}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {currentView === 'artworks' && <ArtworkManager />}
                {currentView === 'exhibitions' && <ExhibitionManager />}
            </main>
        </div>
    );
}
