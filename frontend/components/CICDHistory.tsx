import React from 'react';
import { CICDRun } from '../types';
import { CheckCircleIcon, XCircleIcon, ActivityIcon } from './Icons';

interface CICDHistoryProps {
  runs: CICDRun[];
}

export const CICDHistory: React.FC<CICDHistoryProps> = ({ runs }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[200px]">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-rift-700" />
          CI/CD Iteration Timeline
        </h3>
        <span className="text-xs text-slate-500">
          {runs.length} Runs
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto custom-scrollbar p-4 flex items-center gap-4">
        {runs.length === 0 ? (
          <div className="w-full text-center text-slate-400 text-sm italic">
            Waiting for first CI/CD pipeline run...
          </div>
        ) : (
          runs.map((run, index) => (
            <div key={run.id} className="relative group min-w-[140px]">
              {/* Connector Line */}
              {index < runs.length - 1 && (
                <div className="absolute top-1/2 left-full w-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
              )}
              
              <div className={`
                relative z-10 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all
                ${run.status === 'PASSED' ? 'bg-emerald-50 border-emerald-200' : 
                  run.status === 'FAILED' ? 'bg-red-50 border-red-200' : 
                  'bg-blue-50 border-blue-200 animate-pulse'}
              `}>
                <div className="flex items-center gap-1.5">
                  {run.status === 'PASSED' && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                  {run.status === 'FAILED' && <XCircleIcon className="w-4 h-4 text-red-600" />}
                  {run.status === 'RUNNING' && <ActivityIcon className="w-4 h-4 text-blue-600 animate-spin" />}
                  <span className={`text-xs font-bold ${
                     run.status === 'PASSED' ? 'text-emerald-700' : 
                     run.status === 'FAILED' ? 'text-red-700' : 
                     'text-blue-700'
                  }`}>
                    {run.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Run #{index + 1}
                </div>
                <div className="text-[10px] text-slate-400 bg-white/50 px-1.5 py-0.5 rounded">
                  {new Date(run.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second: '2-digit'})}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};