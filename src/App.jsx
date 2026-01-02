import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navigation/Navbar';
import { Home } from './pages/Home';
import { Tracker } from './pages/Tracker';
import { Focus } from './pages/Focus';
import { Insights } from './pages/Insights';
import { DigitalPlanner } from './pages/DigitalPlanner';

import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import { GlobalSpotifyPlayer } from './components/Tools/GlobalSpotifyPlayer';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <div className="min-h-screen relative flex flex-col bg-[#06080F] selection:bg-cyan-500/30">

            {/* --- Advanced Rubrik-Style Background Layers --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              {/* Top Left Cyan Glow */}
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />

              {/* Bottom Right Purple/Blue Glow */}
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />

              {/* Subtle Grid Overlay for Tech Look */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
            </div>

            {/* --- Navigation --- */}
            <div className="relative z-50">
              <Navbar />
            </div>

            {/* --- Main Content Area --- */}
            {/* Added max-width and centered container for better professional spacing */}
            <main className="flex-1 relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/planner" element={<DigitalPlanner />} />
              </Routes>
            </main>

            {/* --- Footer --- */}
            <footer className="relative z-10 border-t border-white/5 py-12 bg-[#06080F]/80 backdrop-blur-md">
              <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-cyan-500 rounded-sm rotate-45" />
                  <span className="font-bold tracking-tighter text-white">DAYMAKER</span>
                </div>

                <p className="text-slate-500 text-sm font-medium">
                  © 2026 Day Maker App. Built for High-Performance.
                </p>

                <div className="flex gap-6 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
                </div>
              </div>
            </footer>
          </div>

          {/* Persistent Global Player */}
          <GlobalSpotifyPlayer />
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;