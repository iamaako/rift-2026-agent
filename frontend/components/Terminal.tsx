import React, { useEffect, useRef } from 'react';
import { TimelineEvent } from '../types';
import { TerminalIcon } from './Icons';

interface TerminalProps {
  logs: TimelineEvent[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg flex flex-col h-[400px]">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300">agent-logs — -bash</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm custom-scrollbar bg-[#0f172a]"
      >
        {logs.length === 0 && (
          <div className="text-slate-500 italic">Waiting for agent to start...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="mb-1.5 flex items-start opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-slate-500 mr-3 text-xs pt-0.5 select-none">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
            </span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-emerald-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              log.type === 'command' ? 'text-blue-400 font-bold' :
              'text-slate-300'
            }`}>
              {log.type === 'command' && <span className="text-slate-500 mr-2">$</span>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};