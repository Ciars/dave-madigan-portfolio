import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExhibitions } from '../hooks/useContent';
import { ChevronDown } from 'lucide-react';

const Exhibitions = () => {
    const { exhibitions: rawExhibitions, currentExhibition } = useExhibitions();
    const [isExpanded, setIsExpanded] = useState(false);

    // Group exhibitions by year
    const exhibitionsByYear = rawExhibitions.reduce((acc, curr) => {
        const existingYear = acc.find(group => group.year === curr.year);
        if (existingYear) {
            existingYear.items.push(curr);
        } else {
            acc.push({ year: curr.year, items: [curr] });
        }
        return acc;
    }, []);

    // Split into initial and archive
    const initialYears = exhibitionsByYear.slice(0, 3);
    const archiveYears = exhibitionsByYear.slice(3);

    return (
        <section id="exhibitions" className="py-32 px-6 md:px-12 bg-[#050505] overflow-hidden">
            <div className="container mx-auto">
                <div className="mb-24">
                    <span className="section-label text-gray-400">Archive</span>
                    <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-white">
                        Exhibitions
                    </h2>
                </div>

                {/* Current Highlight */}
                {currentExhibition && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mb-32 p-10 bg-white text-black rounded-2xl flex flex-col md:flex-row justify-between items-center gap-10"
                    >
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block opacity-50">Currently Showing</span>
                            <h3 className="text-4xl md:text-5xl font-serif tracking-tighter mb-4">{currentExhibition.title}</h3>
                            <p className="text-lg font-medium opacity-80">{currentExhibition.location}</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-lg font-bold mb-6">{currentExhibition.dates}</p>
                            <button className="px-10 py-4 bg-black text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:scale-105 transition-transform">
                                More Info
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Initial Recent List */}
                <div className="space-y-24">
                    {initialYears.map((yearGroup, index) => (
                        <div key={yearGroup.year} className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            <div className="md:col-span-2">
                                <h3 className="text-4xl md:text-6xl font-serif text-gray-700 font-bold">{yearGroup.year}</h3>
                            </div>
                            <div className="md:col-span-10 space-y-12">
                                {yearGroup.items.map((item, i) => (
                                    <div key={i} className="group border-b border-white/10 pb-12 last:border-0 last:pb-0">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                            <div>
                                                <h4 className="text-2xl md:text-3xl text-white font-medium mb-2 group-hover:text-gray-400 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-lg text-gray-400 italic font-serif">
                                                    {item.location}
                                                </p>
                                            </div>
                                            {item.award && (
                                                <span className="px-5 py-2 border border-white/20 text-white text-[9px] uppercase tracking-widest font-bold rounded-full">
                                                    Awarded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Archive Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-24 pt-24 border-t border-white/5"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16">
                                {archiveYears.map((yearGroup) => (
                                    <div key={yearGroup.year} className="flex flex-col gap-6">
                                        <h3 className="text-3xl font-serif text-gray-800 font-bold mb-2">{yearGroup.year}</h3>
                                        <div className="space-y-6">
                                            {yearGroup.items.map((item, i) => (
                                                <div key={i} className="border-l-2 border-white/5 pl-6 py-1">
                                                    <h4 className="text-lg text-white font-medium mb-1">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 font-serif italic">{item.location}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Show More Button */}
                {!isExpanded && archiveYears.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-32 flex justify-center"
                    >
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="flex flex-col items-center gap-4 group"
                        >
                            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">
                                Show More
                            </span>
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                                <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Exhibitions;
