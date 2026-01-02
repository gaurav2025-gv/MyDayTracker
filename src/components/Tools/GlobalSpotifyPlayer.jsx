import React, { useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import { Minimize2, Maximize2, X } from 'lucide-react';

export const GlobalSpotifyPlayer = () => {
    const { playerMode, spotifyUrl, setPlayerMode } = useMusic();
    const [isMinified, setIsMinified] = useState(true);

    // Only render if mode is Spotify
    if (playerMode !== 'spotify') return null;

    return (
        <div className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-[#0B0D17] ${isMinified ? 'w-80 h-20' : 'w-80 h-96 md:w-96'}`}>

            {/* Header Controls */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex gap-2">
                    <button
                        onClick={() => setIsMinified(!isMinified)}
                        className="bg-black/50 hover:bg-black/80 text-white p-1 rounded-md backdrop-blur-sm"
                    >
                        {isMinified ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button
                        onClick={() => setPlayerMode('internal')}
                        className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-md backdrop-blur-sm"
                        title="Close Player"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* The Persistent Iframe */}
            <iframe
                style={{ borderRadius: '12px' }}
                src={spotifyUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="bg-[#0B0D17]"
            />
        </div>
    );
};
