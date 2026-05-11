"use client"

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { multimediaSchema, MultimediaInput } from "@/lib/validations/fonoteca";
import { createMultimedia, updateMultimedia, getMultimedia } from "@/actions/multimedia";
import { getOccurrences } from "@/actions/occurrences";
import { searchProfiles } from "@/actions/users";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Occurrence, MEDIA_TYPE, MEDIA_TAG } from "@/types/fonoteca";
import { FileAudio, FileText, Settings2, Info, Check, Globe, Shield, Music, ImageIcon, Film, Loader2, ChevronDown, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function MultimediaForm({ id, redirectUrl, defaultOccurrenceId }: { id?: string, redirectUrl?: string, defaultOccurrenceId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [userResults, setUserResults] = useState<{ id: string, first_name: string, last_name: string, email: string }[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const debouncedCreatorSearch = useDebounce(creatorSearch, 400);
  const [openCreator, setOpenCreator] = useState(false);

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<MultimediaInput>({
    resolver: zodResolver(multimediaSchema) as any,
    defaultValues: {
      type: "Sound",
      format: "audio/wav",
      rightsHolder: "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
      license: "http://creativecommons.org/licenses/by-nc/4.0/",
      order_index: 0,
      record_status: "draft",
      is_public: true,
      guano_metadata: {},
      occurrence_id: defaultOccurrenceId || undefined,
    }
  });

  const mediaType = watch("type");

  // Auto-set tag and format when type changes
  useEffect(() => {
    if (!id) { // Only for new records
      if (mediaType === MEDIA_TYPE.SOUND) {
        reset((prev) => ({ ...prev, tag: MEDIA_TAG.MAIN_AUDIO, format: "audio/wav" }));
      } else if (mediaType === MEDIA_TYPE.STILL) {
        reset((prev) => ({ ...prev, tag: MEDIA_TAG.GALLERY, format: "image/jpeg" }));
      } else if (mediaType === MEDIA_TYPE.VIDEO) {
        reset((prev) => ({ ...prev, tag: MEDIA_TAG.GALLERY, format: "video/mp4" }));
      }
    }
  }, [mediaType, id, reset]);

  useEffect(() => {
    getOccurrences({ limit: 100 }).then(resp => setOccurrences(resp.data));

    if (id) {
      setIsFetching(true);
      getMultimedia(id).then((resp) => {
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          showToast.error("Error de Carga", "No se pudo recuperar la información del archivo multimedia.");
        }
      });
    }
  }, [id, reset]);

  // User Fetch on Search
  useEffect(() => {
    if (!debouncedCreatorSearch || debouncedCreatorSearch.length < 2) {
      setUserResults([]);
      return;
    }
    setIsUserLoading(true);
    searchProfiles(debouncedCreatorSearch).then(resp => {
      setUserResults(resp.data);
      setIsUserLoading(false);
    });
  }, [debouncedCreatorSearch]);

  const onSubmit = async (data: MultimediaInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateMultimedia(id, data);
    } else {
      resp = await createMultimedia(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Multimedia actualizada correctamente." : "Multimedia registrada correctamente.");
      if (redirectUrl && resp.data?.id) {
        const finalUrl = redirectUrl.replace('[id]', resp.data.id);
        router.push(finalUrl);
      } else {
        router.push("/dashboard/occurrences/" + data.occurrence_id);
      }
    } else {
      showToast.error("Error", (typeof resp.error === "string" ? resp.error : "Hubo un fallo al procesar los datos multimedia."));
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-medium">Cargando detalles multimedia...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* 1. Datos del Archivo y Asociación */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <FileAudio className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Asociación y Archivo</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Ocurrencia Relacionada *</label>
            <select
              {...register("occurrence_id")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
            >
              <option value="">Seleccionar Ocurrencia...</option>
              {occurrences.map(oc => (
                <option key={oc.id} value={oc.id}>{oc.occurrenceID} ({oc.taxon?.scientificName || "Desconocido"})</option>
              ))}
            </select>
            {errors.occurrence_id && <p className="text-[10px] text-red-500 mt-1">{errors.occurrence_id.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Identificador / URL del Archivo *</label>
            <Input {...register("identifier")} placeholder="https://..." className="h-9" />
            {errors.identifier && <p className="text-[10px] text-red-500 mt-1">{errors.identifier.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre de Archivo Original</label>
            <Input {...register("originalFilename")} placeholder="recording_001.wav" className="h-9" />
          </div>

          <input type="hidden" {...register("tag")} />
        </div>
      </div>

      {/* 2. Metadatos Generales */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Información General</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Título de la Multimedia</label>
            <Input {...register("title")} placeholder="Canto de ave en amanecer..." className="h-9" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Creador / Autor *</label>
            <Controller
              control={control}
              name="creator"
              render={({ field }) => (
                <Popover open={openCreator} onOpenChange={setOpenCreator}>
                  <PopoverTrigger asChild>
                    <div className="relative group">
                      <Input 
                        {...field} 
                        placeholder="Nombre del autor..."
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setCreatorSearch(e.target.value);
                          if (!e.target.value) setValue("creator_id", null);
                        }}
                        onFocus={() => setOpenCreator(true)}
                        className="bg-background h-9 focus-visible:ring-primary/20 pr-8" 
                      />
                      {field.value && (
                        <button 
                          type="button"
                          onClick={() => {
                            field.onChange("");
                            setValue("creator_id", null);
                            setCreatorSearch("");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </PopoverTrigger>
                  {userResults.length > 0 && (
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                      <Command>
                        <CommandList>
                          <CommandGroup heading="Sugerencias de la Intranet">
                            {userResults.map((u) => (
                              <CommandItem
                                key={u.id}
                                value={u.id}
                                onSelect={() => {
                                  const fullName = `${u.first_name} ${u.last_name}`;
                                  field.onChange(fullName);
                                  setValue("creator_id", u.id);
                                  setOpenCreator(false);
                                }}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-sm">{u.first_name} {u.last_name}</span>
                                  <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  )}
                </Popover>
              )}
            />
            {errors.creator && <p className="text-[10px] text-red-500 mt-1">{errors.creator.message}</p>}
            {watch("creator_id") && (
              <div className="flex items-center gap-1.5 mt-1 px-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Vinculado a Intranet</span>
              </div>
            )}
          </div>

          <input type="hidden" {...register("type")} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Formato (MIME Type) *</label>
            <Input {...register("format")} placeholder="audio/wav, image/jpeg..." className="h-9" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Orden de Visualización</label>
            <Input type="number" {...register("order_index")} className="h-9" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Descripción</label>
            <Textarea {...register("description")} placeholder="Detalles adicionales sobre el contenido del archivo..." />
          </div>
        </div>
      </div>
      {/* 2.5 Bioacústica Avanzada (Solo para Audio) */}
      {mediaType === MEDIA_TYPE.SOUND && (
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <Music className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Detalles de Bioacústica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Vocalización</label>
              <Input {...register("vocalization_type")} placeholder="Ej: Canto de anuncio, Alarma, Contacto" className="h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Especies de Fondo</label>
              <Input {...register("background_species")} placeholder="Especies que se escuchan al fondo..." className="h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Duración (Segundos)</label>
              <Input type="number" step="0.01" {...register("duration_seconds")} placeholder="0.00" className="h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Tamaño del Archivo (Bytes)</label>
              <Input type="number" {...register("file_size_bytes")} placeholder="Peso en bytes..." className="h-9" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Metadatos GUANO (Solo para Audio) */}
      {mediaType === "Sound" && (
        <div className="space-y-4 bg-card border rounded-lg p-5 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
            <Settings2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Metadatos GUANO (Parámetros técnicos del grabador)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[
              { label: "Marca (Make - Fabricante del grabador)", key: "Make" },
              { label: "Modelo (Model - Nombre del equipo)", key: "Model" },
              { label: "Serie (Serial - Número único del dispositivo)", key: "Serial" },
              { label: "Filtro HP (Filter HP - Paso alto en Hz)", key: "Filter HP" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{field.label}</label>
                <Input
                  {...register(`guano_metadata.${field.key}` as any)}
                  className="h-8 text-xs bg-background/80"
                  placeholder="N/A"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Note / Observaciones GUANO</label>
              <Textarea
                {...register("guano_metadata.Note" as any)}
                className="text-xs bg-background/80"
                placeholder="Notas técnicas de la grabación..."
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Derechos y Visibilidad */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Derechos y Estado</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Titular de Derechos</label>
            <Input {...register("rightsHolder")} className="h-9" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Licencia</label>
            <Input {...register("license")} className="h-9" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Estado del Registro</label>
            <Controller
              control={control}
              name="record_status"
              render={({ field }) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === "draft" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => field.onChange("draft")}
                  >
                    Borrador
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "published" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => field.onChange("published")}
                  >
                    Publicado
                  </Button>
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Controller
              control={control}
              name="is_public"
              render={({ field }) => (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors w-full",
                    field.value ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/30 text-muted-foreground"
                  )}
                  onClick={() => field.onChange(!field.value)}
                >
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center", field.value ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30")}>
                    {field.value && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-xs font-bold uppercase">Acceso Público</span>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <FormFooter>
        <Button variant="outline" type="button" asChild>
          <Link href={id ? `/dashboard/occurrences/${watch("occurrence_id")}` : "/dashboard/multimedia"}>
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? "Guardando..." : id ? "Actualizar Multimedia" : "Registrar Multimedia"}
        </Button>
      </FormFooter>
    </form>
  );
}
