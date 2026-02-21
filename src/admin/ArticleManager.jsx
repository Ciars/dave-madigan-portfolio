import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, Loader2, Link as LinkIcon } from 'lucide-react';

export default function ArticleManager() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('articles')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Article ${!currentStatus ? 'published' : 'hidden'}`);
            setArticles(articles.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update article status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this article? This cannot be undone.')) return;

        try {
            setDeletingId(id);
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Article deleted');
            setArticles(articles.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error('Failed to delete article');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="font-serif text-4xl tracking-tight text-white mb-2">Editorials</h1>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Manage Articles and Publications</p>
                </div>
                <Link
                    to="/admin/articles/new"
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-xl"
                >
                    <Plus size={16} />
                    New Article
                </Link>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {articles.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <FileText size={48} className="text-gray-800 mb-4" />
                        <h3 className="text-xl font-serif text-white mb-2">No Editorials Yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Create your first article to share news and insights.</p>
                        <Link
                            to="/admin/articles/new"
                            className="text-[10px] uppercase tracking-[0.2em] font-bold text-white border-b border-white hover:text-gray-300 transition-colors"
                        >
                            Start Writing
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {articles.map((article) => (
                            <div key={article.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group hover:bg-white/[0.02] transition-colors">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-serif text-xl tracking-tight text-white group-hover:text-white transition-colors">
                                            {article.title}
                                        </h3>
                                        {!article.is_active && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                                        <span>{new Date(article.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="flex items-center gap-1 opacity-50"><LinkIcon size={10} /> /{article.slug}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(article.id, article.is_active)}
                                        className={`p-3 rounded-xl transition-all shadow-sm ${article.is_active
                                            ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                            : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'} border border-white/5`}
                                        title={article.is_active ? "Hide Article" : "Publish Article"}
                                    >
                                        {article.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>

                                    <Link
                                        to={`/admin/articles/edit/${article.id}`}
                                        className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-black hover:bg-white transition-all shadow-sm border border-white/5 group-hover:border-white/20"
                                        title="Edit Article"
                                    >
                                        <Edit size={16} />
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        disabled={deletingId === article.id}
                                        className="p-3 bg-[#1A0505] rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/20 transition-all shadow-sm border border-red-500/20 disabled:opacity-50"
                                        title="Delete Article"
                                    >
                                        {deletingId === article.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
