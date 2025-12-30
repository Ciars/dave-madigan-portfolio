import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { bio as staticBio, collections as staticCollections } from '../data/content';

const About = () => {
    const [bio, setBio] = useState(staticBio);
    const [collections, setCollections] = useState(staticCollections);

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase.from('site_content').select('about_bio, about_collections').single();
            if (data) {
                if (data.about_bio && data.about_bio.length > 0) setBio(data.about_bio);
                if (data.about_collections && data.about_collections.length > 0) setCollections(data.about_collections);
            }
        };
        fetchContent();
    }, []);

    return (
        <section id="about" className="py-32 px-6 md:px-12 bg-[#050505]">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    <div className="lg:col-span-12">
                        <span className="section-label">Artist Bio</span>
                        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-white mb-16">
                            Dave Madigan
                        </h2>
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                        {bio.map((paragraph, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-xl md:text-2xl leading-relaxed text-gray-200 font-serif"
                            >
                                {paragraph}
                            </motion.p>
                        ))}
                    </div>

                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-10">
                            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-8 border-b border-white/10 pb-4 font-bold">Collections</h3>
                            <ul className="space-y-6">
                                {collections.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="text-white text-lg font-medium flex items-center gap-3"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (index * 0.05) }}
                                    >
                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
