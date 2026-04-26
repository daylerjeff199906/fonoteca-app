"use client"

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { occurrenceSchema, OccurrenceInput } from "@/lib/validations/fonoteca";
import { createOccurrence, updateOccurrence, getOccurrence } from "@/actions/occurrences";
import { getTaxa } from "@/actions/taxa";
import { getLocations } from "@/actions/locations";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Location, Taxon } from "@/types/fonoteca";
import { FileText, FolderTree, Calendar, Building, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaxonForm } from "@/components/dashboard/taxa/taxon-form";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export function OccurrenceForm({ id, redirectUrl, defaultEventId }: { id?: string, redirectUrl?: string, defaultEventId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [taxa, setTaxa] = useState<Taxon[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [openTaxon, setOpenTaxon] = useState(false);
  const [isTaxonFormOpen, setIsTaxonFormOpen] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<OccurrenceInput>({
    resolver: zodResolver(occurrenceSchema) as any,
    defaultValues: {
      basisOfRecord: "MachineObservation",
      institutionCode: "IIAP",
      collectionCode: "Fonoteca",
      identificationMethod: "Manual",
      verification_status: "pending",
      record_status: "draft",
      event_id: defaultEventId || undefined,
    }
  });

  useEffect(() => {
    getTaxa({ limit: 100 }).then(resp => setTaxa(resp.data));
    getLocations({ limit: 100 }).then(resp => setLocations(resp.data));

    if (id) {
      setLoading(true);
      getOccurrence(id).then((resp) => {
        setLoading(false);
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);

          if (resp.data.taxon) {
            setTaxa(prev => {
              if (!prev.find(t => t.id === resp.data.taxon?.id)) {
                return [resp.data.taxon as Taxon, ...prev];
              }
              return prev;
            });
          }

          if (resp.data.location) {
            setLocations(prev => {
              if (!prev.find(l => l.id === resp.data.location?.id)) {
                return [resp.data.location as Location, ...prev];
              }
              return prev;
            });
          }
        } else {
          toast.error(
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm">Error de carga</span>
              <span className="text-xs opacity-90">No se pudo cargar la ocurrencia.</span>
            </div>
          );
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: OccurrenceInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateOccurrence(id, data);
    } else {
      resp = await createOccurrence(data);
    }
    setLoading(false);

    if (resp.success) {
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Operación Exitosa</span>
          <span className="text-xs opacity-90">{id ? "La ocurrencia se actualizó correctamente." : "La ocurrencia se registró correctamente en el sistema."}</span>
        </div>
      );
      if (redirectUrl && resp.data?.id) {
        const finalUrl = redirectUrl.replace('[id]', resp.data.id);
        router.push(finalUrl);
      } else {
        router.push("/dashboard/occurrences");
      }
    } else {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Ocurrió un error</span>
          <span className="text-xs opacity-90">{typeof resp.error === "string" ? resp.error : "Falló la validación."}</span>
        </div>
      );
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-medium">Cargando detalles de la ocurrencia...</span>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
      {/* 1. Datos Básicos */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Datos Básicos</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Occurrence ID *</label>
            <Input {...register("occurrenceID")} placeholder="Ex: FON-001" className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.occurrenceID && <p className="text-[10px] text-red-500 mt-1">{errors.occurrenceID.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Basis of Record *</label>
            <Input {...register("basisOfRecord")} className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.basisOfRecord && <p className="text-[10px] text-red-500 mt-1">{errors.basisOfRecord.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Taxonomía y Ubicación */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <FolderTree className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Taxonomía y Ubicación</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Taxón *</label>
            <Controller
              control={control}
              name="taxon_id"
              render={({ field }) => (
                <Popover open={openTaxon} onOpenChange={setOpenTaxon}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span className="truncate">
                        {field.value
                          ? (() => {
                            const t = taxa.find((t) => t.id === field.value);
                            return t ? `${t.scientificName} (${t.vernacularName || "-"})` : "Seleccionar Taxón...";
                          })()
                          : "Seleccionar Taxón..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar taxón..." />
                      <CommandList>
                        <CommandEmpty>No se encontró taxón.</CommandEmpty>
                        <CommandGroup>
                          {taxa.map((t) => (
                            <CommandItem
                              key={t.id}
                              value={`${t.scientificName} ${t.vernacularName || ""}`}
                              onSelect={() => {
                                field.onChange(t.id);
                                setOpenTaxon(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  t.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {t.scientificName} ({t.vernacularName || "-"})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                      <div className="p-2 border-t border-muted/20">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full text-xs h-8 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-2"
                          onClick={() => {
                            setOpenTaxon(false);
                            setIsTaxonFormOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Crear Nuevo Taxón
                        </Button>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.taxon_id && <p className="text-[10px] text-red-500 mt-1">{errors.taxon_id.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Ubicación *</label>
            <select
              {...register("location_id")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
            >
              <option value="">Seleccionar Ubicación...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.locality} ({l.stateProvince || l.country})</option>
              ))}
            </select>
            {errors.location_id && <p className="text-[10px] text-red-500 mt-1">{errors.location_id.message}</p>}
          </div>
        </div>
      </div>

      {/* 3. Identificación y Verificación */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Check className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Identificación y Verificación</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Identificación</label>
            <Input {...register("identificationMethod")} className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Confianza (0-1)</label>
            <Input type="number" step="0.01" {...register("identificationConfidence")} className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>

          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Estado de Verificación</label>
            <Controller
              control={control}
              name="verification_status"
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "pending" && "border-amber-500 bg-amber-500/5")}>
                    <input type="radio" value="pending" checked={field.value === "pending"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-amber-600">Pendiente</span>
                    <span className="text-xs text-muted-foreground mt-1">Requiere revisión por un experto.</span>
                  </label>
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "verified" && "border-emerald-500 bg-emerald-500/5")}>
                    <input type="radio" value="verified" checked={field.value === "verified"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-emerald-600">Verificado</span>
                    <span className="text-xs text-muted-foreground mt-1">La identidad ha sido confirmada.</span>
                  </label>
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "rejected" && "border-red-500 bg-red-500/5")}>
                    <input type="radio" value="rejected" checked={field.value === "rejected"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-red-600">Rechazado</span>
                    <span className="text-xs text-muted-foreground mt-1">La identificación no es válida.</span>
                  </label>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* 4. Temporalidad y Monitoreo */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Monitoreo</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Registrado Por *</label>
            <Input {...register("recordedBy")} className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.recordedBy && <p className="text-[10px] text-red-500 mt-1">{errors.recordedBy.message}</p>}
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Identificado Por</label>
            <Input {...register("identifiedBy")} className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>
        </div>
      </div>

      {/* 5. Institución */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Building className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Institución y Colección</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Institución</label>
            <Input {...register("institutionCode")} className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.institutionCode && <p className="text-[10px] text-red-500 mt-1">{errors.institutionCode.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Colección</label>
            <Input {...register("collectionCode")} className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.collectionCode && <p className="text-[10px] text-red-500 mt-1">{errors.collectionCode.message}</p>}
          </div>
        </div>
      </div>

      {/* 6. Observaciones y Estado del Registro */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Descripción de Hábitat</label>
            <Textarea 
              {...register("occurrenceRemarks")} 
              placeholder="Describa el hábitat o detalles extra del avistamiento..." 
              className="bg-background focus-visible:ring-primary/20" 
            />
            {errors.occurrenceRemarks && <p className="text-[10px] text-red-500 mt-1">{errors.occurrenceRemarks.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Estado del Registro Público</label>
            <Controller
              control={control}
              name="record_status"
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "draft" && "border-amber-500 bg-amber-500/5")}>
                    <input type="radio" value="draft" checked={field.value === "draft"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-amber-600">Borrador</span>
                    <span className="text-xs text-muted-foreground mt-1">Oculto del portal público.</span>
                  </label>
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "published" && "border-emerald-500 bg-emerald-500/5")}>
                    <input type="radio" value="published" checked={field.value === "published"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-emerald-600">Publicado</span>
                    <span className="text-xs text-muted-foreground mt-1">Visible para todos en la web.</span>
                  </label>
                  <label className={cn("relative flex cursor-pointer flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors", field.value === "deleted" && "border-red-500 bg-red-500/5")}>
                    <input type="radio" value="deleted" checked={field.value === "deleted"} onChange={field.onChange} className="sr-only" />
                    <span className="text-sm font-bold text-red-600">Eliminado</span>
                    <span className="text-xs text-muted-foreground mt-1">Archivado, no disponible.</span>
                  </label>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <FormFooter>
        <Button variant="outline" type="button" asChild>
          <Link href="/dashboard/occurrences">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
        </Button>
      </FormFooter>
    </form>

    <Sheet open={isTaxonFormOpen} onOpenChange={setIsTaxonFormOpen}>
      <SheetContent className="overflow-y-auto md:min-w-[60vw] max-w-5xl">
        <SheetHeader className="pb-0">
          <SheetTitle>Registrar Taxón</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4 min-w-5xl">
          <TaxonForm 
            id={null} 
            onSuccess={async (newTaxonId) => {
              setIsTaxonFormOpen(false);
              // Refresh taxa list
              const taxaResp = await getTaxa({ limit: 100 });
              if (taxaResp.data) {
                setTaxa(taxaResp.data);
                // Select the new taxon if ID is provided
                if (newTaxonId) {
                  control._defaultValues.taxon_id = newTaxonId; // For react-hook-form to recognize it
                  reset({ ...control._formValues, taxon_id: newTaxonId } as any);
                }
              }
            }} 
          />
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
