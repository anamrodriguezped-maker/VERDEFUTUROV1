import React, { useState } from 'react';
import { X, Upload, Camera, Trash2, Calendar, Tag, Check } from 'lucide-react';
import { ProjectPhoto } from '../types/index.ts';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhoto: ProjectPhoto | null;
  onAddPhoto: (photo: ProjectPhoto) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  selectedPhoto,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>(
    selectedPhoto ? 'view' : 'upload'
  );
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'prototipo' | 'construccion' | 'cultivo' | 'equipo'>('prototipo');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !title.trim()) return;

    const newPhoto: ProjectPhoto = {
      id: `custom-photo-${Date.now()}`,
      title: title.trim(),
      category,
      url: previewUrl,
      date: new Date().toISOString().split('T')[0],
      description: description.trim() || 'Foto del prototipo y avances del proyecto Verde Futuro.',
      isCustom: true,
    };

    onAddPhoto(newPhoto);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('view')}
              disabled={!selectedPhoto}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'view'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white disabled:opacity-30'
              }`}
            >
              Ver Fotografía
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Subir Foto
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 flex-1">
          {activeTab === 'view' && selectedPhoto ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-white">
                    {selectedPhoto.title}
                  </h3>
                  <span className="text-xs text-emerald-400 uppercase font-semibold">
                    {selectedPhoto.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedPhoto.date}</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  {selectedPhoto.description}
                </p>
              </div>

              {onDeletePhoto && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onDeletePhoto(selectedPhoto.id);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar esta fotografía
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveUpload} className="space-y-4">
              {/* Photo preview or dropzone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Selecciona la foto del proyecto Verde Futuro
                </label>
                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 aspect-video bg-slate-950">
                    <img
                      src={previewUrl}
                      alt="Previsualización"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-colors group">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Tocar para abrir cámara o galería
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Soporta PNG, JPEG, JPG (prototipo, montaje, equipo)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título de la foto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Montaje de sensores ESP32 y bomba"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'prototipo', label: 'Prototipo Funcional' },
                    { id: 'construccion', label: 'Construcción y Montaje' },
                    { id: 'equipo', label: 'Equipo STEM' },
                    { id: 'cultivo', label: 'Cultivo Hidropónico' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                        category === cat.id
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Descripción o notas del avance
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe qué componente se aprecia o qué prueba se realizó..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!previewUrl || !title.trim()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    ¡Foto guardada con éxito!
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Guardar en el Proyecto
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
