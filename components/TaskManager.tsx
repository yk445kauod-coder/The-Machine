import React from 'react';
import { MachineTask, TaskStatus, TaskPriority } from '../types';

interface TaskManagerProps {
  tasks: MachineTask[];
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks }) => {
  if (tasks.length === 0) return null;

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'text-red-500 border-red-500/30 bg-red-500/10';
      case TaskPriority.MEDIUM: return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case TaskPriority.LOW: return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (s: TaskStatus) => {
    switch(s) {
      case TaskStatus.PROCESSING: 
        return <span className="w-2 h-2 rounded-full bg-machine-cyan animate-pulse"/>;
      case TaskStatus.QUEUED:
        return <span className="w-2 h-2 rounded-full bg-slate-500"/>;
      case TaskStatus.COMPLETED:
        return <span className="text-green-500">✓</span>;
      case TaskStatus.FAILED:
        return <span className="text-red-500">✕</span>;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 w-64 bg-machine-surface/90 backdrop-blur-md border border-machine-highlight rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
      <div className="bg-machine-base/50 p-3 border-b border-machine-highlight flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Tasks</h3>
        <span className="text-[10px] bg-machine-cyan/20 text-machine-cyan px-2 py-0.5 rounded-full font-mono">{tasks.filter(t => t.status !== TaskStatus.COMPLETED).length} ACTIVE</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
        {tasks.slice().reverse().map(task => (
          <div key={task.id} className="p-2 rounded bg-black/20 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            {task.status === TaskStatus.PROCESSING && (
               <div className="absolute bottom-0 left-0 h-0.5 bg-machine-cyan transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
            )}
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] font-bold px-1.5 rounded border ${getPriorityColor(task.priority)} uppercase`}>
                {task.priority}
              </span>
              <div className="text-xs">{getStatusIcon(task.status)}</div>
            </div>
            <div className="text-xs text-slate-300 font-medium truncate">{task.title}</div>
            <div className="flex justify-between items-center mt-1">
               <span className="text-[10px] text-slate-500 font-mono capitalize">{task.type}</span>
               <span className="text-[10px] text-slate-600 font-mono">{new Date(task.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;