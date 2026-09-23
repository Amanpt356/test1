import React, { useState, useEffect } from 'react';
import { TopMenu } from './components/layout/TopMenu';
import { ActivityBar } from './components/layout/ActivityBar';
import { BottomPanel } from './components/layout/BottomPanel';
import { FileExplorer } from './components/explorer/FileExplorer';
import { DeviceCatalog } from './components/explorer/DeviceCatalog';
import { EditorTabs } from './components/editor/EditorTabs';
import { MonacoViewer } from './components/editor/MonacoViewer';
import { TopologyCanvas } from './components/editor/TopologyCanvas';
import { AgentPanel } from './components/agent/AgentPanel';
import { GithubModal } from './components/agent/GithubModal';
import {
  ActiveTab,
  ActivityBarTab,
  WorkspaceFile,
  CatalogData,
  TopologyNode,
  TopologyLink,
  ImplementationPlan,
  StateSnapshot,
  TestResult,
  ConsoleLog,
} from './types/workspace';

// Initial Mock/Loaded Catalog conforming to device_catalog.yaml
const INITIAL_CATALOG: CatalogData = {
  version: '1.0',
  catalog_name: 'NetArchitect-Free-OpenSource-Inventory',
  inventory: {
    routers: [
      {
        vendor: 'VyOS',
        type: 'vyos',
        model: 'VyOS 1.4 Rolling',
        description: 'Open-source Linux network OS supporting OSPF, BGP, NAT, and WireGuard.',
        gns3_template_id: 'vyos-1.4-rolling',
        node_type: 'qemu',
        cli_type: 'vyos',
        ram_mb: 2048,
        cpus: 1,
        default_interfaces: [
          { name: 'eth0', purpose: 'management' },
          { name: 'eth1', purpose: 'data' },
          { name: 'eth2', purpose: 'data' },
          { name: 'eth3', purpose: 'data' },
        ],
        supported_protocols: ['ospf', 'bgp', 'static_routing', 'nat', 'dhcp_server'],
      },
      {
        vendor: 'FRRouting',
        type: 'frr',
        model: 'FRR Docker Container',
        description: 'Ultra-lightweight Linux IP routing protocol suite (OSPF, BGP, RIP, IS-IS).',
        gns3_template_id: 'frr-docker',
        node_type: 'docker',
        cli_type: 'vtysh',
        ram_mb: 512,
        cpus: 1,
        default_interfaces: [{ name: 'eth0' }, { name: 'eth1' }, { name: 'eth2' }],
      },
    ],
    switches: [
      {
        vendor: 'Open vSwitch',
        type: 'ovs',
        model: 'OVS Layer 2/3 Switch',
        description: 'Virtual switch supporting 802.1Q VLAN tagging and trunking.',
        gns3_template_id: 'openvswitch',
        node_type: 'docker',
        cli_type: 'openflow',
        ram_mb: 512,
        cpus: 1,
        default_interfaces: [
          { name: 'eth0' },
          { name: 'eth1' },
          { name: 'eth2' },
          { name: 'eth3' },
          { name: 'eth4' },
          { name: 'eth5' },
          { name: 'eth6' },
          { name: 'eth7' },
        ],
      },
    ],
    firewalls: [
      {
        vendor: 'iptables-router',
        type: 'linux_fw',
        model: 'Alpine Linux Security Gateway',
        description: 'Lightweight firewall container for stateful packet inspection and NAT policies.',
        gns3_template_id: 'alpine-firewall',
        node_type: 'docker',
        cli_type: 'bash',
        ram_mb: 256,
        cpus: 1,
        default_interfaces: [{ name: 'eth0' }, { name: 'eth1' }],
      },
    ],
    hosts: [
      {
        vendor: 'Alpine Linux',
        type: 'alpine',
        model: 'Alpine Workload Node',
        description: 'Lightweight container (~5MB) for automated reachability verification.',
        gns3_template_id: 'alpine-host',
        node_type: 'docker',
        cli_type: 'bash',
        ram_mb: 128,
        cpus: 1,
        default_interfaces: [{ name: 'eth0' }],
      },
    ],
  },
  guardrails: {
    max_nodes_per_project: 15,
    disallow_duplicate_ips: true,
    enforce_management_subnet: '192.168.122.0/24',
    allowed_vlan_range: '1-4094',
  },
};

