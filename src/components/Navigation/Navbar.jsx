import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import { Menu, X, Play, Pause, Music as MusicIcon, AudioWaveform } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isPlaying, togglePlay, currentTrack } = useMusic();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Day Tracker', path: '/tracker' },
        { name: 'Focus Tools', path: '/focus' },
        { name: 'AI Insights', path: '/insights' },
        { name: 'Digital Planner', path: '/planner' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-transparent
        ${isScrolled ? 'bg-[#0B0D17]/80 backdrop-blur-md border-[rgba(255,255,255,0.08)] py-4' : 'bg-transparent py-6'}
      `}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <NavLink to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-white">Day</span>
                    <span className="text-cyan-400">Maker</span>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                </NavLink>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-cyan-400 
                ${isActive ? 'text-cyan-400' : 'text-slate-300'}`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                {/* VISIBLE ON EVERY PAGE: Global Music Widget (Replaces Launch App) */}
                <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-4 py-1.5 backdrop-blur-sm group hover:border-cyan-500/30 transition-colors">
                    {/* Album Art / Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTrack.cover} ${isPlaying ? 'animate-spin-slow' : ''}`}>
                        <MusicIcon size={14} className="text-white" />
                    </div>

                    {/* Track Info */}
                    <div className="flex flex-col w-32 overflow-hidden">
                        <span className="text-xs font-bold text-white truncate leading-none">{currentTrack.title}</span>
                        <span className="text-[10px] text-cyan-400 truncate leading-tight flex items-center gap-1">
                            {isPlaying ? <span className="animate-pulse">Now Playing...</span> : 'Paused'}
                        </span>
                    </div>

                    {/* Play/Pause Control */}
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#0B0D17] border-b border-white/10 p-6 flex flex-col gap-4 animate-fade-up">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg font-medium text-slate-300 hover:text-cyan-400"
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
};
