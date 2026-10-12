import * as XLSX from 'xlsx';
import { ExcelRowData, UmbralesConfig, AlertaSensor } from '../types/index.ts';

export interface ParseResult {
  data: ExcelRowData[];
  errors: string[];
  alertas: AlertaSensor[];
  stats: {
    totalFilas: number;
    tempPromedio: number;
    humPromedio: number;
    phPromedio: number;
    ecPromedio: number;
    tempMin: number;
    tempMax: number;
    phMin: number;
    phMax: number;
    ecMin: number;
    ecMax: number;
    humMin: number;
    humMax: number;
    fechaInicio: string;
    fechaFin: string;
  };
}

/**
 * Normaliza nombres de encabezados para soportar variaciones comunes
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Procesa un archivo Excel (.xlsx, .xls) o CSV
 */
export async function parseExcelFile(
  file: File,
  umbrales: UmbralesConfig
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          throw new Error('No se pudo leer el archivo seleccionado.');
        }

        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('El archivo Excel no contiene hojas de cálculo.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd',
        });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('La hoja de cálculo está vacía.');
        }

        const parsedRows: ExcelRowData[] = [];
        const errors: string[] = [];
        const alertas: AlertaSensor[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // Considerando fila 1 como encabezados
          const normalizedRow: Record<string, any> = {};

          Object.keys(row).forEach((k) => {
            normalizedRow[normalizeKey(k)] = row[k];
          });

          // Detectar Fecha
          let fecha =
            normalizedRow['fecha'] ||
            normalizedRow['date'] ||
            normalizedRow['dia'] ||
            normalizedRow['fechahora'] ||
            '';

          // Detectar Hora
          let hora =
            normalizedRow['hora'] ||
            normalizedRow['time'] ||
            normalizedRow['tiempo'] ||
            '00:00';

          // Detectar Temperatura
          const tempRaw =
            normalizedRow['temperatura'] ||
            normalizedRow['temp'] ||
            normalizedRow['temperaturac'] ||
            normalizedRow['tc'];

          // Detectar Humedad
          const humRaw =
            normalizedRow['humedad'] ||
            normalizedRow['hum'] ||
            normalizedRow['humedadrelativa'] ||
            normalizedRow['hr'];

          // Detectar pH
          const phRaw =
            normalizedRow['ph'] ||
            normalizedRow['nivelph'] ||
            normalizedRow['potencialhidrogeno'];

          // Detectar Conductividad
          const ecRaw =
            normalizedRow['conductividad'] ||
            normalizedRow['ec'] ||
            normalizedRow['conductividadelectrica'] ||
            normalizedRow['cond'] ||
            normalizedRow['tds'];

          const temperatura = parseFloat(String(tempRaw).replace(',', '.'));
          const humedad = parseFloat(String(humRaw).replace(',', '.'));
          const ph = parseFloat(String(phRaw).replace(',', '.'));
          let conductividad = parseFloat(String(ecRaw).replace(',', '.'));

          // Si conductividad viene en microSiemens (ej: 1400 uS/cm), convertir a mS/cm (1.4 mS/cm)
          if (conductividad > 100) {
            conductividad = conductividad / 1000;
          }

          if (
            isNaN(temperatura) &&
            isNaN(humedad) &&
            isNaN(ph) &&
            isNaN(conductividad)
          ) {
            // Fila no numérica o vacía
            return;
          }

          const parsedRow: ExcelRowData = {
            id: `row-${index}-${Date.now()}`,
            fecha: String(fecha).trim() || `Registro #${rowNum}`,
            hora: String(hora).trim() || '12:00',
            temperatura: isNaN(temperatura) ? 22.0 : Number(temperatura.toFixed(2)),
            humedad: isNaN(humedad) ? 65.0 : Number(humedad.toFixed(2)),
            ph: isNaN(ph) ? 6.0 : Number(ph.toFixed(2)),
            conductividad: isNaN(conductividad) ? 1.5 : Number(conductividad.toFixed(2)),
          };

          parsedRows.push(parsedRow);

          // Evaluar umbrales para notificaciones en tiempo real
          if (parsedRow.temperatura > umbrales.tempMax) {
            alertas.push({
              id: `alt-tmax-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'temperatura',
              valor: parsedRow.temperatura,
              umbralEsperado: `${umbrales.tempMin}°C - ${umbrales.tempMax}°C`,
              nivel: 'critica',
              mensaje: `Temperatura alta detectada (${parsedRow.temperatura}°C > ${umbrales.tempMax}°C)`,
              sugerencia: 'Activar ventilación o sombreado en el sistema hidropónico.',
              leida: false,
            });
          } else if (parsedRow.temperatura < umbrales.tempMin) {
            alertas.push({
              id: `alt-tmin-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'temperatura',
              valor: parsedRow.temperatura,
              umbralEsperado: `${umbrales.tempMin}°C - ${umbrales.tempMax}°C`,
              nivel: 'advertencia',
              mensaje: `Temperatura baja detectada (${parsedRow.temperatura}°C < ${umbrales.tempMin}°C)`,
              sugerencia: 'Verificar temperatura de recirculación de la solución nutritiva.',
              leida: false,
            });
          }

          if (parsedRow.ph < umbrales.phMin) {
            alertas.push({
              id: `alt-phmin-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'ph',
              valor: parsedRow.ph,
              umbralEsperado: `${umbrales.phMin} - ${umbrales.phMax}`,
              nivel: 'critica',
              mensaje: `pH ácido peligroso (${parsedRow.ph} < ${umbrales.phMin})`,
              sugerencia: 'Agregar solución alcalina o agua desclorada para elevar el pH.',
              leida: false,
            });
          } else if (parsedRow.ph > umbrales.phMax) {
            alertas.push({
              id: `alt-phmax-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'ph',
              valor: parsedRow.ph,
              umbralEsperado: `${umbrales.phMin} - ${umbrales.phMax}`,
              nivel: 'critica',
              mensaje: `pH alcalino alto (${parsedRow.ph} > ${umbrales.phMax})`,
              sugerencia: 'Agregar solución reductora de pH (ácido fosfórico diluido).',
              leida: false,
            });
          }

          if (parsedRow.conductividad > umbrales.ecMax) {
            alertas.push({
              id: `alt-ecmax-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'conductividad',
              valor: parsedRow.conductividad,
              umbralEsperado: `${umbrales.ecMin} - ${umbrales.ecMax} mS/cm`,
              nivel: 'critica',
              mensaje: `Salinidad / EC excesiva (${parsedRow.conductividad} mS/cm)`,
              sugerencia: 'Agregar agua limpia para diluir la concentración de sales nutritivas.',
              leida: false,
            });
          } else if (parsedRow.conductividad < umbrales.ecMin) {
            alertas.push({
              id: `alt-ecmin-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'conductividad',
              valor: parsedRow.conductividad,
              umbralEsperado: `${umbrales.ecMin} - ${umbrales.ecMax} mS/cm`,
              nivel: 'advertencia',
              mensaje: `Baja conductividad (${parsedRow.conductividad} mS/cm)`,
              sugerencia: 'Agregar solución nutritiva A+B proporcional al volumen de agua.',
              leida: false,
            });
          }

          if (parsedRow.humedad < umbrales.humMin || parsedRow.humedad > umbrales.humMax) {
            alertas.push({
              id: `alt-hum-${index}`,
              timestamp: `${parsedRow.fecha} ${parsedRow.hora}`,
              parametro: 'humedad',
              valor: parsedRow.humedad,
              umbralEsperado: `${umbrales.humMin}% - ${umbrales.humMax}%`,
              nivel: 'advertencia',
              mensaje: `Humedad fuera de rango óptimo (${parsedRow.humedad}%)`,
              sugerencia: 'Revisar flujo de aire y evaporación ambiental en el aula/invernadero.',
              leida: false,
            });
          }
        });

        if (parsedRows.length === 0) {
          throw new Error('No se encontraron registros válidos con las columnas requeridas.');
        }

        // Estadísticas agregadas
        const temps = parsedRows.map((r) => r.temperatura);
        const hums = parsedRows.map((r) => r.humedad);
        const phs = parsedRows.map((r) => r.ph);
        const ecs = parsedRows.map((r) => r.conductividad);

        const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
        const avg = (arr: number[]) => Number((sum(arr) / arr.length).toFixed(2));

        const stats = {
          totalFilas: parsedRows.length,
          tempPromedio: avg(temps),
          humPromedio: avg(hums),
          phPromedio: avg(phs),
          ecPromedio: avg(ecs),
          tempMin: Math.min(...temps),
          tempMax: Math.max(...temps),
          phMin: Math.min(...phs),
          phMax: Math.max(...phs),
          ecMin: Math.min(...ecs),
          ecMax: Math.max(...ecs),
          humMin: Math.min(...hums),
          humMax: Math.max(...hums),
          fechaInicio: parsedRows[0].fecha,
          fechaFin: parsedRows[parsedRows.length - 1].fecha,
        };

        resolve({
          data: parsedRows,
          errors,
          alertas,
          stats,
        });
      } catch (err: any) {
        reject(err.message || 'Error al procesar el archivo Excel.');
      }
    };

    reader.onerror = () => {
      reject('Error de lectura en el archivo seleccionado.');
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Genera y descarga una plantilla Excel oficial de Verde Futuro con los encabezados requeridos
 */
export function downloadExcelTemplate() {
  const wsData = [
    ['Fecha', 'Hora', 'Temperatura', 'Humedad', 'pH', 'Conductividad'],
    ['2026-10-15', '08:00', 21.5, 65, 6.0, 1.6],
    ['2026-10-15', '12:00', 24.2, 58, 6.2, 1.7],
    ['2026-10-15', '16:00', 23.0, 62, 6.1, 1.65],
    ['2026-10-16', '08:00', 20.8, 68, 5.9, 1.55],
    ['2026-10-16', '12:00', 25.0, 55, 6.3, 1.75],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos_Verde_Futuro');

  XLSX.writeFile(wb, 'plantilla_datos_verde_futuro.xlsx');
}
