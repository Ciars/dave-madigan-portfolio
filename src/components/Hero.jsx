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
            // Trigger animation even if load is instant
            setTimeout(() => setLoading(false), 100);
        };
        fetchContent();
    }, []);

    // Split title for styling if needed, or just render normally
    const titleParts = content.hero_title.split(' ');
    const displayTitle = titleParts.length > 1 ? (
        <>
            {titleParts.slice(0, -1).join(' ')} <br />
            <span className="italic text-gray-500">{titleParts[titleParts.length - 1]}</span>
        </>
    ) : content.hero_title;

    if (loading) return <div className="min-h-screen bg-[#050505]" />; // Avoids flash of wrong content

    return (
        <section className="min-h-screen w-full relative flex items-center pl-16 md:pl-24 overflow-hidden bg-[#050505]">

            {/* Large Background Text (Parallax) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-20 right-[-5%] text-[12vw] md:text-[15vw] font-serif leading-none text-[#111111] whitespace-nowrap select-none z-0 pointer-events-none"
            >
                DAVE MADIGAN
            </motion.div>

            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

                {/* Text Content (Left, Overlapping) */}
                <div className="lg:col-span-5 lg:col-start-2 order-2 lg:order-1 mt-12 lg:mt-0">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif mb-6 leading-[0.9]"
                    >
                        {displayTitle}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6 max-w-md"
                    >
                        <p className="text-gray-400 font-light leading-relaxed">
                            {content.hero_subtitle}
                        </p>
                        <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-gray-600">
                            <span>Oil on Canvas</span>
                            <span>—</span>
                            <span>Digital Aesthetics</span>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image (Right, Asymmetrical) */}
                <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2 relative">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="relative z-10"
                    >
                        <img
                            src={content.hero_image_url}
                            alt="Hero Art"
                            className="w-full h-auto shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                        />
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-white/10 z-[-1]" />
                        <div className="absolute -top-8 -right-8 w-full h-full bg-[#111111] z-[-2]" />
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
