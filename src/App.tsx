import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { InicioView } from './components/InicioView.tsx';
import { AnalisisView } from './components/AnalisisView.tsx';
import { SiembraView } from './components/SiembraView.tsx';
import { Esp32View } from './components/Esp32View.tsx';
import { PhotoModal } from './components/PhotoModal.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import {
  ProjectPhoto,
  ExcelRowData,
  UmbralesConfig,
  AlertaSensor,
  Cultivo,
  LecturaESP32,
} from './types/index.ts';
import { ParseResult } from './utils/excel.ts';
import { triggerPushNotification } from './utils/notifications.ts';

const DEFAULT_UMBRALES: UmbralesConfig = {
  tempMin: 18.0,
  tempMax: 26.0,
  humMin: 50.0,
  humMax: 75.0,
  phMin: 5.5,
  phMax: 6.5,
  ecMin: 1.2,
  ecMax: 2.2,
};

const INITIAL_PHOTOS: ProjectPhoto[] = [
  {
    id: 'photo-1',
    title: 'Prototipo Funcional Verde Futuro',
    category: 'prototipo',
    url: '/prototipo.jpeg',
    date: '2026-10-10',
    description:
      'Estructura ligera en tubería plástica cuadrada con sistema NFT de recirculación, techo con panel solar fotovoltaico, lámpara LED de iluminación espectral, batería AGM 12V y caja estanca con microcontrolador ESP32.',
  },
  {
    id: 'photo-2',
    title: 'Construcción del Sistema en Equipo',
    category: 'construccion',
    url: '/construccion.jpeg',
    date: '2026-10-08',
    description:
      'Estudiantes y docente mentora colaborando en el ensamblaje de la estructura en tubería cuadrada, conexionado de sensores y montaje del prototipo.',
  },
  {
    id: 'photo-3',
    title: 'Emblema Oficial Verde Futuro',
    category: 'equipo',
    url: '/logo.jpeg',
    date: '2026-09-01',
    description:
      'Identidad visual: integración de gota de agua, bombilla incandescente, sol, brote vegetal y pistas de circuitos electrónicos.',
  },
];

