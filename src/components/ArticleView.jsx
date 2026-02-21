import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ArticleView() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // Ensure we only fetch an active article
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (error) throw error;
                setArticle(data);
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        // Scroll to top on load
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-8">
                <h1 className="text-4xl font-serif text-white tracking-tighter mb-4">404 - Not Found</h1>
                <p className="text-gray-500 mb-8">This editorial could not be found or is no longer available.</p>
                <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-white pb-1 hover:text-gray-300 transition-colors">
                    Return to Portfolio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black font-sans pb-32">

            {/* Minimal Header */}
            <header className="fixed top-0 left-0 w-full h-24 flex items-center px-8 md:px-16 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <Link
                    to="/#articles"
                    className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Portfolio
                </Link>
                <div className="ml-auto font-sans font-black text-xl tracking-tighter uppercase opacity-50">
                    Dave Madigan
                </div>
            </header>

            {/* Article Content */}
            <main className="pt-48 px-6 md:px-8 max-w-3xl mx-auto">
                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Header */}
                    <header className="mb-16 md:mb-24 text-center md:text-left">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] mb-6 inline-block border border-white/10 rounded-full px-4 py-1.5 bg-white/5">
                            Editorial • {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tighter leading-[1.1] text-white">
                            {article.title}
                        </h1>
                    </header>

                    {/* Rich Text Body */}
                    <div
                        className="prose prose-invert prose-lg md:prose-xl max-w-none 
                                   prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight 
                                   prose-p:font-light prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-8
                                   prose-a:text-white prose-a:underline-offset-4
                                   prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-16 prose-img:w-full
                                   prose-blockquote:border-l-white/20 prose-blockquote:text-gray-400 prose-blockquote:font-serif prose-blockquote:not-italic"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </motion.article>

                {/* Footer divider */}
                <div className="mt-32 pt-16 border-t border-white/10 flex justify-center">
                    <Link
                        to="/#articles"
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-gray-300 transition-colors border-b border-white pb-1"
                    >
                        Read More Editorials
                    </Link>
                </div>
            </main>
        </div>
    );
}
