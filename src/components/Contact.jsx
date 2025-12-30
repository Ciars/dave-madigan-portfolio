import { useState } from 'react';
import { motion } from 'framer-motion';
import { contact } from '../data/content';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const Contact = ({ footerSettings = {} }) => {
    const {
        email = contact.email,
        instagram_url,
        copyright_text = `© ${new Date().getFullYear()} Dave Madigan. All rights reserved.`,
    } = footerSettings;

    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            const body = `${formState.message}\n\nFrom: ${formState.name} (${formState.email})`;
            window.location.href = `mailto:${email}?subject=Inquiry&body=${encodeURIComponent(body)}`;
            setStatus('success');
            setFormState({ name: '', email: '', message: '' });
        }, 800);
    };

    return (
        <footer id="contact" className="bg-[#050505] py-32 px-6 border-t border-white/5">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-12 gap-20">

                    <div className="lg:col-span-5">
                        <span className="section-label">Contact</span>
                        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-white mb-10">
                            Get in Touch
                        </h2>
                        <div className="space-y-12">
                            <div>
                                <p className="text-gray-400 uppercase text-[11px] tracking-widest font-bold mb-4">Direct Email</p>
                                <a href={`mailto:${email}`} className="text-3xl font-serif text-white hover:underline decoration-white/20 underline-offset-8 transition-all">
                                    {email}
                                </a>
                            </div>
                            {instagram_url && (
                                <div>
                                    <p className="text-gray-400 uppercase text-[11px] tracking-widest font-bold mb-4">Social</p>
                                    <a href={instagram_url} target="_blank" rel="noopener noreferrer" className="text-xl text-white hover:text-gray-300 transition-colors">
                                        Instagram — @dmadigan
                                    </a>
                                </div>
                            )}
                            <p className="text-gray-600 font-mono text-xs pt-12">{copyright_text}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <label className="section-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-white/10 py-4 text-white text-xl focus:outline-none focus:border-white transition-colors placeholder-gray-800"
                                        required
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="section-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formState.email}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-white/10 py-4 text-white text-xl focus:outline-none focus:border-white transition-colors placeholder-gray-800"
                                        required
                                        placeholder="hello@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="section-label">Message</label>
                                <textarea
                                    name="message"
                                    rows="5"
                                    value={formState.message}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-white text-xl focus:outline-none focus:border-white transition-colors resize-none placeholder-gray-800"
                                    required
                                    placeholder="Tell me about your vision"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-16 py-6 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full hover:bg-gray-200 transition-all flex items-center gap-4"
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 /> : <Send size={18} />}
                                {status === 'loading' ? 'Sending' : status === 'success' ? 'Email Client Opened' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Contact;
