import React from 'react';
import { Router, Server, Shield, Monitor, Cpu, HardDrive } from 'lucide-react';
import { CatalogData, CatalogDevice } from '../../types/workspace';

interface DeviceCatalogProps {
  catalog: CatalogData;
}

export const DeviceCatalog: React.FC<DeviceCatalogProps> = ({ catalog }) => {
  const renderDeviceCard = (device: CatalogDevice, icon: React.ReactNode, borderClass: string) => (
    <div
      key={device.gns3_template_id}
      className={`p-2.5 rounded-lg bg-zinc-900/80 border ${borderClass} space-y-2 hover:border-zinc-500 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="font-semibold text-zinc-100 text-xs">{device.model}</div>
            <div className="text-[10px] text-zinc-400 font-mono">{device.vendor}</div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
          {device.node_type}
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-4">{device.description}</p>

      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-zinc-500" />
          <span>RAM: {device.ram_mb}MB</span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-zinc-500" />
          <span>CPUs: {device.cpus}</span>
        </div>
        <div className="col-span-2 text-zinc-400">
          CLI: <span className="text-zinc-200 font-semibold">{device.cli_type}</span> ({device.default_interfaces?.length || 0} ports)
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-[#141416] border-r border-zinc-800 flex flex-col h-full select-none text-xs">
      <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
        <span>Hardware Inventory</span>
        <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Guardrails Info Box */}
        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1 font-mono text-[10px]">
          <div className="text-emerald-400 font-bold uppercase tracking-wider">Guardrail Constraints</div>
          <div className="text-zinc-400">Max Nodes: <span className="text-zinc-200 font-semibold">{catalog.guardrails.max_nodes_per_project}</span></div>
          <div className="text-zinc-400">Mgmt Subnet: <span className="text-zinc-200 font-semibold">{catalog.guardrails.enforce_management_subnet}</span></div>
          <div className="text-zinc-400">VLAN Range: <span className="text-zinc-200 font-semibold">{catalog.guardrails.allowed_vlan_range}</span></div>
        </div>

        {/* Routers */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Routers ({catalog.inventory.routers?.length || 0})
          </div>
          {catalog.inventory.routers?.map((dev) =>
            renderDeviceCard(dev, <Router className="w-4 h-4 text-emerald-400" />, 'border-emerald-500/20')
          )}
        </div>

        {/* Switches */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Switches ({catalog.inventory.switches?.length || 0})
          </div>
          {catalog.inventory.switches?.map((dev) =>
            renderDeviceCard(dev, <Server className="w-4 h-4 text-cyan-400" />, 'border-cyan-500/20')
          )}
        </div>

        {/* Firewalls */}
        {catalog.inventory.firewalls && catalog.inventory.firewalls.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
              Firewalls
            </div>
            {catalog.inventory.firewalls.map((dev) =>
              renderDeviceCard(dev, <Shield className="w-4 h-4 text-rose-400" />, 'border-rose-500/20')
            )}
          </div>
        )}

        {/* Workload Hosts */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Workload Endpoints
          </div>
          {catalog.inventory.hosts?.map((dev) =>
            renderDeviceCard(dev, <Monitor className="w-4 h-4 text-purple-400" />, 'border-purple-500/20')
          )}
        </div>
      </div>
    </div>
  );
};
