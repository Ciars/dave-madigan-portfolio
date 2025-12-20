import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useArtworks } from '../hooks/useContent';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

// Helper to chunk array into n columns
const chunkArray = (array, numCols) => {
    const cols = Array.from({ length: numCols }, () => []);
    array.forEach((item, i) => {
        cols[i % numCols].push(item);
    });
    return cols;
};

const WorkGrid = () => {
    const { artworks: galleryImages, loading } = useArtworks();
    const [selectedId, setSelectedId] = useState(null);
    const containerRef = useRef(null);

    // Parallax Setup
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Create different velocities for columns
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]); // Middle column moves opposite/slower
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const transforms = [y1, y2, y3];

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

    if (loading) return <div className="h-screen bg-[#050505]" />;

    // Split images into 3 columns
    const columns = chunkArray(galleryImages, 3);

    const selectedImage = galleryImages.find(img => img.id === selectedId);
    const currentIndex = galleryImages.findIndex(img => img.id === selectedId);

    const navigate = (direction) => {
        if (currentIndex === -1) return;
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = galleryImages.length - 1;
        if (newIndex >= galleryImages.length) newIndex = 0;
        setSelectedId(galleryImages[newIndex].id);
    };

    return (
        <section ref={containerRef} id="work" className="relative min-h-screen bg-[#050505] overflow-hidden py-32 px-4 md:px-12">

            {/* Header */}
            <div className="container mx-auto mb-24 flex items-end justify-between border-b border-white/10 pb-6 relative z-10">
                <h2 className="text-4xl md:text-7xl font-serif text-white tracking-tighter">
                    Selected <span className="text-gray-600 italic">Works</span>
                </h2>
                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest hidden md:block">
                    Archive 2024 — 2025
                </span>
            </div>

            {/* Kinetic Grid */}
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {columns.map((colImages, colIndex) => (
                    <motion.div
                        key={colIndex}
                        style={{ y: transforms[colIndex % 3] }}
                        className="flex flex-col gap-16"
                    >
                        {colImages.map((image) => (
                            <WorkItem
                                key={image.id}
                                image={image}
                                onClick={() => setSelectedId(image.id)}
                            />
                        ))}
                    </motion.div>
                ))}
            </div>

            {/* Seamless Expansion Detail View */}
            <AnimatePresence>
                {selectedId && selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">

                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl"
                            onClick={() => setSelectedId(null)}
                        />

                        {/* Controls */}
                        <div className="absolute top-0 right-0 p-8 z-[110] flex gap-4">
                            <button onClick={() => setSelectedId(null)} className="text-white hover:text-red-500 transition-colors">
                                <X size={32} />
                            </button>
                        </div>

                        {/* Arrows */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute left-4 md:left-8 p-4 text-white/50 hover:text-white transition-colors z-[110]"
                        >
                            <ChevronLeft size={48} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(1); }}
                            className="absolute right-4 md:right-8 p-4 text-white/50 hover:text-white transition-colors z-[110]"
                        >
                            <ChevronRight size={48} />
                        </button>

                        {/* Content Container */}
                        <div className="relative z-[105] w-full h-full p-4 md:p-12 flex flex-col md:flex-row gap-12 items-center justify-center pointer-events-none">

                            {/* Image - Shared Layout ID */}
                            <motion.div
                                layoutId={`image-container-${selectedId}`}
                                className="relative w-full md:w-auto max-w-5xl pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.img
                                    layoutId={`image-${selectedId}`}
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    className="max-h-[70vh] md:max-h-[85vh] w-auto object-contain shadow-2xl"
                                />
                            </motion.div>

                            {/* Info - Slides In */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: 0.2 }}
                                className="pointer-events-auto text-left"
                            >
                                <h3 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-none">
                                    {selectedImage.title}
                                </h3>
                                <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-gray-400">
                                    <span>{selectedImage.medium}</span>
                                    <span>{selectedImage.year}</span>
                                    <span className="text-red-500 mt-4">Available</span>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                )}
            </AnimatePresence>

        </section>
    );
};

// Isolated Work Item for cleaner code & animations
const WorkItem = ({ image, onClick }) => {
    return (
        <motion.div
            layoutId={`image-container-${image.id}`}
            className="group relative cursor-pointer"
            onClick={onClick}
            whileHover={{ scale: 0.98 }}
            transition={{ duration: 0.5 }}
        >
            {/* Image Wrapper */}
            <div className="relative overflow-hidden bg-gray-900">
                <motion.img
                    layoutId={`image-${image.id}`}
                    src={image.src}
                    alt={image.title}
                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                />

                {/* Glitch/Color overlays */}
                <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/20 mix-blend-overlay transition-colors duration-300" />

                {/* Chromatic abberation psuedo-element manually implemented via separate layers or CSS - keeping simple for now with overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none mix-blend-screen">
                    {/* Fake glitch flash via CSS could go here, for now using blend modes */}
                </div>
            </div>

            {/* Meta removed for pure grid vision */}
        </motion.div>
    );
};

export default WorkGrid;
