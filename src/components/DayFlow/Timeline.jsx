import React from 'react';
import { TaskItem } from './TaskItem';

export const Timeline = ({ tasks, onCompleteTask }) => {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <p>No tasks for today yet.</p>
                <p className="text-sm">Add one to get started!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[calc(100%-4rem)] custom-scrollbar">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={onCompleteTask}
                />
            ))}

            {/* End of Day Marker */}
            <div className="flex items-center gap-4 py-8 opacity-50">
                <div className="h-[1px] flex-1 bg-slate-700" />
                <span className="text-xs text-slate-500 uppercase tracking-widest">End of Day</span>
                <div className="h-[1px] flex-1 bg-slate-700" />
            </div>
        </div>
    );
};
