import React from 'react';
import Editor from '@monaco-editor/react';
import { WorkspaceFile } from '../../types/workspace';
import { Copy, Check, Download } from 'lucide-react';

interface MonacoViewerProps {
  file: WorkspaceFile | null;
  readOnly?: boolean;
}

export const MonacoViewer: React.FC<MonacoViewerProps> = ({ file, readOnly = false }) => {
  const [copied, setCopied] = React.useState(false);

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 font-mono text-xs select-none">
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/40 text-center max-w-sm space-y-2">
          <div className="text-zinc-300 font-semibold">No File Selected</div>
          <p className="text-zinc-500">Select a configuration or test script from the Explorer on the left, or switch to the Visual Topology Canvas.</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.cfg')) return 'shell';
    if (filename.endsWith('.patch')) return 'diff';
    return 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181b] overflow-hidden">
      {/* File Action Ribbon */}
      <div className="h-7 bg-[#1c1c20] border-b border-zinc-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200">{file.path}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">{file.content.split('\n').length} lines</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
            title="Download file"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor Component */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content}
          theme="vs-dark"
          options={{
            readOnly: readOnly,
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: true, scale: 0.8 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>
    </div>
  );
};
