import { useState } from 'react';
import { motion } from 'framer-motion';
import { contact } from '../data/content';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const Contact = ({ footerSettings = {} }) => {
    const {
        email = contact.email,
        instagram_url,
        copyright_text = `© ${new Date().getFullYear()} Dave Madigan. All rights reserved.`,
    } = footerSettings;

    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [botField, setBotField] = useState(''); // honeypot

    const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot check — bots fill hidden fields
        if (botField) return;

        setStatus('loading');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: `New inquiry from ${formState.name}`,
                    from_name: formState.name,
                    name: formState.name,
                    email: formState.email,
                    message: formState.message,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setFormState({ name: '', email: '', message: '' });
                // Reset to idle after 5 seconds so they can send another
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                console.error('Web3Forms error:', data);
                setStatus('error');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setStatus('error');
        }
    };

    const buttonLabel = {
        idle: 'Send Message',
        loading: 'Sending…',
        success: 'Message Sent!',
        error: 'Failed — Try Again',
    };

    const ButtonIcon = {
        idle: <Send size={18} />,
        loading: <Loader2 className="animate-spin" size={18} />,
        success: <CheckCircle2 size={18} />,
        error: <AlertCircle size={18} />,
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
                            {/* Honeypot field — hidden from real users, bots fill it */}
                            <input
                                type="text"
                                name="botcheck"
                                value={botField}
                                onChange={(e) => setBotField(e.target.value)}
                                style={{ display: 'none' }}
                                tabIndex="-1"
                                autoComplete="off"
                            />

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

                            {status === 'error' && (
                                <p className="text-red-400 text-sm">
                                    Something went wrong. Please try again or email directly.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className={`px-16 py-6 font-bold uppercase text-xs tracking-widest rounded-full transition-all flex items-center gap-4 ${status === 'success'
                                        ? 'bg-green-500 text-white'
                                        : status === 'error'
                                            ? 'bg-red-500 text-white hover:bg-red-400'
                                            : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                {ButtonIcon[status]}
                                {buttonLabel[status]}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Contact;