// Initial Config Files from Workspace
const INITIAL_FILES: WorkspaceFile[] = [
  {
    name: 'vyos-lab-gw.cfg',
    path: 'configs/vyos-lab-gw.cfg',
    category: 'configs',
    language: 'shell',
    content: `# VyOS 1.4 Rolling Router Configuration: vyos-lab-gw
set system host-name 'vyos-lab-gw'
set system domain-name 'lab.local'

set interfaces ethernet eth0 description 'OOB Management Plane'
set interfaces ethernet eth0 address '192.168.122.10/24'

set interfaces ethernet eth1 description 'Trunk to ovs-lab-sw01 eth0'
set interfaces ethernet eth1 vif 100 description 'Computer Lab Workstation Subnet'
set interfaces ethernet eth1 vif 100 address '10.100.1.1/24'

set service dhcp-server shared-network-name LAB_POOL authoritative
set service dhcp-server shared-network-name LAB_POOL subnet 10.100.1.0/24 default-router '10.100.1.1'
set service dhcp-server shared-network-name LAB_POOL subnet 10.100.1.0/24 name-server '1.1.1.1'
set service dhcp-server shared-network-name LAB_POOL subnet 10.100.1.0/24 range 0 start '10.100.1.10'
set service dhcp-server shared-network-name LAB_POOL subnet 10.100.1.0/24 range 0 stop '10.100.1.30'

set nat source rule 100 description 'Outbound NAT for Computer Lab Subnet'
set nat source rule 100 source address '10.100.1.0/24'
set nat source rule 100 outbound-interface 'eth0'
set nat source rule 100 translation address 'masquerade'

set protocols static route 0.0.0.0/0 next-hop 192.168.122.1
commit
save`,
  },
  {
    name: 'ovs-lab-sw01.cfg',
    path: 'configs/ovs-lab-sw01.cfg',
    category: 'configs',
    language: 'shell',
    content: `#!/bin/sh
ovs-vsctl --if-exists del-br br-lab
ovs-vsctl add-br br-lab

# Uplink Trunk to vyos-lab-gw
ovs-vsctl add-port br-lab eth0
ip link set eth0 up

# Inter-Switch Trunk to ovs-lab-sw02
ovs-vsctl add-port br-lab eth7
ip link set eth7 up

# Access Ports for Lab Workstations
ovs-vsctl add-port br-lab eth1 tag=100
ip link set eth1 up
ovs-vsctl add-port br-lab eth2 tag=100
ip link set eth2 up
ip link set br-lab up`,
  },
  {
    name: 'ovs-lab-sw02.cfg',
    path: 'configs/ovs-lab-sw02.cfg',
    category: 'configs',
    language: 'shell',
    content: `#!/bin/sh
ovs-vsctl --if-exists del-br br-lab
ovs-vsctl add-br br-lab

# Inter-Switch Trunk to ovs-lab-sw01
ovs-vsctl add-port br-lab eth7
ip link set eth7 up

# Access Ports for Lab Workstations
ovs-vsctl add-port br-lab eth1 tag=100
ip link set eth1 up
ovs-vsctl add-port br-lab eth2 tag=100
ip link set eth2 up
ip link set br-lab up`,
  },
  {
    name: 'lab-pc01.cfg',
    path: 'configs/lab-pc01.cfg',
    category: 'configs',
    language: 'shell',
    content: `#!/bin/sh
hostname lab-pc01
cat << 'EOF' > /etc/network/interfaces
auto eth0
iface eth0 inet static
    address 10.100.1.11
    netmask 255.255.255.0
    gateway 10.100.1.1
EOF
ifup eth0`,
  },
  {
    name: 'topology.json',
    path: 'topology.json',
    category: 'root',
    language: 'json',
    content: `{
  "name": "NetArchitect-Computer-Lab",
  "project_id": "proj-lab-20-nodes",
  "nodes_count": 7,
  "guardrails": "PASS_ZERO_COLLISIONS"
}`,
  },
  {
    name: 'test_reachability.py',
    path: 'tests/test_reachability.py',
    category: 'tests',
    language: 'python',
    content: `# Pytest Verification Suite for Reachability & Zero Duplicate IPs
def test_topology_node_count_and_guardrail():
    pass

def test_zero_duplicate_ips():
    pass

def test_gateway_workstation_subnet_consistency():
    pass`,
  },
  {
    name: 'checkpoint_20260923_lab.json',
    path: 'snapshots/checkpoint_20260923_lab.json',
    category: 'snapshots',
    language: 'json',
    content: `{
  "checkpoint_id": "chk_20260923_lab_001",
  "status": "APPROVED",
  "nodes_count": 7
}`,
  },
];

