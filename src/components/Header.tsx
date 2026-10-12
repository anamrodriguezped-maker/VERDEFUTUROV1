import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { AlertaSensor } from '../types/index.ts';

interface HeaderProps {
  esp32Connected: boolean;
  onToggleESP32: () => void;
  alertas: AlertaSensor[];
  onOpenAlertas: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  esp32Connected,
  onToggleESP32,
  alertas,
  onOpenAlertas,
}) => {
  const unreadAlerts = alertas.filter((a) => !a.leida).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="sm" showText={true} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wi-Fi ESP32 Toggle */}
          <button
            onClick={onToggleESP32}
            title={esp32Connected ? 'ESP32 conectado vía Wi-Fi' : 'ESP32 desconectado'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              esp32Connected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            {esp32Connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">ESP32 Online</span>
                <span className="sm:hidden">WiFi</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Conectar ESP32</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </button>

          {/* Notificaciones Bell */}
          <button
            onClick={onOpenAlertas}
            aria-label="Abrir centro de alertas"
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
