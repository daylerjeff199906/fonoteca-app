"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassInput } from "@/lib/validations/fonoteca";
import { createClass, updateClass } from "@/actions/classes";
import { uploadToR2 } from "@/actions/multimedia";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { ImageIcon, Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      kingdom: "Animalia",
      phylum: "Chordata",
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
      // Path structure: classes/className_timestamp.ext
      const className = watch("name") || "unnamed";
      const sanitizedName = className.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const path = `classes/${sanitizedName}_${Date.now()}.${file.name.split('.').pop()}`;
      formData.append("path", path);

      const resp = await uploadToR2(formData);
      if (resp.success && resp.url) {
        setValue("image_url", resp.url);
        toast.success("Imagen subida correctamente");
      } else {
        toast.error("Error al subir imagen: " + resp.error);
      }
    } catch (err) {
      toast.error("Error en la subida");
    } finally {
      setUploading(false);
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
      toast.success(id ? "Clase actualizada" : "Clase registrada");
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error("Error al guardar la clase");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Taxonomy */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Reino *</label>
            <Input {...register("kingdom")} className="bg-background" />
            {errors.kingdom && <p className="text-xs text-red-500">{errors.kingdom.message}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Filo</label>
            <Input {...register("phylum")} className="bg-background" />
            {errors.phylum && <p className="text-xs text-red-500">{errors.phylum.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre Científico (Clase) *</label>
            <Input {...register("name")} className="bg-background" placeholder="Ej: Mammalia" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
        </div>

        {/* Presentation & UI */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre Común / Etiqueta</label>
            <Input {...register("label_name")} className="bg-background" placeholder="Ej: Mamíferos" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Icono (Lucide / Emoji)</label>
            <Input {...register("icon")} className="bg-background" placeholder="Ej: bird, dog, waves..." />
          </div>

          {/* Image URL / Upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Imagen representativa</label>
              <div className="flex bg-muted rounded-md p-0.5">
                <Button 
                  type="button" 
                  variant={imageMode === "url" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setImageMode("url")}
                >
                  <LinkIcon className="h-3 w-3 mr-1" /> URL
                </Button>
                <Button 
                  type="button" 
                  variant={imageMode === "upload" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setImageMode("upload")}
                >
                  <Upload className="h-3 w-3 mr-1" /> Subir
                </Button>
              </div>
            </div>

            <div className="relative group">
              {imageMode === "url" ? (
                <Input {...register("image_url")} className="bg-background" placeholder="https://..." />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className={cn(
                    "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors",
                    uploading ? "opacity-50" : "hover:bg-muted/50 cursor-pointer"
                  )}>
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground text-center">Click para seleccionar archivo</span>
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
                  {imageUrl && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-1 rounded overflow-hidden">
                      <span className="truncate flex-1">{imageUrl}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setValue("image_url", "")}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {imageUrl && (
              <div className="mt-2 relative h-32 w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setValue("image_url", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormFooter variant="sticky">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Clase"}
        </Button>
      </FormFooter>
    </form>
  );
}
