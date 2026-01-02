import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Tag } from 'lucide-react';

export const AddEventForm = ({ onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState('work');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !time) return;

        onAdd({
            id: Date.now(),
            title,
            time,
            category,
            status: 'upcoming'
        });

        setTitle('');
        setTime('');
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group w-full py-4 border-2 border-dashed border-slate-600/50 rounded-2xl text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all duration-300 flex items-center justify-center gap-3 hover:bg-white/5"
            >
                <div className="p-1 rounded-full bg-slate-700/50 group-hover:bg-accent-primary group-hover:text-white transition-colors">
                    <Plus size={20} />
                </div>
                <span className="font-medium tracking-wide">Add New Activity</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6 border-l-4 border-l-accent-primary animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-start mb-6">
                <h4 className="font-semibold text-lg text-white flex items-center gap-2">
                    <Calendar size={18} className="text-accent-primary" />
                    New Activity
                </h4>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white hover:rotate-90 transition-all p-1"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="What's your focus?"
                        className="glass-input pl-4 text-lg placeholder:text-slate-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="time"
                            className="glass-input w-40 pl-10 cursor-pointer"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 relative">
                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="glass-input pl-10 appearance-none cursor-pointer hover:bg-white/10"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="work" className="bg-slate-900 text-white">💼 Work</option>
                            <option value="personal" className="bg-slate-900 text-white">🏠 Personal</option>
                            <option value="study" className="bg-slate-900 text-white">📚 Study</option>
                            <option value="health" className="bg-slate-900 text-white">💪 Health</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="glass-button w-full from-accent-primary/20 to-accent-secondary/20 hover:from-accent-primary hover:to-accent-secondary border-white/10 text-white shadow-lg">
                    Add to Timeline
                </button>
            </div>
        </form>
    );
};
