import React, { useState } from 'react';
import { Terminal, ShieldAlert, Cpu, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { ConsoleLog } from '../../types/workspace';

interface BottomPanelProps {
  logs: ConsoleLog[];
  onClearLogs: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  logs,
  onClearLogs,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState<'pytest' | 'gns3' | 'ssh'>('pytest');

  const filteredLogs = logs.filter((log) => log.type === activeTab);

  const getLevelColor = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'warn':
        return 'text-amber-400';
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'info':
      default:
        return 'text-zinc-300';
    }
  };

  return (
    <footer
      className={`border-t border-zinc-800 bg-[#0f0f11] flex flex-col transition-all duration-200 ${
        isExpanded ? 'h-72' : 'h-48'
      }`}
    >
      {/* Panel Tab Header */}
      <div className="h-8 bg-[#141416] border-b border-zinc-800/80 px-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pytest')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeTab === 'pytest'
                ? 'bg-zinc-800/80 text-emerald-400 border-b border-emerald-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Pytest Simulation Logs
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-900 text-[10px] text-zinc-400">
              {logs.filter((l) => l.type === 'pytest').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gns3')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeTab === 'gns3'
                ? 'bg-zinc-800/80 text-cyan-400 border-b border-cyan-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            GNS3 REST API Trace
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-900 text-[10px] text-zinc-400">
              {logs.filter((l) => l.type === 'gns3').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ssh')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeTab === 'ssh'
                ? 'bg-zinc-800/80 text-purple-400 border-b border-purple-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SSH Execution Shell
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-900 text-[10px] text-zinc-400">
              {logs.filter((l) => l.type === 'ssh').length}
            </span>
          </button>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2 text-zinc-400">
          <button
            onClick={onClearLogs}
            title="Clear Console Output"
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              title={isExpanded ? 'Collapse Console' : 'Expand Console'}
              className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-5 space-y-1 bg-[#0a0a0c]">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-600 italic select-none py-2 px-1">
            No active stream output for this channel.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-zinc-900/40 px-1 rounded">
              <span className="text-zinc-600 select-none text-[10px] pt-0.5">[{log.timestamp}]</span>
              <span className="text-zinc-500 select-none uppercase text-[10px] pt-0.5 w-12 font-semibold">
                {log.level}
              </span>
              <span className={`flex-1 break-all ${getLevelColor(log.level)}`}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </footer>
  );
};
