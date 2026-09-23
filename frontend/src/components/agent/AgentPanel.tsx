import React, { useState } from 'react';
import { Send, Bot, CheckCircle, GitPullRequest, RotateCw, AlertCircle } from 'lucide-react';
import { ImplementationPlan, StateSnapshot, TestResult } from '../../types/workspace';
import { PlanArtifact } from './PlanArtifact';
import { StateTimeline } from './StateTimeline';

interface AgentPanelProps {
  intent: string;
  onIntentChange: (val: string) => void;
  onSubmitIntent: () => void;
  isGeneratingPlan: boolean;
  plan: ImplementationPlan | null;
  onApprovePlan: () => void;
  onModifyPlan: () => void;
  isDeploying: boolean;
  testResult: TestResult | null;
  snapshots: StateSnapshot[];
  activeSnapshotId: string;
  onRevertState: (snapshot: StateSnapshot) => void;
  onOpenGithubModal: () => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  intent,
  onIntentChange,
  onSubmitIntent,
  isGeneratingPlan,
  plan,
  onApprovePlan,
  onModifyPlan,
  isDeploying,
  testResult,
  snapshots,
  activeSnapshotId,
  onRevertState,
  onOpenGithubModal,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmitIntent();
    }
  };

  return (
    <aside className="w-[380px] bg-[#141416] border-l border-zinc-800 flex flex-col h-full select-none text-xs">
      {/* Agent Panel Header */}
      <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-300 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Antigravity Agent</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-normal">v2.5 Flash</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Intent Prompt Input Box */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 space-y-2 focus-within:border-emerald-500/60 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>NATURAL LANGUAGE INTENT</span>
            <span className="text-zinc-500">Ctrl+Enter to Run</span>
          </div>

          <textarea
            value={intent}
            onChange={(e) => onIntentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Deploy an academic computer lab with 20 workstations, VyOS gateway, OVS switching, and VLAN 100..."
            className="w-full h-20 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 outline-none resize-none font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 font-mono">Catalog: 5 nodes avail</span>
            <button
              onClick={onSubmitIntent}
              disabled={isGeneratingPlan || !intent.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-40"
            >
              {isGeneratingPlan ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPlan ? 'Synthesizing...' : 'Synthesize Plan'}</span>
            </button>
          </div>
        </div>

        {/* Implementation Plan & HITL Gate Card */}
        {plan && (
          <PlanArtifact
            plan={plan}
            onApprove={onApprovePlan}
            onModify={onModifyPlan}
            isDeploying={isDeploying}
          />
        )}

        {/* Test Results & Post-Pass PR Card */}
        {testResult && (
          <div
            className={`rounded-xl border p-3 space-y-2.5 shadow-lg ${
              testResult.passed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testResult.passed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-bold text-xs">
                  {testResult.passed ? 'All Simulation Tests Passed' : 'Verification Failure'}
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  testResult.passed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {testResult.passed ? '100% GREEN' : 'HOTFIX REQUIRED'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-zinc-300">
              {testResult.details.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 border-b border-zinc-800/40 last:border-none">
                  <span className="truncate pr-2">{t.name}</span>
                  <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {t.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>

            {testResult.passed && (
              <button
                onClick={onOpenGithubModal}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer mt-1"
              >
                <GitPullRequest className="w-4 h-4" />
                <span>Push to GitHub PR</span>
              </button>
            )}
          </div>
        )}

        {/* State Snapshot Timeline */}
        <StateTimeline
          snapshots={snapshots}
          activeSnapshotId={activeSnapshotId}
          onRevertState={onRevertState}
        />
      </div>
    </aside>
  );
};
