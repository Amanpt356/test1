import React from 'react';
import { GitPullRequest, ExternalLink, Check, Copy } from 'lucide-react';

interface GithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  prUrl: string;
}

export const GithubModal: React.FC<GithubModalProps> = ({
  isOpen,
  onClose,
  branchName,
  prUrl,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-5 space-y-4 shadow-2xl text-zinc-100">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">GitHub Pull Request Ready</h3>
            <p className="text-xs text-zinc-400 font-mono">Branch: {branchName}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          All simulation verification tests have completed with <strong>100% Green</strong>. The validated network artifacts (GNS3 topology canvas, vendor configs, snapshots, and pytest test suite) are published on your branch.
        </p>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="text-[11px] text-zinc-400 font-mono">Pull Request URL:</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={prUrl}
              className="flex-1 bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 rounded text-xs font-mono text-zinc-200 outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <span>Open on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
