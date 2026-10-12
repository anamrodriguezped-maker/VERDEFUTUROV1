import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Droplet,
  FlaskConical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Layers,
} from 'lucide-react';
import { Cultivo, RegistroAguaFertilizante } from '../types/index.ts';

interface SiembraViewProps {
  cultivos: Cultivo[];
  activeCultivoId: string;
  onSelectCultivo: (id: string) => void;
  onAddCultivo: (cultivo: Cultivo) => void;
  onUpdateCultivo: (cultivo: Cultivo) => void;
  onDeleteCultivo: (id: string) => void;
}

// Meses permitidos según instrucción estricta:
// Septiembre, Octubre, Noviembre y Diciembre de 2026, y todo el 2027 (Ene - Dic)
interface AllowedMonth {
  year: number;
  monthIndex: number; // 0-11
  name: string;
}

const ALLOWED_MONTHS: AllowedMonth[] = [
  { year: 2026, monthIndex: 8, name: 'Septiembre 2026' },
  { year: 2026, monthIndex: 9, name: 'Octubre 2026' },
  { year: 2026, monthIndex: 10, name: 'Noviembre 2026' },
  { year: 2026, monthIndex: 11, name: 'Diciembre 2026' },
  { year: 2027, monthIndex: 0, name: 'Enero 2027' },
  { year: 2027, monthIndex: 1, name: 'Febrero 2027' },
  { year: 2027, monthIndex: 2, name: 'Marzo 2027' },
  { year: 2027, monthIndex: 3, name: 'Abril 2027' },
  { year: 2027, monthIndex: 4, name: 'Mayo 2027' },
  { year: 2027, monthIndex: 5, name: 'Junio 2027' },
  { year: 2027, monthIndex: 6, name: 'Julio 2027' },
  { year: 2027, monthIndex: 7, name: 'Agosto 2027' },
  { year: 2027, monthIndex: 8, name: 'Septiembre 2027' },
  { year: 2027, monthIndex: 9, name: 'Octubre 2027' },
  { year: 2027, monthIndex: 10, name: 'Noviembre 2027' },
  { year: 2027, monthIndex: 11, name: 'Diciembre 2027' },
];

