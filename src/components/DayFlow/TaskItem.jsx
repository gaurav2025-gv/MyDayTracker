import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TaskItem = ({ task, onComplete }) => {
    const isCurrent = task.status === 'current';
    const isCompleted = task.status === 'completed';

    return (
        <div
            className={twMerge(
                "glass-card p-6 flex gap-6 items-center group relative overflow-hidden",
                isCurrent && "border-l-4 border-l-accent-primary bg-white/10 shadow-lg shadow-accent-primary/5",
                isCompleted && "opacity-50 grayscale-[0.5]"
            )}
        >
            {/* Time Column with Visual Connector */}
            <div className="flex flex-col items-center min-w-[70px] relative z-10">
                <span className={clsx(
                    "text-sm font-bold tracking-wider mb-2",
                    isCurrent ? "text-accent-primary" : "text-slate-400"
                )}>
                    {task.time}
                </span>
                <div className={clsx(
                    "h-full w-[2px] rounded-full transition-colors duration-500",
                    isCompleted ? "bg-accent-success/30" : "bg-white/10",
                    isCurrent && "bg-accent-primary shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                )} />
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 py-1">
                <h3 className={clsx(
                    "font-medium text-xl transition-all",
                    isCompleted ? "line-through text-slate-500" : "text-white"
                )}>
                    {task.title}
                </h3>
                {task.category && (
                    <span className={clsx(
                        "text-xs px-3 py-1 mt-2 rounded-full inline-block font-medium tracking-wide border",
                        "bg-slate-800/50 text-slate-300 border-white/5"
                    )}>
                        {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                )}
            </div>

            {/* Actions */}
            <button
                onClick={() => onComplete(task.id)}
                className="p-3 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-accent-success relative z-10 group/btn"
            >
                <div className="absolute inset-0 bg-accent-success/20 rounded-xl scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                {isCompleted ? (
                    <CheckCircle2 size={24} className="text-accent-success relative z-10" />
                ) : (
                    <Circle size={24} className="relative z-10" />
                )}
            </button>

            {/* Decorative Glow for Current Task */}
            {isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-transparent pointer-events-none" />
            )}
        </div>
    );
};
