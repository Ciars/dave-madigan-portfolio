import { useState } from 'react';
import { motion } from 'framer-motion';
import { contact } from '../data/content';
import Subscribe from './Subscribe';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const Contact = ({ footerSettings = {} }) => {
    const {
        email = contact.email,
        instagram_url,
        copyright_text = `© ${new Date().getFullYear()} Dave Madigan. All rights reserved.`,
        show_subscribe = true
    } = footerSettings;

    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
        if (status === 'error') setStatus('idle');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formState.name || !formState.email || !formState.message) {
            setStatus('error');
            return;
        }

        setStatus('loading');

        // Simulate network delay for UX then open mailto
        setTimeout(() => {
            const subject = formState.subject ? `Portfolio Enquiry: ${formState.subject}` : `Portfolio Enquiry from ${formState.name}`;
            const body = `${formState.message}\n\n--------------------------------\nFrom: ${formState.name}\nEmail: ${formState.email}`;

            window.location.href = `mailto:dave.madigan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            setStatus('success');
            setFormState({ name: '', email: '', subject: '', message: '' });

            // Reset success message after 5s
            setTimeout(() => setStatus('idle'), 5000);
        }, 800);
    };

    return (
        <footer className="bg-black text-white py-24 px-6 text-center border-t border-white/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto space-y-16"
            >
                {show_subscribe && <Subscribe />}

                <div className="grid md:grid-cols-2 gap-16 items-start text-left">
                    {/* Left: Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-serif mb-6">Get in Touch</h2>
                            <p className="text-gray-400 leading-relaxed">
                                I am always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Email</p>
                            <a href={`mailto:${email}`} className="text-xl md:text-2xl hover:text-gray-300 transition-colors">
                                {email}
                            </a>
                        </div>

                        {contact.studio && (
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Studio</p>
                                <p className="text-gray-400 whitespace-pre-line">{contact.studio}</p>
                            </div>
                        )}

                        {instagram_url && (
                            <div>
                                <a
                                    href={instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                >
                                    Instagram
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/5">
                        <div className="space-y-4">
                            <div>
                                <label className="sr-only">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formState.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="sr-only">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formState.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="sr-only">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="Subject (Optional)"
                                    value={formState.subject}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="sr-only">Message</label>
                                <textarea
                                    name="message"
                                    rows="4"
                                    placeholder="Message"
                                    value={formState.message}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors resize-none"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ${status === 'success' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {status === 'loading' ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : status === 'success' ? (
                                <>
                                    <CheckCircle2 size={20} /> Opened Email Client
                                </>
                            ) : (
                                <>
                                    Send Message <Send size={18} />
                                </>
                            )}
                        </button>
                        {status === 'error' && (
                            <p className="text-red-400 text-sm text-center">Please fill in all required fields.</p>
                        )}
                    </form>
                </div>

                <div className="pt-12 text-xs text-gray-600 border-t border-white/10">
                    {copyright_text}
                </div>
            </motion.div>
        </footer>
    );
};

export default Contact;
