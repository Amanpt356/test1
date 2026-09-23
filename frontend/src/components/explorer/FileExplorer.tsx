import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Layers,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { WorkspaceFile } from '../../types/workspace';

interface FileExplorerProps {
  files: WorkspaceFile[];
  activeFile: WorkspaceFile | null;
  onSelectFile: (file: WorkspaceFile) => void;
  onOpenTopology: () => void;
  isTopologyActive: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFile,
  onSelectFile,
  onOpenTopology,
  isTopologyActive,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    configs: true,
    tests: true,
    snapshots: true,
    diagnostics: false,
  });

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const getFileIcon = (file: WorkspaceFile) => {
    if (file.name.endsWith('.cfg')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (file.name.endsWith('.json')) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (file.name.endsWith('.py')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))
      return <FileCode className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-zinc-400" />;
  };

  const configs = files.filter((f) => f.category === 'configs');
  const tests = files.filter((f) => f.category === 'tests');
  const snapshots = files.filter((f) => f.category === 'snapshots');
  const rootFiles = files.filter((f) => f.category === 'root');

  return (
    <div className="w-64 bg-[#141416] border-r border-zinc-800 flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
        <span>Workspace Explorer</span>
        <span className="text-[10px] text-zinc-500 font-normal">v1.0</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Visual Topology Canvas Shortcut */}
        <div className="px-2 mb-2">
          <button
            onClick={onOpenTopology}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left font-medium ${
              isTopologyActive
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="flex-1">topology.canvas</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-mono">
              LIVE
            </span>
          </button>
        </div>

        <div className="px-2 font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
          Files & Artifacts
        </div>

        {/* /configs/ folder */}
        <div>
          <button
            onClick={() => toggleFolder('configs')}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:bg-zinc-800/40 rounded transition-colors"
          >
            {openFolders.configs ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            )}
            {openFolders.configs ? (
              <FolderOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-semibold text-zinc-200">configs</span>
            <span className="text-[10px] text-zinc-500 ml-auto">{configs.length}</span>
          </button>

          {openFolders.configs && (
            <div className="pl-6 pr-1 space-y-0.5 mt-0.5">
              {configs.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelectFile(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors truncate ${
                    activeFile?.path === file.path && !isTopologyActive
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                  }`}
                >
                  {getFileIcon(file)}
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* /tests/ folder */}
        <div>
          <button
            onClick={() => toggleFolder('tests')}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:bg-zinc-800/40 rounded transition-colors mt-1"
          >
            {openFolders.tests ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            )}
            {openFolders.tests ? (
              <FolderOpen className="w-4 h-4 text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-semibold text-zinc-200">tests</span>
            <span className="text-[10px] text-zinc-500 ml-auto">{tests.length}</span>
          </button>

          {openFolders.tests && (
            <div className="pl-6 pr-1 space-y-0.5 mt-0.5">
              {tests.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelectFile(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors truncate ${
                    activeFile?.path === file.path && !isTopologyActive
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* /snapshots/ folder */}
        <div>
          <button
            onClick={() => toggleFolder('snapshots')}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:bg-zinc-800/40 rounded transition-colors mt-1"
          >
            {openFolders.snapshots ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            )}
            {openFolders.snapshots ? (
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <Folder className="w-4 h-4 text-cyan-400" />
            )}
            <span className="font-semibold text-zinc-200">snapshots</span>
            <span className="text-[10px] text-zinc-500 ml-auto">{snapshots.length}</span>
          </button>

          {openFolders.snapshots && (
            <div className="pl-6 pr-1 space-y-0.5 mt-0.5">
              {snapshots.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelectFile(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors truncate ${
                    activeFile?.path === file.path && !isTopologyActive
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Root Files (device_catalog.yaml, topology.json) */}
        <div className="mt-2 pl-2 pr-1 space-y-0.5">
          {rootFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => onSelectFile(file)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors truncate ${
                activeFile?.path === file.path && !isTopologyActive
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
              }`}
            >
              {getFileIcon(file)}
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
