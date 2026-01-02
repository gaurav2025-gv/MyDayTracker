import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';

export const AIWidget = ({ currentTask }) => {
    const [insight, setInsight] = useState("Your day looks balanced. Great start!");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Simulate AI analysis when task changes
    useEffect(() => {
        if (currentTask) {
            setIsAnalyzing(true);
            setTimeout(() => {
                setInsight(generateInsight(currentTask));
                setIsAnalyzing(false);
            }, 1500);
        }
    }, [currentTask]);

    const generateInsight = (task) => {
        const insights = [
            `For "${task.title}", try the 25-minute focus technique.`,
            "This looks like a deep work task. Minimize distractions.",
            "Don't forget to take a break after this.",
            "You're on a streak! Keep the momentum."
        ];
        return insights[Math.floor(Math.random() * insights.length)];
    };

    return (
        <div className="glass-panel p-6 relative overflow-hidden group min-h-[200px] flex flex-col justify-between">
            {/* Decor */}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <BrainCircuit size={64} className="text-accent-secondary" />
            </div>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent-secondary/20 text-accent-secondary">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-white tracking-wide">AI Insights</h3>
                </div>

                <div className="min-h-[80px] flex items-center relative z-10">
                    {isAnalyzing ? (
                        <div className="flex gap-2 items-center text-slate-400 text-sm animate-pulse">
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Analyzing your workflow...</span>
                        </div>
                    ) : (
                        <p className="text-lg text-slate-200 leading-relaxed font-light">
                            "{insight}"
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">DayMaker Intelligence</span>
                <button
                    onClick={() => {
                        setIsAnalyzing(true);
                        setTimeout(() => {
                            setInsight(generateInsight(currentTask || { title: 'General' }));
                            setIsAnalyzing(false);
                        }, 1000);
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors text-slate-300 hover:text-white"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
};
