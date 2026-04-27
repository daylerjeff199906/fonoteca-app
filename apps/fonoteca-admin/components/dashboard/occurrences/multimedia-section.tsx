"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, GripVertical, FileAudio, FileImage, Loader2, Link, FolderOpen, Pencil, Music, MoreVertical, X, Info, Settings2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { createFonotecaClient } from "@/utils/supabase/fonoteca/client";
import { bulkUpdateMultimediaIndexes, createMultimedia, deleteMultimedia, getMultimediaList, updateMultimedia, getPresignedUrl } from "@/actions/multimedia";
import { Multimedia, MEDIA_TYPE, MEDIA_TAG, MediaType } from "@/types/fonoteca";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import axios from "axios";
import { R2_PUBLIC_URL } from "@/lib/r2";
import { cn } from "@/lib/utils";
import { multimediaSchema } from "@/lib/validations/fonoteca";
import { Textarea } from "@/components/ui/textarea";
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
import { MultimediaViewer } from "./multimedia-viewer";

const BaseSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  title: string,
  description: string,
  children: React.ReactNode,
  footer?: React.ReactNode
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="lg:min-w-[45vw] lg:max-w-[60vw] lg:w-1/2 flex flex-col h-full overflow-hidden p-0 border-l shadow-2xl">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
        <SheetDescription className="text-xs">{description}</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
        {children}
      </div>
      {footer && (
        <div className="p-6 border-t bg-background flex justify-end gap-3 shadow-inner">
          {footer}
        </div>
      )}
    </SheetContent>
  </Sheet>
);

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

