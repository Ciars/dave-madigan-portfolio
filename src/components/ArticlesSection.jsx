import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ArticlesSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (error) throw error;
                setArticles(data || []);
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading || articles.length === 0) return null; // Don't show section if no articles

    const mainArticle = articles[0];
    const sideArticles = articles.slice(1);

    // Helper to strip HTML and get a clean excerpt
    const getExcerpt = (htmlString, length = 200) => {
        if (!htmlString) return '';
        const stripped = htmlString.replace(/<[^>]+>/g, '');
        if (stripped.length <= length) return stripped;
        return stripped.substring(0, length).trim() + '...';
    };

    return (
        <section id="articles" className="min-h-screen py-32 px-8 flex items-center justify-center bg-[#050505] relative z-10 border-t border-white/5">
            <div className="max-w-[1400px] w-full mx-auto relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-20"
                >
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-4 text-center md:text-left">
                        Publications
                    </p>
                    <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tighter text-center md:text-left">
                        Editorials
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* Main Featured Article (Left Side) */}
                    <div className="lg:col-span-8 flex flex-col justify-center">
                        <motion.a
                            href={`/article/${mainArticle.slug}`}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="group block"
                        >
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-6">
                                {new Date(mainArticle.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <h3 className="text-4xl md:text-6xl font-serif text-white tracking-tighter mb-8 group-hover:text-gray-300 transition-colors leading-[1.1]">
                                {mainArticle.title}
                            </h3>
                            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl mb-12">
                                {getExcerpt(mainArticle.content, 250)}
                            </p>

                            <div className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white pb-2 group-hover:gap-6 transition-all">
                                Read Full Article <ArrowRight size={14} />
                            </div>
                        </motion.a>
                    </div>

                    {/* Side Articles List (Right Side) */}
                    {sideArticles.length > 0 && (
                        <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-16 lg:pt-0 lg:pl-16">
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] mb-12"
                            >
                                Exploring Further
                            </motion.p>

                            <div className="space-y-12">
                                {sideArticles.map((article, i) => (
                                    <motion.a
                                        key={article.id}
                                        href={`/article/${article.slug}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
                                        className="block group"
                                    >
                                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-3 group-hover:text-gray-400 transition-colors">
                                            {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <h4 className="text-2xl font-serif text-gray-300 tracking-tight leading-snug group-hover:text-white transition-colors">
                                            {article.title}
                                        </h4>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </section>
    );
}
