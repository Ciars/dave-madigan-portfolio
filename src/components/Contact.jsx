import { motion } from 'framer-motion';
import { contact } from '../data/content';
import Subscribe from './Subscribe';

const Contact = () => {
    return (
        <footer className="py-24 px-6 text-center border-t border-white/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <Subscribe />
                <h2 className="text-3xl font-serif text-white mt-16">Get in Touch</h2>

                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Enquiries</p>
                    <a
                        href={`mailto:${contact.email}`}
                        className="text-xl md:text-3xl text-gray-300 hover:text-red-500 transition-colors duration-300"
                    >
                        {contact.email}
                    </a>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Studio</p>
                    <p className="text-gray-400 max-w-md mx-auto">
                        {contact.studio}
                    </p>
                </div>

                <div className="pt-24 text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Dave Madigan. All rights reserved.
                </div>
            </motion.div>
        </footer>
    );
};

export default Contact;