// Initial Topology Nodes & Links
const INITIAL_TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: 'vyos-lab-gw',
    name: 'vyos-lab-gw',
    label: 'vyos-lab-gw (Core Router/DHCP)',
    type: 'router',
    template_id: 'vyos-1.4-rolling',
    ip: '10.100.1.1/24',
    mgmt_ip: '192.168.122.10',
    x: 350,
    y: 50,
    status: 'up',
  },
  {
    id: 'ovs-lab-sw01',
    name: 'ovs-lab-sw01',
    label: 'ovs-lab-sw01 (Rack 1 Switch)',
    type: 'switch',
    template_id: 'openvswitch',
    mgmt_ip: '192.168.122.11',
    x: 180,
    y: 200,
    status: 'up',
  },
  {
    id: 'ovs-lab-sw02',
    name: 'ovs-lab-sw02',
    label: 'ovs-lab-sw02 (Rack 2 Switch)',
    type: 'switch',
    template_id: 'openvswitch',
    mgmt_ip: '192.168.122.12',
    x: 520,
    y: 200,
    status: 'up',
  },
  {
    id: 'lab-pc01',
    name: 'lab-pc01',
    label: 'lab-pc01 (Workstation 1)',
    type: 'host',
    template_id: 'alpine-host',
    ip: '10.100.1.11',
    x: 80,
    y: 380,
    status: 'up',
  },
  {
    id: 'lab-pc02',
    name: 'lab-pc02',
    label: 'lab-pc02 (Workstation 2)',
    type: 'host',
    template_id: 'alpine-host',
    ip: '10.100.1.12',
    x: 240,
    y: 380,
    status: 'up',
  },
  {
    id: 'lab-pc03',
    name: 'lab-pc03',
    label: 'lab-pc03 (Workstation 3)',
    type: 'host',
    template_id: 'alpine-host',
    ip: '10.100.1.13',
    x: 440,
    y: 380,
    status: 'up',
  },
  {
    id: 'lab-pc04',
    name: 'lab-pc04',
    label: 'lab-pc04 (Workstation 4)',
    type: 'host',
    template_id: 'alpine-host',
    ip: '10.100.1.14',
    x: 600,
    y: 380,
    status: 'up',
  },
];

