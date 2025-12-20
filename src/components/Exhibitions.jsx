import { motion } from 'framer-motion';
import { useExhibitions } from '../hooks/useContent';

const Exhibitions = () => {
    const { exhibitions: rawExhibitions, currentExhibition } = useExhibitions();

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

    return (
        <section className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-3xl font-serif mb-16 text-center"
            >
                Exhibitions
            </motion.h2>

            {/* Current Exhibition Highlight */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-24 p-8 border border-white/10 bg-[#111111] rounded-sm text-center"
            >
                <span className="text-xs uppercase tracking-[0.3em] text-red-600 mb-4 block">Currently Showing</span>
                <h3 className="text-2xl md:text-4xl font-serif mb-2 text-white">{currentExhibition.title}</h3>
                <p className="text-gray-400 mb-2">{currentExhibition.location}</p>
                <p className="text-sm text-gray-500 font-mono">{currentExhibition.dates}</p>
            </motion.div>

            {/* Timeline */}
            <div className="space-y-16">
                {exhibitionsByYear.map((yearGroup, index) => (
                    <motion.div
                        key={yearGroup.year}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12"
                    >
                        {/* Year Marker */}
                        <div className="text-xl md:text-2xl font-mono text-gray-500 font-bold md:text-right pt-1">
                            {yearGroup.year}
                        </div>

                        {/* Items */}
                        <div className="space-y-8 border-l border-white/10 pl-8 md:pl-12 py-2">
                            {yearGroup.items.map((item, i) => (
                                <div key={i} className="group cursor-default">
                                    <h4 className={`text-xl md:text-2xl font-light mb-1 transition-colors duration-300 ${item.award ? 'text-red-600' : 'group-hover:text-white text-gray-400'}`}>
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 group-hover:text-gray-400 transition-colors">
                                        {item.location}
                                    </p>
                                    {item.award && (
                                        <span className="inline-block mt-2 text-[10px] uppercase tracking-wider border border-red-200 text-red-700 px-2 py-1 rounded">
                                            Award
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Exhibitions;
