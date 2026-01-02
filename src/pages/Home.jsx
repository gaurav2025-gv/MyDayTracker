import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, Brain, PlayCircle, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const Home = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center">
                
                {/* Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(0,201,200,0.1)]"
                >
                    <Sparkles size={14} className="animate-spin-slow" />
                    Revolutionizing Daily Flow
                </motion.div>

                {/* Main Heading */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8"
                >
                    Orchestrate Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        Productivity.
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12"
                >
                    Stop managing tasks and start mastering time. DayMaker combines 
                    <span className="text-white font-medium"> AI-driven insights</span> with enterprise-grade focus tools to secure your daily output.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-6 mb-24"
                >
                    <NavLink to="/tracker" className="btn-primary group !px-10 !py-4 text-lg">
                        Get Started Free 
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                    <NavLink to="/focus" className="btn-secondary !px-10 !py-4 text-lg backdrop-blur-md">
                        Explore Studio
                    </NavLink>
                </motion.div>

                {/* Featured Product Preview */}
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative w-full max-w-5xl group"
                >
                    {/* Glow effect behind the card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    
                    <div className="relative bg-[#0F121D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Browser Top Bar */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1D2D]/50 border-b border-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="px-4 py-1 bg-black/20 rounded-md text-[10px] text-slate-500 font-mono tracking-widest">
                                APP.DAYMAKER.IO/DASHBOARD
                            </div>
                            <div className="w-10" />
                        </div>
                        
                        {/* Mock UI Content */}
                        <div className="p-8 grid grid-cols-12 gap-6">
                            <div className="col-span-4 space-y-4">
                                <div className="h-32 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/10 p-4">
                                    <div className="w-12 h-2 bg-cyan-500/20 rounded mb-2" />
                                    <div className="w-full h-8 bg-cyan-500/5 rounded" />
                                </div>
                                <div className="h-48 rounded-xl bg-white/5 border border-white/5" />
                            </div>
                            <div className="col-span-8 space-y-4">
                                <div className="h-16 rounded-xl bg-white/5 border border-white/5 w-full" />
                                <div className="h-64 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Feature Grid Section */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">The Operating System <br/>for your Day.</h2>
                        <p className="text-slate-400 leading-relaxed">Designed for builders, creators, and high-performance teams who demand more from their time.</p>
                    </div>
                    <div className="flex gap-4">
                         <div className="p-3 rounded-full border border-white/5 bg-white/5 text-slate-400"><ShieldCheck size={20}/></div>
                         <div className="p-3 rounded-full border border-white/5 bg-white/5 text-slate-400"><Zap size={20}/></div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<Layout size={28} className="text-cyan-400" />}
                        title="Day Tracker"
                        desc="A unified timeline that visualizes your entire workload in a high-density console."
                        link="/tracker"
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Brain size={28} className="text-purple-400" />}
                        title="AI Insights"
                        desc="Neural pattern recognition that suggests your optimal deep-work windows."
                        link="/insights"
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<PlayCircle size={28} className="text-blue-400" />}
                        title="Focus Studio"
                        desc="Integrated lofi-streaming and focus-locks to prevent digital distractions."
                        link="/focus"
                        delay={0.3}
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, link, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
    >
        <NavLink to={link} className="rubrik-card group block h-full !p-8 border-white/5 hover:border-cyan-500/30 transition-all duration-500">
            <div className="mb-8 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed mb-6">{desc}</p>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-500">
                Initialize Module <ArrowRight size={14} />
            </div>
        </NavLink>
    </motion.div>
);