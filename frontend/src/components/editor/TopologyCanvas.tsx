import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Router, Server, Monitor, Activity, Radio } from 'lucide-react';
import { TopologyNode, TopologyLink } from '../../types/workspace';

// Custom Node for Routers
const RouterNode = ({ data }: { data: any }) => (
  <div className="relative px-3 py-2 rounded-xl bg-[#131b17] border-2 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] min-w-[170px] text-zinc-100 font-mono transition-transform hover:scale-105">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-emerald-400" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-emerald-400" />
    <Handle type="source" position={Position.Left} className="w-2.5 h-2.5 bg-emerald-400" />
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-emerald-400" />

    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
        <Router className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold leading-tight truncate">{data.name}</div>
        <div className="text-[10px] text-emerald-400/80 leading-none">{data.template_id}</div>
      </div>
    </div>

    <div className="pt-1.5 border-t border-emerald-500/20 text-[10px] space-y-0.5">
      {data.ip && <div className="text-zinc-300">IP: <span className="text-emerald-300 font-semibold">{data.ip}</span></div>}
      {data.mgmt_ip && <div className="text-zinc-400">Mgmt: <span className="text-zinc-300">{data.mgmt_ip}</span></div>}
    </div>
  </div>
);

// Custom Node for Switches
const SwitchNode = ({ data }: { data: any }) => (
  <div className="relative px-3 py-2 rounded-xl bg-[#111720] border-2 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] min-w-[170px] text-zinc-100 font-mono transition-transform hover:scale-105">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-cyan-400" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-cyan-400" />
    <Handle type="source" position={Position.Left} className="w-2.5 h-2.5 bg-cyan-400" />
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-400" />

    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
        <Server className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold leading-tight truncate">{data.name}</div>
        <div className="text-[10px] text-cyan-400/80 leading-none">{data.template_id}</div>
      </div>
    </div>

    <div className="pt-1.5 border-t border-cyan-500/20 text-[10px] space-y-0.5">
      <div className="text-zinc-400">VLAN 100 <span className="text-cyan-300 font-semibold">(Lab Access)</span></div>
      {data.mgmt_ip && <div className="text-zinc-400">Mgmt: <span className="text-zinc-300">{data.mgmt_ip}</span></div>}
    </div>
  </div>
);

// Custom Node for Workstation Hosts
const HostNode = ({ data }: { data: any }) => (
  <div className="relative px-3 py-2 rounded-xl bg-[#18141f] border-2 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.2)] min-w-[150px] text-zinc-100 font-mono transition-transform hover:scale-105">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-purple-400" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-purple-400" />

    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
        <Monitor className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold leading-tight truncate">{data.name}</div>
        <div className="text-[10px] text-purple-400/80 leading-none">{data.template_id}</div>
      </div>
    </div>

    <div className="pt-1.5 border-t border-purple-500/20 text-[10px]">
      <div className="text-zinc-300">IP: <span className="text-purple-300 font-semibold">{data.ip}</span></div>
    </div>
  </div>
);

interface TopologyCanvasProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  onSelectNode?: (node: TopologyNode) => void;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({ nodes: initialNodes, links: initialLinks, onSelectNode }) => {
  const nodeTypes = useMemo(
    () => ({
      router: RouterNode,
      switch: SwitchNode,
      host: HostNode,
    }),
    []
  );

  // Convert application domain nodes to React Flow format
  const flowNodes: Node[] = useMemo(() => {
    return initialNodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.x, y: n.y },
      data: {
        name: n.name,
        template_id: n.template_id,
        ip: n.ip,
        mgmt_ip: n.mgmt_ip,
        status: n.status,
      },
    }));
  }, [initialNodes]);

  // Convert application domain links to React Flow format
  const flowEdges: Edge[] = useMemo(() => {
    return initialLinks.map((l) => {
      let strokeColor = '#10b981'; // Green: UP / Converged
      if (l.status === 'deploying') strokeColor = '#f59e0b';
      if (l.status === 'down') strokeColor = '#ef4444';
      if (l.status === 'stopped') strokeColor = '#71717a';

      return {
        id: l.id,
        source: l.source,
        target: l.target,
        animated: l.status === 'up' || l.status === 'deploying',
        label: l.label,
        style: {
          stroke: strokeColor,
          strokeWidth: 2.5,
        },
        labelStyle: {
          fill: '#e4e4e7',
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
        },
        labelBgStyle: {
          fill: '#18181b',
          fillOpacity: 0.9,
          stroke: strokeColor,
          strokeWidth: 1,
        },
      };
    });
  }, [initialLinks]);

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  return (
    <div className="flex-1 h-full w-full bg-[#0d0d10] relative select-none">
      {/* Top Topology Canvas Ribbon */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-zinc-400">CANVAS:</span>
          <span className="text-emerald-400 font-bold">GNS3 REST API v2 SYNCED</span>
        </div>
        <div className="h-3 w-px bg-zinc-800" />
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-300">Link UP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-zinc-300">Deploying</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-zinc-300">Down</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0c0c0e]"
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !fill-zinc-200 shadow-xl" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'router') return '#10b981';
            if (n.type === 'switch') return '#06b6d4';
            return '#a855f7';
          }}
          className="!bg-zinc-950 !border-zinc-800 rounded-lg shadow-2xl"
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
