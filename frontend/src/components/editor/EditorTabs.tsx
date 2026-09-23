import React from 'react';
import { Layers, FileCode, X } from 'lucide-react';
import { WorkspaceFile, ActiveTab } from '../../types/workspace';

interface EditorTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeFile: WorkspaceFile | null;
  onCloseFile?: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  onTabChange,
  activeFile,
  onCloseFile,
}) => {
  return (
    <div className="h-9 bg-[#121215] border-b border-zinc-800 flex items-center px-1 select-none overflow-x-auto">
      {/* File Editor Tab */}
      {activeFile && (
        <div
          onClick={() => onTabChange('file')}
          className={`group flex items-center gap-2 px-3 py-1.5 h-full text-xs border-r border-zinc-800 transition-colors cursor-pointer ${
            activeTab === 'file'
              ? 'bg-[#18181b] text-zinc-100 border-t-2 border-t-emerald-400 font-medium'
              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono">{activeFile.name}</span>
          {onCloseFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile();
              }}
              className="p-0.5 rounded hover:bg-zinc-700/60 opacity-60 group-hover:opacity-100"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
        </div>
      )}

      {/* Visual Topology Canvas Tab */}
      <div
        onClick={() => onTabChange('topology')}
        className={`flex items-center gap-2 px-3.5 py-1.5 h-full text-xs border-r border-zinc-800 transition-colors cursor-pointer ${
          activeTab === 'topology'
            ? 'bg-[#18181b] text-zinc-100 border-t-2 border-t-cyan-400 font-medium'
            : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
        }`}
      >
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-mono">Topology Canvas</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
      </div>
    </div>
  );
};
