"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassInput } from "@/lib/validations/fonoteca";
import { createClass, updateClass } from "@/actions/classes";
import { uploadToR2, deleteFileFromR2 } from "@/actions/multimedia";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getBackendMessage, showToast } from "@/lib/toast";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { ImageIcon, Upload, Link as LinkIcon, X, Loader2, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TAXON_KINGDOM, TAXON_PHYLUM } from "@/types/fonoteca";

export function ClassForm({
  id,
  defaultValues,
  onSuccess,
}: {
  id: string | null;
  defaultValues?: Partial<ClassInput>;
  onSuccess?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ClassInput>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: defaultValues || {
      kingdom: TAXON_KINGDOM.ANIMALIA,
      phylum: TAXON_PHYLUM.CHORDATA,
      name: "",
      label_name: "",
      icon: "",
      image_url: ""
    }
  });

  const imageUrl = watch("image_url");

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      if (defaultValues.image_url) {
        setImageMode("url");
      }
    }
  }, [defaultValues, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const className = watch("name") || "unnamed";
      formData.append(
        "metadata",
        JSON.stringify({
          class_name: className,
          source: "class_form",
        })
      );

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setValue("image_url", data.url);

        // If we are editing, update the DB immediately
        if (id) {
          const currentData = watch();
          const updateResp = await updateClass(id, { ...currentData, image_url: data.url });
          if (updateResp.success) {
            showToast.success("Imagen actualizada", "La imagen y los datos de la clase se guardaron correctamente.");
          } else {
            showToast.warning("Imagen subida", getBackendMessage(updateResp.error, "No se pudo actualizar los datos de la clase."));
          }
        } else {
          showToast.success("Imagen subida", "La imagen se adjuntará al guardar la clase.");
        }
      } else {
        showToast.error("No se pudo subir la imagen", data.detail || "El servidor no pudo procesar el archivo.");
      }
    } catch (err) {
      showToast.error("No se pudo subir la imagen", "Ocurrió un error inesperado durante la subida.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!imageUrl) return;

    const confirmDelete = confirm("¿Estás seguro de eliminar esta imagen del servidor permanentemente?");
    if (!confirmDelete) return;

    setUploading(true);
    try {
      if (imageUrl.includes("/api/files/")) {
        const fileId = imageUrl.split("/api/files/").pop()?.split("?")[0]?.split("/")[0];
        if (fileId) {
          await fetch(`/api/files/${fileId}`, { method: "DELETE" });
        }
      }
    } catch (err) {
      console.error("Error removing image file:", err);
    } finally {
      setUploading(false);
    }

    setValue("image_url", "");

    if (id) {
      const currentData = watch();
      await updateClass(id, { ...currentData, image_url: "" });
      showToast.success("Imagen removida", "Se ha quitado la imagen de la clase.");
    }
  };

  const onSubmit = async (data: ClassInput) => {
    let resp;
    if (id) {
      resp = await updateClass(id, data);
    } else {
      resp = await createClass(data);
    }

    if (resp.success) {
      showToast.response(resp, id ? "Clase actualizada" : "Clase registrada", id ? "Los cambios se guardaron correctamente." : "La clase fue registrada correctamente.");
      reset();
      if (onSuccess) onSuccess();
    } else {
      showToast.response(resp, "", "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col w-full max-w-2xl mx-auto">
      {/* Taxonomy Section */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50 w-full">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <Info className="h-3 w-3" /> Datos Taxonómicos
        </h3>
        
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Reino *</Label>
            <select
              {...register("kingdom")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {Object.entries(TAXON_KINGDOM).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
            {errors.kingdom && <p className="text-[10px] text-red-500">{errors.kingdom.message}</p>}
          </div>
          
          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Filo</Label>
            <select
              {...register("phylum")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Ninguno</option>
              {Object.entries(TAXON_PHYLUM).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
            {errors.phylum && <p className="text-[10px] text-red-500">{errors.phylum.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Científico (Clase) *</Label>
            <Input {...register("name")} className="bg-background h-9 w-full" placeholder="Ej: Mammalia" />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
          </div>
        </div>
      </div>

      {/* Presentation Section */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50 w-full">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="h-3 w-3" /> Presentación y UI
        </h3>

        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Común / Etiqueta</Label>
            <Input {...register("label_name")} className="bg-background h-9 w-full" placeholder="Ej: Mamíferos" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Icono (Lucide / Emoji)</Label>
            <Input {...register("icon")} className="bg-background h-9 w-full" placeholder="Ej: bird, dog, waves..." />
          </div>

          {/* Image URL / Upload with Switch-like UI */}
          <div className="flex flex-col gap-3 pt-2 w-full">
            <div className="flex items-center justify-between bg-background border rounded-lg p-2 w-full">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Modo de Imagen</span>
                <span className="text-xs text-foreground/70">{imageMode === 'url' ? 'Vínculo Externo' : 'Subida Directa'}</span>
              </div>
              <div className="flex items-center bg-muted p-1 rounded-full border shadow-inner">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    imageMode === "url" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LinkIcon className="h-3 w-3" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    imageMode === "upload" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Upload className="h-3 w-3" /> SUBIR
                </button>
              </div>
            </div>

            <div className="relative w-full">
              {imageMode === "url" ? (
                <div className="space-y-1.5 w-full">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">URL de la Imagen</Label>
                  <Input {...register("image_url")} className="bg-background h-9 w-full" placeholder="https://..." />
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Archivo de Imagen</Label>
                  <div className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all bg-background w-full",
                    uploading ? "opacity-50" : "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  )}>
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Seleccionar archivo</span>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleFileUpload}
                          accept="image/*"
                          disabled={uploading}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {imageUrl && (
              <div className="mt-2 relative group rounded-xl border overflow-hidden bg-background ring-1 ring-border shadow-sm w-full">
                <div className="aspect-video w-full flex items-center justify-center bg-muted/20">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm" 
                    className="h-8 gap-2 px-4 shadow-lg"
                    onClick={removeImage}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar Imagen
                  </Button>
                </div>
                <div className="bg-background px-2 py-1 border-t text-[9px] text-muted-foreground truncate w-full">
                  {imageUrl}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormFooter variant="sticky" className="pt-4 border-t mt-6 bg-background/80 backdrop-blur-sm w-full">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()} className="h-9 px-6">Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || uploading} className="h-9 px-8 shadow-lg shadow-primary/20">
          {isSubmitting ? "Guardando..." : id ? "Actualizar Clase" : "Registrar Clase"}
        </Button>
      </FormFooter>
    </form>
  );
}
