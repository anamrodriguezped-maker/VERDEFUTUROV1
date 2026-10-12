import { LecturaESP32 } from '../types/index.ts';

/**
 * Exporta lecturas de sensores ESP32 en tiempo real a archivo CSV descargable
 */
export function exportESP32DataToCSV(data: LecturaESP32[], filename = 'reporte_sensores_esp32_verde_futuro.csv') {
  if (!data || data.length === 0) {
    alert('No hay registros de sensores para exportar en este momento.');
    return;
  }

  const headers = [
    'ID',
    'Marca_Tiempo',
    'Dia',
    'Mes',
    'Año',
    'Hora',
    'Temp_Agua_C',
    'Temp_Ambiente_C',
    'Humedad_Relativa_Pct',
    'pH',
    'Conductividad_mS_cm',
    'Nivel_Agua_Litros',
    'Bomba_Recirculacion',
    'Luz_Espectral',
  ];

  const rows = data.map((item) => [
    item.id,
    `"${item.timestamp}"`,
    item.dia,
    item.mes,
    item.año,
    `"${item.hora}"`,
    item.tempAgua.toFixed(2),
    item.tempAmbiente.toFixed(2),
    item.humedad.toFixed(1),
    item.ph.toFixed(2),
    item.conductividad.toFixed(2),
    item.nivelAguaLitros.toFixed(2),
    item.bombaActiva ? 'ACTIVA' : 'INACTIVA',
    item.luzEspectralActiva ? 'ENCENDIDA' : 'APAGADA',
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM para que Excel en español lo abra perfecto
    [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
