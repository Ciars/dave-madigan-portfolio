import { motion } from 'framer-motion';

const Navigation = ({ title }) => {
    return (
        <nav className="fixed top-0 left-0 h-screen w-16 md:w-24 flex flex-col justify-between items-center py-12 z-50 border-r border-white/10 bg-[#050505]/80 backdrop-blur-sm">
            <div className="font-serif font-bold text-xl tracking-tighter text-white writing-mode-vertical rotate-180 md:rotate-0 md:writing-mode-horizontal">{title || 'DM'}</div>

            <div className="flex flex-col gap-12 items-center">
                {['Work', 'About', 'Contact'].map((item, i) => (
                    <motion.a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        whileHover={{ scale: 1.1, x: 5 }}
                        className="text-vertical uppercase tracking-widest text-xs font-mono hover:text-white text-gray-500 transition-colors cursor-pointer"
                    >
                        {item}
                    </motion.a>
                ))}
            </div>

            <div className="w-[1px] h-12 bg-white/20"></div>
        </nav>
    );
};

export default Navigation;
