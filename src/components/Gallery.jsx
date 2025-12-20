import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryImages } from '../data/content';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
    const [selectedId, setSelectedId] = useState(null);

    const selectedImage = galleryImages.find(img => img.id === selectedId);

    const handleNext = (e) => {
        e.stopPropagation();
        const currentIndex = galleryImages.findIndex(img => img.id === selectedId);
        const nextIndex = (currentIndex + 1) % galleryImages.length;
        setSelectedId(galleryImages[nextIndex].id);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        const currentIndex = galleryImages.findIndex(img => img.id === selectedId);
        const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setSelectedId(galleryImages[prevIndex].id);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedId) return;
            if (e.key === 'Escape') setSelectedId(null);
            if (e.key === 'ArrowRight') handleNext(e);
            if (e.key === 'ArrowLeft') handlePrev(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    return (
        <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-3xl font-serif mb-16 text-center"
            >
                Selected Works
            </motion.h2>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleryImages.map((image, index) => (
                    <motion.div
                        key={image.id}
                        layoutId={`image-${image.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedId(image.id)}
                        className="cursor-pointer group relative aspect-[4/5] overflow-hidden bg-gray-100"
                    >
                        <img
                            src={image.src}
                            alt={image.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-xs uppercase tracking-widest text-black bg-white/80 backdrop-blur-sm px-4 py-2">View</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4"
                        onClick={() => setSelectedId(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors z-50 p-2"
                            onClick={() => setSelectedId(null)}
                        >
                            <X size={32} />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            className="absolute left-4 md:left-8 text-gray-300 hover:text-black transition-colors z-50 p-4 hidden md:block"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={48} />
                        </button>
                        <button
                            className="absolute right-4 md:right-8 text-gray-300 hover:text-black transition-colors z-50 p-4 hidden md:block"
                            onClick={handleNext}
                        >
                            <ChevronRight size={48} />
                        </button>

                        {/* Image Container */}
                        <div
                            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                layoutId={`image-${selectedId}`}
                                src={selectedImage.src}
                                alt={selectedImage.title}
                                className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain shadow-xl"
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-6 text-center"
                            >
                                <h3 className="text-2xl font-serif text-gray-900 mb-1">{selectedImage.title}</h3>
                                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
                                    {selectedImage.year} — {selectedImage.medium}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;
