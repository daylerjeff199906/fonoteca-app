"use client"

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { occurrenceSchema, OccurrenceInput } from "@/lib/validations/fonoteca";
import { createOccurrence, updateOccurrence, getOccurrence } from "@/actions/occurrences";
import { getTaxa } from "@/actions/taxa";
import { getLocations } from "@/actions/locations";
import { getInstitutions } from "@/actions/institutions";
import { getCollections } from "@/actions/collections";
import { Input } from "@/components/ui/input";


import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Location, Taxon, Institution, Collection, BASIS_OF_RECORD_LABELS } from "@/types/fonoteca";
import { FileText, Calendar, Building, Check, ChevronsUpDown, Plus, ChevronRight } from "lucide-react";



import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaxonForm } from "@/components/dashboard/taxa/taxon-form";
import { InstitutionForm } from "@/components/dashboard/geography/institutions/institution-form";
import { CollectionForm } from "@/components/dashboard/geography/institutions/collection-form";
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
import { Skeleton } from "@/components/ui/skeleton";

export function OccurrenceForm({ id, redirectUrl, defaultEventId }: { id?: string, redirectUrl?: string, defaultEventId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [taxa, setTaxa] = useState<Taxon[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);

  const [openTaxon, setOpenTaxon] = useState(false);
  const [openInstitution, setOpenInstitution] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);

  const [isTaxonFormOpen, setIsTaxonFormOpen] = useState(false);
  const [isInstitutionFormOpen, setIsInstitutionFormOpen] = useState(false);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);



  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<OccurrenceInput>({
    resolver: zodResolver(occurrenceSchema) as any,
    defaultValues: {
      basisOfRecord: "MachineObservation",
      identificationMethod: "Manual",

      verification_status: "pending",
      record_status: "draft",
      event_id: defaultEventId || undefined,
    }
  });

  useEffect(() => {
    getTaxa({ limit: 100 }).then(resp => setTaxa(resp.data));
    getLocations({ limit: 100 }).then(resp => setLocations(resp.data));
    getInstitutions({ limit: 100 }).then(resp => setInstitutions(resp.data));
    getCollections({ limit: 100 }).then(resp => setCollections(resp.data));



    if (id) {
      setLoading(true);
      getOccurrence(id).then((resp) => {
        setLoading(false);
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);

          if (resp.data.collection) {
            setSelectedInstitutionId(resp.data.collection.institution_id);
            setCollections(prev => {
              if (!prev.find(c => c.id === resp.data.collection?.id)) {
                return [resp.data.collection as Collection, ...prev];
              }
              return prev;
            });
          }


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
          showToast.error("Error de carga", "No se pudo cargar la ocurrencia solicitada.");
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
      showToast.success("Operación Exitosa", id ? "La ocurrencia se actualizó correctamente." : "La ocurrencia se registró correctamente en el sistema.");
      if (redirectUrl && resp.data?.id) {
        const finalUrl = redirectUrl.replace('[id]', resp.data.id);
        router.push(finalUrl);
      } else {
        router.push("/dashboard/occurrences");
      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "Falló la validación o el registro de la ocurrencia.");
    }
  };

  const selectedCollectionId = watch("collection_id");
  const filteredCollections = selectedInstitutionId
    ? collections.filter(c => c.institution_id === selectedInstitutionId)
    : [];



  if (isFetching) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
        {/* 1. Detalles Principales */}
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Detalles de la Ocurrencia</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Occurrence ID *</label>
              <Input {...register("occurrenceID")} placeholder="Ex: FON-001" className="bg-background h-9 focus-visible:ring-primary/20" />
              {errors.occurrenceID && <p className="text-[10px] text-red-500 mt-1">{errors.occurrenceID.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Basis of Record *</label>
              <select
                {...register("basisOfRecord")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                {Object.entries(BASIS_OF_RECORD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.basisOfRecord && <p className="text-[10px] text-red-500 mt-1">{errors.basisOfRecord.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Fecha de la Ocurrencia
              </label>
              <Input type="date" {...register("occurrence_date")} className="bg-background h-9 focus-visible:ring-primary/20" />
              {errors.occurrence_date && <p className="text-[10px] text-red-500 mt-1">{errors.occurrence_date.message}</p>}
            </div>

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
                              return t ? t.scientificName : "Seleccionar Taxón...";
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
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/90 font-semibold tracking-tight">
                                    <span>{t.genus?.family?.order_obj?.class_obj?.name}</span>
                                    <ChevronRight className="h-1.5 w-1.5 opacity-40" />
                                    <span>{t.genus?.family?.order_obj?.name}</span>
                                    <ChevronRight className="h-1.5 w-1.5 opacity-40" />
                                    <span>{t.genus?.family?.name}</span>
                                    <ChevronRight className="h-1.5 w-1.5 opacity-40" />
                                    <span>{t.genus?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm italic text-foreground leading-none">
                                      {t.scientificName}
                                    </span>

                                    <span className="text-[10px] text-muted-foreground">({t.vernacularName || "-"})</span>
                                  </div>
                                </div>

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
                            Registrar Nueva Taxonomía
                          </Button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {watch("taxon_id") && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-medium mt-1 px-1 overflow-hidden truncate">
                  {(() => {
                    const t = taxa.find(t => t.id === watch("taxon_id"));
                    if (!t) return null;
                    return (
                      <>
                        <span className="shrink-0">{t.genus?.family?.order_obj?.class_obj?.kingdom}</span>
                        <ChevronRight className="h-2 w-2 opacity-30 shrink-0" />
                        <span className="shrink-0">{t.genus?.family?.order_obj?.class_obj?.name}</span>
                        <ChevronRight className="h-2 w-2 opacity-30 shrink-0" />
                        <span className="shrink-0">{t.genus?.family?.order_obj?.name}</span>
                        <ChevronRight className="h-2 w-2 opacity-30 shrink-0" />
                        <span className="shrink-0">{t.genus?.family?.name}</span>
                      </>
                    )
                  })()}
                </div>
              )}

              {errors.taxon_id && <p className="text-[10px] text-red-500 mt-1">{errors.taxon_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
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

        {/* 5. Afiliación e Institución */}
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <Building className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Afiliación Institucional</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            {/* Institución */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Afiliación (Institución) *</label>
              <Popover open={openInstitution} onOpenChange={setOpenInstitution}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-normal h-10",
                      !selectedInstitutionId && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedInstitutionId
                        ? institutions.find(inst => inst.id === selectedInstitutionId)?.name || "Institución seleccionada"
                        : "Seleccionar Institución..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar institución..." />
                    <CommandList>
                      <CommandEmpty>No se encontró la institución.</CommandEmpty>
                      <CommandGroup>
                        {institutions.map((inst) => (
                          <CommandItem
                            key={inst.id}
                            value={inst.name}
                            onSelect={() => {
                              setSelectedInstitutionId(inst.id);
                              setValue("collection_id", null); // Reset collection when institution changes
                              setOpenInstitution(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{inst.name}</span>
                              <span className="text-[10px] text-muted-foreground">{inst.code}</span>
                            </div>
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
                          setOpenInstitution(false);
                          setIsInstitutionFormOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Registrar Nueva Institución
                      </Button>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Colección */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Colección Biológica (Code) *</label>
              <Controller
                control={control}
                name="collection_id"
                render={({ field }) => (
                  <Popover open={openCollection} onOpenChange={setOpenCollection}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedInstitutionId}
                        className={cn(
                          "w-full justify-between font-normal h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {field.value
                            ? collections.find(c => c.id === field.value)?.name || "Colección seleccionada"
                            : selectedInstitutionId ? "Seleccionar Colección..." : "Primero seleccione institución"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar colección..." />
                        <CommandList>
                          <CommandEmpty>
                            Sin resultados
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredCollections.map((col) => (
                              <CommandItem
                                key={col.id}
                                value={col.name}
                                onSelect={() => {
                                  field.onChange(col.id);
                                  setOpenCollection(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{col.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{col.code}</span>
                                </div>
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
                              setOpenCollection(false);
                              setIsCollectionFormOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Colección
                          </Button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.collection_id && <p className="text-[10px] text-red-500 mt-1">{errors.collection_id.message}</p>}
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
        <SheetContent className="overflow-y-auto sm:max-w-[600px] md:max-w-[800px] min-w-[40vw]">
          <SheetHeader className="pb-0">
            <SheetTitle>Registrar Taxón</SheetTitle>
          </SheetHeader>
          <div className="py-6 px-1">
            <TaxonForm
              id={null}
              onSuccess={async (newId) => {
                const resp = await getTaxa({ limit: 100 });
                setTaxa(resp.data);
                if (newId) {
                  setValue("taxon_id", newId);
                }
                setIsTaxonFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isInstitutionFormOpen} onOpenChange={setIsInstitutionFormOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px] md:max-w-[800px] min-w-[45vw]">
          <SheetHeader className="pb-0">
            <SheetTitle>Registrar Nueva Institución</SheetTitle>
          </SheetHeader>
          <div className="py-6 px-1">
            <InstitutionForm
              footerVariant="sticky"
              onCancel={() => setIsInstitutionFormOpen(false)}
              onSuccess={async (newInst) => {
                const resp = await getInstitutions({ limit: 100 });
                setInstitutions(resp.data);
                setSelectedInstitutionId(newInst.id);
                setValue("collection_id", null);
                setIsInstitutionFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isCollectionFormOpen} onOpenChange={setIsCollectionFormOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px] md:max-w-[800px] min-w-[40vw]">
          <SheetHeader className="pb-0">
            <SheetTitle>Registrar Nueva Colección</SheetTitle>
          </SheetHeader>
          <div className="py-6 px-1">
            <CollectionForm
              defaultInstitutionId={selectedInstitutionId || undefined}
              onCancel={() => setIsCollectionFormOpen(false)}
              onSuccess={async (newCol) => {
                const resp = await getCollections({ limit: 100 });
                setCollections(resp.data);
                setValue("collection_id", newCol.id);
                setSelectedInstitutionId(newCol.institution_id);
                setIsCollectionFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

