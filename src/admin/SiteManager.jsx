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

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching site content:', error);
            // If table is empty (shouldn't be due to SQL insert), valid fallback?
            if (error.code !== 'PGRST116') toast.error('Failed to load content');
        } else if (data) {
            setContent(data);
            setPreviewUrl(data.hero_image_url);
        }
        setLoading(false);
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading('Saving changes...');

        try {
            let joyImageUrl = content.hero_image_url;

            // 1. Upload new image if selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `hero_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('artworks') // Reusing artworks bucket
                    .upload(filePath, selectedImage);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('artworks')
                    .getPublicUrl(filePath);

                joyImageUrl = publicUrlData.publicUrl;
            }

            // 2. Update Database
            const { error: dbError } = await supabase
                .from('site_content')
                .update({
                    hero_title: content.hero_title,
                    hero_subtitle: content.hero_subtitle,
                    hero_image_url: joyImageUrl,
                    updated_at: new Date()
                })
                .eq('id', 1); // Singleton row

            if (dbError) throw dbError;

            toast.success('Site content updated!', { id: toastId });
            setSelectedImage(null);
            // Update local state to reflect finalized URL
            setContent(prev => ({ ...prev, hero_image_url: joyImageUrl }));

        } catch (error) {
            console.error('Error saving content:', error);
            toast.error(`Save failed: ${error.message}`, { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-serif">Site Content</h2>
                <p className="text-gray-500 text-sm">Manage the text and imagery for your homepage.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                {/* Hero Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="font-medium text-lg border-b border-gray-100 pb-4 mb-6">Hero Section</h3>

                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Left: Text Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Main Heading</label>
                                <input
                                    type="text"
                                    value={content.hero_title}
                                    onChange={e => setContent({ ...content, hero_title: e.target.value })}
                                    className="w-full text-2xl font-serif border-b border-gray-200 py-2 focus:outline-none focus:border-black transition-colors"
                                    placeholder="Distorting Reality"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Subtitle / Intro</label>
                                <textarea
                                    rows={4}
                                    value={content.hero_subtitle}
                                    onChange={e => setContent({ ...content, hero_subtitle: e.target.value })}
                                    className="w-full text-gray-600 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-black transition-colors resize-none"
                                    placeholder="Exploring the..."
                                />
                            </div>
                        </div>

                        {/* Right: Image Upload */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold uppercase text-gray-400">Hero Image</label>

                            <div className="relative group aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}

                                {/* Overlay Upload Button */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                        <UploadCloud size={16} /> Change Image
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Recommended: Vertical Portrait (4:5 ratio)</p>
                        </div>
                    </div>
                </div>

                {/* Sticky Save Bar */}
                <div className="sticky bottom-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-medium shadow-xl hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
}
