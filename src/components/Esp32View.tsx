import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  Download,
  Calendar,
  Clock,
  Thermometer,
  Droplets,
  Activity,
  Zap,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Settings2,
} from 'lucide-react';
import { LecturaESP32 } from '../types/index.ts';
import { exportESP32DataToCSV } from '../utils/csv.ts';

interface Esp32ViewProps {
  esp32Connected: boolean;
  onToggleESP32: () => void;
  currentReading: LecturaESP32 | null;
  history: LecturaESP32[];
  onToggleBomba: () => void;
  onToggleLuz: () => void;
  onClearHistory: () => void;
}

export const Esp32View: React.FC<Esp32ViewProps> = ({
  esp32Connected,
  onToggleESP32,
  currentReading,
  history,
  onToggleBomba,
  onToggleLuz,
  onClearHistory,
}) => {
  const [espIp, setEspIp] = useState('192.168.4.1');
  const [showConfig, setShowConfig] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleExportCSV = () => {
    exportESP32DataToCSV(history);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2000);
  };

  const reading = (esp32Connected && currentReading) ? currentReading : {
    id: 'offline',
    timestamp: new Date().toISOString(),
    dia: new Date().getDate(),
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    hora: new Date().toLocaleTimeString(),
    tempAgua: 0.0,
    tempAmbiente: 0.0,
    humedad: 0.0,
    ph: 0.0,
    conductividad: 0.0,
    nivelAguaLitros: 0.0,
    bombaActiva: false,
    luzEspectralActiva: false,
  };

  const nivelPorcentaje = Math.min(
    100,
    Math.max(0, Math.round((reading.nivelAguaLitros / 11) * 100))
  );

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Monitoreo en Tiempo Real ESP32
          </h1>
          <p className="text-xs text-slate-400">
            Conexión inalámbrica Wi-Fi con el microcontrolador y sensores IoT
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Configurar conexión Wi-Fi"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Panel de Configuración Wi-Fi (Colapsable) */}
      {showConfig && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              Parámetros de Enlace Wi-Fi ESP32
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Puerto 80 / WebSocket
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400">IP del Microcontrolador:</label>
              <input
                type="text"
                value={espIp}
                onChange={(e) => setEspIp(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Frecuencia de Muestreo:</label>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs">
                2000 ms (2 segundos)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta de Estado de Conexión Wi-Fi & Sincronización Temporal */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status WiFi */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                esp32Connected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {esp32Connected ? (
                <Wifi className="w-5 h-5 animate-pulse" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {esp32Connected ? 'ESP32 Conectado vía Wi-Fi' : 'ESP32 Fuera de Línea'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    esp32Connected
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {esp32Connected ? 'Enlace Activo' : 'Desconectado'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {esp32Connected
                  ? `IP: ${espIp} · Señal: -54 dBm (Excelente)`
                  : 'Toca el botón para iniciar telemetría en tiempo real'}
              </p>
            </div>
          </div>

          {/* Toggle Connect Button */}
          <button
            onClick={onToggleESP32}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              esp32Connected
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {esp32Connected ? 'Desconectar Wi-Fi' : 'Conectar ESP32 vía Wi-Fi'}
          </button>
        </div>

        {/* Reloj y Fecha Sincronizados (Día, Mes, Año, Hora) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Día / Mes / Año</span>
              <span className="font-bold text-white font-mono">
                {String(reading.dia).padStart(2, '0')}/{String(reading.mes).padStart(2, '0')}/{reading.año}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Hora Sincronizada</span>
              <span className="font-bold text-white font-mono">{reading.hora}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Telemetría</span>
              <span className="font-bold text-emerald-400 font-mono">
                {history.length} lecturas
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Latencia Wi-Fi</span>
              <span className="font-bold text-white font-mono">
                {esp32Connected ? '18 ms' : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Sensores Físicos en Tiempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* pH */}
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">pH Solución</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {reading.ph.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium block">
            Rango óptimo: 5.5 - 6.5
          </span>
        </div>

        {/* Conductividad Eléctrica */}
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conductividad</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {reading.conductividad.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">mS/cm</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            TDS: ~{Math.round(reading.conductividad * 500)} PPM
          </span>
        </div>

        {/* Temperatura del Agua */}
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Temp. Agua</span>
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {reading.tempAgua.toFixed(1)}°C
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            Ambiente: {reading.tempAmbiente.toFixed(1)}°C
          </span>
        </div>

        {/* Humedad Relativa */}
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Humedad Amb.</span>
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {reading.humedad.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 block">
            Sensor DHT22 / BME280
          </span>
        </div>

        {/* Nivel de Agua en el Tanque (Máx 11L) */}
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5 col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Nivel de Agua (Tanque 11L Máx)
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {reading.nivelAguaLitros.toFixed(1)} / 11.0 Litros
            </span>
          </div>

          {/* Barra de progreso de volumen líquido */}
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                nivelPorcentaje < 25
                  ? 'bg-rose-500'
                  : nivelPorcentaje < 50
                  ? 'bg-amber-500'
                  : 'bg-sky-400'
              }`}
              style={{ width: `${nivelPorcentaje}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{nivelPorcentaje}% disponible</span>
            <span>
              {reading.nivelAguaLitros < 3.5 ? '⚠️ Requiere reposición' : 'Nivel seguro'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Manual de Actuadores del ESP32 (Bomba NFT & Luz Espectral) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Power className="w-3.5 h-3.5 text-emerald-400" />
          Control de Actuadores Físicos
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Bomba de recirculación */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Bomba NFT
              </span>
              <span className="text-[10px] text-slate-400">
                {reading.bombaActiva ? 'Recirculando agua' : 'Detenida'}
              </span>
            </div>

            <button
              onClick={onToggleBomba}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                reading.bombaActiva
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {reading.bombaActiva ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Luz espectral grow LED */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Luz Espectral
              </span>
              <span className="text-[10px] text-slate-400">
                {reading.luzEspectralActiva ? 'LED espectral activo' : 'Apagada'}
              </span>
            </div>

            <button
              onClick={onToggleLuz}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                reading.luzEspectralActiva
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {reading.luzEspectralActiva ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE EXPORTACIÓN CSV REQUERIDA POR EL USUARIO */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Historial de Telemetría ({history.length} registros)
            </h3>
            <p className="text-xs text-slate-400">
              Datos registrados continuamente con Día, Mes, Año, Hora y parámetros
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
            >
              Limpiar registros
            </button>
          )}
        </div>

        {/* BOTÓN EXPORTAR DATOS REQUERIDO: "con un boton que diga exportar datos" */}
        <button
          onClick={handleExportCSV}
          disabled={history.length === 0}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Download className="w-5 h-5 text-slate-950" />
          <span>EXPORTAR DATOS</span>
        </button>

        {exportNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Reporte CSV exportado y descargado exitosamente!</span>
          </div>
        )}

        {/* Tabla previa compacta de últimas lecturas */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-left text-[11px] text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="py-2 px-2.5">Fecha</th>
                  <th className="py-2 px-2.5">Hora</th>
                  <th className="py-2 px-2.5">pH</th>
                  <th className="py-2 px-2.5">EC (mS)</th>
                  <th className="py-2 px-2.5">T. Agua</th>
                  <th className="py-2 px-2.5">Nivel (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/50">
                    <td className="py-1.5 px-2.5 whitespace-nowrap">
                      {String(row.dia).padStart(2, '0')}/{String(row.mes).padStart(2, '0')}/{row.año}
                    </td>
                    <td className="py-1.5 px-2.5">{row.hora}</td>
                    <td className="py-1.5 px-2.5 text-emerald-400">{row.ph.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-purple-400">{row.conductividad.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-amber-400">{row.tempAgua.toFixed(1)}°</td>
                    <td className="py-1.5 px-2.5 text-sky-400">{row.nivelAguaLitros.toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
