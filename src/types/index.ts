export interface StemCard {
  id: 'ciencia' | 'tecnologia' | 'ingenieria' | 'matematicas' | 'sociales';
  title: string;
  badge: string;
  color: string;
  accentBg: string;
  borderColor: string;
  iconName: string;
  summary: string;
  preguntaOrientadora: string;
  puntos: { area: string; desc: string }[];
}

export interface ProjectPhoto {
  id: string;
  title: string;
  category: 'prototipo' | 'construccion' | 'cultivo' | 'equipo';
  url: string;
  date: string;
  description: string;
  isCustom?: boolean;
}

export interface ExcelRowData {
  id: string;
  fecha: string; // YYYY-MM-DD o DD/MM/YYYY
  dia?: number;
  mes?: number;
  año?: number;
  hora: string; // HH:mm
  temperatura: number; // °C
  humedad: number; // %
  ph: number; // 0 - 14
  conductividad: number; // mS/cm o µS/cm
}

export interface UmbralesConfig {
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  phMin: number;
  phMax: number;
  ecMin: number;
  ecMax: number;
}

export interface AlertaSensor {
  id: string;
  timestamp: string;
  parametro: 'temperatura' | 'humedad' | 'ph' | 'conductividad';
  valor: number;
  umbralEsperado: string;
  nivel: 'critica' | 'advertencia';
  mensaje: string;
  sugerencia: string;
  leida: boolean;
}

export interface RegistroAguaFertilizante {
  id: string;
  fecha: string; // YYYY-MM-DD
  litrosAgua: number;
  fertilizanteA_ml: number;
  fertilizanteB_ml: number;
  phMedido?: number;
  ecMedido?: number;
  notas?: string;
  horaRegistro: string;
}

export interface Cultivo {
  id: string;
  nombre: string;
  variedad: string;
  fechaInicio: string; // YYYY-MM-DD
  capacidadTanqueLitros: number; // Litros de agua requeridos / capacidad (máx 11L)
  tipoFertilizante: string; // ej. "Fertilizante Tipo A + B"
  cantidadFertilizante: string; // ej. "33 ml (3 ml/L)"
  estado: 'activo' | 'cosechado' | 'pausado';
  notas: string;
  registros: Record<string, RegistroAguaFertilizante>; // key: YYYY-MM-DD
}

export interface LecturaESP32 {
  id: string;
  timestamp: string;
  dia: number;
  mes: number;
  año: number;
  hora: string;
  tempAgua: number;
  tempAmbiente: number;
  humedad: number;
  ph: number;
  conductividad: number;
  nivelAguaLitros: number;
  bombaActiva: boolean;
  luzEspectralActiva: boolean;
}
