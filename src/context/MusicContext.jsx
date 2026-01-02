import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    // Playlist (Mock Data or Real URLs)
    const INTERNAL_PLAYLIST = [
        {
            title: "Lofi Study Beats",
            artist: "Cosmic Vibes",
            url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3",
            cover: "bg-gradient-to-br from-pink-500 to-orange-400"
        },
        {
            title: "Deep Focus",
            artist: "Mindful State",
            url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d216f15896.mp3?filename=ambient-piano-amp-drone-10781.mp3",
            cover: "bg-gradient-to-br from-blue-500 to-purple-600"
        },
        {
            title: "Night Walk",
            artist: "Cyber Dreams",
            url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_145e7f6f02.mp3?filename=night-walk-124978.mp3",
            cover: "bg-gradient-to-br from-emerald-500 to-cyan-600"
        }
    ];

    const DEFAULT_SPOTIFY = "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0";

    // State: Player Mode ('internal' | 'spotify')
    const [playerMode, setPlayerMode] = useState(() => localStorage.getItem('daymaker_player_mode') || 'internal');

    // State: Spotify Embed
    const [spotifyUrl, setSpotifyUrl] = useState(() => localStorage.getItem('daymaker_spotify_url') || DEFAULT_SPOTIFY);

    // Initialize state from localStorage
    const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
        const saved = localStorage.getItem('daymaker_music_index');
        return saved ? parseInt(saved) : 0;
    });

    const [isPlaying, setIsPlaying] = useState(() => {
        const saved = localStorage.getItem('daymaker_music_playing');
        return saved === 'true';
    });

    // Save Modes
    useEffect(() => {
        localStorage.setItem('daymaker_player_mode', playerMode);
        localStorage.setItem('daymaker_spotify_url', spotifyUrl);
    }, [playerMode, spotifyUrl]);

    // Use a ref for the Audio object to persist it without re-renders
    const audioRef = useRef(null);

    // Initialize Audio Object Once
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    useEffect(() => {
        const audio = audioRef.current;

        // Restore saved timestamp on fresh load/track change
        const savedTime = localStorage.getItem('daymaker_music_time');

        // Setup initial source
        if (audio.src !== INTERNAL_PLAYLIST[currentTrackIndex].url) {
            audio.src = INTERNAL_PLAYLIST[currentTrackIndex].url;
            if (savedTime && parseFloat(savedTime) > 0) {
                audio.currentTime = parseFloat(savedTime);
            }
        }

        // Only manage internal audio if mode is 'internal'
        if (playerMode === 'internal') {
            // Save playback position periodically (to avoid saving on every millisecond)
            const saveTime = () => localStorage.setItem('daymaker_music_time', audio.currentTime);
            audio.addEventListener('timeupdate', saveTime);

            // Auto-play if state says playing
            if (isPlaying) {
                audio.play().catch(() => {
                    console.log("Autoplay blocked, waiting for interaction");
                    setIsPlaying(false);
                });
            } else {
                audio.pause();
            }
            return () => {
                audio.removeEventListener('timeupdate', saveTime);
            };
        } else {
            // If Spotify mode, pause internal audio
            audio.pause();
        }
    }, [currentTrackIndex, playerMode]); // Only re-run full setup on track change, not play/pause toggles

    // Separate effect for simple Play/Pause toggle to avoid reloading source
    useEffect(() => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.play().catch(e => console.error("Playback failed", e));
        } else {
            audio.pause();
        }
        // Save state
        localStorage.setItem('daymaker_music_playing', isPlaying);
        localStorage.setItem('daymaker_music_index', currentTrackIndex);
    }, [isPlaying, currentTrackIndex]);

    const togglePlay = () => {
        if (playerMode === 'spotify') {
            setPlayerMode('internal'); // Switch back to internal on play
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        setPlayerMode('internal');
        localStorage.setItem('daymaker_music_time', 0);
        setCurrentTrackIndex(prev => (prev + 1) % INTERNAL_PLAYLIST.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setPlayerMode('internal');
        localStorage.setItem('daymaker_music_time', 0);
        setCurrentTrackIndex(prev => (prev - 1 + INTERNAL_PLAYLIST.length) % INTERNAL_PLAYLIST.length);
        setIsPlaying(true);
    };

    const playSpotify = (url) => {
        setSpotifyUrl(url);
        setPlayerMode('spotify');
        setIsPlaying(false); // Pause internal
    };

    return (
        <MusicContext.Provider value={{
            isPlaying,
            currentTrack: INTERNAL_PLAYLIST[currentTrackIndex],
            playerMode,
            spotifyUrl,
            internalPlaylist: INTERNAL_PLAYLIST,
            togglePlay,
            nextTrack,
            prevTrack,
            playSpotify,
            setPlayerMode,
            setSpotifyUrl
        }}>
            {children}
        </MusicContext.Provider>
    );
};
