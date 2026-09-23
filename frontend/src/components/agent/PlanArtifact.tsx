import React from 'react';
import { CheckCircle2, AlertTriangle, Play, Edit3, ShieldCheck } from 'lucide-react';
import { ImplementationPlan } from '../../types/workspace';

interface PlanArtifactProps {
  plan: ImplementationPlan | null;
  onApprove: () => void;
  onModify: () => void;
  isDeploying?: boolean;
}

export const PlanArtifact: React.FC<PlanArtifactProps> = ({
  plan,
  onApprove,
  onModify,
  isDeploying = false,
}) => {
  if (!plan) return null;

  return (
    <div className="rounded-xl bg-zinc-900/90 border border-zinc-700/80 p-3.5 space-y-3 shadow-xl">
      {/* Header & Status */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider">
            HITL Review Gate
          </span>
        </div>
        <span
          className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            plan.status === 'APPROVED'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
          }`}
        >
          {plan.status}
        </span>
      </div>

      {/* Plan Title & Quick Metrics */}
      <div>
        <h4 className="font-semibold text-xs text-zinc-100">{plan.title}</h4>
        <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-zinc-400">
          <span>Nodes: <strong className="text-zinc-200">{plan.nodesCount}</strong></span>
          <span>Subnets: <strong className="text-zinc-200">{plan.subnets.join(', ')}</strong></span>
        </div>
      </div>

      {/* Structured Blueprint Preview */}
      <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300 space-y-1.5 border border-zinc-800/80 max-h-48 overflow-y-auto">
        <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">1. Scope & Nodes</div>
        <div className="text-zinc-400">vyos-lab-gw, ovs-lab-sw01, ovs-lab-sw02, lab-pc01..04</div>

        <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider pt-1">2. IP Schema & VLANs</div>
        <div className="text-zinc-400">VLAN 100: 10.100.1.0/24 (GW: 10.100.1.1, Pool: 10-30)</div>

        <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider pt-1">3. Control Plane</div>
        <div className="text-zinc-400">VyOS DHCP service, NAT masquerade, 802.1Q tagged trunks</div>
      </div>

      {/* Action Buttons */}
      {plan.status === 'PENDING_APPROVAL' && (
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={onApprove}
            disabled={isDeploying}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isDeploying ? 'Deploying...' : 'Approve & Run'}</span>
          </button>

          <button
            onClick={onModify}
            disabled={isDeploying}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modify</span>
          </button>
        </div>
      )}

      {plan.status === 'APPROVED' && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono bg-emerald-950/40 p-2 rounded border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Plan approved. Topology and vendor configs synced.</span>
        </div>
      )}
    </div>
  );
};
