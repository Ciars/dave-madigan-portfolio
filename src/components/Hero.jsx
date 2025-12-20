import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="min-h-screen w-full relative flex items-center pl-16 md:pl-24 overflow-hidden bg-[#050505]">

            {/* Large Background Text (Parallax) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-20 right-[-5%] text-[12vw] md:text-[15vw] font-serif leading-none text-[#111111] whitespace-nowrap select-none z-0 pointer-events-none"
            >
                DAVE MADIGAN
            </motion.div>

            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

                {/* Text Content (Left, Overlapping) */}
                <div className="lg:col-span-5 lg:col-start-2 order-2 lg:order-1 mt-12 lg:mt-0">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif mb-6 leading-[0.9]"
                    >
                        Distorting <br />
                        <span className="italic text-gray-500">Reality</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6 max-w-md"
                    >
                        <p className="text-gray-400 font-light leading-relaxed">
                            Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.
                        </p>
                        <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-gray-600">
                            <span>Oil on Canvas</span>
                            <span>—</span>
                            <span>Digital Aesthetics</span>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image (Right, Asymmetrical) */}
                <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2 relative">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="relative z-10"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop"
                            alt="Hero Art"
                            className="w-full h-auto shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                        />
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-white/10 z-[-1]" />
                        <div className="absolute -top-8 -right-8 w-full h-full bg-[#111111] z-[-2]" />
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
