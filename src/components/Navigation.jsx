import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navigation = ({ title }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Works', href: '#work' },
        { name: 'About', href: '#about' },
        { name: 'Exhibitions', href: '#exhibitions' },
        { name: 'Contact', href: '#contact' },
    ];

    const scrollToSection = (e, href) => {
        e.preventDefault();
        setIsMenuOpen(false); // Close mobile menu when a link is clicked

        const targetId = href.replace('#', '');
        const elem = document.getElementById(targetId);

        if (elem) {
            const offset = 96; // h-24 = 96px
            const bodyRect = document.body.getBoundingClientRect().top;
            const elemRect = elem.getBoundingClientRect().top;
            const elemPosition = elemRect - bodyRect;
            const offsetPosition = elemPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full h-24 flex justify-between items-center px-8 md:px-16 z-[101] bg-black/40 backdrop-blur-xl border-b border-white/10">
                <div
                    className="font-sans font-black text-2xl tracking-tighter text-white uppercase cursor-pointer"
                    onClick={(e) => scrollToSection(e, '#top')}
                >
                    {title || 'Dave Madigan'}
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-12 items-center">
                    {navItems.map((item) => (
                        <motion.a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className="uppercase tracking-[0.2em] text-[11px] font-mono font-bold hover:text-white text-gray-400 transition-colors cursor-pointer"
                            whileHover={{ y: -1 }}
                        >
                            {item.name}
                        </motion.a>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:block">
                    <a
                        href="#contact"
                        onClick={(e) => scrollToSection(e, '#contact')}
                        className="px-10 py-3 border-2 border-white text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        Inquire
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white p-2"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-12 p-8 md:hidden"
                    >
                        {navItems.map((item) => (
                            <motion.a
                                key={item.name}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl font-serif text-white tracking-tighter italic"
                            >
                                {item.name}
                            </motion.a>
                        ))}
                        <motion.a
                            href="#contact"
                            onClick={(e) => scrollToSection(e, '#contact')}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 px-12 py-4 border-2 border-white text-white text-xs font-bold uppercase tracking-widest"
                        >
                            Get In Touch
                        </motion.a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
