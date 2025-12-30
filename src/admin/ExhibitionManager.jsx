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
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                    <h1 className="font-serif text-4xl tracking-tight mb-2">Exhibitions</h1>
                    <p className="text-gray-500 text-sm max-w-sm">Curate your professional history and upcoming gallery shows.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(null);
                        setFormData({ title: '', location: '', dates: '', year: new Date().getFullYear().toString(), link: '' });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus size={18} /> New Exhibition
                </button>
            </div>

            {/* Edit/Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-[#111111] p-10 md:p-12 rounded-[2rem] w-full max-w-xl shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="font-serif text-3xl tracking-tight">{isEditing ? 'Edit Exhibition' : 'Log Exhibition'}</h2>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Exhibition Registry</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Exhibition Title</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                        placeholder="Solo Exhibition: Visionary Landscapes"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Year</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Dates</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                            placeholder="Oct - Dec"
                                            value={formData.dates}
                                            onChange={e => setFormData({ ...formData, dates: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Location / Gallery</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                        placeholder="The Royal Academy, London"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3">Reference URL (Optional)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white outline-none transition-all text-white placeholder-gray-700"
                                        placeholder="https://exhibition-link.com"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-6">
                                <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard</button>
                                <button className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 shadow-xl shadow-white/5 transition-all">
                                    {isEditing ? 'Save Changes' : 'Confirm Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List View */}
            <div className="grid gap-6">
                {exhibitions.map(ex => (
                    <div key={ex.id} className="group flex items-center justify-between p-8 bg-[#111111] border border-white/5 rounded-3xl hover:border-white/10 hover:bg-[#151515] transition-all duration-500 shadow-2xl shadow-black/20">
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-4">
                                <span className="font-mono text-xs tracking-tighter text-gray-600 group-hover:text-white transition-colors">{ex.year}</span>
                                <h3 className="font-serif text-2xl tracking-tight text-white">{ex.title}</h3>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-700" /> {ex.location}</div>
                                {ex.dates && <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-700" /> {ex.dates}</div>}
                                {ex.link && <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors"><LinkIcon size={14} /> Ref Available</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <button
                                onClick={() => startEdit(ex)}
                                className="p-3 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                title="Edit Record"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(ex.id)}
                                className="p-3 bg-red-500/5 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                title="Delete Record"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                {exhibitions.length === 0 && !loading && (
                    <div className="text-center py-32 rounded-3xl bg-white/5 border border-dashed border-white/10">
                        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-500">No records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
