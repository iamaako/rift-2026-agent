import React from 'react';
import { AgentStage } from '../types';
import { GitBranchIcon, CpuIcon, CheckCircleIcon, TerminalIcon } from './Icons';

interface PipelineProps {
  currentStage: AgentStage;
}

const steps = [
  { id: AgentStage.CLONING, label: 'Clone Repo', icon: GitBranchIcon },
  { id: AgentStage.SCANNING, label: 'Deep Scan', icon: TerminalIcon },
  { id: AgentStage.ANALYZING, label: 'AI Analysis', icon: CpuIcon },
  { id: AgentStage.FIXING, label: 'Apply Fixes', icon: TerminalIcon },
  { id: AgentStage.TESTING, label: 'Run Tests', icon: CheckCircleIcon },
  { id: AgentStage.PUSHING, label: 'Git Push', icon: GitBranchIcon },
];

export const Pipeline: React.FC<PipelineProps> = ({ currentStage }) => {
  const getCurrentStepIndex = () => {
    if (currentStage === AgentStage.IDLE) return -1;
    return steps.findIndex(step => step.id === currentStage);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <CpuIcon className="w-5 h-5 text-rift-700" />
        Live CI/CD Pipeline Status
      </h3>
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-rift-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${currentIndex === -1 ? 0 : (currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'bg-rift-700 border-rift-700 text-white scale-110 shadow-lg shadow-rift-200' : ''}
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                  ${isPending ? 'bg-white border-slate-300 text-slate-400' : ''}
                `}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span 
                className={`
                  mt-3 text-xs font-semibold whitespace-nowrap transition-colors duration-300
                  ${isActive ? 'text-rift-800' : ''}
                  ${isCompleted ? 'text-emerald-600' : ''}
                  ${isPending ? 'text-slate-400' : ''}
                `}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rift-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rift-500"></span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};