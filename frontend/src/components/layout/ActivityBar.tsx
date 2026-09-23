import React from 'react';
import { Files, Network, GitBranch, Settings } from 'lucide-react';
import { ActivityBarTab } from '../../types/workspace';

interface ActivityBarProps {
  activeTab: ActivityBarTab;
  onTabChange: (tab: ActivityBarTab) => void;
  prPending?: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onTabChange,
  prPending = false,
}) => {
  const items = [
    { id: 'explorer' as ActivityBarTab, label: 'Explorer', icon: Files },
    { id: 'catalog' as ActivityBarTab, label: 'Device Catalog', icon: Network },
    { id: 'git' as ActivityBarTab, label: 'Source Control (PR)', icon: GitBranch, badge: prPending },
  ];

  return (
    <aside className="w-12 bg-[#121214] border-r border-zinc-800 flex flex-col items-center py-2 justify-between select-none">
      <div className="flex flex-col items-center gap-1 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`relative w-full h-11 flex items-center justify-center transition-colors ${
                isActive
                  ? 'text-zinc-100 bg-zinc-800/40'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-400 rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full flex flex-col items-center">
        <button
          onClick={() => onTabChange('settings')}
          title="Workspace Settings"
          className={`relative w-full h-11 flex items-center justify-center transition-colors ${
            activeTab === 'settings'
              ? 'text-zinc-100 bg-zinc-800/40'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {activeTab === 'settings' && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-400 rounded-r" />
          )}
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
