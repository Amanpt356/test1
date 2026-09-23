export type ActiveTab = 'file' | 'topology';

export type ActivityBarTab = 'explorer' | 'catalog' | 'git' | 'settings';

export interface WorkspaceFile {
  name: string;
  path: string;
  category: 'configs' | 'root' | 'tests' | 'snapshots' | 'diagnostics';
  content: string;
  language: string;
}

export interface CatalogDevice {
  vendor: string;
  type: string;
  model: string;
  description: string;
  gns3_template_id: string;
  node_type: string;
  cli_type: string;
  ram_mb: number;
  cpus: number;
  default_interfaces: Array<{ name: string; type?: string; purpose?: string }>;
  supported_protocols?: string[];
  supported_features?: string[];
  supported_tools?: string[];
}

export interface CatalogData {
  version: string;
  catalog_name: string;
  inventory: {
    routers?: CatalogDevice[];
    switches?: CatalogDevice[];
    firewalls?: CatalogDevice[];
    hosts?: CatalogDevice[];
  };
  guardrails: {
    max_nodes_per_project: number;
    disallow_duplicate_ips: boolean;
    enforce_management_subnet: string;
    allowed_vlan_range: string;
  };
}

export interface TopologyNode {
  id: string;
  label: string;
  name: string;
  type: 'router' | 'switch' | 'host' | 'firewall';
  template_id: string;
  ip?: string;
  mgmt_ip?: string;
  x: number;
  y: number;
  status: 'stopped' | 'deploying' | 'up' | 'down';
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  status: 'stopped' | 'deploying' | 'up' | 'down';
}

export interface ImplementationPlan {
  title: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  markdown: string;
  nodesCount: number;
  subnets: string[];
}

export interface StateSnapshot {
  id: string;
  checkpoint_id: string;
  timestamp: string;
  description: string;
  status: string;
  nodes_count: number;
  files: Record<string, string>;
  topology: {
    nodes: TopologyNode[];
    links: TopologyLink[];
  };
}

export interface TestResult {
  passed: boolean;
  summary: string;
  details: Array<{
    name: string;
    passed: boolean;
    duration?: string;
    output?: string;
  }>;
}

export interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'pytest' | 'gns3' | 'ssh';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