const INITIAL_TOPOLOGY_LINKS: TopologyLink[] = [
  { id: 'l1', source: 'vyos-lab-gw', target: 'ovs-lab-sw01', label: 'eth1 <-> eth0 (Trunk)', status: 'up' },
  { id: 'l2', source: 'ovs-lab-sw01', target: 'ovs-lab-sw02', label: 'eth7 <-> eth7 (Trunk)', status: 'up' },
  { id: 'l3', source: 'ovs-lab-sw01', target: 'lab-pc01', label: 'eth1 <-> eth0 (VLAN 100)', status: 'up' },
  { id: 'l4', source: 'ovs-lab-sw01', target: 'lab-pc02', label: 'eth2 <-> eth0 (VLAN 100)', status: 'up' },
  { id: 'l5', source: 'ovs-lab-sw02', target: 'lab-pc03', label: 'eth1 <-> eth0 (VLAN 100)', status: 'up' },
  { id: 'l6', source: 'ovs-lab-sw02', target: 'lab-pc04', label: 'eth2 <-> eth0 (VLAN 100)', status: 'up' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('topology');
  const [activeBarTab, setActiveBarTab] = useState<ActivityBarTab>('explorer');
  const [files, setFiles] = useState<WorkspaceFile[]>(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState<WorkspaceFile | null>(INITIAL_FILES[0]);
  const [catalog] = useState<CatalogData>(INITIAL_CATALOG);
  const [nodes, setNodes] = useState<TopologyNode[]>(INITIAL_TOPOLOGY_NODES);
  const [links, setLinks] = useState<TopologyLink[]>(INITIAL_TOPOLOGY_LINKS);

  // Agent Intent & HITL State
  const [intent, setIntent] = useState('Create a computer lab with 20 computers');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  const [plan, setPlan] = useState<ImplementationPlan | null>({
    title: '20-Workstation Enterprise Computer Lab Network',
    status: 'APPROVED',
    markdown: '# Implementation Plan: 20-Workstation Enterprise Computer Lab Network',
    nodesCount: 7,
    subnets: ['192.168.122.0/24 (Mgmt)', '10.100.1.0/24 (VLAN 100)'],
  });

  const [testResult, setTestResult] = useState<TestResult | null>({
    passed: true,
    summary: '7 passed in 0.04s (100% Green)',
    details: [
      { name: 'test_topology_node_count_and_guardrail', passed: true },
      { name: 'test_zero_duplicate_ips', passed: true },
      { name: 'test_gateway_workstation_subnet_consistency', passed: true },
      { name: 'test_ovs_vlan_trunking_and_access', passed: true },
      { name: 'test_inter_workstation_cross_switch_reachability', passed: true },
      { name: 'test_routing_engine_control_plane', passed: true },
      { name: 'test_ospf_or_stub_routing_readiness', passed: true },
    ],
  });

  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([
    {
      id: 'snap-001',
      checkpoint_id: 'chk_20260923_lab_001',
      timestamp: '12:10:30',
      description: 'Pre-execution state checkpoint for 20-workstation lab topology.',
      status: 'APPROVED',
      nodes_count: 7,
      files: {},
      topology: { nodes: INITIAL_TOPOLOGY_NODES, links: INITIAL_TOPOLOGY_LINKS },
    },
  ]);

  const [activeSnapshotId, setActiveSnapshotId] = useState('chk_20260923_lab_001');

  // Logs stream
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: 'l1',
      timestamp: '12:18:07',
      type: 'pytest',
      level: 'info',
      message: 'Running pytest tests/test_reachability.py tests/test_ospf.py -v',
    },
    {
      id: 'l2',
      timestamp: '12:19:43',
      type: 'pytest',
      level: 'success',
      message: '============================== 7 passed in 0.04s ==============================',
    },
    {
      id: 'l3',
      timestamp: '12:20:01',
      type: 'gns3',
      level: 'info',
      message: 'POST /v2/projects/proj-lab-20-nodes/nodes -> 7 nodes synced',
    },
    {
      id: 'l4',
      timestamp: '12:22:24',
      type: 'ssh',
      level: 'success',
      message: 'Applied /configs/vyos-lab-gw.cfg via SSH -> Commit and save successful',
    },
  ]);

  // Submit Intent Handler
  const handleSubmitIntent = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setPlan({
        title: `Plan: ${intent.slice(0, 45)}...`,
        status: 'PENDING_APPROVAL',
        markdown: `# Implementation Plan: ${intent}\n**Status:** PENDING_APPROVAL`,
        nodesCount: 7,
        subnets: ['10.100.1.0/24'],
      });
      setIsGeneratingPlan(false);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'pytest',
          level: 'info',
          message: `Phase 1: Implementation Plan generated for intent: "${intent}". Execution paused for HITL review.`,
        },
      ]);
    }, 900);
  };

  // HITL Approval Handler
  const handleApprovePlan = () => {
    if (!plan) return;
    setIsDeploying(true);

    setTimeout(() => {
      setPlan({ ...plan, status: 'APPROVED' });
      setIsDeploying(false);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-1`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'gns3',
          level: 'success',
          message: 'HITL Approval received. Immutable snapshot created: chk_20260923_lab_002',
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'pytest',
          level: 'success',
          message: 'All 7 Pytest simulation assertions passed with 100% Green.',
        },
      ]);
    }, 1200);
  };

  // State Revert Handler
  const handleRevertState = (snap: StateSnapshot) => {
    setActiveSnapshotId(snap.checkpoint_id);
    setNodes(snap.topology.nodes);
    setLinks(snap.topology.links);
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'gns3',
        level: 'warn',
        message: `↩️ State Rollback: Reverted workspace and GNS3 topology to checkpoint [${snap.checkpoint_id}].`,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0c0e] text-zinc-100 select-none">
      {/* Top Menu Bar */}
      <TopMenu
        threadId="netarch-thread-001"
        gns3Status="connected"
        guardrailStatus="enforced"
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far-Left Activity Bar */}
        <ActivityBar
          activeTab={activeBarTab}
          onTabChange={(tab) => {
            if (tab === 'git') setIsGithubModalOpen(true);
            else setActiveBarTab(tab);
          }}
          prPending={testResult?.passed}
        />

        {/* Primary Left Drawer (File Explorer or Device Catalog) */}
        {activeBarTab === 'explorer' && (
          <FileExplorer
            files={files}
            activeFile={activeFile}
            onSelectFile={(file) => {
              setActiveFile(file);
              setActiveTab('file');
            }}
            onOpenTopology={() => setActiveTab('topology')}
            isTopologyActive={activeTab === 'topology'}
          />
        )}

        {activeBarTab === 'catalog' && <DeviceCatalog catalog={catalog} />}

        {/* Center Dual-Tab Editor & Visual Canvas */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#121215] overflow-hidden">
          <EditorTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeFile={activeFile}
            onCloseFile={() => setActiveFile(null)}
          />

          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'file' ? (
              <MonacoViewer file={activeFile} />
            ) : (
              <TopologyCanvas nodes={nodes} links={links} />
            )}
          </div>

          {/* Bottom Console Panel */}
          <BottomPanel
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </main>

        {/* Right Sidebar: Antigravity Agent Manager */}
        <AgentPanel
          intent={intent}
          onIntentChange={setIntent}
          onSubmitIntent={handleSubmitIntent}
          isGeneratingPlan={isGeneratingPlan}
          plan={plan}
          onApprovePlan={handleApprovePlan}
          onModifyPlan={() => alert('Editing Plan Artifact in Monaco Editor...')}
          isDeploying={isDeploying}
          testResult={testResult}
          snapshots={snapshots}
          activeSnapshotId={activeSnapshotId}
          onRevertState={handleRevertState}
          onOpenGithubModal={() => setIsGithubModalOpen(true)}
        />
      </div>

      {/* GitHub PR Modal */}
      <GithubModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        branchName="feature/netarchitect-computer-lab"
        prUrl="https://github.com/Amanpt356/test1/compare/feature/netarchitect-computer-lab?expand=1"
      />
    </div>
  );
};

export default App;
