import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle2, Circle, Trash2, Zap, Brain, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const INITIAL_TASKS = [
    { id: 1, title: 'Morning Standup', time: '09:00', category: 'work', status: 'completed' },
    { id: 2, title: 'Deep Work: Project X', time: '10:00', category: 'work', status: 'current' },
    { id: 3, title: 'Lunch Break', time: '13:00', category: 'health', status: 'upcoming' },
];

export const Tracker = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const isInitialLoad = useRef(true);

    // Initial Load & Selected Date Sync
    useEffect(() => {
        const historyStr = localStorage.getItem('daymaker_analytics_history');
        const history = historyStr ? JSON.parse(historyStr) : {};

        // Migration: If we have old tasks but no history for today, migrate them
        const oldTasksStr = localStorage.getItem('daymaker_tasks');
        const todayKey = new Date().toISOString().split('T')[0];

        isInitialLoad.current = true; // Block persistence during state sync

        if (!history[selectedDate]) {
            if (selectedDate === todayKey && oldTasksStr) {
                const oldTasks = JSON.parse(oldTasksStr);
                setTasks(oldTasks);
                // Clear old storage after first migration
                localStorage.removeItem('daymaker_tasks');
            } else {
                setTasks(selectedDate === todayKey ? INITIAL_TASKS : []);
            }
        } else {
            setTasks(history[selectedDate].tasks || []);
        }

        // Use a tiny timeout or just let the next effect run
        // Actually, better to just flag it.
        setTimeout(() => { isInitialLoad.current = false; }, 100);
    }, [selectedDate]);

    // Persistence & History Tracking (Triggers when tasks change)
    useEffect(() => {
        if (isInitialLoad.current) return;
        if (tasks === null) return; // Wait for load

        const historyStr = localStorage.getItem('daymaker_analytics_history');
        const history = historyStr ? JSON.parse(historyStr) : {};

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;

        let status = 'red';
        if (total > 0) {
            if (completed === total) status = 'green';
            else if (completed > 0) status = 'blue';
            else status = 'red';
        }

        // Only update history if it's different to avoid loops (though tasks change usually implies intent)
        history[selectedDate] = {
            date: selectedDate,
            total,
            completed,
            status,
            tasks: tasks
        };

        localStorage.setItem('daymaker_analytics_history', JSON.stringify(history));
    }, [tasks, selectedDate]);

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const addTask = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newTask = {
            id: Date.now(),
            title: formData.get('title'),
            time: formData.get('time'),
            category: formData.get('category'),
            status: 'upcoming'
        };
        const updated = [...tasks, newTask].sort((a, b) => a.time.localeCompare(b.time));
        setTasks(updated);
        setShowForm(false);
    };

    const toggleTask = (id) => {
        const updated = tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'upcoming' : 'completed' } : t);
        setTasks(updated);
    };

    const deleteTask = (id) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            {/* --- Header Section --- */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 font-bold text-xs uppercase tracking-[0.3em] mb-3">
                        <Zap size={14} className="fill-cyan-400" /> System Active
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                        Day <span className="text-slate-600">Tracker</span>
                    </h1>
                </motion.div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary !py-4 !px-8 text-lg shadow-[0_0_20px_rgba(0,201,200,0.2)]"
                >
                    <Plus size={20} /> {showForm ? "Close Panel" : "New Activity"}
                </button>
            </header>

            {/* --- Date Navigator Section --- */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between mb-12 gap-6 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-[#0B0D17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-sm focus:border-cyan-400/50 focus:outline-none transition-all cursor-pointer appearance-none"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                            ${selectedDate === new Date().toISOString().split('T')[0]
                                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(0,201,200,0.1)]'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'}
                        `}
                    >
                        Today
                    </button>
                </div>
            </motion.div>


            <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* --- Add Event Form (Conditional) --- */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="lg:col-span-4 sticky top-28"
                        >
                            <form onSubmit={addTask} className="rubrik-card p-8 border-cyan-500/30 bg-[#0F121D]">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Plus className="text-cyan-400" size={18} /> Initialize Task
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Activity Name</label>
                                        <input name="title" required className="input-field" placeholder="e.g. System Sync" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Time</label>
                                            <input name="time" type="time" required className="input-field" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Category</label>
                                            <select name="category" className="input-field bg-[#0B0D17]">
                                                <option value="work">Work</option>
                                                <option value="health">Health</option>
                                                <option value="focus">Focus</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary w-full justify-center mt-4">Deploy Task</button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Timeline Column --- */}
                <div className={`${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
                    <div className="relative border-l-2 border-slate-800 ml-6 md:ml-10 pl-10 space-y-8">
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                {/* Indicator Circle */}
                                <div className={`absolute -left-[51px] w-5 h-5 rounded-full border-4 bg-[#06080F] z-10 transition-all duration-300
                                    ${task.status === 'completed' ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,201,200,0.5)]' : 'border-slate-700'}
                                `} />

                                <div className={`rubrik-card flex items-center justify-between p-6 transition-all duration-300 ${task.status === 'completed' ? 'opacity-50 grayscale' : 'hover:border-cyan-500/40'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex flex-col items-center">
                                            <span className="text-xs font-mono text-cyan-400 font-bold">{task.time}</span>
                                            <Clock size={14} className="text-slate-600 mt-1" />
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                                                {task.title}
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{task.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`p-2 rounded-lg transition-colors ${task.status === 'completed' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                                        >
                                            {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                        </button>
                                        <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Insight Box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 flex gap-6 items-center"
                    >
                        <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                            <Brain size={28} />
                        </div>
                        <div>
                            <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-1">AI Productivity Insight</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                You have 3 high-intensity tasks scheduled. Based on your history, taking a 10-minute break after "Deep Work" will increase your focus by 22%.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};