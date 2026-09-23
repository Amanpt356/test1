import React from 'react';

interface StatusBadgeProps {
  status: 'stopped' | 'deploying' | 'up' | 'down' | 'converged' | 'pending' | 'approved';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const getColors = () => {
    switch (status) {
      case 'up':
      case 'converged':
      case 'approved':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'deploying':
      case 'pending':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse';
      case 'down':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/30';
      case 'stopped':
      default:
        return 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'up':
      case 'converged':
      case 'approved':
        return 'bg-emerald-400';
      case 'deploying':
      case 'pending':
        return 'bg-amber-400 animate-ping';
      case 'down':
        return 'bg-rose-400';
      case 'stopped':
      default:
        return 'bg-zinc-500';
    }
  };

  const displayLabel = label || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-semibold border rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${getColors()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {displayLabel}
    </span>
  );
};
