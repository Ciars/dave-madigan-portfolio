import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Hero = () => {
    const [content, setContent] = useState({
        hero_title: 'Distorting Reality',
        hero_subtitle: 'Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.',
        hero_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase.from('site_content').select('*').single();
            if (data) {
                setContent({
                    hero_title: data.hero_title || content.hero_title,
                    hero_subtitle: data.hero_subtitle || content.hero_subtitle,
                    hero_image_url: data.hero_image_url || content.hero_image_url
                });
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#050505]" />;

    return (
        <section id="top" className="min-h-screen pt-32 pb-20 px-6 md:px-12 bg-[#050505] flex flex-col justify-center">
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Text Content */}
                <div className="lg:col-span-12 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-6xl md:text-9xl font-serif text-white tracking-tighter leading-[0.9] mb-8">
                            {content.hero_title}
                        </h1>
                        <p className="text-xl md:text-3xl text-gray-300 font-serif italic max-w-4xl leading-relaxed">
                            {content.hero_subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Hero Image - Large & Impactful */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 1.2 }}
                    className="lg:col-span-12 relative aspect-video overflow-hidden rounded-2xl border border-white/10"
                >
                    <img
                        src={content.hero_image_url}
                        alt="Featured Artwork"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