const INITIAL_CULTIVOS: Cultivo[] = [
  {
    id: 'cultivo-ejemplo',
    nombre: 'Cultivo Ejemplo (Lote #1 - Lechuga)',
    variedad: 'Lechuga Batavia',
    fechaInicio: '2026-10-05',
    capacidadTanqueLitros: 11, // Propuesta fija 11L
    tipoFertilizante: 'Fertilizante Tipo A + B',
    cantidadFertilizante: '33 ml (3.0 ml / L)',
    estado: 'activo',
    notas: 'Cultivo ejemplo en el prototipo hidropónico NFT Verde Futuro con panel solar y 11 litros de agua.',
    registros: {
      '2026-10-06': {
        id: 'reg-2026-10-06',
        fecha: '2026-10-06',
        litrosAgua: 2.5,
        fertilizanteA_ml: 7.5,
        fertilizanteB_ml: 7.5,
        notas: 'Llenado y nutrición inicial del reservorio',
        horaRegistro: '08:30',
      },
      '2026-10-08': {
        id: 'reg-2026-10-08',
        fecha: '2026-10-08',
        litrosAgua: 1.5,
        fertilizanteA_ml: 4.5,
        fertilizanteB_ml: 4.5,
        notas: 'Reposición de agua por evaporación',
        horaRegistro: '09:15',
      },
      '2026-10-11': {
        id: 'reg-2026-10-11',
        fecha: '2026-10-11',
        litrosAgua: 2.0,
        fertilizanteA_ml: 6.0,
        fertilizanteB_ml: 6.0,
        notas: 'Revisión de raíces, color blanco óptimo',
        horaRegistro: '10:00',
      },
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');

  // Galería de fotos (solo las imágenes cargadas por el usuario)
  const [photos, setPhotos] = useState<ProjectPhoto[]>(() => {
    return INITIAL_PHOTOS;
  });
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Alertas & Umbrales
  const [umbrales, setUmbrales] = useState<UmbralesConfig>(() => {
    const saved = localStorage.getItem('vf_umbrales');
    return saved ? JSON.parse(saved) : DEFAULT_UMBRALES;
  });
  const [alertas, setAlertas] = useState<AlertaSensor[]>(() => {
    const saved = localStorage.getItem('vf_alertas');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Datos Excel (vacío por defecto, listo para cargar)
  const [excelData, setExcelData] = useState<ExcelRowData[]>([]);

  // Siembras: solo manten lote#1 -lechuga pero que se llame cultivo ejemplo
  const [cultivos, setCultivos] = useState<Cultivo[]>(() => {
    const saved = localStorage.getItem('vf_cultivos');
    if (saved) {
      try {
        const parsed: Cultivo[] = JSON.parse(saved);
        // Si tiene el antiguo lote 2 o no tiene el formato nuevo, usar INITIAL_CULTIVOS
        if (parsed.length === 1 && parsed[0].nombre.includes('Cultivo Ejemplo')) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_CULTIVOS;
  });
  const [activeCultivoId, setActiveCultivoId] = useState<string>(
    cultivos[0]?.id || 'cultivo-ejemplo'
  );

  // ESP32 IoT en tiempo real
  const [esp32Connected, setEsp32Connected] = useState<boolean>(true);
  const [bombaActiva, setBombaActiva] = useState<boolean>(true);
  const [luzEspectralActiva, setLuzEspectralActiva] = useState<boolean>(true);
  const [esp32CurrentReading, setEsp32CurrentReading] = useState<LecturaESP32 | null>({
    id: 'esp-init',
    timestamp: new Date().toISOString(),
    dia: new Date().getDate(),
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    tempAgua: 22.1,
    tempAmbiente: 24.3,
    humedad: 63.5,
    ph: 6.12,
    conductividad: 1.58,
    nivelAguaLitros: 9.6,
    bombaActiva: true,
    luzEspectralActiva: true,
  });
  const [esp32History, setEsp32History] = useState<LecturaESP32[]>([]);

  // Guardar fotos en localStorage al cambiar
  useEffect(() => {
    try {
      localStorage.setItem('vf_photos', JSON.stringify(photos));
    } catch {
      // ignore
    }
  }, [photos]);

  // Guardar cultivos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vf_cultivos', JSON.stringify(cultivos));
    } catch {
      // ignore
    }
  }, [cultivos]);

  // Guardar umbrales y alertas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vf_umbrales', JSON.stringify(umbrales));
      localStorage.setItem('vf_alertas', JSON.stringify(alertas));
    } catch {
      // ignore
    }
  }, [umbrales, alertas]);

  // Simulación y manejo de ESP32: cuando se desconecta, TODAS las variables van a cero
  useEffect(() => {
    if (!esp32Connected) {
      // Al desconectar el ESP32 fuera de línea, todas las variables llegan a cero
      const zeroReading: LecturaESP32 = {
        id: `esp-offline-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dia: new Date().getDate(),
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tempAgua: 0.0,
        tempAmbiente: 0.0,
        humedad: 0.0,
        ph: 0.0,
        conductividad: 0.0,
        nivelAguaLitros: 0.0,
        bombaActiva: false,
        luzEspectralActiva: false,
      };
      setEsp32CurrentReading(zeroReading);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      // Pequeñas fluctuaciones físicas en tiempo real
      const noise = (Math.random() - 0.5) * 0.15;
      const phNoise = (Math.random() - 0.5) * 0.08;

      const reading: LecturaESP32 = {
        id: `esp-${now.getTime()}`,
        timestamp: now.toISOString(),
        dia: now.getDate(),
        mes: now.getMonth() + 1,
        año: now.getFullYear(),
        hora: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tempAgua: Number((22.1 + noise).toFixed(2)),
        tempAmbiente: Number((24.3 + noise * 1.5).toFixed(2)),
        humedad: Number((63.5 + noise * 3).toFixed(1)),
        ph: Number((6.12 + phNoise).toFixed(2)),
        conductividad: Number((1.58 + noise * 0.2).toFixed(2)),
        nivelAguaLitros: Number((9.6 + (Math.random() - 0.5) * 0.05).toFixed(2)),
        bombaActiva,
        luzEspectralActiva,
      };

      setEsp32CurrentReading(reading);
      setEsp32History((prev) => [reading, ...prev.slice(0, 49)]); // Guardar últimas 50 lecturas

      // Evaluar umbrales en tiempo real y emitir alertas si esporádicamente se sale
      if (reading.ph < umbrales.phMin || reading.ph > umbrales.phMax) {
        const alt: AlertaSensor = {
          id: `alt-esp-ph-${Date.now()}`,
          timestamp: `${reading.dia}/${reading.mes}/${reading.año} ${reading.hora}`,
          parametro: 'ph',
          valor: reading.ph,
          umbralEsperado: `${umbrales.phMin} - ${umbrales.phMax}`,
          nivel: 'critica',
          mensaje: `ESP32 Wi-Fi: pH fuera de rango (${reading.ph})`,
          sugerencia: 'Calibrar sonda o agregar solución reguladora.',
          leida: false,
        };
        setAlertas((a) => [alt, ...a.slice(0, 20)]);
        triggerPushNotification(alt);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [esp32Connected, bombaActiva, luzEspectralActiva, umbrales]);

  // Manejadores de Galería
  const handleOpenPhoto = (photo: ProjectPhoto) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleOpenUpload = () => {
    setSelectedPhoto(null);
    setIsPhotoModalOpen(true);
  };

  const handleAddPhoto = (newPhoto: ProjectPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Manejadores de Excel
  const handleDataLoaded = (result: ParseResult) => {
    setExcelData(result.data);
    if (result.alertas.length > 0) {
      setAlertas((prev) => [...result.alertas, ...prev]);
    }
  };

  // Manejadores de Cultivos
  const handleAddCultivo = (cultivo: Cultivo) => {
    setCultivos((prev) => [cultivo, ...prev]);
    setActiveCultivoId(cultivo.id);
  };

  const handleUpdateCultivo = (updated: Cultivo) => {
    setCultivos((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteCultivo = (id: string) => {
    if (cultivos.length <= 1) {
      alert('Debe haber al menos un cultivo registrado en el sistema.');
      return;
    }
    const remaining = cultivos.filter((c) => c.id !== id);
    setCultivos(remaining);
    setActiveCultivoId(remaining[0].id);
  };

  // Manejadores de Alertas
  const handleMarkAllRead = () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
  };

  const handleClearAlertas = () => {
    setAlertas([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Mobile Bar */}
      <Header
        esp32Connected={esp32Connected}
        onToggleESP32={() => setEsp32Connected(!esp32Connected)}
        alertas={alertas}
        onOpenAlertas={() => setIsNotificationModalOpen(true)}
        activeTab={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-4">
        {activeTab === 'inicio' && (
          <InicioView
            photos={photos}
            onOpenPhoto={handleOpenPhoto}
            onOpenUpload={handleOpenUpload}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {activeTab === 'analisis' && (
          <AnalisisView
            excelData={excelData}
            onDataLoaded={handleDataLoaded}
            umbrales={umbrales}
            onOpenUmbralesModal={() => setIsNotificationModalOpen(true)}
            alertas={alertas}
          />
        )}

        {activeTab === 'siembra' && (
          <SiembraView
            cultivos={cultivos}
            activeCultivoId={activeCultivoId}
            onSelectCultivo={setActiveCultivoId}
            onAddCultivo={handleAddCultivo}
            onUpdateCultivo={handleUpdateCultivo}
            onDeleteCultivo={handleDeleteCultivo}
          />
        )}

        {activeTab === 'esp32' && (
          <Esp32View
            esp32Connected={esp32Connected}
            onToggleESP32={() => setEsp32Connected(!esp32Connected)}
            currentReading={esp32CurrentReading}
            history={esp32History}
            onToggleBomba={() => setBombaActiva(!bombaActiva)}
            onToggleLuz={() => setLuzEspectralActiva(!luzEspectralActiva)}
            onClearHistory={() => setEsp32History([])}
          />
        )}
      </main>

      {/* Ergonomic Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Photo Viewer & Uploader Modal */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        selectedPhoto={selectedPhoto}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Real-Time Push Notification & Threshold Settings Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        alertas={alertas}
        onMarkAllRead={handleMarkAllRead}
        onClearAlertas={handleClearAlertas}
        umbrales={umbrales}
        onUpdateUmbrales={setUmbrales}
      />
    </div>
  );
}
