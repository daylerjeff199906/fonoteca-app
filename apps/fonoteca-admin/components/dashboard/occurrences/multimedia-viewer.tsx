"use client"

import { Multimedia, MEDIA_TYPE } from "@/types/fonoteca";
import { X, ChevronLeft, ChevronRight, MapPin, Eye, EyeOff, User, Tag, Info, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setCurrentIndex(prev => Math.max(0, prev - 1));
      if (e.key === "ArrowRight") setCurrentIndex(prev => Math.min(items.length - 1, prev + 1));
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, onClose]);

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

        {/* Image/Audio Container */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden group">
          {currentItem.type === MEDIA_TYPE.STILL ? (
            <img
              src={currentItem.identifier}
              alt={currentItem.title || "Viewer"}
              className="max-h-full max-w-full object-contain shadow-2xl transition-all duration-500"
            />
          ) : (
            <div className="w-full max-w-4xl px-4 flex flex-col items-center gap-6">
               <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                  <FileText className="h-16 w-16 text-primary" />
               </div>
               <audio src={currentItem.identifier} controls className="w-full max-w-2xl" />
            </div>
          )}

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

      {/* Sidebar Content (Right Aside) - Static Details */}
      <div className="w-full md:w-[380px] bg-[#0A0A0A] border-l border-white/5 flex flex-col text-white z-30 p-8 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 pb-4 border-b border-white/5">
          <div className="h-4 w-1 bg-primary" />
          DETALLES DE MULTIMEDIA
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Título</label>
              <p className="text-sm font-medium text-white/90">{currentItem.title || "Sin título"}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Etiqueta</label>
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-medium text-white/90 uppercase">{currentItem.tag || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Visibilidad</label>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                  currentItem.is_public ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                )}>
                  {currentItem.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {currentItem.is_public ? "Público" : "Privado"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Creador</label>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-white/40" />
                <p className="text-sm font-medium text-white/90">{currentItem.creator || "Desconocido"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Licencia</label>
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-white/40" />
                <p className="text-xs font-medium text-white/70 truncate">{currentItem.license || "Propiedad del IIAP"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Descripción</label>
              <p className="text-sm leading-relaxed text-white/60 italic">
                {currentItem.description || "Sin descripción disponible para este elemento multimedia."}
              </p>
            </div>

            {location && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Localidad</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">{location}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 mt-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/5 h-12 text-sm font-bold"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/5 h-12 text-sm font-bold"
              onClick={() => setCurrentIndex(prev => Math.min(items.length - 1, prev + 1))}
              disabled={currentIndex === items.length - 1}
            >
              Siguiente <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
