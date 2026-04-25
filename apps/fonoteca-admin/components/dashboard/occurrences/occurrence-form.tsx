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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full max-w-7xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-medium">Cargando detalles de la ocurrencia...</span>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full max-w-7xl">
      {/* 1. Datos Básicos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Datos Básicos</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Occurrence ID *</label>
            </div>
            <div className="w-3/4">
              <Input {...register("occurrenceID")} placeholder="Ex: FON-001" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.occurrenceID && <p className="text-xs text-red-500 mt-1 px-2">{errors.occurrenceID.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Basis of Record *</label>
            </div>
            <div className="w-3/4">
              <Input {...register("basisOfRecord")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.basisOfRecord && <p className="text-xs text-red-500 mt-1 px-2">{errors.basisOfRecord.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Taxonomía y Ubicación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Taxonomía y Ubicación</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Taxón *</label>
            </div>
            <div className="w-full flex flex-col items-start gap-1 max-w-xl md:min-w-[74%]">
              <Controller
                control={control}
                name="taxon_id"
                render={({ field }) => (
                  <Popover open={openTaxon} onOpenChange={setOpenTaxon}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
              {errors.taxon_id && <p className="text-xs text-red-500 px-2">{errors.taxon_id.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Ubicación *</label>
            </div>
            <div className="w-3/4">
              <select
                {...register("location_id")}
                className="flex h-8 w-full max-w-xl rounded-md border-none bg-transparent px-2 text-sm shadow-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                <option value="">Seleccionar Ubicación...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.locality} ({l.stateProvince || l.country})</option>
                ))}
              </select>
              {errors.location_id && <p className="text-xs text-red-500 mt-1 px-2">{errors.location_id.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Identificación y Verificación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Identificación y Verificación</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Identificación</label>
            </div>
            <div className="w-3/4">
              <Input {...register("identificationMethod")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Confianza (0-1)</label>
            </div>
            <div className="w-3/4">
              <Input type="number" step="0.01" {...register("identificationConfidence")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Estado de Verificación</label>
            </div>
            <div className="w-3/4">
              <select
                {...register("verification_status")}
                className="flex h-8 w-full max-w-xl rounded-md border-none bg-transparent px-2 text-sm shadow-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                <option value="pending">Pendiente</option>
                <option value="verified">Verificado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Temporalidad y Monitoreo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Monitoreo</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Registrado Por *</label>
            </div>
            <div className="w-3/4">
              <Input {...register("recordedBy")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.recordedBy && <p className="text-xs text-red-500 mt-1 px-2">{errors.recordedBy.message}</p>}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Identificado Por</label>
            </div>
            <div className="w-3/4">
              <Input {...register("identifiedBy")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Institución */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Institución y Colección</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Institución</label>
            </div>
            <div className="w-3/4">
              <Input {...register("institutionCode")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.institutionCode && <p className="text-xs text-red-500 mt-1 px-2">{errors.institutionCode.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Colección</label>
            </div>
            <div className="w-3/4">
              <Input {...register("collectionCode")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.collectionCode && <p className="text-xs text-red-500 mt-1 px-2">{errors.collectionCode.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Estado del Registro */}
      <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="w-1/4 flex items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Observaciones</label>
          </div>
          <div className="w-3/4">
            <Input {...register("occurrenceRemarks")} placeholder="Detalles extra del avistamiento..." className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            {errors.occurrenceRemarks && <p className="text-xs text-red-500 mt-1 px-2">{errors.occurrenceRemarks.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="w-1/4 flex items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Estado del Registro</label>
          </div>
          <div className="w-3/4">
            <select
              {...register("record_status")}
              className="flex h-8 w-full max-w-xl rounded-md border-none bg-transparent px-2 text-sm shadow-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="deleted">Eliminado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-muted/20 mt-6">
        <Button variant="outline" type="button" asChild>
          <Link href="/dashboard/occurrences">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
        </Button>
      </div>
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
