import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import { AlertaSensor, UmbralesConfig } from '../types/index.ts';
import { requestPushPermission } from '../utils/notifications.ts';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertas: AlertaSensor[];
  onMarkAllRead: () => void;
  onClearAlertas: () => void;
  umbrales: UmbralesConfig;
  onUpdateUmbrales: (umbrales: UmbralesConfig) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  alertas,
  onMarkAllRead,
  onClearAlertas,
  umbrales,
  onUpdateUmbrales,
}) => {
  const [activeTab, setActiveTab] = React.useState<'alertas' | 'umbrales'>('alertas');
  const [localUmbrales, setLocalUmbrales] = React.useState<UmbralesConfig>(umbrales);
  const [savedMsg, setSavedMsg] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  React.useEffect(() => {
    setLocalUmbrales(umbrales);
  }, [umbrales]);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const res = await requestPushPermission();
    setPushStatus(res);
  };

  const handleSaveUmbrales = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUmbrales(localUmbrales);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Centro de Alertas & Push
              </h2>
              <span className="text-[11px] text-slate-400">
                Monitoreo en tiempo real de umbrales
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('alertas')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-colors ${
              activeTab === 'alertas'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial ({alertas.length})
          </button>
          <button
            onClick={() => setActiveTab('umbrales')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-colors ${
              activeTab === 'umbrales'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Configurar Umbrales
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 flex-1">
          {activeTab === 'alertas' ? (
            <div className="space-y-3">
              {/* Push Permission Banner */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Notificaciones Push</p>
                    <p className="text-[11px] text-slate-400">
                      {pushStatus === 'granted'
                        ? 'Activadas y listas para recibir alertas'
                        : pushStatus === 'denied'
                        ? 'Bloqueadas en el navegador'
                        : 'Permite avisos instantáneos al teléfono'}
                    </p>
                  </div>
                </div>

                {pushStatus !== 'granted' && (
                  <button
                    onClick={handleRequestPush}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
                  >
                    Habilitar
                  </button>
                )}
              </div>

              {/* Action row */}
              {alertas.length > 0 && (
                <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                  <button
                    onClick={onMarkAllRead}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar leídas
                  </button>
                  <button
                    onClick={onClearAlertas}
                    className="text-rose-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar lista
                  </button>
                </div>
              )}

              {/* Alert list */}
              {alertas.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    Todos los parámetros dentro de rango
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Cuando cargues datos en Excel o los sensores del ESP32 superen los umbrales, aquí recibirás alertas instantáneas.
                  </p>
                </div>
              ) : (
                alertas.map((alt) => {
                  const isCrit = alt.nivel === 'critica';
                  return (
                    <div
                      key={alt.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCrit
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-amber-950/20 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          {isCrit ? (
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold uppercase ${
                              isCrit ? 'text-rose-400' : 'text-amber-400'
                            }`}
                          >
                            {alt.parametro}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alt.timestamp}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-200 mt-1">
                        {alt.mensaje}
                      </p>

                      <div className="mt-2 text-[11px] bg-slate-950/60 p-2 rounded-xl text-slate-300 border border-slate-800">
                        <span className="font-semibold text-emerald-400">
                          Acción correctiva:{' '}
                        </span>
                        {alt.sugerencia}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveUmbrales} className="space-y-4">
              <p className="text-xs text-slate-400">
                Ajusta los rangos seguros para el cultivo hidropónico. El sistema activará alertas push cuando cualquier lectura salga de estos valores.
              </p>

              {/* Temperatura */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Temperatura (°C)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {localUmbrales.tempMin}°C - {localUmbrales.tempMax}°C
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Mínima (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={localUmbrales.tempMin}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, tempMin: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Máxima (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={localUmbrales.tempMax}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, tempMax: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* pH */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span>pH (Potencial de Hidrógeno)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {localUmbrales.phMin} - {localUmbrales.phMax}
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Mínimo pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localUmbrales.phMin}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, phMin: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Máximo pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localUmbrales.phMax}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, phMax: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Conductividad */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Conductividad Eléctrica (mS/cm)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {localUmbrales.ecMin} - {localUmbrales.ecMax} mS/cm
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Mínimo EC (mS/cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localUmbrales.ecMin}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, ecMin: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Máximo EC (mS/cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localUmbrales.ecMax}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, ecMax: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Humedad */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Humedad Relativa (%)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {localUmbrales.humMin}% - {localUmbrales.humMax}%
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Mínima (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={localUmbrales.humMin}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, humMin: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Máxima (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={localUmbrales.humMax}
                      onChange={(e) =>
                        setLocalUmbrales({ ...localUmbrales, humMax: parseFloat(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                {savedMsg ? '✓ Umbrales Actualizados' : 'Guardar Umbrales'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