export function MultimediaSection({ occurrenceId, location }: { occurrenceId: string, location?: string }) {
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
  const [urlRecordStatus, setUrlRecordStatus] = useState<"draft" | "published" | "deleted">("draft");

  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editCreator, setEditCreator] = useState("");
  const [editRightsHolder, setEditRightsHolder] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editRecordStatus, setEditRecordStatus] = useState<"draft" | "published" | "deleted">("draft");
  const [editType, setEditType] = useState<MediaType>(MEDIA_TYPE.SOUND);
  const [editFormat, setEditFormat] = useState("");
  const [editGuanoMetadata, setEditGuanoMetadata] = useState<Record<string, any>>({});
  const [showMetadataConfig, setShowMetadataConfig] = useState(false);

  // Slider Preview States
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [sliderItems, setSliderItems] = useState<Multimedia[]>([]);

  // Library States
  const [libItems, setLibItems] = useState<Multimedia[]>([]);
  const [libLoading, setLibLoading] = useState(false);

  // Batch Upload Metadata States
  const [batchCreator, setBatchCreator] = useState("Dashboard");
  const [batchRightsHolder, setBatchRightsHolder] = useState("Instituto de Investigaciones de la Amazonía Peruana (IIAP)");
  const [batchLicense, setBatchLicense] = useState("http://creativecommons.org/licenses/by-nc/4.0/");
  const [batchRecordStatus, setBatchRecordStatus] = useState<"draft" | "published" | "deleted">("draft");
  const [batchIsPublic, setBatchIsPublic] = useState(true);
  const [batchGuanoMetadata, setBatchGuanoMetadata] = useState<Record<string, any>>({});
  const [showBatchConfig, setShowBatchConfig] = useState(false);

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

        const payload = {
          occurrence_id: occurrenceId,
          identifier: publicUrl,
          originalFilename: file.name,
          type: type as any,
          format: file.type,
          title: file.name,
          description: "",
          creator: batchCreator,
          order_index: items.length + successCount,
          rightsHolder: batchRightsHolder,
          license: batchLicense,
          tag: type === MEDIA_TYPE.SOUND ? MEDIA_TAG.MAIN_AUDIO : MEDIA_TAG.GALLERY,
          record_status: batchRecordStatus,
          is_public: batchIsPublic,
          guano_metadata: batchGuanoMetadata,
        };

        // Validate with Zod
        const validatedData = multimediaSchema.parse(payload);

        const createResp = await createMultimedia(validatedData as any);

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
      const payload = {
        occurrence_id: occurrenceId,
        identifier: urlInput,
        originalFilename: "url_source",
        type: isSpectro ? MEDIA_TYPE.STILL : (activeUploadType as any),
        format: isSpectro ? "image/jpeg" : (activeUploadType === MEDIA_TYPE.SOUND ? "audio/mpeg" : "image/jpeg"),
        title: urlTitle || (isSpectro ? `Histograma de ${items.find(i => i.id === activeParentItemId)?.title || "Audio"}` : "Enlace URL"),
        description: "",
        creator: urlCreator || "Dashboard",
        order_index: isSpectro ? items.filter(it => it.parent_multimedia_id === activeParentItemId).length : items.length,
        rightsHolder: urlRightsHolder || "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
        license: urlLicense || "http://creativecommons.org/licenses/by-nc/4.0/",
        tag: isSpectro ? MEDIA_TAG.SPECTROGRAM : (activeUploadType === MEDIA_TYPE.SOUND ? MEDIA_TAG.MAIN_AUDIO : MEDIA_TAG.GALLERY),
        parent_multimedia_id: activeParentItemId || undefined,
        record_status: urlRecordStatus,
        is_public: true,
        guano_metadata: {},
      };

      // Validate with Zod
      const validatedData = multimediaSchema.parse(payload);

      await createMultimedia(validatedData as any);

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
    setEditDescription(item.description || "");
    setEditIsPublic(item.is_public ?? true);
    setEditRecordStatus(item.record_status || "draft");
    setEditType(item.type);
    setEditFormat(item.format);
    setEditGuanoMetadata(item.guano_metadata || {});
    setShowMetadataConfig(false);
    setEditSheetOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setUploading("editing");

    try {
      const payload = {
        ...editingItem,
        identifier: editUrl,
        title: editTitle,
        creator: editCreator,
        rightsHolder: editRightsHolder,
        license: editLicense,
        tag: editTag,
        description: editDescription,
        is_public: editIsPublic,
        record_status: editRecordStatus,
        type: editType as any,
        format: editFormat,
        guano_metadata: editGuanoMetadata,
      };

      // Validate with Zod
      const validatedData = multimediaSchema.parse(payload);

      const resp = await updateMultimedia(editingItem.id, validatedData as any);

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
        originalFilename: file.name,
        type: MEDIA_TYPE.STILL,
        format: file.type,
        title: `Histograma de ${items.find(i => i.id === itemId)?.title || itemId}`,
        description: "",
        creator: "Dashboard",
        order_index: items.filter(it => it.parent_multimedia_id === itemId).length,
        rightsHolder: "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
        license: "http://creativecommons.org/licenses/by-nc/4.0/",
        tag: MEDIA_TAG.SPECTROGRAM,
        parent_multimedia_id: itemId,
        record_status: "draft",
        is_public: true,
        guano_metadata: {},
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

  const MultimediaSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border bg-card/50 overflow-hidden flex flex-col h-[320px]">
          <div className="p-3 border-b flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="flex-1 m-2 rounded-sm bg-muted/20 flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="p-3 border-t space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full rounded-sm" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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

  const RenderList = ({ list, typeTitle }: { list: Multimedia[], typeTitle: string }) => (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{typeTitle}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/10 hover:border-primary/40 text-[11px] font-bold px-3 h-9 bg-white/50 backdrop-blur-sm text-foreground transition-colors hover:bg-white/80">
            <Plus className="h-3.5 w-3.5" />
            <span>Subir Audio</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => { setActiveUploadType(MEDIA_TYPE.SOUND); setSelectedFiles([]); setUploadSheetOpen(true); }}>
              <Upload className="h-4 w-4 mr-2" /> Subir Archivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setActiveUploadType(MEDIA_TYPE.SOUND); setUrlSheetOpen(true); }}>
              <Link className="h-4 w-4 mr-2" /> Desde URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setActiveUploadType(MEDIA_TYPE.SOUND); setLibSheetOpen(true); }}>
              <FolderOpen className="h-4 w-4 mr-2" /> Biblioteca
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {list.length === 0 ? (
        <div className="border border-dashed rounded-xl py-12 flex flex-col items-center justify-center bg-muted/5">
          <div className="bg-muted/30 p-4 rounded-full mb-2">
            <Music className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">No hay audios registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add New Audio Card */}
          <button
            onClick={() => { setActiveUploadType(MEDIA_TYPE.SOUND); setSelectedFiles([]); setUploadSheetOpen(true); }}
            className="w-full flex items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
          >
            <div className="bg-primary/20 p-2 rounded-full group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-bold text-primary">Añadir nuevo audio o grabación</span>
          </button>

          {list.map((item) => {
            const isPlaying = playingId === item.id;
            const spectrograms = items.filter(it => it.parent_multimedia_id === item.id && it.tag === "spectrogram");
            const maxThumbs = 4;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl border bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-300"
              >
                {/* Drag Handle */}
                <div className="hidden sm:flex p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Info & Player */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-all ${isPlaying ? "bg-red-500 text-white animate-pulse" : "bg-red-50 text-red-500"}`}>
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.title || "Sin título"}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest leading-none mt-1">{item.tag || "audio"}</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <audio
                      src={getAudioUrl(item.identifier)}
                      controls
                      className="h-8 w-full sm:w-[180px] scale-90"
                      onPlay={(e) => {
                        if (currentAudio && currentAudio !== e.currentTarget) currentAudio.pause();
                        setCurrentAudio(e.currentTarget);
                        setPlayingId(item.id);
                      }}
                      onPause={() => playingId === item.id && setPlayingId(null)}
                      onEnded={() => playingId === item.id && setPlayingId(null)}
                    />
                  </div>
                  {/* Visibility Chip */}
                  <div className={cn(
                    "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase",
                    item.is_public ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"
                  )}>
                    {item.is_public ? <Eye className="h-3 w-3 inline mr-1" /> : <EyeOff className="h-3 w-3 inline mr-1" />}
                    {item.is_public ? "Público" : "Privado"}
                  </div>
                </div>

                {/* Spectrograms Thumbnails */}
                <div className="flex items-center gap-1.5 px-3 border-l border-muted/50 h-10">
                  {spectrograms.slice(0, maxThumbs).map((sp, idx) => (
                    <div
                      key={sp.id}
                      className="h-9 w-9 rounded-lg border bg-white overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm flex-shrink-0 relative group/thumb"
                      onClick={() => {
                        setSliderItems(spectrograms);
                        setSliderIndex(idx);
                        setSliderOpen(true);
                      }}
                    >
                      <img src={sp.identifier} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                        <Info className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ))}
                  {spectrograms.length > maxThumbs && (
                    <div
                      className="h-9 w-9 rounded-lg border bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-all flex-shrink-0"
                      onClick={() => {
                        setSliderItems(spectrograms);
                        setSliderIndex(maxThumbs);
                        setSliderOpen(true);
                      }}
                    >
                      <span className="text-[10px] font-bold">+{spectrograms.length - maxThumbs}</span>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="h-9 w-9 rounded-lg border border-dashed flex items-center justify-center hover:bg-primary/5 hover:border-primary/40 text-primary transition-all flex-shrink-0">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="text-xs" onClick={() => { setActiveParentItemId(item.id); setActiveUploadType(MEDIA_TYPE.STILL); setSelectedFiles([]); setUploadSheetOpen(true); }}>
                        <Upload className="h-3 w-3 mr-2" /> Subir Histograma
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs" onClick={() => { setActiveParentItemId(item.id); setActiveUploadType(MEDIA_TYPE.STILL); setUrlSheetOpen(true); }}>
                        <Link className="h-3 w-3 mr-2" /> Desde URL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 border-l border-muted/50 pl-2 h-10">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEditClick(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete({ id: item.id, isChild: false })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

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
            <span>Subir Imagen</span>
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
            <FileImage className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">No hay imágenes registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Add New Image Card */}
          <button
            onClick={() => { setActiveUploadType(uploadType); setSelectedFiles([]); setUploadSheetOpen(true); }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group aspect-square"
          >
            <div className="bg-primary/20 p-4 rounded-full group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary text-center px-4">Subir nueva fotografía</span>
          </button>

          {list.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item)}
              className="group relative rounded-2xl overflow-hidden border bg-blue-50/20 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col h-full"
            >
              {/* Header Section */}
              <div className="flex items-center justify-between p-3 bg-white/40 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-blue-500 rounded p-1">
                    <FileImage className="h-3 w-3 text-white" />
                  </div>
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

              {/* Body Section */}
              <div className="relative aspect-square bg-white flex items-center justify-center p-4 m-2 rounded-xl cursor-pointer overflow-hidden group/img" onClick={() => {
                setSliderItems(list);
                setSliderIndex(list.indexOf(item));
                setSliderOpen(true);
              }}>
                <img
                  src={getDriveThumbnailUrl(item.identifier) || item.identifier}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  alt={item.title || "Imagen"}
                />
                {/* Tag Overlay Bottom Left */}
                <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-black/50 text-white backdrop-blur-md border border-white/10">{item.tag || "N/A"}</span>
                </div>
              </div>

              {/* Image Info Footer */}
              <div className="p-3 border-t bg-white/30 text-[10px] text-muted-foreground flex justify-between uppercase font-bold tracking-widest">
                <span>{item.creator || "Desconocido"}</span>
                <span>{item.license ? "CC" : "Copyright"}</span>
              </div>

              {/* Global Hover Drag Tool */}
              <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <div className="bg-white/90 p-1.5 rounded-full shadow-lg border border-muted cursor-move animate-pulse pointer-events-auto">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
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
      <div className="grid grid-cols-1 gap-6">
        {initialLoading ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <MultimediaSkeleton />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <MultimediaSkeleton />
            </div>
          </div>
        ) : (
          <>
            <RenderList list={audioItems} typeTitle="Audios & Espectrogramas" />
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
      <BaseSheet
        open={urlSheetOpen}
        onOpenChange={(open) => { setUrlSheetOpen(open); if (!open) setActiveParentItemId(null); }}
        title="Agregar desde URL"
        description="Inserta un enlace externo del audio o imagen."
        footer={(
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" className="text-xs rounded-xl" onClick={() => setUrlSheetOpen(false)}>Cancelar</Button>
            <Button className="text-xs rounded-xl px-6" onClick={handleAddFromUrl} disabled={!urlInput || uploading !== null}>
              {uploading ? "Agregando..." : "Agregar Desde URL"}
            </Button>
          </div>
        )}
      >
        <div className="space-y-6">
          {urlInput && (
            <div className="aspect-video relative rounded-2xl border bg-card flex flex-col items-center justify-center overflow-hidden shadow-sm">
              {getDriveEmbedUrl(urlInput) ? (
                <iframe src={getDriveEmbedUrl(urlInput)!} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
              ) : activeUploadType === MEDIA_TYPE.STILL ? (
                <img src={getAudioUrl(urlInput)} className="object-cover h-full w-full" alt="Preview Image" onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=Error+Loading+Image" }} />
              ) : (
                <audio src={getAudioUrl(urlInput)} controls className="w-[90%] mt-auto mb-4" />
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Título *</label>
                <Input placeholder="p. ej. Canto de ave en MP3" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} className="text-sm h-9 bg-background focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">URL del Archivo *</label>
                <Input placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="text-sm h-9 bg-background focus-visible:ring-primary/20" />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg py-5"
                onClick={() => setShowMetadataConfig(!showMetadataConfig)}
              >
                Configurar Metadatos
                <MoreVertical className={cn("h-4 w-4 transition-transform", showMetadataConfig && "rotate-90")} />
              </Button>

              {showMetadataConfig && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creador</label>
                      <Input placeholder="Investigador" value={urlCreator} onChange={(e) => setUrlCreator(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Derechos</label>
                      <Input placeholder="Institución" value={urlRightsHolder} onChange={(e) => setUrlRightsHolder(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Licencia</label>
                      <Input placeholder="http://..." value={urlLicense} onChange={(e) => setUrlLicense(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado de Registro</label>
                      <select
                        value={urlRecordStatus}
                        onChange={(e) => setUrlRecordStatus(e.target.value as any)}
                        className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                      >
                        <option value="draft">Borrador (Draft)</option>
                        <option value="published">Publicado (Published)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </BaseSheet>

      {/* --- Dialog: Library --- */}
      <BaseSheet
        open={libSheetOpen}
        onOpenChange={setLibSheetOpen}
        title="Biblioteca de Archivos"
        description="Selecciona un archivo existente en el sistema para vincularlo a esta ocurrencia."
      >
        {libLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <span className="text-xs font-medium text-muted-foreground">Consultando biblioteca...</span>
          </div>
        ) : libItems.filter(i => i.type === activeUploadType).length === 0 ? (
          <div className="text-center text-xs text-muted-foreground p-12 border-2 border-dashed rounded-3xl bg-background/50">No hay archivos de este tipo en la biblioteca.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {libItems.filter(i => i.type === activeUploadType).map((item) => (
              <div
                key={item.id}
                className="group relative border rounded-2xl bg-card overflow-hidden hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleLinkFromLibrary(item)}
              >
                <div className="aspect-square flex flex-col items-center justify-center bg-muted/10 p-4">
                  {item.type === MEDIA_TYPE.STILL ? (
                    <div className="bg-blue-500/10 p-3 rounded-full text-blue-500 mb-2">
                      <FileImage className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="bg-green-500/10 p-3 rounded-full text-green-500 mb-2">
                      <FileAudio className="h-6 w-6" />
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-foreground line-clamp-2 text-center">{item.title || "Sin título"}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/5 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-[9px] font-bold text-primary uppercase bg-white px-2 py-1 rounded-md shadow-sm">Seleccionar</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </BaseSheet>

      {/* --- Dialog: Edit --- */}
      <BaseSheet
        open={editSheetOpen}
        onOpenChange={(open) => { setEditSheetOpen(open); if (!open) setEditingItem(null); }}
        title="Editar"
        description="Gestiona la información y metadatos del archivo."
        footer={(
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" className="text-xs rounded-xl" onClick={() => { setEditSheetOpen(false); setEditingItem(null); }}>Cancelar</Button>
            <Button className="text-xs rounded-xl px-6" onClick={handleSaveEdit} disabled={!editUrl || uploading !== null}>
              {uploading === "editing" ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      >
        <div className="space-y-6">
          {/* Visualizer */}
          {editUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border bg-black flex items-center justify-center mb-6 shadow-xl group">
              {getDriveEmbedUrl(editUrl) ? (
                <iframe src={getDriveEmbedUrl(editUrl)!} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
              ) : editingItem?.type === MEDIA_TYPE.STILL ? (
                <img
                  src={getAudioUrl(editUrl)}
                  className="max-h-full max-w-full object-contain"
                  alt="Preview"
                  onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=Error+Loading+Image" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/10 p-8">
                  <audio src={getAudioUrl(editUrl)} controls className="w-full" />
                </div>
              )}
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest">
                Vista Previa
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Título *</label>
                <Input placeholder="p. ej. Canto de ave" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-sm h-9 bg-background focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Etiqueta</label>
                <Input placeholder="main_audio, gallery..." value={editTag} onChange={(e) => setEditTag(e.target.value)} className="text-sm h-9 bg-background focus-visible:ring-primary/20" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descripción</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción detallada..."
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg py-5"
                onClick={() => setShowMetadataConfig(!showMetadataConfig)}
              >
                Ver Metadatos Avanzados
                <MoreVertical className={cn("h-4 w-4 transition-transform", showMetadataConfig && "rotate-90")} />
              </Button>

              {showMetadataConfig && (
                <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 pb-8">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creador</label>
                      <Input value={editCreator} onChange={(e) => setEditCreator(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Derechos</label>
                      <Input value={editRightsHolder} onChange={(e) => setEditRightsHolder(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Licencia</label>
                      <Input value={editLicense} onChange={(e) => setEditLicense(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado Registro</label>
                      <select
                        value={editRecordStatus}
                        onChange={(e) => setEditRecordStatus(e.target.value as any)}
                        className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                        <option value="deleted">Eliminado (Lógico)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipo de Multimedia</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as any)}
                        className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                      >
                        {Object.entries(MEDIA_TYPE).map(([key, val]) => (
                          <option key={key} value={val}>{key}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Formato (MIME)</label>
                      <Input value={editFormat} onChange={(e) => setEditFormat(e.target.value)} className="text-xs h-8 bg-background" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Público</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold">{editIsPublic ? 'SÍ' : 'NO'}</span>
                        <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      </div>
                    </div>
                  </div>

                  {/* GUANO Section - Only for Sound */}
                  {editType === MEDIA_TYPE.SOUND && (
                    <div className="pt-6 border-t mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Metadatos GUANO</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          "GUANO|Version", "Make", "Model", "Serial", "Firmware Version",
                          "Timestamp", "Loc Position", "Loc Elevation", "Length",
                          "Samplerate", "TE", "Filter HP", "Species Manual ID",
                          "Species Auto ID", "Note"
                        ].map((key) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{key}</label>
                            {key === "Note" ? (
                              <Textarea
                                value={editGuanoMetadata[key] || ""}
                                placeholder={`Valor de ${key}...`}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditGuanoMetadata(prev => ({ ...prev, [key]: val }));
                                }}
                                className="text-xs min-h-[80px] bg-background/50 focus:bg-background border-dashed"
                              />
                            ) : (
                              <Input
                                value={editGuanoMetadata[key] || ""}
                                placeholder={`Valor de ${key}...`}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditGuanoMetadata(prev => ({ ...prev, [key]: val }));
                                }}
                                className="text-xs h-8 bg-background/50 focus:bg-background border-dashed"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t mt-4">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Archivo Original</p>
                    <p className="text-[10px] font-mono bg-muted/30 p-2 rounded break-all border">{editingItem?.originalFilename || "Desconocido"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </BaseSheet>

      {/* --- Dialog: Local Upload --- */}
      <BaseSheet
        open={uploadSheetOpen}
        onOpenChange={(open) => { if (!uploading) { setUploadSheetOpen(open); if (!open) setSelectedFiles([]); } }}
        title="Subida de Archivos"
        description="Sube y gestiona multimedia para esta ocurrencia."
        footer={(
          <div className="flex items-center justify-between w-full">
            <div className="hidden sm:block">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">Tamaño total:</p>
              <p className="text-xs font-bold">{(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs rounded-xl" disabled={!!uploading} onClick={() => { setUploadSheetOpen(false); setSelectedFiles([]); }}>
                Cancelar
              </Button>
              <Button className="text-xs rounded-xl px-8" disabled={selectedFiles.length === 0 || !!uploading} onClick={async () => {
                if (activeParentItemId) {
                  for (const file of selectedFiles) await uploadSpectrogramFile(file, activeParentItemId);
                } else {
                  await handleFileUpload(selectedFiles, activeUploadType!);
                }
                setSelectedFiles([]);
                setUploadSheetOpen(false);
              }}>
                {uploading ? "Subiendo..." : "Iniciar Carga"}
              </Button>
            </div>
          </div>
        )}
      >
        <div className="space-y-6">
          {/* Drop Zone with Grid Inside */}
          <div
            className={cn(
              "group relative border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center",
              isDragOver ? "border-primary bg-primary/10 ring-8 ring-primary/5" : "border-muted-foreground/20 hover:border-primary/40",
              uploading ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
              selectedFiles.length > 0 ? "p-4 justify-start" : "p-12"
            )}
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
            onClick={(e) => {
              if (uploading) return;
              // Only trigger if click is on the container, not on items
              if (e.target === e.currentTarget) document.getElementById("file-sheet-upload")?.click();
            }}
          >
            {selectedFiles.length === 0 ? (
              <>
                <Upload className={`h-8 w-8 mb-2 ${isDragOver ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                <h3 className="text-xs font-bold text-foreground text-center">Seleccionar archivos</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 text-center">Audios e Imágenes</p>
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                {selectedFiles.map((f, i) => {
                  const progress = uploadProgress[f.name];
                  const isUploading = progress !== undefined && progress < 100;
                  const isDone = progress === 100;
                  const isImage = f.type.startsWith("image/");
                  const thumbUrl = isImage ? URL.createObjectURL(f) : null;

                  return (
                    <div key={i} className="group/item relative aspect-square rounded-2xl border bg-card overflow-hidden shadow-sm">
                      {isImage ? (
                        <img src={thumbUrl!} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-muted/10 p-2">
                          <FileAudio className="h-6 w-6 text-primary/60 mb-1" />
                          <span className="text-[8px] font-bold text-muted-foreground truncate w-full text-center px-2">{f.name}</span>
                        </div>
                      )}

                      {(isUploading || isDone) && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1">
                          <div className="w-full bg-white/20 h-0.5 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${isDone ? "bg-green-500" : "bg-primary"}`} style={{ width: `${progress || 0}%` }} />
                          </div>
                        </div>
                      )}

                      {!uploading && (
                        <button
                          className="absolute top-1 right-1 p-1 bg-background/90 hover:bg-destructive hover:text-white text-muted-foreground rounded-lg border opacity-0 group-hover/item:opacity-100 transition-all"
                          onClick={(e) => { e.stopPropagation(); setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i)) }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {/* Add More Square */}
                {!uploading && (
                  <button
                    className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center transition-all group/add"
                    onClick={(e) => { e.stopPropagation(); document.getElementById("file-sheet-upload")?.click(); }}
                  >
                    <Plus className="h-6 w-6 text-muted-foreground/50 group-hover/add:text-primary group-hover/add:scale-110 transition-all" />
                    <span className="text-[9px] font-bold text-muted-foreground/50 mt-1 uppercase">Añadir</span>
                  </button>
                )}
              </div>
            )}

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

          {/* Batch Metadata Configuration */}
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg py-5"
              onClick={() => setShowBatchConfig(!showBatchConfig)}
            >
              Configurar Metadatos para la carga ({selectedFiles.length} archivos)
              <Settings2 className={cn("h-4 w-4 transition-transform", showBatchConfig && "rotate-90")} />
            </Button>

            {showBatchConfig && (
              <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 pb-8">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creador Común</label>
                    <Input value={batchCreator} onChange={(e) => setBatchCreator(e.target.value)} className="text-xs h-8 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Derechos</label>
                    <Input value={batchRightsHolder} onChange={(e) => setBatchRightsHolder(e.target.value)} className="text-xs h-8 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Licencia</label>
                    <Input value={batchLicense} onChange={(e) => setBatchLicense(e.target.value)} className="text-xs h-8 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado Inicial</label>
                    <select
                      value={batchRecordStatus}
                      onChange={(e) => setBatchRecordStatus(e.target.value as any)}
                      className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                    >
                      <option value="draft">Borrador (Recomendado)</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visibilidad Pública</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold">{batchIsPublic ? 'SÍ' : 'NO'}</span>
                      <input type="checkbox" checked={batchIsPublic} onChange={(e) => setBatchIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    </div>
                  </div>
                </div>

                {/* Batch GUANO Section - Only if uploading sound */}
                {activeUploadType === MEDIA_TYPE.SOUND && (
                  <div className="pt-6 border-t mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Metadatos GUANO Comunes</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        "GUANO|Version", "Make", "Model", "Serial", "Firmware Version",
                        "Timestamp", "Loc Position", "Loc Elevation", "Length",
                        "Samplerate", "TE", "Filter HP", "Species Manual ID",
                        "Species Auto ID", "Note"
                      ].map((key) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{key}</label>
                          {key === "Note" ? (
                            <Textarea
                              value={batchGuanoMetadata[key] || ""}
                              placeholder={`Valor de ${key}...`}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchGuanoMetadata(prev => ({ ...prev, [key]: val }));
                              }}
                              className="text-xs min-h-[80px] bg-background/50 focus:bg-background border-dashed"
                            />
                          ) : (
                            <Input
                              value={batchGuanoMetadata[key] || ""}
                              placeholder={`Valor de ${key}...`}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchGuanoMetadata(prev => ({ ...prev, [key]: val }));
                              }}
                              className="text-xs h-8 bg-background/50 focus:bg-background border-dashed"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </BaseSheet>

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

      {/* --- Premium Multimedia Viewer --- */}
      <MultimediaViewer
        isOpen={sliderOpen}
        items={sliderItems}
        initialIndex={sliderIndex}
        onClose={() => setSliderOpen(false)}
        location={location}
        onUpdate={async (updatedItem) => {
          const validatedData = multimediaSchema.parse(updatedItem);
          const resp = await updateMultimedia(updatedItem.id, validatedData as any);
          if (resp.error) {
            toast.error("Error al actualizar");
          } else {
            toast.success("Elemento actualizado correctamente");
            loadMultimedia();
          }
        }}
        onDelete={async (id) => {
          setItemToDelete({ id, isChild: false });
        }}
      />
    </div>
  );
}