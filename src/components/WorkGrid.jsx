import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtworks } from '../hooks/useContent';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const WorkGrid = () => {
    const { artworks: galleryImages, loading } = useArtworks();
    const [selectedId, setSelectedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(9);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedId) return;
            if (e.key === 'Escape') setSelectedId(null);
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    // Safety check for galleryImages
    if (loading && (!galleryImages || galleryImages.length === 0)) {
        return (
            <section className="py-32 text-center">
                <p className="font-mono text-gray-500">Loading works...</p>
            </section>
        );
    }

    const navigate = (direction) => {
        if (currentIndex === -1) return;
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = galleryImages.length - 1;
        if (newIndex >= galleryImages.length) newIndex = 0;
        setSelectedId(galleryImages[newIndex].id);
    };

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + 9, galleryImages.length));
    };

    return (
        <section id="work" className="py-32 pl-16 md:pl-24 pr-6 md:pr-12 bg-[#050505] min-h-screen">
            <div className="container mx-auto">
                <div className="flex items-end justify-between mb-24 border-b border-white/20 pb-4">
                    <h2 className="text-4xl md:text-6xl font-serif">Selected Works</h2>
                    <span className="font-mono text-xs uppercase tracking-widest mb-2 hidden md:block">
                        Index 01 — {String(galleryImages.length).padStart(2, '0')}
                    </span>
                </div>

                {/* Broken Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
                    {galleryImages.slice(0, visibleCount).map((image, index) => (
                        <motion.div
                            key={image.id}
                            layoutId={`image-${image.id}`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index % 3 * 0.1 }}
                            onClick={() => setSelectedId(image.id)}
                            className={`group relative cursor-pointer ${index % 3 === 1 ? 'md:mt-24' : ''
                                } ${index % 3 === 2 ? 'md:-mt-12' : ''
                                }`}
                        >
                            <div className="relative overflow-hidden mb-6">
                                <motion.img
                                    src={image.src}
                                    alt={image.title}
                                    loading="lazy"
                                    className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:contrast-125 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-red-900/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300" />

                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                                </div>
                            </div>

                            <div className="flex justify-between items-start border-t border-white/10 pt-4">
                                <div>
                                    <h3 className="text-xl font-serif mb-1 group-hover:translate-x-2 transition-transform duration-300 glitch-hover">{image.title}</h3>
                                    <p className="text-xs font-mono text-gray-500 uppercase">{image.medium}</p>
                                </div>
                                <span className="text-xs font-mono text-gray-600">{image.year}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Load More Button */}
                {visibleCount < galleryImages.length && (
                    <div className="mt-32 flex justify-center">
                        <button
                            onClick={loadMore}
                            className="group relative px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest overflow-hidden"
                        >
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">View More Works</span>
                            <div className="absolute inset-0 bg-[#050505] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </button>
                    </div>
                )}

                {/* Lightbox */}
                <AnimatePresence>
                    {selectedId && selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                        >
                            {/* Controls */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors z-50 text-white"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                                className="absolute left-4 md:left-8 p-4 hover:bg-white/10 rounded-full transition-colors z-50 group text-white"
                            >
                                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                                className="absolute right-4 md:right-8 p-4 hover:bg-white/10 rounded-full transition-colors z-50 group text-white"
                            >
                                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Image Container */}
                            <div className="w-full h-full p-4 md:p-12 flex flex-col items-center justify-center" onClick={() => setSelectedId(null)}>
                                <motion.div
                                    layoutId={`image-${selectedId}`}
                                    className="relative max-w-full max-h-[85vh] shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={selectedImage.src}
                                        alt={selectedImage.title}
                                        className="max-w-full max-h-[85vh] object-contain"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-6 text-center"
                                >
                                    <h3 className="text-2xl md:text-3xl font-serif mb-2">{selectedImage.title}</h3>
                                    <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                                        {selectedImage.medium} — {selectedImage.year}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default WorkGrid;
