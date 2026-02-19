import React from 'react';
import { AgentStats } from '../types';
import { BugIcon, CheckCircleIcon, ActivityIcon, ShieldIcon } from './Icons';

interface MetricsProps {
  stats: AgentStats;
}

const Card = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
  </div>
);

export const Metrics: React.FC<MetricsProps> = ({ stats }) => {
  const successRate = stats.totalBugs > 0 
    ? Math.round((stats.fixedBugs / stats.totalBugs) * 100) 
    : 100;

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card 
        title="Total Issues Detected" 
        value={stats.totalBugs} 
        subtext="+12% from last scan"
        icon={BugIcon}
        colorClass="text-red-600"
      />
      <Card 
        title="Issues Fixed" 
        value={stats.fixedBugs} 
        subtext="Autonomous healing active"
        icon={ShieldIcon}
        colorClass="text-emerald-600"
      />
      <Card 
        title="Success Rate" 
        value={`${successRate}%`} 
        subtext="AI Confidence Score: 98%"
        icon={CheckCircleIcon}
        colorClass="text-blue-600"
      />
      <Card 
        title="Session Uptime" 
        value={formatUptime(stats.uptime)} 
        subtext="Continuous Monitoring"
        icon={ActivityIcon}
        colorClass="text-rift-700"
      />
    </div>
  );
};