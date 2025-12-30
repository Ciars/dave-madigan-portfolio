import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtworks } from '../hooks/useContent';
import { X, ChevronLeft, ChevronRight, Plus, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

const WorkGrid = () => {
    const { artworks, loading } = useArtworks();
    const [selectedId, setSelectedId] = useState(null);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    const selectedImage = artworks.find(img => img.id === selectedId);
    const currentIndex = artworks.findIndex(img => img.id === selectedId);

    const navigate = useCallback((newDirection) => {
        if (currentIndex === -1) return;
        setDirection(newDirection);
        let newIndex = currentIndex + newDirection;
        if (newIndex < 0) newIndex = artworks.length - 1;
        if (newIndex >= artworks.length) newIndex = 0;
        setSelectedId(artworks[newIndex].id);
    }, [currentIndex, artworks]);

    // Track View Count
    useEffect(() => {
        if (selectedId) {
            supabase.rpc('increment_artwork_view', { artwork_id: selectedId })
                .then(({ error }) => {
                    if (error) console.error('Error incrementing view:', error);
                });
        }
    }, [selectedId]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedId) return;

            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'Escape') setSelectedId(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, navigate]);

    // Animation Variants
    const variants = {
        enter: (d) => ({
            x: d > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (d) => ({
            zIndex: 0,
            x: d > 0 ? -100 : 100,
            opacity: 0,
            scale: 1.05
        })
    };

    const textVariants = {
        enter: { y: 20, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 }
    };

    if (loading) return <div className="h-96 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-white">Loading Archive...</div>;

    return (
        <section id="work" className="py-32 px-6 md:px-12 bg-[#050505]">
            <div className="container mx-auto">
                <div className="mb-20">
                    <span className="section-label">Gallery</span>
                    <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-white">
                        Selected Works
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {artworks.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group cursor-pointer"
                            onClick={() => {
                                setDirection(0);
                                setSelectedId(image.id);
                            }}
                        >
                            <div className="relative aspect-[4/5] bg-[#0a0a0a] rounded-2xl overflow-hidden mb-8 border border-white/10">
                                <img
                                    src={image.src}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-2 border-white/20 rounded-2xl">
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                        <Plus size={24} className="text-black" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-start pr-4">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2">{image.title}</h3>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 font-mono font-bold">{image.medium || 'Oil on Canvas'}</p>
                                </div>
                                <span className="text-2xl font-serif italic text-gray-800 font-bold">{image.year || '2024'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedId && selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/98 backdrop-blur-[80px]" onClick={() => setSelectedId(null)} />

                        <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10">

                            {/* Absolute Close Button - Frees up vertical space */}
                            <motion.button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-6 right-6 md:top-10 md:right-10 p-4 text-white/50 hover:text-white hover:rotate-90 transition-all bg-white/5 hover:bg-white/10 rounded-full z-[100]"
                                aria-label="Close modal"
                            >
                                <X size={28} />
                            </motion.button>

                            {/* Main Display - Max 100% Height Utilization */}
                            <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center min-h-0 pt-4 md:pt-0">

                                {/* Artwork Section - Max Height Available */}
                                <div className="flex-1 w-full h-full flex items-center justify-center min-h-0 relative">
                                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                        <motion.div
                                            key={selectedId}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 220, damping: 28 },
                                                opacity: { duration: 0.4 },
                                                scale: { duration: 0.5 }
                                            }}
                                            className="w-full h-full flex items-center justify-center"
                                        >
                                            <img
                                                src={selectedImage.src}
                                                alt={selectedImage.title}
                                                className="max-w-full max-h-full object-contain shadow-[0_0_150px_rgba(0,0,0,0.9)] border border-white/5"
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Details Panel */}
                                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-10 text-center lg:text-left pb-4 md:pb-0">
                                    <AnimatePresence initial={false} mode="wait">
                                        <motion.div
                                            key={selectedId}
                                            variants={textVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="space-y-8"
                                        >
                                            <div>
                                                <span className="section-label mb-6">Archive Record</span>
                                                <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tighter text-white leading-[0.8] mb-4">
                                                    {selectedImage.title}
                                                </h3>
                                            </div>

                                            <div className="space-y-8 font-mono text-[10px] tracking-[0.3em] uppercase text-gray-500">
                                                <div className="flex flex-col border-b border-white/5 pb-6 gap-3">
                                                    <span className="opacity-40">Medium</span>
                                                    <span className="text-white font-medium text-xs tracking-normal normal-case">{selectedImage.medium || 'Oil on Canvas'}</span>
                                                </div>
                                                <div className="flex flex-col border-b border-white/5 pb-6 gap-3">
                                                    <span className="opacity-40">Timeline</span>
                                                    <span className="text-white font-medium text-xs tracking-normal">{selectedImage.year || '2024'}</span>
                                                </div>

                                                {selectedImage.description && (
                                                    <div className="flex flex-col border-b border-white/5 pb-6 gap-3">
                                                        <span className="opacity-40">Description</span>
                                                        <div className="text-white font-medium text-xs tracking-normal normal-case leading-relaxed space-y-3">
                                                            {selectedImage.description.split('\n').map((para, i) => (
                                                                <p key={i}>{para}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedImage.print_url && (
                                                    <div className="pt-2">
                                                        <motion.a
                                                            href={selectedImage.print_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className="flex items-center justify-center gap-3 w-full bg-white text-black py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-200 transition-all"
                                                        >
                                                            Buy Limited Print
                                                            <ExternalLink size={14} strokeWidth={3} />
                                                        </motion.a>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation */}
                                    <div className="flex justify-center lg:justify-start gap-8 pt-2">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group shadow-xl"
                                            aria-label="Previous artwork"
                                        >
                                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => navigate(1)}
                                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group shadow-xl"
                                            aria-label="Next artwork"
                                        >
                                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default WorkGrid;
