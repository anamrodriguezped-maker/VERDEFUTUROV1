import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  TrendingUp,
  Thermometer,
  Droplets,
  Activity,
  Zap,
} from 'lucide-react';
import { ExcelRowData, UmbralesConfig, AlertaSensor } from '../types/index.ts';
import { parseExcelFile, downloadExcelTemplate, ParseResult } from '../utils/excel.ts';
import { triggerPushNotification } from '../utils/notifications.ts';

interface AnalisisViewProps {
  excelData: ExcelRowData[];
  onDataLoaded: (result: ParseResult) => void;
  umbrales: UmbralesConfig;
  onOpenUmbralesModal: () => void;
  alertas: AlertaSensor[];
}

export const AnalisisView: React.FC<AnalisisViewProps> = ({
  excelData,
  onDataLoaded,
  umbrales,
  onOpenUmbralesModal,
  alertas,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    'temperatura' | 'humedad' | 'ph' | 'conductividad'
  >('temperatura');
  const [hoveredPoint, setHoveredPoint] = useState<ExcelRowData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setUploadError(null);
    try {
      const result = await parseExcelFile(file, umbrales);
      onDataLoaded(result);

      // Disparar notificaciones push para las alertas encontradas
      if (result.alertas.length > 0) {
        result.alertas.forEach((alerta, idx) => {
          // Escalona sutilmente las alertas push
          setTimeout(() => {
            triggerPushNotification(alerta);
          }, idx * 600);
        });
      }
    } catch (err: any) {
      setUploadError(err || 'Error al procesar el archivo Excel. Verifica el formato de columnas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Métricas estadísticas sobre los datos cargados
  const stats = React.useMemo(() => {
    if (excelData.length === 0) return null;
    const temps = excelData.map((d) => d.temperatura);
    const hums = excelData.map((d) => d.humedad);
    const phs = excelData.map((d) => d.ph);
    const ecs = excelData.map((d) => d.conductividad);

    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

    return {
      count: excelData.length,
      tempAvg: avg(temps),
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      humAvg: avg(hums),
      humMin: Math.min(...hums),
      humMax: Math.max(...hums),
      phAvg: (phs.reduce((a, b) => a + b, 0) / phs.length).toFixed(2),
      phMin: Math.min(...phs).toFixed(2),
      phMax: Math.max(...phs).toFixed(2),
      ecAvg: (ecs.reduce((a, b) => a + b, 0) / ecs.length).toFixed(2),
      ecMin: Math.min(...ecs).toFixed(2),
      ecMax: Math.max(...ecs).toFixed(2),
    };
  }, [excelData]);

  // Configuración de visualización por métrica
  const metricConfigs = {
    temperatura: {
      label: 'Temperatura del Agua/Ambiente',
      unit: '°C',
      minThreshold: umbrales.tempMin,
      maxThreshold: umbrales.tempMax,
      strokeColor: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.15)',
      yMin: Math.min(10, Math.floor((stats?.tempMin ?? 18) - 2)),
      yMax: Math.max(35, Math.ceil((stats?.tempMax ?? 28) + 2)),
      icon: Thermometer,
    },
    humedad: {
      label: 'Humedad Relativa',
      unit: '%',
      minThreshold: umbrales.humMin,
      maxThreshold: umbrales.humMax,
      strokeColor: '#38BDF8',
      fillColor: 'rgba(56, 189, 248, 0.15)',
      yMin: 20,
      yMax: 100,
      icon: Droplets,
    },
    ph: {
      label: 'Nivel de pH (Acidez / Alcalinidad)',
      unit: 'pH',
      minThreshold: umbrales.phMin,
      maxThreshold: umbrales.phMax,
      strokeColor: '#10B981',
      fillColor: 'rgba(16, 185, 129, 0.15)',
      yMin: 4.0,
      yMax: 9.0,
      icon: Activity,
    },
    conductividad: {
      label: 'Conductividad Eléctrica (EC)',
      unit: 'mS/cm',
      minThreshold: umbrales.ecMin,
      maxThreshold: umbrales.ecMax,
      strokeColor: '#A855F7',
      fillColor: 'rgba(168, 85, 247, 0.15)',
      yMin: 0.5,
      yMax: 3.5,
      icon: Zap,
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  // Generador de coordenadas SVG para la gráfica
  const renderChart = () => {
    if (excelData.length === 0) return null;

    const width = 600;
    const height = 240;
    const padding = { top: 25, right: 30, bottom: 40, left: 45 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = excelData.map((d) => d[selectedMetric]);
    const minVal = currentConfig.yMin;
    const maxVal = currentConfig.yMax;
    const range = maxVal - minVal || 1;

    const getX = (idx: number) => {
      if (excelData.length <= 1) return padding.left + chartW / 2;
      return padding.left + (idx / (excelData.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      return padding.top + chartH - ((clamped - minVal) / range) * chartH;
    };

    // Coordenadas de la línea de datos
    const points = values.map((val, idx) => ({
      x: getX(idx),
      y: getY(val),
      val,
      data: excelData[idx],
    }));

    const linePath = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${
      padding.top + chartH
    } L ${points[0].x} ${padding.top + chartH} Z`;

    const minThresholdY = getY(currentConfig.minThreshold);
    const maxThresholdY = getY(currentConfig.maxThreshold);

    return (
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={currentConfig.strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * pct;
            const val = (maxVal - pct * range).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Zona óptima / Umbrales visuales */}
          <rect
            x={padding.left}
            y={Math.min(minThresholdY, maxThresholdY)}
            width={chartW}
            height={Math.abs(minThresholdY - maxThresholdY)}
            fill="#10B981"
            fillOpacity="0.06"
          />

          {/* Línea de umbral mínimo */}
          <line
            x1={padding.left}
            y1={minThresholdY}
            x2={padding.left + chartW}
            y2={minThresholdY}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Línea de umbral máximo */}
          <line
            x1={padding.left}
            y1={maxThresholdY}
            x2={padding.left + chartW}
            y2={maxThresholdY}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Área sombreada bajo la curva */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Curva de datos */}
          <path
            d={linePath}
            fill="none"
            stroke={currentConfig.strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos de datos interactivos */}
          {points.map((pt, idx) => {
            const isOutOfRange =
              pt.val < currentConfig.minThreshold || pt.val > currentConfig.maxThreshold;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onTouchStart={() => setHoveredPoint(pt.data)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={isOutOfRange ? '#EF4444' : currentConfig.strokeColor}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="transition-all hover:r-6"
                />
              </g>
            );
          })}

          {/* Etiquetas eje X */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={height - 12}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="start"
                className="font-mono"
              >
                {points[0].data.fecha.slice(0, 10)} {points[0].data.hora}
              </text>
              <text
                x={points[points.length - 1].x}
                y={height - 12}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                {points[points.length - 1].data.fecha.slice(0, 10)} {points[points.length - 1].data.hora}
              </text>
            </>
          )}
        </svg>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-[11px] text-slate-400 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentConfig.strokeColor }}
              />
              <span>{currentConfig.label}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500" />
              <span>Umbrales ({currentConfig.minThreshold} - {currentConfig.maxThreshold} {currentConfig.unit})</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-500">
            Toca cualquier punto para detalles
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Análisis de Datos Hidropónicos
          </h1>
          <p className="text-xs text-slate-400">
            Carga tu archivo Excel para generar gráficas y alertas automáticas
          </p>
        </div>

        <button
          onClick={onOpenUmbralesModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold shrink-0 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Umbrales</span>
        </button>
      </div>

      {/* Upload Zone (Siempre accesible, destacada cuando está vacía) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-3xl p-6 sm:p-8 text-center border-2 border-dashed transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : excelData.length === 0
            ? 'border-emerald-500/40 bg-slate-900/80 shadow-xl'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
            {isLoading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {excelData.length === 0
                ? 'Carga un documento Excel (.xlsx, .csv)'
                : 'Cargar otro archivo Excel con nuevos datos'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Columnas requeridas: <span className="text-slate-200 font-medium">FECHA, Hora, Temperatura, Humedad, pH y Conductividad</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {isLoading ? 'Analizando...' : 'Seleccionar Archivo Excel'}
            </button>

            <button
              onClick={downloadExcelTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar Plantilla .xlsx</span>
            </button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cuando NO hay datos cargados, guiar al usuario sin datos inventados */}
      {excelData.length === 0 && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Instrucciones para tu archivo Excel:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>La primera fila debe contener los nombres de columnas: <code className="text-emerald-400">Fecha</code>, <code className="text-emerald-400">Hora</code>, <code className="text-emerald-400">Temperatura</code>, <code className="text-emerald-400">Humedad</code>, <code className="text-emerald-400">pH</code> y <code className="text-emerald-400">Conductividad</code>.</li>
            <li>El sistema evaluará automáticamente cada registro contra los umbrales configurados y emitirá notificaciones push.</li>
            <li>Puedes descargar la plantilla oficial con el botón superior para ingresar tus datos.</li>
          </ul>
        </div>
      )}

      {/* Gráficas y Métricas cuando SI hay datos cargados */}
      {excelData.length > 0 && stats && (
        <div className="space-y-4">
          {/* Resumen Superior */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Temperatura</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-amber-400">{stats.tempAvg}°C</span>
                <span className="text-[10px] text-slate-500">prom.</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {stats.tempMin}° - {stats.tempMax}°C
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Humedad Rel.</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-sky-400">{stats.humAvg}%</span>
                <span className="text-[10px] text-slate-500">prom.</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {stats.humMin}% - {stats.humMax}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">pH Promedio</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-emerald-400">{stats.phAvg}</span>
                <span className="text-[10px] text-slate-500">pH</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {stats.phMin} - {stats.phMax}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Conductividad</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-purple-400">{stats.ecAvg}</span>
                <span className="text-[10px] text-slate-500">mS/cm</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {stats.ecMin} - {stats.ecMax}
              </span>
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
            {(['temperatura', 'humedad', 'ph', 'conductividad'] as const).map((m) => {
              const active = selectedMetric === m;
              const cfg = metricConfigs[m];
              const Icon = cfg.icon;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMetric(m);
                    setHoveredPoint(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.strokeColor }} />
                  <span>{m === 'temperatura' ? 'Temp' : m === 'humedad' ? 'Humedad' : m === 'ph' ? 'pH' : 'Conductividad'}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Container */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Gráfica: {currentConfig.label}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {excelData.length} lecturas procesadas
                </span>
              </div>

              {hoveredPoint && (
                <div className="text-right bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono text-[10px] block">
                    {hoveredPoint.fecha} · {hoveredPoint.hora}
                  </span>
                  <span className="font-bold text-white font-mono">
                    {hoveredPoint[selectedMetric]} {currentConfig.unit}
                  </span>
                </div>
              )}
            </div>

            {renderChart()}
          </div>

          {/* Resumen de Alertas detectadas en el Excel */}
          {alertas.length > 0 && (
            <div className="rounded-3xl bg-rose-950/20 border border-rose-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-rose-300">
                  {alertas.length} lecturas superaron los umbrales configurados
                </h4>
              </div>
              <p className="text-[11px] text-slate-300">
                Se enviaron notificaciones automáticas para cada evento fuera de los límites agronómicos establecidos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
