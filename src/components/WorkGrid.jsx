import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useArtworks } from '../hooks/useContent';
import { X, ChevronLeft, ChevronRight, Plus, ExternalLink, Info, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ZoomableImage from './ZoomableImage';

const WorkGrid = () => {
    const { artworks, loading } = useArtworks();
    const [selectedId, setSelectedId] = useState(null);
    const [direction, setDirection] = useState(0);
    const [showMobileInfo, setShowMobileInfo] = useState(false);

    const isDesktop = useMediaQuery('(min-width: 768px)');
    const isLgScreen = useMediaQuery('(min-width: 1024px)');

    const selectedImage = artworks.find(img => img.id === selectedId);
    const currentIndex = artworks.findIndex(img => img.id === selectedId);

    const navigate = useCallback((newDirection) => {
        if (currentIndex === -1) return;
        setDirection(newDirection);
        let newIndex = currentIndex + newDirection;
        // Skip dividers
        let attempts = 0;
        while (attempts < artworks.length) {
            if (newIndex < 0) newIndex = artworks.length - 1;
            if (newIndex >= artworks.length) newIndex = 0;
            if (artworks[newIndex].type !== 'divider') break;
            newIndex += newDirection;
            attempts++;
        }
        setSelectedId(artworks[newIndex].id);
        setShowMobileInfo(false);
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

    // Body Scroll Lock for Modal
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedId]);

    // Reset mobile info when closing
    useEffect(() => {
        if (!selectedId) setShowMobileInfo(false);
    }, [selectedId]);

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

    const ArtworkCard = ({ image, index }) => (
        <div
            key={image.id}
            className={`group cursor-pointer shrink-0 ${isDesktop ? 'w-[30vw] min-w-[350px]' : 'w-[85vw] max-w-[400px] snap-center px-1'}`}
            onClick={() => {
                setDirection(0);
                setSelectedId(image.id);
            }}
        >
            <div className={`relative ${isDesktop ? 'aspect-[4/5]' : 'aspect-[4/5]'} bg-[#0a0a0a] rounded-2xl overflow-hidden mb-8 border border-white/10`}>
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
        </div>
    );

    const DividerBlock = ({ item, isDesktop }) => (
        <div
            key={item.id}
            className={`flex items-center justify-center shrink-0 ${isDesktop ? 'h-[60vh] w-[15vw] min-w-[150px]' : 'h-[60vh] w-[42vw] max-w-[200px] snap-center px-4'}`}
        >
            <div className="relative flex items-center justify-center h-full w-full">
                {/* Minimalist vertical line */}
                <div className="absolute w-[1px] h-full bg-white/10 left-1/2 -translate-x-1/2"></div>
                {/* Rotated text block that cuts the line */}
                <h3 className="font-mono text-xl md:text-3xl font-bold text-gray-400 uppercase tracking-[0.5em] -rotate-90 whitespace-nowrap bg-[#050505] py-12 px-2 z-10 transition-colors hover:text-white">
                    {item.title}
                </h3>
            </div>
        </div>
    );

    const DesktopGallery = ({ artworks, ArtworkCard }) => {
        const targetRef = useRef(null);
        const [progress, setProgress] = useState(0);

        useEffect(() => {
            const handleScroll = () => {
                if (!targetRef.current) return;

                const element = targetRef.current;
                const rect = element.getBoundingClientRect();

                const scrollDistance = -rect.top;
                const scrollableHeight = rect.height - window.innerHeight;

                let newProgress = scrollDistance / scrollableHeight;
                newProgress = Math.max(0, Math.min(newProgress, 1));

                setProgress(newProgress);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();

            return () => window.removeEventListener('scroll', handleScroll);
        }, []);

        const translateX = `calc(-${progress * 100}% + ${progress * 100}vw)`;

        return (
            <div ref={targetRef} className="relative h-[400vh]">
                <div className="sticky top-0 h-screen flex flex-col justify-center overflow-x-clip">
                    <div className="container mx-auto px-6 md:px-12 mb-12 shrink-0 pt-20">
                        <span className="section-label">Gallery</span>
                        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-white">
                            Selected Works
                        </h2>
                    </div>
                    <motion.div
                        style={{ transform: `translateX(${translateX})` }}
                        className="flex gap-16 px-6 md:px-12 pb-20 w-max items-center transition-transform duration-0 ease-linear"
                    >
                        {artworks.map((item, index) => (
                            item.type === 'divider' ? (
                                <DividerBlock item={item} isDesktop={true} key={`div-${item.id}`} />
                            ) : (
                                <ArtworkCard image={item} index={index} key={`art-${item.id}`} />
                            )
                        ))}
                    </motion.div>
                </div>
            </div>
        );
    };

    /* ─────────────── Mobile Modal ─────────────── */
    const MobileModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black"
        >
            {/* Full-bleed image */}
            <div className="absolute inset-0 flex items-center justify-center">
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
                        className="w-full h-full flex items-center justify-center p-4"
                    >
                        <ZoomableImage
                            src={selectedImage.src}
                            alt={selectedImage.title}
                            className="w-full h-full flex items-center justify-center"
                            onSwipeLeft={() => navigate(1)}
                            onSwipeRight={() => navigate(-1)}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Top gradient for close button legibility */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />

            {/* Close button */}
            <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-all bg-white/10 backdrop-blur-md rounded-full z-20"
                aria-label="Close modal"
            >
                <X size={22} />
            </button>

            {/* Navigation arrows — float on image edges */}
            <button
                onClick={() => navigate(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 active:bg-white/20 transition-all z-20"
                aria-label="Previous artwork"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => navigate(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 active:bg-white/20 transition-all z-20"
                aria-label="Next artwork"
            >
                <ChevronRight size={20} />
            </button>

            {/* Bottom gradient for info legibility */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

            {/* Bottom info bar — always visible */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={selectedId}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-end justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-serif tracking-tight text-white leading-tight truncate">
                                    {selectedImage.title}
                                </h3>
                                <p className="text-[11px] font-mono uppercase tracking-widest text-white/50 mt-1">
                                    {selectedImage.medium || 'Oil on Canvas'} — {selectedImage.year || '2024'}
                                </p>
                            </div>
                            {(selectedImage.description || selectedImage.print_url) && (
                                <button
                                    onClick={() => setShowMobileInfo(!showMobileInfo)}
                                    className={`shrink-0 p-3 rounded-full backdrop-blur-md transition-all ${showMobileInfo ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}
                                    aria-label="Toggle details"
                                >
                                    {showMobileInfo ? <ChevronDown size={18} /> : <Info size={18} />}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Expandable details sheet */}
            <AnimatePresence>
                {showMobileInfo && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 z-30 bg-[#111]/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 max-h-[60vh] overflow-y-auto"
                    >
                        <div className="p-6 pt-4">
                            {/* Drag indicator */}
                            <div className="flex justify-center mb-5">
                                <div className="w-10 h-1 rounded-full bg-white/20" />
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-serif tracking-tight text-white leading-tight">
                                        {selectedImage.title}
                                    </h3>
                                    <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mt-1">
                                        {selectedImage.medium || 'Oil on Canvas'} — {selectedImage.year || '2024'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMobileInfo(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            {selectedImage.description && (
                                <div className="text-white/70 text-sm leading-relaxed space-y-3 mb-6">
                                    {selectedImage.description.split('\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            )}

                            {selectedImage.print_url && (
                                <a
                                    href={selectedImage.print_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-white text-black py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] active:bg-gray-200 transition-all"
                                >
                                    Buy Limited Print
                                    <ExternalLink size={14} strokeWidth={3} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    /* ─────────────── Desktop Modal ─────────────── */
    const DesktopModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 bg-black/98 backdrop-blur-[80px]" onClick={() => setSelectedId(null)} />

            <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10">

                <motion.button
                    onClick={() => setSelectedId(null)}
                    className="absolute top-6 right-6 md:top-10 md:right-10 p-4 text-white/50 hover:text-white hover:rotate-90 transition-all bg-white/5 hover:bg-white/10 rounded-full z-[100]"
                    aria-label="Close modal"
                >
                    <X size={28} />
                </motion.button>

                <div className="flex-1 flex flex-row gap-20 items-center justify-center min-h-0">

                    {/* Artwork Section */}
                    <div className="flex-1 h-full flex items-center justify-center min-h-0 relative">
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
                                <ZoomableImage
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    className="w-full h-full flex items-center justify-center"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Details Panel */}
                    <div className="w-[320px] shrink-0 flex flex-col gap-10 text-left">
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
                                    <h3 className="text-5xl lg:text-6xl font-serif tracking-tighter text-white leading-[0.8] mb-4">
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
                        <div className="flex justify-start gap-8 pt-2">
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
    );

    return (
        <section id="work" className="bg-[#050505]">
            {isDesktop ? (
                <DesktopGallery artworks={artworks} ArtworkCard={ArtworkCard} />
            ) : (
                <div className="py-24">
                    <div className="px-6 mb-12">
                        <span className="section-label">Gallery</span>
                        <h2 className="text-5xl font-sans font-bold tracking-tighter text-white">
                            Selected Works
                        </h2>
                    </div>
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbars pb-12 w-full gap-4 px-6 md:px-12">
                        {artworks.map((item, index) => (
                            item.type === 'divider' ? (
                                <DividerBlock item={item} isDesktop={false} key={`div-${item.id}`} />
                            ) : (
                                <ArtworkCard image={item} index={index} key={`art-${item.id}`} />
                            )
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedId && selectedImage && (
                    isLgScreen ? <DesktopModal /> : <MobileModal />
                )}
            </AnimatePresence>
        </section>
    );
};

export default WorkGrid;

