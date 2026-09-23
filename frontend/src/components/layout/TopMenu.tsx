import React from 'react';
import { Server, Activity, User, ShieldCheck } from 'lucide-react';

interface TopMenuProps {
  threadId: string;
  gns3Status: 'connected' | 'disconnected' | 'connecting';
  guardrailStatus: 'enforced' | 'warning';
}

export const TopMenu: React.FC<TopMenuProps> = ({ threadId, gns3Status, guardrailStatus }) => {
  const menuItems = ['File', 'Edit', 'Selection', 'View', 'Run', 'Terminal', 'Help'];

  return (
    <header className="h-9 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between px-3 text-xs select-none text-zinc-300">
      {/* Left Menu Items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400 font-mono">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          NETARCHITECT AI
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <nav className="flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item}
              className="px-2 py-0.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Center Thread ID Indicator */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-zinc-900/90 px-2.5 py-0.5 rounded border border-zinc-800/80">
        <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>SESSION:</span>
        <span className="text-zinc-200 font-semibold">{threadId}</span>
      </div>

      {/* Right System Status Badges */}
      <div className="flex items-center gap-3">
        {/* Guardrail Policy */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400">GUARDRAILS:</span>
          <span className="text-emerald-400 font-semibold">ENFORCED</span>
        </div>

        {/* GNS3 Connection */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-400">GNS3:</span>
          <span className="text-cyan-400 font-semibold">localhost:3080</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </div>

        {/* Profile */}
        <button
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
          title="FDE Workspace Profile"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            FDE
          </div>
        </button>
      </div>
    </header>
  );
};
