import React, { useState } from 'react';
import {
  Atom,
  Cpu,
  Wrench,
  Calculator,
  Users,
  Plus,
  HelpCircle,
  CheckCircle2,
  Layers,
  Droplet,
  Sun,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { StemCard, ProjectPhoto } from '../types/index.ts';

interface InicioViewProps {
  photos: ProjectPhoto[];
  onOpenPhoto: (photo: ProjectPhoto) => void;
  onOpenUpload: () => void;
  onDeletePhoto: (photoId: string) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  photos,
  onOpenPhoto,
  onOpenUpload,
  onDeletePhoto,
}) => {
  const [selectedStem, setSelectedStem] = useState<StemCard['id']>('ciencia');

  // Información exacta provista por el usuario para STEM+
  const stemCards: StemCard[] = [
    {
      id: 'ciencia',
      title: 'Ciencia',
      badge: 'Biología, Química, Física, Ecología & Microbiología',
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      borderColor: 'border-emerald-500/20',
      iconName: 'Atom',
      summary:
        'Estudiamos como crecen las plantas y que necesitan para desarrollarse, como agua, temperatura, nutrientes y luz. También observamos como la hidroponía permite cultivar sin utilizar grandes cantidades de suelo y cómo podemos reutilizar el agua para disminuir su desperdicio. Los sensores nos ayudan a conocer las condiciones del agua y del cultivo.',
      preguntaOrientadora:
        '¿Qué condiciones necesita una planta para crecer saludablemente sin utilizar suelo?',
      puntos: [
        {
          area: 'Biología vegetal',
          desc: 'fotosíntesis, respiración, germinación, crecimiento de raíces, absorción de nutrientes y ciclo de vida.',
        },
        {
          area: 'Química del agua',
          desc: 'pH, acidez, alcalinidad, soluciones nutritivas, concentración de sales y conductividad eléctrica (CE).',
        },
        {
          area: 'Física',
          desc: 'energía solar, transferencia de calor, temperatura del agua y del ambiente, evaporación y circulación del agua.',
        },
        {
          area: 'Ecología',
          desc: 'uso eficiente del agua, biodiversidad, reducción de residuos y agricultura sostenible.',
        },
        {
          area: 'Microbiología',
          desc: 'microorganismos beneficiosos y patógenos, higiene del depósito y prevención de enfermedades.',
        },
      ],
    },
    {
      id: 'tecnologia',
      title: 'Tecnología',
      badge: 'Electrónica, IoT, Software & IA',
      color: 'cyan',
      accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      borderColor: 'border-cyan-500/20',
      iconName: 'Cpu',
      summary:
        'Utilizamos Arduino, ESP32, sensores, cámara, panel solar y una aplicación móvil para monitorear y controlar diferentes aspectos del sistema. La aplicación registra los datos obtenidos por los sensores, crea un historial y nos permite revisar la información para tomar decisiones sobre el cultivo y el uso del agua.',
      preguntaOrientadora:
        '¿Cómo podemos convertir un cultivo tradicional en un sistema inteligente que registre información y ayude a tomar decisiones?',
      puntos: [
        {
          area: 'Electrónica y sensores',
          desc: 'ESP32, sensores de pH, conductividad, temperatura y humedad.',
        },
        {
          area: 'Programación',
          desc: 'variables, condicionales, funciones, ciclos, lectura de sensores y manejo de errores.',
        },
        {
          area: 'Internet de las cosas (IoT)',
          desc: 'comunicación Wi-Fi entre la ESP32 y un computador.',
        },
        {
          area: 'Bases de datos',
          desc: 'almacenamiento histórico de mediciones y consultas por fecha.',
        },
        {
          area: 'Desarrollo de software',
          desc: 'panel de monitoreo, gráficos, alertas y exportación de datos a Excel o CSV.',
        },
        {
          area: 'Inteligencia artificial',
          desc: 'detección de tendencias, identificación de valores atípicos y recomendaciones basadas en datos.',
        },
      ],
    },
    {
      id: 'ingenieria',
      title: 'Ingeniería',
      badge: 'Estructura, Hidráulica, Solar & Automatización',
      color: 'amber',
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      borderColor: 'border-amber-500/20',
      iconName: 'Wrench',
      summary:
        'Diseñamos y construimos la estructura del sistema, los tubos de cultivo, el tanque, las conexiones de agua, la bomba y el sistema de energía solar. También organizamos los componentes para que trabajen juntos y realizamos cambios al prototipo para hacerlo más pequeño, liviano, seguro y fácil de transportar, sin perder funcionamiento.',
      preguntaOrientadora:
        '¿Cómo diseñamos un sistema de cultivo eficiente, seguro y autónomo utilizando energía solar?',
      puntos: [
        {
          area: 'Ingeniería electrónica',
          desc: 'conexiones, alimentación de la ESP32, acondicionamiento de señales y protección de circuitos.',
        },
        {
          area: 'Ingeniería eléctrica',
          desc: 'panel fotovoltaico, controlador de carga, batería, consumo energético y autonomía.',
        },
        {
          area: 'Ingeniería mecánica',
          desc: 'estructura, soportes, tuberías, depósito, caudal y bomba de agua.',
        },
        {
          area: 'Ingeniería ambiental',
          desc: 'recirculación, ahorro de agua y manejo responsable de la solución nutritiva.',
        },
        {
          area: 'Diseño de prototipos',
          desc: 'selección de materiales, construcción, pruebas, mantenimiento y mejoras.',
        },
        {
          area: 'Automatización',
          desc: 'activación de bombas y sistemas de alerta mediante reglas de control.',
        },
      ],
    },
    {
      id: 'matematicas',
      title: 'Matemáticas',
      badge: 'Estadística, Gráficas & Proporciones',
      color: 'indigo',
      accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      borderColor: 'border-indigo-500/20',
      iconName: 'Calculator',
      summary:
        'Analizaremos las variables de humedad, temperatura, ph y conductividad y por medio de estadística se generan graficas donde podremos ver en tiempo real el monitoreo de las variables',
      preguntaOrientadora:
        '¿Qué nos dicen los datos sobre el crecimiento de las plantas y el funcionamiento del sistema?',
      puntos: [
        {
          area: 'Aritmética y proporcionalidad',
          desc: 'preparación de soluciones nutritivas, unidades, concentraciones y dosificación.',
        },
        {
          area: 'Álgebra',
          desc: 'relaciones entre variables, ecuaciones y fórmulas de consumo energético.',
        },
        {
          area: 'Estadística',
          desc: 'promedios, medianas, variabilidad, tablas de frecuencia y comparación de resultados.',
        },
        {
          area: 'Funciones y gráficas',
          desc: 'cambios del pH, temperatura, humedad y conductividad a lo largo del tiempo.',
        },
        {
          area: 'Geometría y medición',
          desc: 'dimensiones del cultivo, volumen del depósito y área del panel solar.',
        },
        {
          area: 'Matemática financiera',
          desc: 'costos de materiales, consumo, producción, rentabilidad y ahorro.',
        },
      ],
    },
    {
      id: 'sociales',
      title: 'Ciencias Sociales',
      badge: 'Comunidad, Ética & Cuidado del Agua',
      color: 'rose',
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      borderColor: 'border-rose-500/20',
      iconName: 'Users',
      summary:
        'Analizamos una problemática que afecta las comunidades; el uso desmedido del agua en cultivos tradicionales. El proyecto busca aportar una alternativa que promueva el cuidado de este recurso y pueda ser compartida con agricultores, estudiantes y familias. Además, fortalece el trabajo en equipo, la toma de decisiones y la búsqueda de soluciones a necesidades de la comunidad.',
      preguntaOrientadora:
        '¿Cómo puede la hidroponía con energía solar contribuir a la seguridad alimentaria y al bienestar de una comunidad?',
      puntos: [
        {
          area: 'Geografía',
          desc: 'condiciones climáticas locales, disponibilidad de agua, territorio y producción de alimentos.',
        },
        {
          area: 'Economía',
          desc: 'costos de producción, comercialización, emprendimiento y economía familiar.',
        },
        {
          area: 'Sociología',
          desc: 'trabajo colaborativo, participación comunitaria, distribución de responsabilidades y acceso a los alimentos.',
        },
        {
          area: 'Historia',
          desc: 'evolución de la agricultura y transformaciones de las prácticas productivas.',
        },
        {
          area: 'Ética y ciudadanía',
          desc: 'uso responsable de recursos, propiedad de los datos, inclusión y toma de decisiones colectivas.',
        },
        {
          area: 'Educación ambiental',
          desc: 'consumo responsable, cambio climático, resiliencia y sostenibilidad.',
        },
      ],
    },
  ];

  const currentStem = stemCards.find((c) => c.id === selectedStem) || stemCards[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Hero Banner usando cultivo_nft_banner_1791839083702 */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden flex items-center justify-center bg-slate-950">
          <img
            src="/cultivo_nft_banner_1791839083702.jpg"
            alt="Cultivo Hidropónico NFT Verde Futuro"
            className="w-full h-full object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

          {/* Badges and Title */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <div className="flex items-center gap-2 mb-1 text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Cultivo Hidropónico NFT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              VERDE FUTURO
            </h1>
            <p className="text-xs text-slate-200 line-clamp-2 mt-0.5 drop-shadow">
              Sistema hidropónico NFT con estructura liviana, energía solar y microcontrolador ESP32.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/70 p-3 text-center border-t border-slate-800">
          <div>
            <div className="flex items-center justify-center gap-1 text-sky-400 mb-0.5">
              <Droplet className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">11 L</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Capacidad Máx</span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
              <Sun className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">Panel + AGM</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Energía Solar</span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">ESP32</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Wi-Fi & Sensores</span>
          </div>
        </div>
      </div>

      {/* STEM+ Interactive Section (Cuadritos: Ciencia, Tecnología, Ingeniería, Matemáticas y Ciencias Sociales) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Enfoque Educativo STEM+
            </h2>
            <p className="text-xs text-slate-400">
              Ciencia · Tecnología · Ingeniería · Matemáticas · Ciencias Sociales
            </p>
          </div>
        </div>

        {/* Cuadritos STEM+ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {stemCards.map((stem) => {
            const isSelected = selectedStem === stem.id;
            const getIcon = () => {
              switch (stem.id) {
                case 'ciencia': return <Atom className="w-4 h-4" />;
                case 'tecnologia': return <Cpu className="w-4 h-4" />;
                case 'ingenieria': return <Wrench className="w-4 h-4" />;
                case 'matematicas': return <Calculator className="w-4 h-4" />;
                case 'sociales': return <Users className="w-4 h-4" />;
              }
            };

            return (
              <button
                key={stem.id}
                onClick={() => setSelectedStem(stem.id)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  isSelected
                    ? `${stem.accentBg} shadow-lg ring-1 ring-emerald-500/40`
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-slate-800'}`}>
                    {getIcon()}
                  </div>
                  <span className="text-[10px] font-mono uppercase opacity-75">
                    {stem.id.slice(0, 3)}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {stem.title}
                </div>
                <div className="text-[10px] opacity-75 truncate mt-0.5">
                  {stem.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cuadro Extendido con la información exacta provista */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${currentStem.accentBg} inline-block mb-1`}>
                {currentStem.badge}
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {currentStem.title}
              </h3>
            </div>
          </div>

          {/* Texto descriptivo principal */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {currentStem.summary}
          </p>

          {/* Pregunta Orientadora */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Pregunta orientadora:
              </span>
              <p className="text-xs font-semibold text-white mt-0.5 leading-snug">
                {currentStem.preguntaOrientadora}
              </p>
            </div>
          </div>

          {/* Puntos y subáreas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Áreas de estudio y aplicación:
            </h4>
            <div className="grid gap-2">
              {currentStem.puntos.map((punto, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">
                      {punto.area}:{' '}
                    </strong>
                    <span className="text-slate-300 leading-normal">{punto.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Espacio para Ver y Subir Fotos del Proyecto Verde Futuro con Botón de Eliminar Foto */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Fotos del Proyecto Verde Futuro
            </h2>
            <p className="text-xs text-slate-400">
              Prototipo funcional, construcción en equipo y registros
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Foto</span>
          </button>
        </div>

        {/* Galería con las fotos y botón para eliminar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all aspect-square flex flex-col justify-end"
            >
              <img
                src={photo.url}
                alt={photo.title}
                onClick={() => onOpenPhoto(photo)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
              <div
                onClick={() => onOpenPhoto(photo)}
                className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent cursor-pointer"
              />

              {/* Botón de Eliminar Foto en la tarjeta */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Deseas eliminar la foto "${photo.title}"?`)) {
                    onDeletePhoto(photo.id);
                  }
                }}
                title="Eliminar esta foto"
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-slate-200 hover:text-white z-20 transition-all active:scale-95 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div
                onClick={() => onOpenPhoto(photo)}
                className="relative p-2.5 z-10 cursor-pointer"
              >
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                  {photo.category}
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {photo.title}
                </p>
                <span className="text-[10px] text-slate-400">
                  {photo.date}
                </span>
              </div>
            </div>
          ))}

          {/* Ranura para subir foto */}
          <button
            onClick={onOpenUpload}
            className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center transition-all aspect-square group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">
              Subir Foto
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Prototipo Verde Futuro
            </span>
          </button>
        </div>
      </section>

      {/* Información del Prototipo al final de las fotos, elegante y bien distribuida */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              Ecosistema Cibernético-Físico Híbrido
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Integración & Funcionamiento del Prototipo
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware y software indivisibles para resolver la problemática del agua
          </p>
        </div>

        <div className="grid gap-3.5">
          {/* Componentes Físicos */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400">
              <Wrench className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Componentes Físicos (Hardware y Estructura)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Desarrollamos una estructura ligera en tubería plástica cuadrada con sistema hidropónico NFT, energizada por paneles solares y baterías AGM. Integra una caja de control con tarjeta ESP32, Arduinos, bomba de recirculación, iluminación espectral y sensores calibrados de pH, conductividad, temperatura y nivel de agua, sumados a una cámara de seguimiento inteligente.
            </p>
          </div>

          {/* Componentes Digitales */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-2 text-cyan-400">
              <Cpu className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Componentes Digitales (Software y Nube)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Programamos la lógica del microcontrolador en código PHP, desarrollamos una aplicación móvil interactiva y creamos una plataforma web IoT para la visualización de métricas en tiempo real, análisis de datos históricos y gestión de alertas automáticas.
            </p>
          </div>

          {/* Cómo se complementan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cómo se complementan
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El entorno físico recolecta datos precisos del cultivo y ejecuta las acciones de control (bombeo y luz); el entorno digital transforma esos datos en información accesible desde cualquier lugar para la toma de decisiones preventivas. Sin la estructura física no habría datos que medir, y sin la plataforma digital trabajaríamos a ciegas. Ambos mundos se conectan vía Wi-Fi para garantizar una agricultura de precisión, preventiva y 100% eficiente en el uso del agua.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
