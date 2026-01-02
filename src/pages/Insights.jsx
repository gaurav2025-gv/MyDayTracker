import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { analyzeDayPerformance } from '../services/gemini';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';


export const Insights = () => {
    const { user } = useAuth();
    // 1. History & Year State
    const [history, setHistory] = useState({});
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);

    // 2. Stats State
    const [stats, setStats] = useState({ green: 0, blue: 0, red: 0, total: 0, maxStreak: 0, activeDays: 0 });

    // 3. Selection & AI State
    const [selectedDay, setSelectedDay] = useState(null); // { date, data }
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        // Load Available Years
        const years = [];
        for (let y = 2029; y >= 2026; y--) {
            years.push(y);
        }
        setAvailableYears(years);

        if (!user) {
            // Unauthenticated: Load from localStorage
            const saved = localStorage.getItem('daymaker_analytics_history');
            if (saved) setHistory(JSON.parse(saved));
            return;
        }

        // Authenticated: Load from Firestore Collection
        const historyRef = collection(db, `users/${user.uid}/history`);
        const q = query(historyRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const historyData = {};
            querySnapshot.forEach((doc) => {
                historyData[doc.id] = doc.data();
            });
            setHistory(historyData);
        });

        return () => unsubscribe();
    }, [user]);

    // 4. Effect: Recalculate Stats
    useEffect(() => {
        calculateStats();
    }, [history, selectedYear]);

    const calculateStats = () => {
        let green = 0, blue = 0, red = 0, active = 0;
        let currentStreak = 0;
        let maxStreak = 0;

        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31);

        for (let d = new Date(yearStart); d <= yearEnd; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const dayData = history[dateKey];

            if (dayData) {
                active++;
                if (dayData.status === 'green') green++;
                else if (dayData.status === 'blue') blue++;
                else red++;
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        setStats({ green, blue, red, total: green + blue + red, activeDays: active, maxStreak });
    };

    // 5. Grid Generation & Data Grouping
    const generateCalendarGrid = () => {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);

        const startDayOfWeek = startDate.getDay();
        const gridStartDate = new Date(startDate);
        gridStartDate.setDate(gridStartDate.getDate() - startDayOfWeek);

        const endDayOfWeek = endDate.getDay();
        const gridEndDate = new Date(endDate);
        gridEndDate.setDate(gridEndDate.getDate() + (6 - endDayOfWeek));

        const calendarData = [];
        let currentDate = new Date(gridStartDate);

        while (currentDate <= gridEndDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const isTargetYear = currentDate.getFullYear() === selectedYear;

            calendarData.push({
                date: dateKey,
                data: history[dateKey],
                month: currentDate.toLocaleString('default', { month: 'short' }),
                dayOfMonth: currentDate.getDate(),
                inYear: isTargetYear
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Group into weeks
        const weeks = [];
        for (let i = 0; i < calendarData.length; i += 7) {
            weeks.push(calendarData.slice(i, i + 7));
        }
        return weeks;
    };

    const weekGroups = generateCalendarGrid();

    // Chart Data Calculations
    const getWeeklyStats = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());

        const d = [];
        for (let i = 0; i < 7; i++) {
            const curr = new Date(start);
            curr.setDate(start.getDate() + i);
            const key = curr.toISOString().split('T')[0];
            const data = history[key];
            let color = "bg-slate-800";
            if (data) {
                if (data.status === 'green') color = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                else if (data.status === 'blue') color = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]";
                else color = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]";
            }
            d.push({
                label: curr.toLocaleDateString('default', { weekday: 'narrow' }),
                value: data?.completed || 0,
                status: data?.status || 'none',
                color: color,
                fullDate: curr.toLocaleDateString('default', { month: 'short', day: 'numeric' })
            });
        }
        return d;
    };

    const getMonthlyStats = () => {
        const d = [];
        for (let m = 0; m < 12; m++) {
            const monthName = new Date(selectedYear, m, 1).toLocaleString('default', { month: 'short' });
            let g = 0, b = 0, r = 0, totalTasks = 0;

            Object.entries(history).forEach(([date, data]) => {
                const dateObj = new Date(date);
                if (dateObj.getFullYear() === selectedYear && dateObj.getMonth() === m) {
                    if (data.status === 'green') g++;
                    else if (data.status === 'blue') b++;
                    else r++;
                    totalTasks += (data.completed || 0);
                }
            });
            d.push({ label: monthName, green: g, blue: b, red: r, totalTasks });
        }
        return d;
    };

    const weeklyStats = getWeeklyStats();
    const monthlyStats = getMonthlyStats();
    const maxWeekValue = Math.max(...weeklyStats.map(s => s.value), 1);

    // Find Max monthly volume (sum of green+blue+red days for normalization, or just max days 31)
    const maxMonthDays = 31; // Simplest for a stacked "days" bar

    // Pie Chart Logic (SVG)
    const totalDaysInSelection = stats.total || 1;
    const pieData = [
        { key: 'green', val: stats.green, color: '#22c55e' },
        { key: 'blue', val: stats.blue, color: '#3b82f6' },
        { key: 'red', val: stats.red, color: '#ef4444' }
    ].filter(p => p.val > 0);

    const getPieSlices = () => {
        let currentOffset = 0;
        return pieData.map(p => {
            const percentage = (p.val / totalDaysInSelection) * 100;
            const strokeDash = `${percentage} 100`;
            const slice = { ...p, dash: strokeDash, offset: -currentOffset };
            currentOffset += percentage;
            return slice;
        });
    };
    const pieSlices = getPieSlices();

    // Month Labels Logic (Based on first day of each month)
    const getMonthLabels = () => {
        const labels = [];
        let currentMonth = "";
        weekGroups.forEach((week, idx) => {
            const firstDay = week[0];
            if (firstDay.inYear && firstDay.month !== currentMonth) {
                labels.push({ index: idx, label: firstDay.month });
                currentMonth = firstDay.month;
            }
        });
        return labels;
    };

    const monthLabels = getMonthLabels();

    // Tooltip & Interactions
    const [tooltip, setTooltip] = useState(null);

    const handleMouseEnter = (e, day) => {
        const rect = e.target.getBoundingClientRect();

        let statusText = 'No Activity';
        let statusColor = 'text-slate-500';

        if (day.data) {
            if (day.data.status === 'green') { statusText = 'Perfect'; statusColor = 'text-green-400'; }
            else if (day.data.status === 'blue') { statusText = 'Partial'; statusColor = 'text-blue-400'; }
            else { statusText = 'Incomplete'; statusColor = 'text-red-400'; }
        }

        const dateObj = new Date(day.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        setTooltip({
            x: rect.left + window.scrollX - 70,
            y: rect.top + window.scrollY - 80,
            date: dateStr,
            status: statusText,
            color: statusColor,
            details: day.data ? `${day.data.completed}/${day.data.total} Tasks` : '0 Tasks'
        });
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setAiAnalysis(null);
        setTooltip(null);
    };

    // AI Analysis Logic
    const triggerAIAnalysis = async () => {
        if (!selectedDay) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeDayPerformance(selectedDay, stats);
            setAiAnalysis(result);
        } catch (error) {
            console.error("AI Analysis failed:", error);
            if (error.message === "API_KEY_MISSING") {
                setAiAnalysis({
                    mistakes: ["Gemini API Key is missing."],
                    solutions: ["Please add your VITE_GEMINI_API_KEY to the .env file to enable live AI coaching."]
                });
            } else {
                setAiAnalysis({
                    mistakes: ["Coaching session interrupted."],
                    solutions: [`Error: ${error.message || "The AI model is currently busy."} Try restarting your dev server.`]
                });
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="pt-24 pb-24 max-w-6xl mx-auto px-6 relative" onClick={() => setTooltip(null)} onMouseLeave={() => setTooltip(null)}>
            <header className="mb-12 text-center animate-fade-up">
                <h1 className="text-4xl font-bold mb-2">Performance Analytics</h1>
                <p className="text-slate-400">Advanced visualization of your discipline.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-fade-up">
                {/* Main Graph Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Graph Header */}
                    <div className="flex justify-between items-center rounded-t-xl bg-[#0F121D] p-4 border-b border-white/5">
                        <div className="flex gap-6 items-baseline">
                            <h3 className="text-white font-bold text-lg">
                                {stats.activeDays} <span className="text-slate-400 text-sm font-normal">submissions in {selectedYear}</span>
                            </h3>
                            <div className="text-xs text-slate-500">
                                Total active: <span className="text-white font-bold">{stats.activeDays}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Max streak: <span className="text-white font-bold">{stats.maxStreak}</span>
                            </div>
                        </div>

                        {/* Year Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-[#1E2335] hover:bg-white/10 text-slate-300 text-xs font-bold py-1.5 px-3 rounded transition-colors">
                                {selectedYear} <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-24 bg-[#1E2335] rounded-lg shadow-xl border border-white/10 overflow-hidden hidden group-hover:block z-20">
                                {availableYears.map(yr => (
                                    <button
                                        key={yr}
                                        onClick={() => setSelectedYear(yr)}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 ${yr === selectedYear ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
                                    >
                                        {yr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contributing Graph with Month Gaps */}
                    <div className="rubrik-card rounded-t-none p-6 pt-2 bg-[#0F121D] border-slate-800 overflow-x-auto custom-scrollbar relative min-h-[160px]">
                        {tooltip && !selectedDay && (
                            <div
                                className="fixed z-[999] px-4 py-2 bg-[#1E2335] text-white text-xs rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-none transform transition-all duration-200"
                                style={{ top: tooltip.y, left: tooltip.x }}
                            >
                                <div className={`font-bold mb-1 ${tooltip.color}`}>{tooltip.status}</div>
                                <div className="text-white font-mono mb-1">{tooltip.date}</div>
                                <div className="text-slate-400 text-[10px] border-t border-white/10 pt-1 mt-1">{tooltip.details}</div>
                                <div className="text-cyan-400 text-[9px] mt-1 font-bold">Click for details</div>
                            </div>
                        )}

                        <div className="min-w-[800px]">
                            {/* Month Labels */}
                            <div className="flex text-[10px] text-slate-500 mb-2 relative h-4 w-full">
                                {monthLabels.map((m, idx) => {
                                    // Estimate position by week index + accumulated gaps
                                    // Each week is ~13px (10px + 3px gap)
                                    // Gaps add another ~8px
                                    const gapsBefore = monthLabels.filter(label => label.index < m.index).length;
                                    const leftPos = (m.index * 13) + (gapsBefore * 12); // Matching ml-3 gap
                                    return (
                                        <span key={idx} style={{ left: `${leftPos}px`, position: 'absolute' }}>{m.label}</span>
                                    );
                                })}
                            </div>

                            {/* The Grid (Flexbox for Gaps) */}
                            <div className="flex gap-[3px]">
                                {weekGroups.map((week, wIdx) => {
                                    const prevWeek = weekGroups[wIdx - 1];
                                    const monthChanged = prevWeek && week[0].month !== prevWeek[0].month;

                                    return (
                                        <div key={wIdx} className={`flex flex-col gap-[3px] ${monthChanged ? 'ml-3' : ''}`}>
                                            {week.map((day) => {
                                                let colorClass = "bg-[#1E2335]";
                                                if (day.data) {
                                                    if (day.data.status === 'green') colorClass = "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]";
                                                    else if (day.data.status === 'blue') colorClass = "bg-blue-500 shadow-[0_0_3px_rgba(59,130,246,0.3)]";
                                                    else colorClass = "bg-red-900/80";
                                                }
                                                const opacityClass = day.inYear ? 'opacity-100' : 'opacity-10 pointer-events-none';

                                                return (
                                                    <div
                                                        key={day.date}
                                                        onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                                                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                                                        className={`w-[10px] h-[10px] rounded-[2px] ${colorClass} ${opacityClass} hover:ring-1 hover:ring-white/50 hover:scale-125 transition-all cursor-pointer`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500">
                            <span>Less activity</span>
                            <div className="flex items-center gap-1.5 mx-2">
                                <div className="w-[8px] h-[8px] rounded-[1px] bg-[#1E2335]" />
                                <div className="w-[8px] h-[8px] rounded-[1px] bg-red-900/80" />
                                <div className="w-[8px] h-[8px] rounded-[1px] bg-blue-500" />
                                <div className="w-[8px] h-[8px] rounded-[1px] bg-green-500" />
                            </div>
                            <span>More activity</span>
                        </div>
                    </div>

                    {/* PERFORMANCE CHARTS ROW */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Weekly Chart */}
                        <div className="rubrik-card p-5">
                            <h4 className="text-sm font-bold text-slate-300 mb-6 flex justify-between items-center">
                                <span>Weekly Progress</span>
                                <span className="text-[10px] font-normal text-slate-500 tracking-widest">THIS WEEK</span>
                            </h4>
                            <div className="flex items-end justify-between h-32 px-2">
                                {weeklyStats.map((s, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                        <div className="relative w-full px-1 flex flex-col items-center justify-end h-24">
                                            {/* Bar */}
                                            <div
                                                className={`w-full max-w-[12px] rounded-t-sm transition-all duration-500 ${s.color}`}
                                                style={{ height: `${(s.value / (maxWeekValue || 1)) * 100}%` }}
                                            />
                                            {/* Tooltip on bar hover */}
                                            <div className="absolute -top-10 bg-[#1E2335] px-3 py-1.5 rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-white/10 z-10 whitespace-nowrap pointer-events-none">
                                                <div className="font-bold border-b border-white/5 pb-1 mb-1">{s.fullDate}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${s.color.split(' shadow')[0]}`} />
                                                    <span>{s.value} Tasks</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-cyan-400 transition-colors uppercase">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stacked Monthly Chart */}
                        <div className="rubrik-card p-5">
                            <h4 className="text-sm font-bold text-slate-300 mb-6 flex justify-between items-center">
                                <span>Consistency Split</span>
                                <span className="text-[10px] font-normal text-slate-500 tracking-widest">{selectedYear}</span>
                            </h4>
                            <div className="flex items-end justify-between h-32 px-1">
                                {monthlyStats.map((s, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                        <div className="relative w-full px-0.5 flex flex-col items-center justify-end h-24">
                                            {/* Segmented Stacked Bar */}
                                            <div className="w-full max-w-[10px] flex flex-col-reverse justify-start overflow-hidden rounded-t-sm bg-slate-800" style={{ height: '100%' }}>
                                                <div className="bg-red-500/80" style={{ height: `${(s.red / maxMonthDays) * 100}%`, transitionDelay: `${i * 30}ms` }} />
                                                <div className="bg-blue-500" style={{ height: `${(s.blue / maxMonthDays) * 100}%`, transitionDelay: `${i * 30}ms` }} />
                                                <div className="bg-green-500" style={{ height: `${(s.green / maxMonthDays) * 100}%`, transitionDelay: `${i * 30}ms` }} />
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute -top-12 bg-[#1E2335] px-3 py-2 rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-white/10 z-10 whitespace-nowrap pointer-events-none">
                                                <div className="font-bold border-b border-white/5 pb-1 mb-1">{s.label} Statistics</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span>{s.green} Perfect</span></div>
                                                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <span>{s.blue} Partial</span></div>
                                                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> <span>{s.red} Empty</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-600 group-hover:text-white transition-colors uppercase">{s.label[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    <div className="rubrik-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" size={18} /> Current Focus
                        </h3>
                        {history[new Date().toISOString().split('T')[0]] ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Progress</div>
                                    <div className="text-cyan-400 font-mono font-bold">
                                        {Math.round((history[new Date().toISOString().split('T')[0]].completed / history[new Date().toISOString().split('T')[0]].total) * 100) || 0}%
                                    </div>
                                </div>
                                <div className="text-center py-4">
                                    {history[new Date().toISOString().split('T')[0]].status === 'green' ? (
                                        <p className="text-sm text-green-400 font-bold">You are at 100% capacity. Great discipline.</p>
                                    ) : (
                                        <p className="text-sm text-slate-400">Keep grinding to reach a perfect green day.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="mx-auto text-slate-700 mb-3" size={32} />
                                <p className="text-slate-500 text-sm">Clear your list in Tracker.</p>
                            </div>
                        )}
                    </div>

                    {/* Pie Chart Card */}
                    <div className="rubrik-card p-6 bg-[#0F121D] relative overflow-hidden group">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Yearly Discipline</h4>
                        <div className="flex items-center justify-between">
                            <div className="relative w-28 h-28">
                                <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
                                    {pieSlices.length > 0 ? pieSlices.map((s, idx) => (
                                        <circle
                                            key={idx}
                                            r="16" cx="16" cy="16"
                                            fill="transparent"
                                            stroke={s.color}
                                            strokeWidth="32"
                                            strokeDasharray={s.dash}
                                            strokeDashoffset={s.offset}
                                            className="transition-all duration-1000 ease-out hover:opacity-80 cursor-help"
                                        />
                                    )) : (
                                        <circle r="16" cx="16" cy="16" fill="#1E2335" />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-[#0F121D] w-16 h-16 rounded-full shadow-inner flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">{Math.round((stats.green / (stats.total || 1)) * 100)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 flex-1 ml-6">
                                {pieData.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter group-hover/item:text-white transition-colors">{p.key}</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{p.val} <span className="text-slate-600 font-normal">d</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Line */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Total Active Volume</span>
                                <span className="text-cyan-400 font-bold">{Object.values(history).reduce((acc, curr) => acc + (curr.completed || 0), 0)} Tasks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DAY ANALYSIS MODAL */}
            {selectedDay && (
                <div
                    className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-32 overflow-y-auto animate-in fade-in duration-300 pointer-events-auto"
                    onClick={() => setSelectedDay(null)}
                >
                    <div
                        className="bg-[#0F121D] border border-slate-700 w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-12 rounded-full ${selectedDay.data?.status === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        {new Date(selectedDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="text-slate-500 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 z-[70] self-center"
                                title="Close"
                            >
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[#1E2335] shadow-inner">
                                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Volume</div>
                                    <div className="text-2xl font-bold text-white">
                                        {selectedDay.data ? selectedDay.data.completed : 0} <span className="text-slate-600 text-sm">tasks</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#1E2335] shadow-inner text-right">
                                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Grade</div>
                                    <div className={`text-2xl font-bold ${selectedDay.data?.status === 'green' ? 'text-green-400' : 'text-blue-400'}`}>
                                        {selectedDay.data ? (selectedDay.data.status === 'green' ? 'A+' : 'B') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {selectedDay.data?.tasks && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Logs</h4>
                                    <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                        {selectedDay.data.tasks.map((t, idx) => (
                                            <li key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 transition-all hover:border-white/10">
                                                <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className={`text-sm ${t.status === 'completed' ? 'text-slate-300' : 'text-slate-500 italic'}`}>{t.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="border-t border-white/10 pt-6">
                                {!aiAnalysis ? (
                                    <button
                                        onClick={triggerAIAnalysis}
                                        disabled={isAnalyzing}
                                        className="w-full h-12 flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <span>AI Performance Review</span>}
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                                            <h5 className="text-[10px] font-bold text-cyan-500 uppercase mb-2"> कोच का सुझाव (Coach Note)</h5>
                                            <ul className="space-y-2">
                                                {aiAnalysis.solutions.map((s, i) => (
                                                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                                                        <span className="text-cyan-500">•</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

