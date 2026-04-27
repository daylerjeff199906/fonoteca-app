"use client"

import { Multimedia, MEDIA_TYPE } from "@/types/fonoteca";
import { X, ChevronLeft, ChevronRight, MapPin, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MultimediaViewerProps {
  items: Multimedia[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  onUpdate?: (item: Multimedia) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function MultimediaViewer({ items, initialIndex, isOpen, onClose, location, onUpdate, onDelete }: MultimediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Multimedia>>({});

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (items[currentIndex]) {
      setFormData({
        title: items[currentIndex].title || "",
        tag: items[currentIndex].tag || "",
        creator: items[currentIndex].creator || "",
        license: items[currentIndex].license || "",
        description: items[currentIndex].description || "",
      });
    }
  }, [currentIndex, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setCurrentIndex(prev => Math.max(0, prev - 1));
      if (e.key === "ArrowRight") setCurrentIndex(prev => Math.min(items.length - 1, prev + 1));
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, onClose]);

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate({ ...items[currentIndex], ...formData });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-lg md:text-xl drop-shadow-md truncate max-w-md">
              {currentItem.title || "Multimedia"}
            </h2>
            <p className="text-white/60 text-[10px] md:text-xs font-medium uppercase tracking-widest drop-shadow-sm">
              Archivo {currentIndex + 1} de {items.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-500 rounded-full h-10 w-10" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden group">
          <img
            src={currentItem.identifier}
            alt={currentItem.title || "Viewer"}
            className="max-h-full max-w-full object-contain shadow-2xl transition-all duration-500"
          />

          {/* Navigation Arrows Overlay */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 border-none text-white disabled:opacity-20"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              disabled={currentIndex === items.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 border-none text-white disabled:opacity-20"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </div>

        {/* Thumbnails Strip Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative h-14 w-14 md:h-16 md:w-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                  idx === currentIndex ? "border-primary scale-110 shadow-lg z-10" : "border-transparent opacity-40 hover:opacity-80"
                )}
              >
                <img src={item.identifier} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Content (Right Aside) - Minimalist Form */}
      <div className="w-full md:w-[380px] bg-[#0A0A0A] border-l border-white/5 flex flex-col text-white z-30 p-8 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 pb-4 border-b border-white/5">
          <div className="h-4 w-1 bg-primary" />
          DETALLE DEL ELEMENTO
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/5 border-white/10 text-white h-9 text-xs focus:ring-primary/40"
                placeholder="Título del archivo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Etiqueta</label>
                <Input
                  value={formData.tag}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white h-9 text-xs focus:ring-primary/40"
                  placeholder="gallery, main..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Creador</label>
                <Input
                  value={formData.creator}
                  onChange={(e) => setFormData(prev => ({ ...prev, creator: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white h-9 text-xs focus:ring-primary/40"
                  placeholder="Autor"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Licencia</label>
              <Input
                value={formData.license}
                onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                className="bg-white/5 border-white/10 text-white h-9 text-xs focus:ring-primary/40"
                placeholder="URL de licencia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white min-h-[100px] text-xs focus:ring-primary/40 resize-none"
                placeholder="Describa el contenido..."
              />
            </div>

            {location && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold text-white/60 uppercase">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 mt-auto flex flex-col gap-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/5 h-10 text-xs"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/5 h-10 text-xs"
              onClick={() => setCurrentIndex(prev => Math.min(items.length - 1, prev + 1))}
              disabled={currentIndex === items.length - 1}
            >
              Siguiente
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 h-10 text-[10px] font-bold uppercase tracking-widest mt-2"
            onClick={() => onDelete && onDelete(currentItem.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar Elemento
          </Button>
        </div>
      </div>
    </div>
  );
}
