import { useState, useEffect, useRef } from 'react';
import { 
  AgentStage, 
  AgentStats, 
  TimelineEvent, 
  FixRecord, 
  CICDRun
} from './types';
import { Metrics } from './components/Metrics';
import { Pipeline } from './components/Pipeline';
import { Terminal } from './components/Terminal';
import { FixTable } from './components/FixTable';
import { RunSummary } from './components/RunSummary';
import { CICDHistory } from './components/CICDHistory';
import { PlayIcon, StopIcon, CpuIcon, GitBranchIcon } from './components/Icons';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [teamName, setTeamName] = useState('TEAM AMD');
  const [teamLeader, setTeamLeader] = useState('AZHAN ALI');
  
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<AgentStage>(AgentStage.IDLE);
  const [stats, setStats] = useState<AgentStats>({
    totalBugs: 0,
    fixedBugs: 0,
    failedFixes: 0,
    activeRepo: null,
    uptime: 0
  });
  const [logs, setLogs] = useState<TimelineEvent[]>([]);
  const [fixes, setFixes] = useState<FixRecord[]>([]);
  const [cicdRuns, setCicdRuns] = useState<CICDRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const uptimeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // API Functions
  const startAgent = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          team_name: teamName,
          team_leader: teamLeader,
          retry_limit: 5
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start agent');
      }
      
      const data = await response.json();
      setIsRunning(true);
      
      // Start polling for updates
      startPolling(data.run_id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start agent');
      console.error('Error starting agent:', err);
    }
  };

  const fetchStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${id}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setStage(data.stage as AgentStage);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const fetchLogs = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/${id}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchFixes = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fixes/${id}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setFixes(data.fixes);
    } catch (err) {
      console.error('Error fetching fixes:', err);
    }
  };

  const fetchCicdRuns = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cicd-runs/${id}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setCicdRuns(data.cicd_runs);
    } catch (err) {
      console.error('Error fetching CI/CD runs:', err);
    }
  };

  const startPolling = (id: string) => {
    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(async () => {
      await Promise.all([
        fetchStatus(id),
        fetchLogs(id),
        fetchFixes(id),
        fetchCicdRuns(id)
      ]);
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Derived state for Branch Name
  const getBranchName = () => {
    const cleanTeam = teamName.replace(/\s+/g, '_');
    const cleanLeader = teamLeader.replace(/\s+/g, '_');
    return `${cleanTeam}_${cleanLeader}_AI_Fix`;
  };

  // Uptime counter
  useEffect(() => {
    if (isRunning) {
      uptimeRef.current = setInterval(() => {
        setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
      }, 1000);
    } else {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
    }

    return () => {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (uptimeRef.current) clearInterval(uptimeRef.current);
    };
  }, []);

  const handleStop = () => {
    setIsRunning(false);
    stopPolling();
  };

  const handleStart = () => {
    setLogs([]);
    setStats({ totalBugs: 0, fixedBugs: 0, failedFixes: 0, activeRepo: repoUrl, uptime: 0 });
    setFixes([]);
    setCicdRuns([]);
    startAgent();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      {/* Header */}
      <header className="bg-rift-900 text-white shadow-lg border-b border-rift-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rift-700 rounded-lg flex items-center justify-center shadow-inner border border-rift-600">
              <CpuIcon className="w-6 h-6 text-rift-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">RIFT 2026</h1>
              <p className="text-xs text-rift-200 opacity-80">Autonomous DevOps Agent Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-rift-800 rounded-full border border-rift-700">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-xs font-medium text-rift-100 uppercase tracking-wider">
                {isRunning ? 'System Online' : 'System Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Control Panel (Only visible if not running for clean UI, or disabled when running) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Repo URL */}
            <div className="lg:col-span-5 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Repository</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GitBranchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isRunning}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rift-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="https://github.com/username/repository"
                />
              </div>
            </div>

            {/* Team Name */}
            <div className="lg:col-span-2 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={isRunning}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rift-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Leader Name */}
            <div className="lg:col-span-2 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Leader Name</label>
              <input
                type="text"
                value={teamLeader}
                onChange={(e) => setTeamLeader(e.target.value)}
                disabled={isRunning}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rift-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-3 w-full flex flex-col gap-2">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center gap-2 bg-rift-700 hover:bg-rift-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all active:scale-95 text-sm"
                >
                  <PlayIcon className="w-4 h-4" />
                  Run Agent
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all active:scale-95 text-sm"
                >
                  <StopIcon className="w-4 h-4" />
                  Abort Mission
                </button>
              )}
              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Run Summary Card (Point 2) */}
        {(isRunning || stats.totalBugs > 0) && (
          <RunSummary 
            repoUrl={repoUrl}
            teamName={teamName}
            leaderName={teamLeader}
            branchName={getBranchName()}
            stats={stats}
          />
        )}

        {/* Metrics Section */}
        {/* <Metrics stats={stats} />  -- Optional, redundant with RunSummary but nice for details. Let's keep it for "Total Failures/Fixes" detail. */}
        <Metrics stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Visuals & Logs */}
          <div className="lg:col-span-1 space-y-6">
            <Pipeline currentStage={stage} />
            <CICDHistory runs={cicdRuns} />
            <Terminal logs={logs} />
          </div>

          {/* Right Column: Detailed Fixes (Point 4) */}
          <div className="lg:col-span-2 h-[600px]">
            <FixTable fixes={fixes} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;