"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassInput } from "@/lib/validations/fonoteca";
import { createClass, updateClass } from "@/actions/classes";
import { uploadToR2 } from "@/actions/multimedia";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { ImageIcon, Upload, Link as LinkIcon, X, Loader2, Info } from "lucide-react";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col max-w-2xl mx-auto">
      {/* Taxonomy Section */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <Info className="h-3 w-3" /> Datos Taxonómicos
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Reino *</Label>
            <Input {...register("kingdom")} className="bg-background h-9" />
            {errors.kingdom && <p className="text-[10px] text-red-500">{errors.kingdom.message}</p>}
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Filo</Label>
            <Input {...register("phylum")} className="bg-background h-9" />
            {errors.phylum && <p className="text-[10px] text-red-500">{errors.phylum.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Científico (Clase) *</Label>
            <Input {...register("name")} className="bg-background h-9" placeholder="Ej: Mammalia" />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
          </div>
        </div>
      </div>

      {/* Presentation Section */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="h-3 w-3" /> Presentación y UI
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Común / Etiqueta</Label>
            <Input {...register("label_name")} className="bg-background h-9" placeholder="Ej: Mamíferos" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Icono (Lucide / Emoji)</Label>
            <Input {...register("icon")} className="bg-background h-9" placeholder="Ej: bird, dog, waves..." />
          </div>

          {/* Image URL / Upload with Switch-like UI */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between bg-background border rounded-lg p-2">
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

            <div className="relative">
              {imageMode === "url" ? (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">URL de la Imagen</Label>
                  <Input {...register("image_url")} className="bg-background h-9" placeholder="https://..." />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Archivo de Imagen</Label>
                  <div className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all bg-background",
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
              <div className="mt-2 relative group rounded-xl border overflow-hidden bg-background ring-1 ring-border shadow-sm">
                <div className="aspect-video w-full flex items-center justify-center bg-muted/20">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm" 
                    className="h-8 gap-2"
                    onClick={() => setValue("image_url", "")}
                  >
                    <X className="h-4 w-4" /> Eliminar Imagen
                  </Button>
                </div>
                <div className="bg-background px-2 py-1 border-t text-[9px] text-muted-foreground truncate">
                  {imageUrl}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormFooter variant="sticky" className="pt-4 border-t mt-6 bg-background/80 backdrop-blur-sm">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()} className="h-9 px-6">Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || uploading} className="h-9 px-8 shadow-lg shadow-primary/20">
          {isSubmitting ? "Guardando..." : id ? "Actualizar Clase" : "Registrar Clase"}
        </Button>
      </FormFooter>
    </form>
  );
}
