import React from 'react';

export const AppLayout = ({ children }) => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen p-6 md:p-10 text-white relative overflow-hidden flex flex-col">
            {/* Background Decor - Enhanced */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full relative z-10 flex-1 flex flex-col">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 tracking-tight">
                            Day Maker
                        </h1>
                        <p className="text-slate-300 mt-2 text-lg font-light tracking-wide">{today}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-panel px-5 py-2 flex items-center gap-3 bg-white/5 border-white/20">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-green-400 animate-none" />
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
                            </div>
                            <span className="text-sm font-medium tracking-wide">AI Connected</span>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-16rem)] min-h-[600px]">
                    {children}
                </main>
            </div>
        </div>
    );
};
