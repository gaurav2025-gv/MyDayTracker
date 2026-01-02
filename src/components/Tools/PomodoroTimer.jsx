import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        setIsActive(false);
                        clearInterval(interval);
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
    };

    const progress = ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

    return (
        <div className="glass-panel p-8 flex flex-col items-center justify-center relative shadow-2xl">
            {/* Ambient Glow */}
            <div className={`absolute inset-0 bg-accent-primary/5 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            <div className="flex items-center gap-2 mb-6 text-accent-secondary relative z-10">
                <Timer size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Focus Mode</span>
            </div>

            <div className="relative mb-8 z-10">
                <div className="text-7xl font-bold font-mono text-white tabular-nums tracking-wider drop-shadow-2xl">
                    {String(minutes).padStart(2, '0')}
                    <span className="animate-pulse">:</span>
                    {String(seconds).padStart(2, '0')}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-8 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex gap-6 relative z-10">
                <button
                    onClick={toggle}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-blue-600 flex items-center justify-center text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] active:scale-95 group"
                >
                    {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={reset}
                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition-all hover:scale-105 hover:text-white active:scale-95"
                >
                    <RotateCcw size={24} />
                </button>
            </div>
        </div>
    );
};
