import { motion } from 'framer-motion';
import { bio, collections } from '../data/content';

const About = () => {
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