export const SiembraView: React.FC<SiembraViewProps> = ({
  cultivos,
  activeCultivoId,
  onSelectCultivo,
  onAddCultivo,
  onUpdateCultivo,
  onDeleteCultivo,
}) => {
  // Modal para crear siembra
  const [showNewModal, setShowNewModal] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [variedadNueva, setVariedadNueva] = useState('Lechuga Batavia');
  const [fechaInicioNueva, setFechaInicioNueva] = useState('2026-10-15');
  const [litrosAguaNuevo, setLitrosAguaNuevo] = useState<number>(11);
  const [tipoFertilizanteNuevo, setTipoFertilizanteNuevo] = useState('Fertilizante Tipo A + B');
  const [cantidadFertilizanteNuevo, setCantidadFertilizanteNuevo] = useState('33 ml (3.0 ml / L)');
  const [notasNuevas, setNotasNuevas] = useState('');

  // Navegación en los meses permitidos (inicia en Octubre 2026)
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(1); // Octubre 2026

  // Registro del día en calendario
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [litrosInput, setLitrosInput] = useState<number>(2.0);
  const [fertAInput, setFertAInput] = useState<number>(6.0);
  const [fertBInput, setFertBInput] = useState<number>(6.0);
  const [notasDia, setNotasDia] = useState('');

  // Calculadora interactiva instantánea
  const [calcLitros, setCalcLitros] = useState<number>(11);

  const activeCultivo =
    cultivos.find((c) => c.id === activeCultivoId) || cultivos[0];

  const currentMonthInfo = ALLOWED_MONTHS[currentMonthIdx];

  // Grilla de días del mes actual
  const daysInMonth = new Date(
    currentMonthInfo.year,
    currentMonthInfo.monthIndex + 1,
    0
  ).getDate();

  const firstDayWeekIndex = new Date(
    currentMonthInfo.year,
    currentMonthInfo.monthIndex,
    1
  ).getDay();
  const startingEmptyCells = (firstDayWeekIndex + 6) % 7; // Lunes como primer día

  const handleCreateCultivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;

    const newCultivo: Cultivo = {
      id: `cultivo-${Date.now()}`,
      nombre: nombreNuevo.trim(),
      variedad: variedadNueva.trim(),
      fechaInicio: fechaInicioNueva,
      capacidadTanqueLitros: Number(litrosAguaNuevo) || 11,
      tipoFertilizante: tipoFertilizanteNuevo.trim() || 'Fertilizante Tipo A + B',
      cantidadFertilizante: cantidadFertilizanteNuevo.trim() || `${(litrosAguaNuevo * 3).toFixed(1)} ml`,
      estado: 'activo',
      notas: notasNuevas.trim(),
      registros: {},
    };

    onAddCultivo(newCultivo);
    setShowNewModal(false);
    setNombreNuevo('');
    setNotasNuevas('');
  };

  const handleOpenDay = (day: number) => {
    if (!activeCultivo) return;
    const yyyy = currentMonthInfo.year;
    const mm = String(currentMonthInfo.monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const existing = activeCultivo.registros[dateStr];
    setSelectedDayDate(dateStr);
    if (existing) {
      setLitrosInput(existing.litrosAgua);
      setFertAInput(existing.fertilizanteA_ml);
      setFertBInput(existing.fertilizanteB_ml);
      setNotasDia(existing.notas || '');
    } else {
      setLitrosInput(2.0);
      setFertAInput(6.0); // 2L * 3ml
      setFertBInput(6.0);
      setNotasDia('');
    }
  };

  const handleSaveDayRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCultivo || !selectedDayDate) return;

    const nuevoRegistro: RegistroAguaFertilizante = {
      id: `reg-${selectedDayDate}`,
      fecha: selectedDayDate,
      litrosAgua: Number(litrosInput),
      fertilizanteA_ml: Number(fertAInput),
      fertilizanteB_ml: Number(fertBInput),
      notas: notasDia.trim(),
      horaRegistro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated: Cultivo = {
      ...activeCultivo,
      registros: {
        ...activeCultivo.registros,
        [selectedDayDate]: nuevoRegistro,
      },
    };

    onUpdateCultivo(updated);
    setSelectedDayDate(null);
  };

  const handleDeleteDayRecord = (dateStr: string) => {
    if (!activeCultivo) return;
    const newRegistros = { ...activeCultivo.registros };
    delete newRegistros[dateStr];
    onUpdateCultivo({ ...activeCultivo, registros: newRegistros });
    setSelectedDayDate(null);
  };

  // Cálculos acumulados del mes seleccionado
  const monthPrefix = `${currentMonthInfo.year}-${String(
    currentMonthInfo.monthIndex + 1
  ).padStart(2, '0')}`;

  const monthRegistros = activeCultivo
    ? Object.values(activeCultivo.registros).filter((r) =>
        r.fecha.startsWith(monthPrefix)
      )
    : [];

  const totalAguaMes = monthRegistros.reduce((acc, r) => acc + r.litrosAgua, 0);
  const totalFertAMes = monthRegistros.reduce((acc, r) => acc + r.fertilizanteA_ml, 0);
  const totalFertBMes = monthRegistros.reduce((acc, r) => acc + r.fertilizanteB_ml, 0);
  const diasConRiego = monthRegistros.length;
  const promedioAguaDia =
    diasConRiego > 0 ? (totalAguaMes / diasConRiego).toFixed(1) : '0';

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Top Header & Selector de Cultivo */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            Control de Siembra & Nutrición
          </h1>
          <p className="text-xs text-slate-400">
            Propuesta Verde Futuro · Capacidad máxima: 11 Litros de Agua
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Siembra</span>
        </button>
      </div>

      {/* Selector de Cultivos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {cultivos.map((c) => {
          const isActive = c.id === activeCultivoId;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCultivo(c.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <div>
                <p className="text-xs font-bold leading-tight truncate max-w-[200px]">
                  {c.nombre}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {c.fechaInicio}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tarjeta de Monitoreo del Cultivo Activo con Litros, Tipo y Cantidad de Fertilizante */}
      {activeCultivo && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Siembra Seleccionada
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                {activeCultivo.nombre}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>Variedad: {activeCultivo.variedad}</span>
                <span>·</span>
                <span>Inicio: {activeCultivo.fechaInicio}</span>
              </div>
            </div>

            {cultivos.length > 1 && (
              <button
                onClick={() => onDeleteCultivo(activeCultivo.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
                title="Eliminar este cultivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Parámetros Específicos de la Siembra Creada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Droplet className="w-3 h-3 text-sky-400" />
                Litros de Agua
              </span>
              <p className="text-base font-extrabold text-sky-400 font-mono mt-0.5">
                {activeCultivo.capacidadTanqueLitros} Litros
              </p>
              <span className="text-[10px] text-slate-500">Capacidad reservorio (11L máx)</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-emerald-400" />
                Tipo de Fertilizante
              </span>
              <p className="text-xs font-bold text-emerald-300 mt-1 truncate">
                {activeCultivo.tipoFertilizante || 'Fertilizante Tipo A + B'}
              </p>
              <span className="text-[10px] text-slate-500">Formulación hidropónica</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-400" />
                Cantidad Fertilizante
              </span>
              <p className="text-xs font-bold text-teal-300 mt-1 truncate">
                {activeCultivo.cantidadFertilizante || `${activeCultivo.capacidadTanqueLitros * 3} ml A+B`}
              </p>
              <span className="text-[10px] text-slate-500">Dosis proporcional</span>
            </div>
          </div>

          {/* Calculadora Dinámica de Reposición A+B */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Calculadora Dinámica de Reposición (A + B)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                3.0 ml / Litro
              </span>
            </div>

            {/* Selector de Litros */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Volumen a preparar o reponer:</span>
                <span className="font-extrabold text-sky-400 font-mono text-sm">
                  {calcLitros} Litros
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="11"
                step="0.5"
                value={calcLitros}
                onChange={(e) => setCalcLitros(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5 L</span>
                <span>5.5 L</span>
                <span>11 L (Máximo)</span>
              </div>
            </div>

            {/* Resultados A y B */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  Solución A
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  {(calcLitros * 3.0).toFixed(1)} ml
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Nitrato de Calcio + Fe
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-teal-500/20 text-center">
                <span className="text-[10px] text-teal-400 font-bold uppercase block">
                  Solución B
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  {(calcLitros * 3.0).toFixed(1)} ml
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Fosfatos + Magnesio + Micros
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO ANIMADO DE RIEGO Y FERTILIZACIÓN (Septiembre 2026 a Diciembre 2027) */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Month Selector Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Calendario de Riego & Fertilización
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Registra día a día el agua agregada y fertilizante A+B
            </p>
          </div>

          {/* Month Stepper Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() =>
                setCurrentMonthIdx((prev) => Math.max(0, prev - 1))
              }
              disabled={currentMonthIdx === 0}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white disabled:opacity-25 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white font-mono px-2 whitespace-nowrap">
              {currentMonthInfo.name}
            </span>

            <button
              onClick={() =>
                setCurrentMonthIdx((prev) =>
                  Math.min(ALLOWED_MONTHS.length - 1, prev + 1)
                )
              }
              disabled={currentMonthIdx === ALLOWED_MONTHS.length - 1}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white disabled:opacity-25 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resumen Métrico del Mes Seleccionado */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Agua Mes</span>
            <div className="flex items-center justify-center gap-1 mt-0.5 text-sky-400">
              <Droplet className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">{totalAguaMes.toFixed(1)} L</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">
              Prom: {promedioAguaDia} L/día
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Días con Riego</span>
            <div className="flex items-center justify-center gap-1 mt-0.5 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">{diasConRiego} días</span>
            </div>
            <span className="text-[9px] text-slate-500">en {currentMonthInfo.name.split(' ')[0]}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Fertilizante A+B</span>
            <div className="flex items-center justify-center gap-1 mt-0.5 text-teal-400">
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">
                {(totalFertAMes + totalFertBMes).toFixed(0)} ml
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">
              A: {totalFertAMes.toFixed(0)} | B: {totalFertBMes.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Grid del Calendario Animado */}
        <div>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-1">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Celdas vacías */}
            {Array.from({ length: startingEmptyCells }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-slate-950/20" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const yyyy = currentMonthInfo.year;
              const mm = String(currentMonthInfo.monthIndex + 1).padStart(2, '0');
              const dd = String(dayNum).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;

              const record = activeCultivo?.registros[dateStr];
              const hasRecord = !!record;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleOpenDay(dayNum)}
                  className={`h-14 sm:h-16 rounded-xl p-1 text-left flex flex-col justify-between border transition-all active:scale-95 group relative ${
                    hasRecord
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        hasRecord ? 'text-emerald-300' : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {hasRecord && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  {hasRecord ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-0.5 text-[10px] text-sky-300 font-mono font-semibold">
                        <Droplet className="w-2.5 h-2.5 shrink-0" />
                        <span>{record.litrosAgua}L</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] text-teal-300 font-mono truncate">
                        <FlaskConical className="w-2.5 h-2.5 shrink-0" />
                        <span>{record.fertilizanteA_ml + record.fertilizanteB_ml}ml</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Marcar
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal para Crear Nueva Siembra (Con Litros de agua, Tipo de fertilizante y Cantidad de fertilizante) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              Crear Nueva Siembra
            </h3>

            <form onSubmit={handleCreateCultivo} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de la siembra
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cultivo Lechuga NFT Lote 2"
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Variedad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lechuga Batavia"
                    value={variedadNueva}
                    onChange={(e) => setVariedadNueva(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaInicioNueva}
                    onChange={(e) => setFechaInicioNueva(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Litros de Agua Requeridos */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Litros de agua requeridos</span>
                  <span className="text-sky-400 font-mono font-bold">{litrosAguaNuevo} Litros (Máx 11 L)</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="11"
                  step="0.5"
                  value={litrosAguaNuevo}
                  onChange={(e) => {
                    const l = parseFloat(e.target.value);
                    setLitrosAguaNuevo(l);
                    setCantidadFertilizanteNuevo(`${(l * 3).toFixed(1)} ml (3.0 ml / L)`);
                  }}
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Tipo de Fertilizante */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipo de fertilizante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fertilizante Tipo A + B"
                  value={tipoFertilizanteNuevo}
                  onChange={(e) => setTipoFertilizanteNuevo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cantidad de Fertilizante */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cantidad de fertilizante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 33 ml de Solución A + 33 ml de Solución B"
                  value={cantidadFertilizanteNuevo}
                  onChange={(e) => setCantidadFertilizanteNuevo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de siembra
                </label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de germinación, clima o solución..."
                  value={notasNuevas}
                  onChange={(e) => setNotasNuevas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Guardar Siembra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Registrar Agua y Fertilizante del Día */}
      {selectedDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  Registro Diario de Riego
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedDayDate}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDayDate(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveDayRecord} className="space-y-4">
              {/* Agua agregada por día */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-400" />
                    Cantidad de Agua Agregada hoy:
                  </label>
                  <span className="text-xs font-extrabold text-sky-400 font-mono">
                    {litrosInput} Litros
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="11"
                  step="0.5"
                  value={litrosInput}
                  onChange={(e) => {
                    const l = parseFloat(e.target.value);
                    setLitrosInput(l);
                    setFertAInput(Number((l * 3.0).toFixed(1)));
                    setFertBInput(Number((l * 3.0).toFixed(1)));
                  }}
                  className="w-full accent-sky-400"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  Máximo permitido del tanque: 11 Litros
                </span>
              </div>

              {/* Fertilizante A y B agregados */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] text-emerald-400 font-bold mb-1">
                    Fertilizante Solución A (ml)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={fertAInput}
                    onChange={(e) => setFertAInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Sugerido: {(litrosInput * 3).toFixed(1)} ml</span>
                </div>

                <div>
                  <label className="block text-[11px] text-teal-400 font-bold mb-1">
                    Fertilizante Solución B (ml)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={fertBInput}
                    onChange={(e) => setFertBInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Sugerido: {(litrosInput * 3).toFixed(1)} ml</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de monitoreo del día
                </label>
                <input
                  type="text"
                  placeholder="Ej: pH 6.1 estable, raíces blancas y vigorosas"
                  value={notasDia}
                  onChange={(e) => setNotasDia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {activeCultivo.registros[selectedDayDate] && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDayRecord(selectedDayDate)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Guardar en Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
