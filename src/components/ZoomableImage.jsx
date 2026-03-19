import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ZoomableImage — Gesture-enabled image viewer
 * 
 * Supports:
 *  • Pinch-to-zoom (touch)
 *  • Double-tap to toggle zoom (touch)
 *  • Pan/drag when zoomed in (touch + mouse)
 *  • Scroll-wheel zoom (desktop)
 *  • Resets zoom on image change
 */
const ZoomableImage = ({ src, alt, className = '', onSwipeLeft, onSwipeRight }) => {
    const containerRef = useRef(null);
    const imgRef = useRef(null);

    // Transform state
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    // Refs for gesture tracking (no re-renders during gestures)
    const gestureRef = useRef({
        // Pinch
        initialDistance: 0,
        initialScale: 1,
        // Pan
        isPanning: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        // Swipe detection
        swipeStartX: 0,
        swipeStartY: 0,
        swipeStartTime: 0,
        // Double tap
        lastTapTime: 0,
        // Current state (avoid stale closures)
        scale: 1,
        translateX: 0,
        translateY: 0,
    });

    // Keep ref in sync with state
    useEffect(() => {
        gestureRef.current.scale = scale;
        gestureRef.current.translateX = translate.x;
        gestureRef.current.translateY = translate.y;
    }, [scale, translate]);

    // Reset on image change
    useEffect(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setIsZoomed(false);
        gestureRef.current.scale = 1;
        gestureRef.current.translateX = 0;
        gestureRef.current.translateY = 0;
    }, [src]);

    // ─── Helpers ───
    const getDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const clampTranslate = useCallback((x, y, currentScale) => {
        if (currentScale <= 1) return { x: 0, y: 0 };
        const container = containerRef.current;
        const img = imgRef.current;
        if (!container || !img) return { x, y };

        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        // How much the image exceeds the container at current scale
        const overflowX = Math.max(0, (img.naturalWidth * currentScale / (img.naturalWidth / imgRect.width * currentScale) - containerRect.width) / 2);
        const overflowY = Math.max(0, (imgRect.height - containerRect.height) / 2);

        // Simpler: just limit based on scaled dimensions
        const scaledW = imgRect.width;
        const scaledH = imgRect.height;
        const maxX = Math.max(0, (scaledW - containerRect.width) / 2);
        const maxY = Math.max(0, (scaledH - containerRect.height) / 2);

        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    }, []);

    // ─── Touch Handlers ───
    const handleTouchStart = useCallback((e) => {
        const g = gestureRef.current;

        if (e.touches.length === 2) {
            // Pinch start
            e.preventDefault();
            g.initialDistance = getDistance(e.touches[0], e.touches[1]);
            g.initialScale = g.scale;
        } else if (e.touches.length === 1) {
            const now = Date.now();
            const touch = e.touches[0];

            // Double-tap detection
            if (now - g.lastTapTime < 300) {
                e.preventDefault();
                if (g.scale > 1) {
                    // Zoom out
                    setScale(1);
                    setTranslate({ x: 0, y: 0 });
                    setIsZoomed(false);
                } else {
                    // Zoom in to 2.5x centered on tap point
                    const container = containerRef.current;
                    if (container) {
                        const rect = container.getBoundingClientRect();
                        const tapX = touch.clientX - rect.left - rect.width / 2;
                        const tapY = touch.clientY - rect.top - rect.height / 2;
                        setScale(2.5);
                        setTranslate({ x: -tapX * 1.5, y: -tapY * 1.5 });
                        setIsZoomed(true);
                    }
                }
                g.lastTapTime = 0;
                return;
            }
            g.lastTapTime = now;

            // Pan/swipe start
            g.isPanning = true;
            g.startX = touch.clientX;
            g.startY = touch.clientY;
            g.lastX = g.translateX;
            g.lastY = g.translateY;
            g.swipeStartX = touch.clientX;
            g.swipeStartY = touch.clientY;
            g.swipeStartTime = now;
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        const g = gestureRef.current;

        if (e.touches.length === 2) {
            // Pinch zoom
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const ratio = currentDistance / g.initialDistance;
            let newScale = Math.max(1, Math.min(5, g.initialScale * ratio));

            setScale(newScale);
            setIsZoomed(newScale > 1);

            if (newScale <= 1) {
                setTranslate({ x: 0, y: 0 });
            }
        } else if (e.touches.length === 1 && g.isPanning) {
            const touch = e.touches[0];
            const dx = touch.clientX - g.startX;
            const dy = touch.clientY - g.startY;

            if (g.scale > 1) {
                // Pan when zoomed
                e.preventDefault();
                const newX = g.lastX + dx;
                const newY = g.lastY + dy;
                setTranslate({ x: newX, y: newY });
            }
            // If not zoomed, don't preventDefault — let swipe detection handle it in touchEnd
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const g = gestureRef.current;

        if (g.isPanning && g.scale <= 1) {
            // Check for swipe gesture
            const dx = (e.changedTouches?.[0]?.clientX || 0) - g.swipeStartX;
            const dy = (e.changedTouches?.[0]?.clientY || 0) - g.swipeStartY;
            const dt = Date.now() - g.swipeStartTime;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            // Horizontal swipe: fast enough, far enough, and more horizontal than vertical
            if (dt < 400 && absDx > 50 && absDx > absDy * 1.5) {
                if (dx > 0 && onSwipeRight) onSwipeRight();
                if (dx < 0 && onSwipeLeft) onSwipeLeft();
            }
        }

        g.isPanning = false;

        // Snap back if scale is close to 1
        if (g.scale < 1.1) {
            setScale(1);
            setTranslate({ x: 0, y: 0 });
            setIsZoomed(false);
        }
    }, [onSwipeLeft, onSwipeRight]);

    // ─── Wheel Handler (Desktop) ───
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const g = gestureRef.current;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        let newScale = Math.max(1, Math.min(5, g.scale * delta));

        setScale(newScale);
        setIsZoomed(newScale > 1);

        if (newScale <= 1) {
            setTranslate({ x: 0, y: 0 });
        }
    }, []);

    // Attach wheel listener with passive: false
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Prevent default touch behavior on the container for pinch
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const prevent = (e) => {
            if (e.touches.length >= 2) e.preventDefault();
        };
        el.addEventListener('touchmove', prevent, { passive: false });
        return () => el.removeEventListener('touchmove', prevent);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden touch-none select-none ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                draggable={false}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
                style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                }}
            />

            {/* Zoom level indicator — fades in when zoomed */}
            {isZoomed && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white/70 text-[10px] font-mono px-3 py-1.5 rounded-full pointer-events-none transition-opacity">
                    {scale.toFixed(1)}×
                </div>
            )}
        </div>
    );
};

export default ZoomableImage;
