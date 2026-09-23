import React from 'react';
import { History, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import { StateSnapshot } from '../../types/workspace';

interface StateTimelineProps {
  snapshots: StateSnapshot[];
  activeSnapshotId: string;
  onRevertState: (snapshot: StateSnapshot) => void;
  isReverting?: boolean;
}

export const StateTimeline: React.FC<StateTimelineProps> = ({
  snapshots,
  activeSnapshotId,
  onRevertState,
  isReverting = false,
}) => {
  return (
    <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider">
            State Checkpoint Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          {snapshots.length} Snapshots
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {snapshots.length === 0 ? (
          <div className="text-zinc-600 text-xs italic py-2">No state snapshots created yet.</div>
        ) : (
          snapshots.map((snap, idx) => {
            const isActive = snap.checkpoint_id === activeSnapshotId;
            return (
              <div
                key={snap.checkpoint_id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-zinc-800/80 border-cyan-500/50 shadow-md'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-200">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{snap.checkpoint_id}</span>
                      {isActive && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1 rounded uppercase">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-4">{snap.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-zinc-500">
                      <span>Nodes: {snap.nodes_count}</span>
                      <span>{snap.timestamp}</span>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => onRevertState(snap)}
                      disabled={isReverting}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-300 text-zinc-300 text-[11px] font-mono border border-zinc-700 hover:border-cyan-500/40 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      title="Rollback workspace to this snapshot"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
