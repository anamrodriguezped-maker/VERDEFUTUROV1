import React from 'react';
import { Home, LineChart, Sprout, Cpu } from 'lucide-react';

export type NavTab = 'inicio' | 'analisis' | 'siembra' | 'esp32';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'inicio' as NavTab,
      label: 'Inicio STEM+',
      icon: Home,
    },
    {
      id: 'analisis' as NavTab,
      label: 'Análisis',
      icon: LineChart,
    },
    {
      id: 'siembra' as NavTab,
      label: 'Siembra',
      icon: Sprout,
    },
    {
      id: 'esp32' as NavTab,
      label: 'ESP32 IoT',
      icon: Cpu,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-area-bottom">
      <div className="max-w-md md:max-w-lg mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all min-h-[48px] active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 scale-105'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
