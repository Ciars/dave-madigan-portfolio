import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Save, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

export default function SiteManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [content, setContent] = useState({
        hero_title: '',
        hero_subtitle: '',
        hero_image_url: ''
    });

    const [newCollectionItem, setNewCollectionItem] = useState('');

    const handleAddCollection = () => {
        if (!newCollectionItem.trim()) return;
        const updated = [...(content.about_collections || []), newCollectionItem.trim()];
        setContent({ ...content, about_collections: updated });
        setNewCollectionItem('');
    };

    const removeCollectionItem = (index) => {
        const updated = [...(content.about_collections || [])];
        updated.splice(index, 1);
        setContent({ ...content, about_collections: updated });
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            <div className="mb-12">
                <h1 className="font-serif text-4xl tracking-tight text-white mb-2">Homepage Composition</h1>
                <p className="text-gray-500 text-sm">Curate the atmospheric elements of your public entrance.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-12">

                {/* Hero Section */}
                <div className="bg-[#111111] p-10 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-4">
                        <div>
                            <h3 className="font-serif text-2xl text-white tracking-tight">Hero Configuration</h3>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Primary Landing Elements</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <ImageIcon size={24} className="text-white" />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">

                        {/* Left: Text Inputs */}
                        <div className="space-y-10">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Visionary Heading</label>
                                <input
                                    type="text"
                                    value={content.hero_title || ''}
                                    onChange={e => setContent({ ...content, hero_title: e.target.value })}
                                    className="w-full text-3xl font-serif text-white bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-white transition-all placeholder-gray-800"
                                    placeholder="Distorting Reality"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Studio Introduction</label>
                                <textarea
                                    rows={6}
                                    value={content.hero_subtitle || ''}
                                    onChange={e => setContent({ ...content, hero_subtitle: e.target.value })}
                                    className="w-full bg-white/5 text-gray-400 leading-relaxed border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-white transition-all resize-none placeholder-gray-800"
                                    placeholder="Exploring the depths of..."
                                />
                            </div>
                        </div>

                        {/* Right: Image Upload */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Atmospheric Imagery</label>

                            <div className="relative group aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-700">
                                        <ImageIcon size={48} />
                                    </div>
                                )}

                                {/* Overlay Upload Button */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <label className="cursor-pointer bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-gray-200 transition-all transform translate-y-4 group-hover:translate-y-0">
                                        Change Atmosphere
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-gray-600 text-center uppercase tracking-widest">Ratio 4:5 Priority • High Resolution</p>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-[#111111] p-10 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-4">
                        <div>
                            <h3 className="font-serif text-2xl text-white tracking-tight">About Page Configuration</h3>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Biography & Collections</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Bio Editor */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Artist Biography</label>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                                <textarea
                                    rows={12}
                                    value={Array.isArray(content.about_bio) ? content.about_bio.join('\n\n') : (content.about_bio || '')}
                                    onChange={e => setContent({ ...content, about_bio: e.target.value.split('\n\n') })}
                                    className="w-full bg-transparent text-gray-300 leading-relaxed p-4 focus:outline-none resize-none placeholder-gray-700"
                                    placeholder="Enter biography paragraphs here. Separate paragraphs with a double line break."
                                />
                                <div className="px-4 py-2 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-widest text-right">
                                    Markdown Supported
                                </div>
                            </div>
                        </div>

                        {/* Collections List */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Notable Collections</label>

                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
                                <div className="max-h-[300px] overflow-y-auto">
                                    {(content.about_collections || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                            <span className="text-sm text-gray-300 font-serif">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCollectionItem(idx)}
                                                className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {(!content.about_collections || content.about_collections.length === 0) && (
                                        <div className="p-8 text-center text-gray-600 text-xs uppercase tracking-widest">
                                            No collections listed
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCollectionItem}
                                    onChange={e => setNewCollectionItem(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCollection())}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white outline-none transition-all placeholder-gray-700"
                                    placeholder="Add new collection..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCollection}
                                    className="px-6 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Save Bar */}
                <div className="sticky bottom-10 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-white text-black px-12 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-200 hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-20 shadow-white/5"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Sync All Content
                    </button>
                </div>

            </form>
        </div>
    );
}
