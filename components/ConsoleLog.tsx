import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      case 'error': return <XCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
      default: return <Clock size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 flex flex-col h-64 md:h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">System Log</span>
        </div>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 && (
          <div className="text-slate-600 text-center py-8 italic">No logs generated yet...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0 text-xs mt-0.5">
              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className="mt-0.5 shrink-0">
              {getIcon(log.type)}
            </div>
            <span className={`${
              log.type === 'error' ? 'text-red-300' : 
              log.type === 'success' ? 'text-green-300' : 
              log.type === 'warning' ? 'text-yellow-300' : 'text-slate-300'
            } break-all`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ConsoleLog;
