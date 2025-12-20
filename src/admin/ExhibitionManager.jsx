import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Edit2, Plus, X, Calendar, MapPin, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ExhibitionManager() {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // ID of item being edited
    const [showForm, setShowForm] = useState(false);

    // Form State (New or Edit)
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        dates: '',
        year: new Date().getFullYear().toString(),
        link: ''
    });

    useEffect(() => {
        fetchExhibitions();
    }, []);

    const fetchExhibitions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('exhibitions')
            .select('*')
            .order('year', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to load exhibitions');
        } else {
            setExhibitions(data || []);
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (isEditing) {
            const { error } = await supabase
                .from('exhibitions')
                .update(formData)
                .match({ id: isEditing });
            if (!error) {
                toast.success('Exhibition updated');
                setIsEditing(null);
                setFormData({ title: '', location: '', dates: '', year: '', link: '' });
                setShowForm(false);
                fetchExhibitions();
            } else {
                toast.error('Update failed');
            }
        } else {
            const { error } = await supabase
                .from('exhibitions')
                .insert([formData]);
            if (!error) {
                toast.success('Exhibition created');
                setFormData({ title: '', location: '', dates: '', year: new Date().getFullYear().toString(), link: '' });
                setShowForm(false);
                fetchExhibitions();
            } else {
                toast.error('Creation failed');
            }
        }
    };

    const startEdit = (ex) => {
        setIsEditing(ex.id);
        setFormData({
            title: ex.title,
            location: ex.location,
            dates: ex.dates,
            year: ex.year,
            link: ex.link
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this exhibition?")) return;
        const { error } = await supabase.from('exhibitions').delete().match({ id });

        if (error) {
            toast.error('Failed to delete exhibition');
        } else {
            toast.success('Exhibition deleted');
            fetchExhibitions();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl">Exhibitions</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your upcoming and past shows.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(null);
                        setFormData({ title: '', location: '', dates: '', year: new Date().getFullYear().toString(), link: '' });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
                >
                    <Plus size={18} /> Add Exhibition
                </button>
            </div>

            {/* Edit/Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">{isEditing ? 'Edit Exhibition' : 'New Exhibition'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Title</label>
                                <input
                                    required
                                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Year</label>
                                    <input
                                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Dates</label>
                                    <input
                                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                                        value={formData.dates}
                                        onChange={e => setFormData({ ...formData, dates: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Location</label>
                                <input
                                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Link URL</label>
                                <input
                                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
                                <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800">
                                    {isEditing ? 'Save Changes' : 'Create Exhibition'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List View */}
            <div className="grid gap-4">
                {exhibitions.map(ex => (
                    <div key={ex.id} className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-3">
                                <span className="font-mono text-sm text-gray-400">{ex.year}</span>
                                <h3 className="font-medium text-lg">{ex.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1"><MapPin size={14} /> {ex.location}</div>
                                {ex.dates && <div className="flex items-center gap-1"><Calendar size={14} /> {ex.dates}</div>}
                                {ex.link && <div className="flex items-center gap-1"><LinkIcon size={14} /> Link</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEdit(ex)}
                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(ex.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {exhibitions.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400">No exhibitions found.</div>
                )}
            </div>
        </div>
    );
}
