import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, RotateCcw, Music, Volume2, Plus, Trash2, Zap, Link as LinkIcon, Save, Coffee, ListMusic, Settings2, Check } from 'lucide-react';

const DEFAULT_TRACK = "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0";

export const Focus = () => {
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [customMinutes, setCustomMinutes] = useState('25'); // Use string for better input handling



    const {
        playSpotify,
        spotifyUrl,
        playerMode,
        setPlayerMode,
        isPlaying: isMusicPlaying,
        currentTrack,
        internalPlaylist,
        togglePlay,
        nextTrack,
        prevTrack
    } = useMusic();

    // Library State
    const [myTracks, setMyTracks] = useState(() => {
        const saved = localStorage.getItem('daymaker_tracks');
        return saved ? JSON.parse(saved) : [];
    });
    const [inputUrl, setInputUrl] = useState('');
    const [inputName, setInputName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [addMode, setAddMode] = useState('song'); // 'song' or 'playlist'


    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('daymaker_tracks', JSON.stringify(myTracks));
    }, [myTracks]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => setSeconds(s => s - 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper: Convert standard Spotify URL to Embed URL
    const getEmbedUrl = (url) => {
        try {
            const pattern = /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
            const match = url.match(pattern);
            if (match) {
                const type = match[1];
                const id = match[2];
                return {
                    embed: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
                    type: type // track, playlist, or album
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    };


    const handleAddTrack = (e) => {
        e.preventDefault();
        const result = getEmbedUrl(inputUrl);

        if (!result) {
            alert("Please paste a valid Spotify Link (Track, Album, or Playlist)");
            return;
        }

        const newTrack = {
            id: Date.now(),
            name: inputName || "Untitled Track",
            url: result.embed,
            originalUrl: inputUrl,
            type: result.type
        };

        setMyTracks([newTrack, ...myTracks]);
        setInputUrl('');
        setInputName('');
        setShowAddForm(false);
        playSpotify(result.embed); // Auto-play via Global Player
    };


    const handleDelete = (id) => {
        setMyTracks(myTracks.filter(t => t.id !== id));
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-cyan/20 bg-cyber-cyan/5 text-cyber-cyan text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                    <Zap size={12} className="fill-cyber-cyan" /> Deep Work Protocol
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Focus <span className="text-slate-700">Studio</span></h1>
                <p className="text-slate-400 max-w-xl leading-relaxed">Eliminate distractions and enter the flow state with enterprise-grade focus tools.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">

                {/* Timer Module */}
                <div className="rubrik-card flex flex-col items-center justify-center p-12 min-h-[450px] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <motion.div
                            className="h-full bg-cyber-cyan"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(seconds / totalSeconds) * 100}%` }}
                        />
                    </div>

                    <div className="absolute top-6 right-6 flex gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-cyber-cyan text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>

                    <span className="text-slate-500 font-mono text-xs tracking-[0.5em] mb-8 uppercase">Pomodoro Timer</span>

                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center mb-12"
                            >
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={customMinutes}
                                        onChange={(e) => setCustomMinutes(e.target.value)}
                                        className="bg-transparent text-5xl font-black w-24 text-center focus:outline-none text-white border-b-2 border-cyber-cyan/30 focus:border-cyber-cyan transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0"
                                    />
                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">MIN</span>
                                    <button
                                        onClick={() => {
                                            const mins = parseInt(customMinutes) || 1;
                                            const validatedMins = Math.max(1, Math.min(120, mins));
                                            const newTotal = validatedMins * 60;
                                            setTotalSeconds(newTotal);
                                            setSeconds(newTotal);
                                            setCustomMinutes(validatedMins.toString());
                                            setIsActive(false);
                                            setIsEditing(false);
                                        }}
                                        className="bg-cyber-cyan text-black p-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,201,200,0.3)]"
                                    >
                                        <Check size={24} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-3 uppercase tracking-widest">Set focus duration (1-120 min)</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-8xl md:text-9xl font-black tracking-tighter mb-12 font-mono text-white group-hover:text-cyber-cyan transition-colors"
                            >
                                {formatTime(seconds)}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-6">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            disabled={isEditing}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isEditing ? 'opacity-20 ' : ''} ${isActive ? 'bg-white text-black' : 'bg-cyber-cyan text-black shadow-[0_0_30px_rgba(0,201,200,0.4)] hover:scale-110'}`}
                        >
                            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                        </button>
                        <button
                            onClick={() => { setSeconds(totalSeconds); setIsActive(false); }}
                            className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all font-bold text-slate-400 hover:text-white"
                        >
                            <RotateCcw size={28} />
                        </button>
                    </div>

                </div>

                {/* Music Library Module (Custom Implementation) */}
                <div className="flex flex-col gap-6">
                    {/* The Official '100 Study Songs' Playlist */}
                    <div className="rubrik-card p-0 min-h-[400px] shadow-2xl overflow-hidden border border-white/5 bg-[#0B0D17]">
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0"
                            width="100%"
                            height="400"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    </div>
                    {/* Personal Library Management */}
                    <div className="rubrik-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-white">
                                <Music className="text-cyber-cyan" size={20} />
                                Personal Library
                            </h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setAddMode('song'); setShowAddForm(true); }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Song
                                </button>
                                <button
                                    onClick={() => { setAddMode('playlist'); setShowAddForm(true); }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Playlist
                                </button>
                            </div>
                        </div>


                        {/* Add Song Form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    onSubmit={handleAddTrack}
                                    className="overflow-hidden mb-6 space-y-3 border-b border-white/10 pb-6"
                                >
                                    <input
                                        type="text"
                                        placeholder={`Paste Spotify ${addMode === 'playlist' ? 'Playlist' : 'Track'} Link`}
                                        className="input-field text-sm"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                        required
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder={`${addMode === 'playlist' ? 'Playlist' : 'Song'} Name`}
                                            className="input-field text-sm"
                                            value={inputName}
                                            onChange={(e) => setInputName(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn-primary !px-4 !py-2">
                                            <Save size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500">*Paste any open.spotify.com link.</p>
                                </motion.form>

                            )}
                        </AnimatePresence>

                        {/* Track List */}
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {myTracks.length === 0 && !showAddForm && (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No custom tracks yet. <br />Click "Add Song" to build your focus list.
                                </div>
                            )}

                            {myTracks.map((track) => (
                                <div key={track.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => playSpotify(track.url)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform">
                                            {track.type === 'playlist' || track.type === 'album' ? (
                                                <ListMusic size={14} />
                                            ) : (
                                                <Play size={12} fill="currentColor" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white truncate max-w-[150px]">
                                            {track.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(track.id)}
                                        className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};