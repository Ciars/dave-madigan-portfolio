import { motion } from 'framer-motion';
import { bio, collections } from '../data/content';

const About = () => {
    return (
        <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Bio Text */}
                <div className="lg:col-span-7 space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-serif mb-8 text-gray-500"
                    >
                        About
                    </motion.h2>

                    {bio.map((paragraph, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-lg md:text-xl leading-relaxed font-light text-gray-300"
                        >
                            {paragraph}
                        </motion.p>
                    ))}
                </div>

                {/* Collections / Side Info */}
                <div className="lg:col-span-4 lg:col-start-9 mt-12 lg:mt-0 border-l border-white/10 pl-8">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-sm uppercase tracking-widest text-gray-500 mb-6"
                    >
                        Selected Collections
                    </motion.h3>
                    <ul className="space-y-4">
                        {collections.map((item, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + (index * 0.05) }}
                                className="text-gray-400 font-light text-sm"
                            >
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default About;
