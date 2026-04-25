"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, GripVertical, FileAudio, FileImage, Loader2, Link, FolderOpen, Pencil, Play, Pause, Music, Eye, MoreVertical, X } from "lucide-react";
import { createFonotecaClient } from "@/utils/supabase/fonoteca/client";
import { bulkUpdateMultimediaIndexes, createMultimedia, deleteMultimedia, getMultimediaList, updateMultimedia, getPresignedUrl } from "@/actions/multimedia";
import { Multimedia, MEDIA_TYPE, MEDIA_TAG, MediaType } from "@/types/fonoteca";
import { toast } from "react-toastify";
import axios from "axios";
import { R2_PUBLIC_URL } from "@/lib/r2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getAudioUrl = (url: string) => {
  if (!url) return "";
  // Check if it's a Google Drive URL
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|open\?id%3D)|docs\.google\.com\/.*?srcid=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}&export=download`;
  }
  return url;
};

const getDriveEmbedUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|open\?id%3D)|docs\.google\.com\/.*?srcid=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
};

const getDriveThumbnailUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|open\?id%3D)|docs\.google\.com\/.*?srcid=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
  }
  return null;
};

const sanitizeFilename = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9.]/g, "_")    // Keep alphanumeric and dot
    .replace(/_{2,}/g, "_")         // Dedup underscores
    .replace(/^_|_$/g, "");         // Trim underscores
};

export function MultimediaSection({ occurrenceId }: { occurrenceId: string }) {
  const [items, setItems] = useState<Multimedia[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<Multimedia | null>(null);

  // Modals
  const [urlSheetOpen, setUrlSheetOpen] = useState(false);
  const [libSheetOpen, setLibSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Multimedia | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<MediaType | null>(null);
  const [activeParentItemId, setActiveParentItemId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, isChild: boolean } | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // URL States
  const [urlInput, setUrlInput] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlCreator, setUrlCreator] = useState("Dashboard");
  const [urlRightsHolder, setUrlRightsHolder] = useState("Instituto de Investigaciones de la Amazonía Peruana (IIAP)");
  const [urlLicense, setUrlLicense] = useState("http://creativecommons.org/licenses/by-nc/4.0/");

  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editCreator, setEditCreator] = useState("");
  const [editRightsHolder, setEditRightsHolder] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editTag, setEditTag] = useState("");

  // Library States
  const [libItems, setLibItems] = useState<Multimedia[]>([]);
  const [libLoading, setLibLoading] = useState(false);

  const supabase = createFonotecaClient();

  const loadMultimedia = async () => {
    setInitialLoading(true);
    const resp = await getMultimediaList({ occurrence_id: occurrenceId, limit: 100 });
    const sorted = (resp.data || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    setItems(sorted);
    setInitialLoading(false);
  };

  const loadLibrary = async () => {
    setLibLoading(true);
    const resp = await getMultimediaList({ limit: 100 });
    const filtered = (resp.data || []).filter(item => item.occurrence_id !== occurrenceId);
    setLibItems(filtered);
    setLibLoading(false);
  };

  useEffect(() => {
    loadMultimedia();
  }, [occurrenceId]);

  useEffect(() => {
    if (libSheetOpen) {
      loadLibrary();
    }
  }, [libSheetOpen]);

  const handleFileUpload = async (files: File[], type: MediaType) => {
    if (!files || files.length === 0) return;

    setUploading(type);
    let successCount = 0;

    // Reset progress for new batch
    setUploadProgress({});

    for (const file of files) {
      const fileId = file.name; // Use filename as key in progress for simplicity in UI matching
      try {
        const fileExt = file.name.split('.').pop() || "";
        const cleanName = sanitizeFilename(file.name.replace(`.${fileExt}`, ""));
        const fileName = `${type.toLowerCase()}_${cleanName}_${Date.now()}.${fileExt}`;
        const uploadPath = `occurrences/${occurrenceId}/${fileName}`;

        const sizeLimit = type === MEDIA_TYPE.SOUND ? 40 * 1024 * 1024 : 10 * 1024 * 1024; // Increased image limit to 10MB too
        if (file.size > sizeLimit) {
          toast.error(`El archivo ${file.name} supera el límite de ${type === MEDIA_TYPE.SOUND ? '40MB' : '10MB'}`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        const signResp = await getPresignedUrl(uploadPath, file.type || "application/octet-stream");
        if (signResp.error || !signResp.url) {
          toast.error(`Error al preparar subida de ${file.name}`);
          continue;
        }

        await axios.put(signResp.url, file, {
          headers: { "Content-Type": file.type || "application/octet-stream" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [fileId]: percent }));
            }
          }
        });

        const publicUrl = `${R2_PUBLIC_URL}/${uploadPath}`;

        const createResp = await createMultimedia({
          occurrence_id: occurrenceId,
          identifier: publicUrl,
          type: type as any,
          format: file.type,
          title: file.name,
          creator: "Dashboard",
          order_index: items.length + successCount,
          rightsHolder: "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
          license: "http://creativecommons.org/licenses/by-nc/4.0/",
          tag: type === MEDIA_TYPE.SOUND ? MEDIA_TAG.MAIN_AUDIO : MEDIA_TAG.GALLERY,
        });

        if (createResp.error) {
          toast.error(`Error al registrar ${file.name} en BD`);
          continue;
        }

        successCount++;
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
        let detail = "";
        if (err.response) {
          detail = ` (Status ${err.response.status}: ${err.response.statusText})`;
        } else if (err.request) {
          detail = " - Posible problema de CORS o conexión.";
        } else {
          detail = ` - ${err.message}`;
        }
        toast.error(`Error subiendo ${file.name}${detail}`);
      }
    }

    // Small delay to let user see 100%
    setTimeout(() => {
      setUploading(null);
      setUploadProgress({});
      if (successCount > 0) {
        toast.success(`${successCount} archivo(s) procesado(s) correctamente.`);
        loadMultimedia();
      }
    }, 500);
  };

  const handleAddFromUrl = async () => {
    if (!urlInput || (!activeUploadType && !activeParentItemId)) return;

    setUploading(activeParentItemId ? MEDIA_TAG.SPECTROGRAM : activeUploadType);
    try {
      const isSpectro = !!activeParentItemId;
      await createMultimedia({
        occurrence_id: occurrenceId,
        identifier: urlInput,
        type: isSpectro ? MEDIA_TYPE.STILL : (activeUploadType as any),
        format: isSpectro ? "image/jpeg" : (activeUploadType === MEDIA_TYPE.SOUND ? "audio/mpeg" : "image/jpeg"),
        title: urlTitle || (isSpectro ? `Histograma de ${items.find(i => i.id === activeParentItemId)?.title || "Audio"}` : "Enlace URL"),
        creator: urlCreator || "Dashboard",
        order_index: isSpectro ? items.filter(it => it.parent_multimedia_id === activeParentItemId).length : items.length,
        rightsHolder: urlRightsHolder || "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
        license: urlLicense || "http://creativecommons.org/licenses/by-nc/4.0/",
        tag: isSpectro ? MEDIA_TAG.SPECTROGRAM : (activeUploadType === MEDIA_TYPE.SOUND ? MEDIA_TAG.MAIN_AUDIO : MEDIA_TAG.GALLERY),
        parent_multimedia_id: activeParentItemId || undefined,
      });

      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Operación Exitosa</span>
          <span className="text-xs opacity-90">{isSpectro ? "Histograma agregado" : "Enlace agregado correctamente"} a la multimedia actual.</span>
        </div>
      );
      setUrlSheetOpen(false);
      setUrlInput("");
      setUrlTitle("");
      setActiveParentItemId(null);
      loadMultimedia();
    } catch (err) {
      toast.error("Error agregando enlace");
    } finally {
      setUploading(null);
    }
  };

  const handleLinkFromLibrary = async (item: Multimedia) => {
    if (!activeUploadType) return;
    setUploading(activeUploadType);

    try {
      await createMultimedia({
        occurrence_id: occurrenceId,
        identifier: item.identifier,
        type: item.type,
        format: item.format,
        title: item.title,
        creator: item.creator || "Dashboard",
        order_index: items.length,
        rightsHolder: item.rightsHolder,
        license: item.license,
        tag: item.tag,
      });

      toast.success("Elemento vinculado de la biblioteca");
      setLibSheetOpen(false);
      loadMultimedia();
    } catch (err) {
      toast.error("Error vinculando elemento");
    } finally {
      setUploading(null);
    }
  };

  const handleEditClick = (item: Multimedia) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditUrl(item.identifier);
    setEditCreator(item.creator || "Dashboard");
    setEditRightsHolder(item.rightsHolder || "Instituto de Investigaciones de la Amazonía Peruana (IIAP)");
    setEditLicense(item.license || "http://creativecommons.org/licenses/by-nc/4.0/");
    setEditTag(item.tag || "");
    setEditSheetOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setUploading("editing");

    try {
      const resp = await updateMultimedia(editingItem.id, {
        occurrence_id: editingItem.occurrence_id,
        identifier: editUrl,
        type: editingItem.type,
        format: editingItem.format,
        title: editTitle,
        creator: editCreator,
        order_index: editingItem.order_index,
        rightsHolder: editRightsHolder,
        license: editLicense,
        tag: editTag,
        parent_multimedia_id: editingItem.parent_multimedia_id
      });

      if (resp.error) {
        toast.error("Error al actualizar");
      } else {
        toast.success("Elemento actualizado correctamente");
        setEditSheetOpen(false);
        setEditingItem(null);
        loadMultimedia();
      }
    } catch (err) {
      toast.error("Error actualizando elemento");
    } finally {
      setUploading(null);
    }
  };

  const uploadSpectrogramFile = async (file: File, itemId: string) => {
    const fileId = `spectro-${itemId}-${Date.now()}`;
    setUploading(itemId);
    try {
      const fileExt = file.name.split('.').pop() || "";
      const cleanName = sanitizeFilename(file.name.replace(`.${fileExt}`, ""));
      const fileName = `spectrogram_${cleanName}_${Date.now()}.${fileExt}`;
      const uploadPath = `occurrences/${occurrenceId}/${fileName}`;

      if (file.size > 10 * 1024 * 1024) { // Increase to 10MB for better quality spectros if needed
        toast.error("El espectrograma supera el límite de 10MB");
        return false;
      }

      // 1. Get Presigned URL
      const signResp = await getPresignedUrl(uploadPath, file.type || "application/octet-stream");
      if (signResp.error || !signResp.url) {
        toast.error(`Error al preparar subida de ${file.name}`);
        return false;
      }

      // 2. Upload with Progress
      await axios.put(signResp.url, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [fileId]: percent }));
          }
        }
      });

      const publicUrl = `${R2_PUBLIC_URL}/${uploadPath}`;

      const createResp = await createMultimedia({
        occurrence_id: occurrenceId,
        identifier: publicUrl,
        type: MEDIA_TYPE.STILL,
        format: file.type,
        title: `Histograma de ${items.find(i => i.id === itemId)?.title || itemId}`,
        creator: "Dashboard",
        order_index: items.filter(it => it.parent_multimedia_id === itemId).length,
        rightsHolder: "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
        license: "http://creativecommons.org/licenses/by-nc/4.0/",
        tag: MEDIA_TAG.SPECTROGRAM,
        parent_multimedia_id: itemId,
      });

      if (createResp.error) {
        toast.error("Error al registrar espectrograma en BD");
        return false;
      }

      setUploadProgress(prev => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
      return true;
    } catch (err) {
      console.error("Spectrogram upload error:", err);
      toast.error("Error subiendo espectrograma");
      return false;
    } finally {
      setUploading(null);
    }
  };

  const handleSpectrogramUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (await uploadSpectrogramFile(file, itemId)) {
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Histograma Registrado</span>
          <span className="text-xs opacity-90">El histograma se guardó exitosamente y se vinculó al audio.</span>
        </div>
      );
      loadMultimedia();
    }
  };

  const handleDragStart = (item: Multimedia) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetItem: Multimedia) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (targetItem.type === MEDIA_TYPE.SOUND) {
        const imageFiles = files.filter(f => f.type.startsWith("image/"));
        if (imageFiles.length > 0) {
          let count = 0;
          for (const file of imageFiles) {
            if (await uploadSpectrogramFile(file, targetItem.id)) count++;
          }
          if (count > 0) {
            toast.success(`${count} histograma(s) subido(s)`);
            loadMultimedia();
          }
          return;
        }
      }
      return;
    }

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    // Drag spectrogram to spectrogram (Swap order)
    if (draggedItem.tag === MEDIA_TAG.SPECTROGRAM && targetItem.tag === MEDIA_TAG.SPECTROGRAM) {
      if (draggedItem.parent_multimedia_id === targetItem.parent_multimedia_id) {
        const updated = items.map(it => {
          if (it.id === draggedItem.id) return { ...it, order_index: targetItem.order_index };
          if (it.id === targetItem.id) return { ...it, order_index: draggedItem.order_index };
          return it;
        });
        setItems([...updated].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        await bulkUpdateMultimediaIndexes([
          { id: draggedItem.id, order_index: targetItem.order_index || 0 },
          { id: targetItem.id, order_index: draggedItem.order_index || 0 }
        ]);
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm">Orden Actualizado</span>
            <span className="text-xs opacity-90">Se reordenaron los histogramas.</span>
          </div>
        );
      }
      setDraggedItem(null);
      return;
    }

    // Drag spectrogram to Audio (Change parent)
    if (draggedItem.tag === MEDIA_TAG.SPECTROGRAM && targetItem.type === MEDIA_TYPE.SOUND) {
      if (draggedItem.parent_multimedia_id !== targetItem.id) {
        const updated = items.map(it => {
          if (it.id === draggedItem.id) return { ...it, parent_multimedia_id: targetItem.id };
          return it;
        });
        setItems(updated);
        await updateMultimedia(draggedItem.id, { ...draggedItem, parent_multimedia_id: targetItem.id });
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm">Histograma Movido</span>
            <span className="text-xs opacity-90">El histograma se vinculó al nuevo audio.</span>
          </div>
        );
      }
      setDraggedItem(null);
      return;
    }

    if (draggedItem.type !== targetItem.type) return;

    const filterType = draggedItem.type;
    const updated = items.map(it => {
      if (it.id === draggedItem.id) return { ...it, order_index: targetItem.order_index };
      if (it.id === targetItem.id) return { ...it, order_index: draggedItem.order_index };
      return it;
    });

    setItems([...updated].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    await bulkUpdateMultimediaIndexes([
      { id: draggedItem.id, order_index: targetItem.order_index || 0 },
      { id: targetItem.id, order_index: draggedItem.order_index || 0 }
    ]);
    toast.success("Orden actualizado");
    setDraggedItem(null);
  };

  const handleDelete = async (id: string, isAudioChild = false) => {
    const resp = await deleteMultimedia(id);
    if (resp.success) {
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Archivo Eliminado</span>
          <span className="text-xs opacity-90">{isAudioChild ? "El espectrograma fue eliminado." : "El archivo multimedia fue eliminado con éxito."}</span>
        </div>
      );
      loadMultimedia();
    } else {
      toast.error("Error al eliminar");
    }
  };

  const audioItems = items.filter(it => it.type === MEDIA_TYPE.SOUND && it.tag !== MEDIA_TAG.SPECTROGRAM);
  const imageItems = items.filter(it => it.type === MEDIA_TYPE.STILL && it.tag !== MEDIA_TAG.SPECTROGRAM);

  const RenderGrid = ({ list, typeTitle, uploadType }: { list: Multimedia[], typeTitle: string, uploadType: MediaType }) => (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{typeTitle}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/10 hover:border-primary/40 text-[11px] font-bold px-3 h-9 bg-white/50 backdrop-blur-sm text-foreground transition-colors hover:bg-white/80">
            <Plus className="h-3.5 w-3.5" />
            <span>{uploadType === "Sound" ? "Subir Audio" : "Subir Imagen"}</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => { setActiveUploadType(uploadType); setSelectedFiles([]); setUploadSheetOpen(true); }}>
              <Upload className="h-4 w-4 mr-2" /> Subir Archivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setActiveUploadType(uploadType); setUrlSheetOpen(true); }}>
              <Link className="h-4 w-4 mr-2" /> Desde URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setActiveUploadType(uploadType); setLibSheetOpen(true); }}>
              <FolderOpen className="h-4 w-4 mr-2" /> Biblioteca
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {list.length === 0 ? (
        <div className="border border-dashed rounded-xl py-12 flex flex-col items-center justify-center bg-muted/5">
          <div className="bg-muted/30 p-4 rounded-full mb-2">
            {uploadType === "Sound" ? <Music className="h-6 w-6 text-muted-foreground/50" /> : <FileImage className="h-6 w-6 text-muted-foreground/50" />}
          </div>
          <p className="text-xs font-medium text-muted-foreground">No hay archivos en esta sección</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((item) => {
            const isPlaying = playingId === item.id;
            const spectrograms = items.filter(it => it.parent_multimedia_id === item.id && it.tag === "spectrogram");

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className="group relative rounded-2xl overflow-hidden border bg-blue-50/20 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col h-full"
              >
                {/* Header Section (Like the image) */}
                <div className="flex items-center justify-between p-3 bg-white/40 border-b">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.type === "Sound" ? (
                      <div className="bg-red-500 rounded p-1">
                        <Music className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="bg-blue-500 rounded p-1">
                        <FileImage className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-[11px] font-bold truncate text-foreground/80">{item.title || "Sin título"}</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(item)}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete({ id: item.id, isChild: false })}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Body Section (Square Center) */}
                <div className="relative flex-1 bg-white flex items-center justify-center min-h-[160px] p-4 m-2 rounded-sm">
                  {item.type === "Still" ? (
                    <img
                      src={getDriveThumbnailUrl(item.identifier) || item.identifier}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={item.title || "Imagen"}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-[160px]">
                      <div className={`p-6 rounded-2xl transition-all duration-500 mb-4 ${isPlaying ? "bg-red-500 text-white scale-110 shadow-lg animate-pulse" : "bg-red-50 text-red-500"}`}>
                        <Music className="h-10 w-10" />
                      </div>
                      <audio
                        src={getAudioUrl(item.identifier)}
                        controls
                        className="w-full h-10 scale-95 opacity-80 hover:opacity-100 transition-opacity"
                        onPlay={(e) => {
                          if (currentAudio && currentAudio !== e.currentTarget) {
                            currentAudio.pause();
                          }
                          setCurrentAudio(e.currentTarget);
                          setPlayingId(item.id);
                        }}
                        onPause={() => {
                          if (playingId === item.id) setPlayingId(null);
                        }}
                        onEnded={() => {
                          if (playingId === item.id) setPlayingId(null);
                        }}
                        onError={(e) => {
                          console.error("Audio error:", e);
                          // toast.error("Error al cargar este archivo de audio");
                        }}
                      />
                    </div>
                  )}

                  {/* Tag Overlay Bottom Left */}
                  <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-black/50 text-white backdrop-blur-md border border-white/10">{item.tag || "N/A"}</span>
                  </div>
                </div>

                {/* Footer Section (Histogramas Piecera) */}
                {item.type === "Sound" && (
                  <div className="p-3 border-t bg-white/30 space-y-2 mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Espectrogramas</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="text-[10px] p-1.5 rounded-full hover:bg-white text-primary flex items-center gap-1 font-bold border border-primary/20">
                            <Plus className="h-2.5 w-2.5" /> Agregar
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="text-xs" onClick={() => { setActiveParentItemId(item.id); setActiveUploadType("Still"); setSelectedFiles([]); setUploadSheetOpen(true); }}>
                            <Upload className="h-3 w-3 mr-1" /> Subir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onClick={() => { setActiveParentItemId(item.id); setActiveUploadType("Still"); setUrlSheetOpen(true); }}>
                            <Link className="h-3 w-3 mr-1" /> URL
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {spectrograms.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {spectrograms.map((sp) => (
                          <div key={sp.id} className="relative group aspect-square rounded-sm border bg-white overflow-hidden cursor-pointer" onClick={() => handleEditClick(sp)}>
                            <img src={sp.identifier} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Pencil className="h-4 w-4 text-white" />
                            </div>
                            <button
                              className="absolute top-1 right-1 p-1.5 bg-destructive/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-sm z-10"
                              onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: sp.id, isChild: true }); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] italic text-muted-foreground text-center py-2 bg-white/20 rounded-lg">No hay espectrogramas vinculados.</p>
                    )}
                  </div>
                )}

                {/* Image Info Footer */}
                {item.type === "Still" && (
                  <div className="p-3 border-t bg-white/30 text-[10px] text-muted-foreground flex justify-between uppercase font-bold tracking-widest">
                    <span>{item.creator || "Desconocido"}</span>
                    <span>{item.license ? "CC" : "Copyright"}</span>
                  </div>
                )}

                {/* Global Hover Drag Tool */}
                <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <div className="bg-white/90 p-1.5 rounded-full shadow-lg border border-muted cursor-move animate-pulse pointer-events-auto">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative space-y-6 mt-6"
      onDragOver={(e) => {
        if (!uploadSheetOpen) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Gestión Multimedia (R2-Bucket)</h3>
        </div>
        <p className="text-xs text-muted-foreground">Sube Audios, Histogramas y Fotografías. Arrastra para cambiar el orden o vincular histogramas.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <span className="text-xs">Cargando multimedia...</span>
          </div>
        ) : (
          <>
            <RenderGrid list={audioItems} typeTitle="Audios & Espectrogramas" uploadType={MEDIA_TYPE.SOUND} />
            <div className="border-t border-muted/50 my-2" />
            <RenderGrid list={imageItems} typeTitle="Imágenes de la Especie" uploadType={MEDIA_TYPE.STILL} />
          </>
        )}
      </div>

      {/* Global Drag Overlay */}
      {isDragOver && !uploadSheetOpen && (
        <div
          className="fixed inset-0 z-[100] bg-primary/10 backdrop-blur-sm border-4 border-dashed border-primary m-4 rounded-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200"
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const files = Array.from(e.dataTransfer.files);
              const firstFile = files[0];
              if (firstFile) {
                if (firstFile.type.startsWith("audio/")) {
                  setActiveUploadType(MEDIA_TYPE.SOUND);
                } else {
                  setActiveUploadType(MEDIA_TYPE.STILL);
                }
              }
              setSelectedFiles(files);
              setUploadSheetOpen(true);
            }
          }}
        >
          <div className="bg-background/90 p-8 rounded-full shadow-2xl mb-4">
            <Upload className="h-12 w-12 text-primary animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Soltar para subida rápida</h2>
          <p className="text-muted-foreground mt-2">Los archivos se clasificarán automáticamente</p>
        </div>
      )}

      {/* --- Dialog: URL --- */}
      <Sheet open={urlSheetOpen} onOpenChange={(open) => { setUrlSheetOpen(open); if (!open) setActiveParentItemId(null); }}>
        <SheetContent className="sm:max-w-xl pb-0">
          <SheetHeader>
            <SheetTitle>Agregar desde URL</SheetTitle>
            <SheetDescription>Inserta un enlace externo del audio o imagen.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 border-t mt-4 p-2 md:p-4 flex-1 overflow-y-auto max-h-[80vh]">

            {/* Visualizer */}
            {urlInput && (
              <div className="aspect-video relative rounded-lg border bg-muted flex flex-col items-center justify-center overflow-hidden mb-4">
                {getDriveEmbedUrl(urlInput) ? (
                  <iframe src={getDriveEmbedUrl(urlInput)!} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
                ) : activeUploadType === MEDIA_TYPE.STILL ? (
                  <img src={getAudioUrl(urlInput)} className="object-cover h-full w-full" alt="Preview Image" onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=Error+Loading+Image" }} />
                ) : (
                  <audio src={getAudioUrl(urlInput)} controls className="w-[90%] mt-auto mb-4" />
                )}
              </div>
            )}

            <div className="rounded-md border bg-card">
              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Título *</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="p. ej. Canto de ave en MP3" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">URL *</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="https://mi-servidor.com/audio.mp3" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Creador</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="p. ej. Investigador" value={urlCreator} onChange={(e) => setUrlCreator(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Derechos</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="Institución" value={urlRightsHolder} onChange={(e) => setUrlRightsHolder(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Licencia</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="http://..." value={urlLicense} onChange={(e) => setUrlLicense(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setUrlSheetOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleAddFromUrl} disabled={!urlInput || uploading !== null}>
                {uploading ? "Agregando..." : "Agregar Desde URL"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- Dialog: Library --- */}
      <Sheet open={libSheetOpen} onOpenChange={setLibSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="">
            <SheetTitle>Biblioteca de Archivos</SheetTitle>
            <SheetDescription>Selecciona un archivo existente en el sistema para vincularlo a esta ocurrencia.</SheetDescription>
          </SheetHeader>
          <div className="py-4 border-t mt-4">
            {libLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : libItems.filter(i => i.type === activeUploadType).length === 0 ? (
              <div className="text-center text-xs text-muted-foreground p-4">No hay archivos de este tipo en la biblioteca.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {libItems.filter(i => i.type === activeUploadType).map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer flex flex-col items-center justify-center text-center transition-all bg-muted/10 hover"
                    onClick={() => handleLinkFromLibrary(item)}
                  >
                    {item.type === MEDIA_TYPE.STILL && <FileImage className="h-10 w-10 text-blue-500 mb-1" />}
                    {item.type === MEDIA_TYPE.SOUND && <FileAudio className="h-10 w-10 text-green-500 mb-1" />}
                    <span className="text-xs font-semibold line-clamp-2 w-full text-foreground/80">{item.title || "Archivo"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* --- Dialog: Edit --- */}
      <Sheet open={editSheetOpen} onOpenChange={(open) => { setEditSheetOpen(open); if (!open) setEditingItem(null); }}>
        <SheetContent className="sm:max-w-xl p-2 md:p-4">
          <SheetHeader>
            <SheetTitle>Editar Elemento</SheetTitle>
            <SheetDescription>Modifica el título o el enlace de la multimedia.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4 border-t mt-4 flex-1 overflow-y-auto max-h-[80vh]">

            {/* Visualizer */}
            {editUrl && (
              <div className="aspect-video relative rounded-lg border bg-muted flex flex-col items-center justify-center overflow-hidden mb-4">
                {getDriveEmbedUrl(editUrl) ? (
                  <iframe src={getDriveEmbedUrl(editUrl)!} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
                ) : editingItem?.type === MEDIA_TYPE.STILL ? (
                  <img src={getAudioUrl(editUrl)} className="object-cover h-full w-full" alt="Preview Image" onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=Error+Loading+Image" }} />
                ) : (
                  <audio src={getAudioUrl(editUrl)} controls className="w-[90%] mt-auto mb-4" />
                )}
              </div>
            )}

            <div className="rounded-md border bg-card">
              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Título *</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="p. ej. Canto de ave" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">URL *</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="https://..." value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Creador</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="p. ej. Investigador" value={editCreator} onChange={(e) => setEditCreator(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Derechos</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="Institución" value={editRightsHolder} onChange={(e) => setEditRightsHolder(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Licencia</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="http://..." value={editLicense} onChange={(e) => setEditLicense(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0">
                <div className="w-1/3 flex items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Etiqueta</label>
                </div>
                <div className="w-2/3">
                  <Input placeholder="p. ej. main_audio" value={editTag} onChange={(e) => setEditTag(e.target.value)} className="font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-8 px-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setEditSheetOpen(false); setEditingItem(null); }}>Cancelar</Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={!editUrl || uploading !== null}>
                {uploading === "editing" ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* --- Dialog: Local Upload --- */}
      <Sheet open={uploadSheetOpen} onOpenChange={(open) => { if (!uploading) { setUploadSheetOpen(open); if (!open) setSelectedFiles([]); } }}>
        <SheetContent className="sm:max-w-2xl p-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 via-background to-background">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Centro de Carga</h2>
                  <p className="text-xs font-medium text-muted-foreground">Sube y organiza tus archivos multimedia</p>
                </div>
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/5">
            {/* Drop Zone */}
            <div
              className={`group relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 hover:bg-primary/[0.02] ${isDragOver ? "border-primary bg-primary/10 ring-8 ring-primary/5" : "border-muted-foreground/20 hover:border-primary/40"
                } ${uploading ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
              onDragOver={(e) => { e.preventDefault(); if (!uploading) setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (uploading) return;
                if (e.dataTransfer.files) {
                  const files = Array.from(e.dataTransfer.files);
                  setSelectedFiles(prev => [...prev, ...files]);
                }
              }}
              onClick={() => !uploading && document.getElementById("file-sheet-upload")?.click()}
            >
              <div className="bg-background rounded-2xl p-5 mb-4 border border-muted/50">
                <Upload className={`h-8 w-8 ${isDragOver ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Seleccionar archivos para subir</h3>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px] text-center">Formato permitido: Audios, Imágenes y Espectrogramas</p>

              <Input
                id="file-sheet-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
              />
            </div>

            {/* Selected Files Grid */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Cola de carga ({selectedFiles.length})</span>
                  {uploading && <div className="flex items-center gap-2 text-primary font-bold text-[11px] animate-pulse"><Loader2 className="h-3 w-3 animate-spin" /> Procesando...</div>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedFiles.map((f, i) => {
                    const progress = uploadProgress[f.name];
                    const isUploading = progress !== undefined && progress < 100;
                    const isDone = progress === 100;
                    const isImage = f.type.startsWith("image/");
                    const thumbUrl = isImage ? URL.createObjectURL(f) : null;

                    return (
                      <div
                        key={i}
                        draggable={!uploading}
                        onDragStart={(e) => { e.dataTransfer.setData("sourceIndex", i.toString()); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const sourceIdx = parseInt(e.dataTransfer.getData("sourceIndex"));
                          if (isNaN(sourceIdx) || sourceIdx === i) return;
                          const newFiles = [...selectedFiles];
                          const [moved] = newFiles.splice(sourceIdx, 1);
                          if (moved) {
                            newFiles.splice(i, 0, moved);
                            setSelectedFiles(newFiles);
                          }
                        }}
                        className={`group relative aspect-square rounded-2xl border bg-card overflow-hidden transition-all duration-300 ${isUploading ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      >
                        {isImage ? (
                          <img src={thumbUrl!} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                            <div className="bg-white p-3 rounded-full text-primary mb-2">
                              <FileAudio className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{f.name.split('.').pop()}</span>
                          </div>
                        )}

                        {/* Progress Overlay */}
                        {(isUploading || isDone || uploading) && (
                          <div className="absolute inset-x-2 bottom-2 z-10 bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-muted/50">
                            <div className="flex items-center justify-between mb-1.5 px-0.5">
                              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">{isDone ? "Completado" : "Subiendo"}</span>
                              <span className="text-[9px] font-bold text-primary">{progress || 0}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${isDone ? "bg-green-500" : "bg-primary"}`}
                                style={{ width: `${progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Delete Button */}
                        {!uploading && (
                          <button
                            className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-white text-muted-foreground rounded-lg border border-muted/50 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                            onClick={(e) => { e.stopPropagation(); setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i)) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {!uploading && (
                          <div className="absolute top-2 left-2 p-1 bg-white/80 rounded-md border border-muted cursor-move opacity-0 group-hover:opacity-100">
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}

                        {/* File Name Tip */}
                        <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
                          <span className="text-[10px] font-medium text-white truncate drop">{f.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-background flex items-center justify-between gap-4 shadow-inner">
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total preparado:</p>
              <p className="text-sm font-bold">{(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" className="flex-1 sm:flex-none text-xs rounded-xl" disabled={!!uploading} onClick={() => { setUploadSheetOpen(false); setSelectedFiles([]); setActiveParentItemId(null); }}>
                Cancelar
              </Button>
              <Button size="default" className="flex-1 sm:flex-none h-11 px-8 rounded-xl  shadow-primary/20 transition-all hover:scale-105 active:scale-95" disabled={selectedFiles.length === 0 || !!uploading} onClick={async () => {
                if (activeParentItemId) {
                  let count = 0;
                  for (const file of selectedFiles) {
                    if (await uploadSpectrogramFile(file, activeParentItemId)) count++;
                  }
                  if (count > 0) {
                    toast.success(`${count} histogramas registrados`);
                    loadMultimedia();
                  }
                } else {
                  await handleFileUpload(selectedFiles, activeUploadType!);
                }
                setSelectedFiles([]);
                setUploadSheetOpen(false);
                setActiveParentItemId(null);
              }}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Iniciar Carga</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- Confirm Delete Dialog (AlertDialog) --- */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              Esta acción no se puede deshacer. El archivo desaparecerá permanentemente del bucket y de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={async () => {
                if (itemToDelete) {
                  await handleDelete(itemToDelete.id, itemToDelete.isChild);
                  setItemToDelete(null);
                }
              }}
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
