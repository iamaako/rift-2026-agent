import React from 'react';
import { GitBranchIcon, ActivityIcon, ClockIcon, GitPullRequestIcon } from './Icons';
import { AgentStats } from '../types';

interface RunSummaryProps {
  repoUrl: string;
  teamName: string;
  leaderName: string;
  branchName: string;
  stats: AgentStats;
}

export const RunSummary: React.FC<RunSummaryProps> = ({ repoUrl, teamName, leaderName, branchName, stats }) => {
  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatus = () => {
    if (stats.uptime === 0) return { label: 'WAITING', color: 'bg-slate-100 text-slate-500' };
    if (stats.failedFixes > 0) return { label: 'NEEDS ATTENTION', color: 'bg-orange-100 text-orange-700' };
    if (stats.fixedBugs > 0 && stats.failedFixes === 0) return { label: 'HEALTHY', color: 'bg-emerald-100 text-emerald-700' };
    return { label: 'RUNNING', color: 'bg-blue-100 text-blue-700' };
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        
        {/* Left Side: Repo & Team Info */}
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="truncate max-w-md" title={repoUrl}>{repoUrl || 'No Repository Selected'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                {status.label}
              </span>
            </h3>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-4">
              <span>Team: <strong className="text-slate-700">{teamName}</strong></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Leader: <strong className="text-slate-700">{leaderName}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
            <GitBranchIcon className="w-4 h-4 text-rift-600" />
            <span className="text-xs font-mono text-slate-600">Branch: </span>
            <span className="text-xs font-mono font-bold text-rift-700">{branchName || '...'}</span>
          </div>
        </div>

        {/* Right Side: High Level Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
          <div>
            <p className="text-xs text-slate-400 mb-1">Duration</p>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">{formatUptime(stats.uptime)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">CI Status</p>
             <div className="flex items-center gap-1.5">
              <ActivityIcon className={`w-4 h-4 ${stats.failedFixes > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
              <span className={`font-semibold ${stats.failedFixes > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stats.failedFixes > 0 ? 'FAILING' : 'PASSING'}
              </span>
            </div>
          </div>
           <div>
            <p className="text-xs text-slate-400 mb-1">Failures</p>
            <span className="font-bold text-red-600 text-lg">{stats.totalBugs}</span>
          </div>
           <div>
            <p className="text-xs text-slate-400 mb-1">Fixes Applied</p>
            <span className="font-bold text-emerald-600 text-lg">{stats.fixedBugs}</span>
          </div>
        </div>

      </div>
    </div>
  );
};