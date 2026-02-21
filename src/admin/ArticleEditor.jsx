import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Don't forget to import styles

export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [isActive, setIsActive] = useState(false);

    const quillRef = useRef(null);

    useEffect(() => {
        if (isEdit) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setTitle(data.title);
                setSlug(data.slug);
                setContent(data.content || '');
                setIsActive(data.is_active);
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error('Failed to load article');
            navigate('/admin/articles');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from title if editing a new article
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!isEdit) {
            const newSlug = newTitle
                .toLowerCase()
                .replace(/[\s_]+/g, '-')
                .replace(/[^\w-]+/g, '');
            setSlug(newSlug);
        }
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const quillObj = quillRef.current.getEditor();
            const range = quillObj.getSelection(true);

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const toastId = toast.loading('Uploading image...');

            try {
                const { error: uploadError } = await supabase.storage
                    .from('article-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('article-images')
                    .getPublicUrl(fileName);

                // Insert image URL at cursor position
                quillObj.insertEmbed(range.index, 'image', data.publicUrl);
                toast.success('Image uploaded', { id: toastId });
            } catch (error) {
                console.error('Upload Error:', error);
                toast.error('Failed to upload image', { id: toastId });
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim() || !slug.trim()) {
            toast.error('Title and Slug are required');
            return;
        }

        setSaving(true);
        const submitData = {
            title,
            slug,
            content,
            is_active: isActive,
            updated_at: new Date()
        };

        try {
            if (isEdit) {
                const { error } = await supabase
                    .from('articles')
                    .update(submitData)
                    .eq('id', id);
                if (error) throw error;
                toast.success('Article updated successfully');
            } else {
                const { error } = await supabase
                    .from('articles')
                    .insert([submitData]);
                // If unique constraint error on slug
                if (error?.code === '23505') {
                    throw new Error('Slug already exists. Please modify the title or slug.');
                }
                if (error) throw error;
                toast.success('Article created successfully');
                navigate('/admin/articles');
            }
        } catch (error) {
            console.error('Save Error:', error);
            toast.error(error.message || 'Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 flex items-center gap-4">
                <Link to="/admin/articles" className="p-3 bg-white/5 rounded-2xl hover:bg-white text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-serif text-3xl tracking-tight text-white mb-1">
                        {isEdit ? 'Edit Article' : 'Draft New Article'}
                    </h1>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Editorial Studio</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                <div className="bg-[#111111] p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row gap-8 justify-between">
                        <div className="flex-1 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Heading / Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="w-full text-2xl font-serif text-white bg-transparent border-b border-white/20 p-2 pl-0 focus:outline-none focus:border-white transition-colors placeholder-gray-800"
                                    placeholder="Enter visionary title..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">URL Slug</label>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-600 mr-1">/article/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, ''))}
                                        className="flex-1 bg-transparent text-gray-300 font-mono focus:outline-none focus:text-white"
                                        placeholder="url-friendly-slug"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="md:border-l md:border-white/5 md:pl-8 flex flex-col items-start justify-center">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Status & Visibility</label>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-inner ${isActive
                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {isActive ? <><Eye size={18} /> Published</> : <><EyeOff size={18} /> Draft Only</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Section */}
                <div className="bg-[#111111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-[#0A0A0A]">
                        <h3 className="font-serif text-xl tracking-tight text-white mb-2">Editorial Content</h3>
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Supports Rich Text & Direct Image Uploads</p>
                    </div>

                    {/* Add scoping styles for quill to override dark mode defaults naturally */}
                    <div className="quill-dark-theme-wrapper">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .quill-dark-theme-wrapper .ql-toolbar { border-left: none; border-right: none; border-top: none; border-bottom: 1px solid rgba(255,255,255,0.05); background: #0A0A0A; border-radius: 0; padding: 16px; }
                            .quill-dark-theme-wrapper .ql-container { border: none; font-size: 16px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                            .quill-dark-theme-wrapper .ql-editor { min-height: 400px; padding: 2rem; color: #E5E7EB; line-height: 1.8; }
                            .quill-dark-theme-wrapper .ql-editor p { margin-bottom: 1.5em; }
                            .quill-dark-theme-wrapper .ql-editor img { border-radius: 12px; margin: 2rem 0; max-width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                            .quill-dark-theme-wrapper .ql-stroke { stroke: #9CA3AF; }
                            .quill-dark-theme-wrapper .ql-fill { fill: #9CA3AF; }
                            .quill-dark-theme-wrapper .ql-picker-label { color: #9CA3AF; }
                            .quill-dark-theme-wrapper .ql-picker-options { background-color: #111111; border: 1px solid rgba(255,255,255,0.1); }
                            .quill-dark-theme-wrapper .ql-active .ql-stroke { stroke: #FFF !important; }
                            .quill-dark-theme-wrapper .ql-active .ql-fill { fill: #FFF !important; }
                            .quill-dark-theme-wrapper .ql-editor h1, .ql-editor h2 { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; color: white; margin-top: 2em; margin-bottom: 0.5em; letter-spacing: -0.025em; }
                            .quill-dark-theme-wrapper .ql-editor p::placeholder { color: #374151; }
                            .quill-dark-theme-wrapper .ql-editor a { color: white; text-decoration: underline; text-underline-offset: 4px; border-bottom: none; }
                        `}} />
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            placeholder="Start weaving your narrative..."
                        />
                    </div>
                </div>

                <div className="sticky bottom-10 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-white text-black px-12 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:bg-gray-200 hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEdit ? 'Update Editorial' : 'Publish Editorial'}
                    </button>
                </div>
            </form>
        </div>
    );
}
