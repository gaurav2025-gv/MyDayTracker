import React, { useState } from 'react';
import { Music, SkipBack, SkipForward, Play, Pause, Volume2 } from 'lucide-react';

export const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="glass-panel p-6 flex flex-col gap-5 group">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-500">
                    <div className={`w-full h-full flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Music size={32} className="text-white drop-shadow-md" />
                    </div>
                </div>
                <div className="overflow-hidden flex-1">
                    <h4 className="font-bold text-white text-lg truncate tracking-tight">Lofi Study Beats</h4>
                    <p className="text-sm text-slate-400 truncate font-medium">Cosmic Vibes Station</p>
                </div>
            </div>

            <div className="flex items-center justify-evenly mt-2">
                <button className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <SkipBack size={24} fill="currentColor" />
                </button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <SkipForward size={24} fill="currentColor" />
                </button>
            </div>

            {/* Fake Volume Bar */}
            <div className="flex items-center gap-3 px-2">
                <Volume2 size={16} className="text-slate-500" />
                <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden cursor-pointer group/vol">
                    <div className="h-full w-2/3 bg-slate-400 group-hover/vol:bg-white rounded-full transition-colors" />
                </div>
            </div>
        </div>
    );
};
