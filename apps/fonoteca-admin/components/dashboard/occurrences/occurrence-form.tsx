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
import { getEcosystems } from "@/actions/ecosystems";
import { searchProfiles } from "@/actions/users";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";


import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Location, Taxon, Institution, Collection, BASIS_OF_RECORD_LABELS, Ecosystem } from "@/types/fonoteca";
import {
  FileText,
  Calendar,
  Building,
  Check,
  ChevronsUpDown,
  Plus,
  ChevronRight,
  Trees,
  Globe,
  Thermometer,
  Droplets,
  ArrowUp,
  Box,
  X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";



import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaxonForm } from "@/components/dashboard/taxa/taxon-form";
import { LocationForm } from "@/components/dashboard/locations/location-form";
import { InstitutionForm } from "@/components/dashboard/geography/institutions/institution-form";
import { CollectionForm } from "@/components/dashboard/geography/institutions/collection-form";
import { EcosystemForm } from "@/components/dashboard/geography/ecosystems/ecosystem-form";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { FormSection } from "@/components/panel-admin/form-section";


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
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [isInstitutionFormOpen, setIsInstitutionFormOpen] = useState(false);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [isEcosystemFormOpen, setIsEcosystemFormOpen] = useState(false);

  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([]);
  const [openEcosystem, setOpenEcosystem] = useState(false);

  // Taxon Search & Pagination
  const [taxonSearch, setTaxonSearch] = useState("");
  const [isTaxonLoading, setIsTaxonLoading] = useState(false);
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null);
  const debouncedTaxonSearch = useDebounce(taxonSearch, 400);

  // Location Search & Pagination
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [openLocation, setOpenLocation] = useState(false);
  const debouncedLocationSearch = useDebounce(locationSearch, 400);

  // User Search
  const [recordedBySearch, setRecordedBySearch] = useState("");
  const [identifiedBySearch, setIdentifiedBySearch] = useState("");
  const [userResults, setUserResults] = useState<{ id: string, first_name: string, last_name: string, email: string }[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const debouncedRecordedBySearch = useDebounce(recordedBySearch, 400);
  const debouncedIdentifiedBySearch = useDebounce(identifiedBySearch, 400);
  const [openRecordedBy, setOpenRecordedBy] = useState(false);
  const [openIdentifiedBy, setOpenIdentifiedBy] = useState(false);



  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<OccurrenceInput>({
    resolver: zodResolver(occurrenceSchema) as any,
    defaultValues: {
      basisOfRecord: "MachineObservation",
      identificationMethod: "Manual",
      verification_status: "pending",
      record_status: "draft",
      event_id: defaultEventId || undefined,
      has_cloud_voucher: false,
      preparations: "",
      disposition: "",
      individualCount: 1,
      dynamicProperties: "{}",
      dateIdentified: "",
      identificationRemarks: "",
      license: "",
      rightsHolder: "",
    }
  });

  useEffect(() => {
    getTaxa({ limit: 20 }).then(resp => setTaxa(resp.data));
    getLocations({ limit: 100 }).then(resp => setLocations(resp.data));
    getInstitutions({ limit: 100 }).then(resp => setInstitutions(resp.data));
    getCollections({ limit: 100 }).then(resp => setCollections(resp.data));
    getEcosystems({ limit: 100 }).then(resp => setEcosystems(resp.data));



    if (id) {
      setLoading(true);
      getOccurrence(id).then((resp) => {
        setLoading(false);
        setIsFetching(false);
        if (resp.data) {
          const loadedData = { ...resp.data } as any;
          if (loadedData.dynamicProperties && typeof loadedData.dynamicProperties === "object") {
            loadedData.dynamicProperties = JSON.stringify(loadedData.dynamicProperties, null, 2);
          } else {
            loadedData.dynamicProperties = "{}";
          }
          reset(loadedData);

          if (resp.data.collection) {
            setSelectedInstitutionId(resp.data.collection.institution_id);
            setCollections(prev => {
              if (!prev.find(c => c.id === resp.data.collection?.id)) {
                return [resp.data.collection as Collection, ...prev];
              }
              return prev;
            });
          }

          if (resp.data.institution_id) {
            setSelectedInstitutionId(resp.data.institution_id);
          }


          if (resp.data.taxon) {
            setSelectedTaxon(resp.data.taxon as Taxon);
            setTaxa(prev => {
              if (!prev.find(t => t.id === resp.data.taxon?.id)) {
                return [resp.data.taxon as Taxon, ...prev];
              }
              return prev;
            });
          }

          if (resp.data.location) {
            setSelectedLocation(resp.data.location as Location);
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

  // Location Fetch on Search
  useEffect(() => {
    setIsLocationLoading(true);
    getLocations({
      limit: 20,
      search: debouncedLocationSearch
    }).then(resp => {
      let newLocs = resp.data;
      if (selectedLocation && !newLocs.find(l => l.id === selectedLocation.id)) {
        newLocs = [selectedLocation, ...newLocs];
      }
      setLocations(newLocs);
      setIsLocationLoading(false);
    });
  }, [debouncedLocationSearch, selectedLocation]);

  // Taxon Fetch on Search
  useEffect(() => {
    setIsTaxonLoading(true);
    getTaxa({
      limit: 20,
      search: debouncedTaxonSearch
    }).then(resp => {
      let newTaxa = resp.data;
      // Preserve selected taxon in list if not present
      if (selectedTaxon && !newTaxa.find(t => t.id === selectedTaxon.id)) {
        newTaxa = [selectedTaxon, ...newTaxa];
      }
      setTaxa(newTaxa);
      setIsTaxonLoading(false);
    });
  }, [debouncedTaxonSearch, selectedTaxon]);

  // User Fetch on Search
  useEffect(() => {
    const search = debouncedRecordedBySearch || debouncedIdentifiedBySearch;
    if (!search || search.length < 2) {
      setUserResults([]);
      return;
    }
    setIsUserLoading(true);
    searchProfiles(search).then(resp => {
      setUserResults(resp.data);
      setIsUserLoading(false);
    });
  }, [debouncedRecordedBySearch, debouncedIdentifiedBySearch]);

  const onSubmit = async (data: OccurrenceInput) => {
    setLoading(true);
    let finalData = { ...data };
    if (typeof data.dynamicProperties === "string" && data.dynamicProperties.trim() !== "") {
      try {
        finalData.dynamicProperties = JSON.parse(data.dynamicProperties);
      } catch (e) {
        showToast.error("Error de Formato", "Propiedades Dinámicas debe ser un JSON válido.");
        setLoading(false);
        return;
      }
    } else if (!data.dynamicProperties) {
      finalData.dynamicProperties = {};
    }

    let resp;
    if (id) {
      resp = await updateOccurrence(id, finalData);
    } else {
      resp = await createOccurrence(finalData);
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
        {/* 1. Detalles de la Ocurrencia */}
        <FormSection title="Detalles de la Ocurrencia" icon={FileText}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            ? selectedTaxon?.scientificName || "Seleccionar Taxón..."
                            : "Seleccionar Taxón..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar por nombre científico o común..."
                          value={taxonSearch}
                          onValueChange={setTaxonSearch}
                        />
                        <CommandList>
                          {isTaxonLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              Buscando especies...
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No se encontró taxón.</CommandEmpty>
                              <CommandGroup>
                                {taxa.map((t) => (
                                  <CommandItem
                                    key={t.id}
                                    value={t.id}
                                    onSelect={() => {
                                      field.onChange(t.id);
                                      setSelectedTaxon(t);
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
                            </>
                          )}
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
                    const t = selectedTaxon;
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

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Ubicación *</label>
              <Controller
                control={control}
                name="location_id"
                render={({ field }) => (
                  <Popover open={openLocation} onOpenChange={setOpenLocation}>
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
                            ? selectedLocation?.locality || "Seleccionar Ubicación..."
                            : "Seleccionar Ubicación..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar por localidad..."
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                        />
                        <CommandList>
                          {isLocationLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              Buscando localidades...
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No se encontró ubicación.</CommandEmpty>
                              <CommandGroup>
                                {locations.map((l) => (
                                  <CommandItem
                                    key={l.id}
                                    value={l.id}
                                    onSelect={() => {
                                      field.onChange(l.id);
                                      setSelectedLocation(l);
                                      setOpenLocation(false);
                                    }}
                                  >
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/90 font-semibold tracking-tight">
                                        <span>{l.district?.province?.department?.name || "-"}</span>
                                        <ChevronRight className="h-1.5 w-1.5 opacity-40" />
                                        <span>{l.district?.province?.name || "-"}</span>
                                        <ChevronRight className="h-1.5 w-1.5 opacity-40" />
                                        <span>{l.district?.name || "-"}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground leading-none">
                                          {l.locality}
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                        <div className="p-2 border-t border-muted/20">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs h-8 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-2"
                            onClick={() => {
                              setOpenLocation(false);
                              setIsLocationFormOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Registrar Nueva Ubicación
                          </Button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.location_id && <p className="text-[10px] text-red-500 mt-1">{errors.location_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Hábitat (Ecosistema)</label>
              <Controller
                control={control}
                name="ecosystem_id"
                render={({ field }) => (
                  <Popover open={openEcosystem} onOpenChange={setOpenEcosystem}>
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
                            ? ecosystems.find((e) => e.id === field.value)?.name || "Seleccionar Hábitat..."
                            : "Seleccionar Hábitat..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar hábitat..." />
                        <CommandList>
                          <CommandEmpty>No se encontró hábitat.</CommandEmpty>
                          <CommandGroup>
                            {ecosystems.map((e) => (
                              <CommandItem
                                key={e.id}
                                value={e.name}
                                onSelect={() => {
                                  field.onChange(e.id);
                                  setOpenEcosystem(false);
                                }}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-sm">{e.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{e.region?.name}</span>
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
                              setOpenEcosystem(false);
                              setIsEcosystemFormOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Nuevo Hábitat
                          </Button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.ecosystem_id && <p className="text-[10px] text-red-500 mt-1">{errors.ecosystem_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Conteo de Individuos</label>
              <Input type="number" min={1} {...register("individualCount")} placeholder="Ex: 1" className="bg-background h-9 focus-visible:ring-primary/20" />
              {errors.individualCount && <p className="text-[10px] text-red-500 mt-1">{errors.individualCount.message}</p>}
            </div>

            <div className="flex flex-col gap-1 lg:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Descripción de Hábitat (Microhábitat)</label>
              <Textarea
                {...register("occurrenceRemarks")}
                placeholder="Describa el hábitat o detalles extra del avistamiento (p. ej. sobre hojarasca húmeda)..."
                className="bg-background min-h-[80px] focus-visible:ring-primary/20"
              />
              {errors.occurrenceRemarks && <p className="text-[10px] text-red-500 mt-1">{errors.occurrenceRemarks.message}</p>}
            </div>
          </div>
        </FormSection>

        {/* 2. Identificación y Verificación */}
        <FormSection title="Identificación y Verificación" icon={Check}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Identificación</label>
              <select
                {...register("identificationMethod")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                <option value="Manual">Manual</option>
                <option value="Automatica">Automática</option>
              </select>
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

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha de Identificación</label>
              <Input type="date" {...register("dateIdentified")} className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Comentarios de Identificación</label>
              <Textarea {...register("identificationRemarks")} placeholder="Escriba comentarios sobre la determinación taxonómica..." className="bg-background min-h-[60px] focus-visible:ring-primary/20" />
            </div>
          </div>
        </FormSection>

        {/* 3. Monitoreo y Variables Ambientales */}
        <FormSection title="Monitoreo y Variables Ambientales" icon={Thermometer}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Registrado Por *</label>
              <Controller
                control={control}
                name="recordedBy"
                render={({ field }) => (
                  <Popover open={openRecordedBy} onOpenChange={setOpenRecordedBy}>
                    <PopoverTrigger asChild>
                      <div className="relative group">
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Nombre del recolector..."
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setRecordedBySearch(e.target.value);
                            if (!e.target.value) setValue("recorded_by_id", null);
                          }}
                          onFocus={() => setOpenRecordedBy(true)}
                          className="bg-background h-9 focus-visible:ring-primary/20 pr-8" 
                        />
                        {field.value && (
                          <button 
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setValue("recorded_by_id", null);
                              setRecordedBySearch("");
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
                                    setValue("recorded_by_id", u.id);
                                    setOpenRecordedBy(false);
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
              {errors.recordedBy && <p className="text-[10px] text-red-500 mt-1">{errors.recordedBy.message}</p>}
              {watch("recorded_by_id") && (
                <div className="flex items-center gap-1.5 mt-1 px-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Vinculado a Intranet</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Identificado Por</label>
              <Controller
                control={control}
                name="identifiedBy"
                render={({ field }) => (
                  <Popover open={openIdentifiedBy} onOpenChange={setOpenIdentifiedBy}>
                    <PopoverTrigger asChild>
                      <div className="relative group">
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Nombre del identificador..."
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setIdentifiedBySearch(e.target.value);
                            if (!e.target.value) setValue("identified_by_id", null);
                          }}
                          onFocus={() => setOpenIdentifiedBy(true)}
                          className="bg-background h-9 focus-visible:ring-primary/20 pr-8" 
                        />
                        {field.value && (
                          <button 
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setValue("identified_by_id", null);
                              setIdentifiedBySearch("");
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
                                    setValue("identified_by_id", u.id);
                                    setOpenIdentifiedBy(false);
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
              {watch("identified_by_id") && (
                <div className="flex items-center gap-1.5 mt-1 px-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Vinculado a Intranet</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-muted/20">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                  <Thermometer className="h-3.5 w-3.5" /> Temperatura (°C)
                </label>
                <Input type="number" step="0.1" {...register("temperature_c")} placeholder="Ex: 24.5" className="h-9 bg-background/50" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                  <Droplets className="h-3.5 w-3.5" /> Humedad Relativa (%)
                </label>
                <Input type="number" step="1" {...register("relative_humidity_percent")} placeholder="Ex: 85" className="h-9 bg-background/50" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5" /> Elevación (m.s.n.m.)
                </label>
                <Input type="number" step="1" {...register("elevation_masl")} placeholder="Ex: 120" className="h-9 bg-background/50" />
              </div>
            </div>
          </div>
        </FormSection>

        {/* 4. Testigo Físico y Afiliación */}
        <FormSection title="Testigo Físico y Afiliación" icon={Box}>
          <div className="space-y-6">
            {/* Testigo Físico (Cloud Voucher) */}
            <div className="p-4 bg-muted/30 rounded-lg border border-muted-foreground/10 space-y-4">
              <div className="flex items-center space-x-3 group">
                <Controller
                  name="has_cloud_voucher"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="has_cloud_voucher"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="has_cloud_voucher" className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors uppercase tracking-tight">Posee Testigo Físico (Voucher)</Label>
                  <p className="text-[10px] text-muted-foreground italic">Marque si existe un espécimen o muestra física depositada en colección.</p>
                </div>
              </div>

              {watch("has_cloud_voucher") && (
                <div className="flex flex-col gap-1.5 pl-7 animate-in fade-in slide-in-from-left-2 duration-200">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Número de Catálogo / Voucher *</label>
                  <Input {...register("catalogNumber")} placeholder="Ex: MUSM-12345" className="h-9 bg-background focus-visible:ring-primary/20" />
                  <p className="text-[9px] text-muted-foreground">Ingrese el código único asignado por la institución/colección.</p>
                </div>
              )}
            </div>

            {/* Specimen Details (Preparations, Disposition, License, RightsHolder, Dynamic Properties) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-muted/20">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Preparaciones (Specimen Preparations)</label>
                <Input {...register("preparations")} placeholder="Ex: tejido, piel, esqueleto completo" className="bg-background h-9 focus-visible:ring-primary/20" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Disposición (Specimen Disposition)</label>
                <Input {...register("disposition")} placeholder="Ex: en colección, duplicado" className="bg-background h-9 focus-visible:ring-primary/20" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Licencia (Darwin Core License)</label>
                <Input {...register("license")} placeholder="Ex: CC BY-NC 4.0" className="bg-background h-9 focus-visible:ring-primary/20" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Titular de Derechos (Rights Holder)</label>
                <Input {...register("rightsHolder")} placeholder="Ex: IIAP / Colección Científica" className="bg-background h-9 focus-visible:ring-primary/20" />
              </div>

              <div className="flex flex-col gap-1 lg:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Propiedades Dinámicas (dynamicProperties JSON)</label>
                <Textarea {...register("dynamicProperties")} placeholder='Ex: { "weight_g": 12.5, "snout_vent_length_mm": 45.2 }' className="bg-background min-h-[80px] font-mono text-xs focus-visible:ring-primary/20" />
                <p className="text-[10px] text-muted-foreground">Debe ser un objeto JSON válido.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Institución */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Afiliación (Institución) *</label>
                <Controller
                  control={control}
                  name="institution_id"
                  render={({ field }) => (
                    <Popover open={openInstitution} onOpenChange={setOpenInstitution}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal h-10",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? institutions.find(inst => inst.id === field.value)?.name || "Institución seleccionada"
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
                                    field.onChange(inst.id);
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
                  )}
                />
                {errors.institution_id && <p className="text-[10px] text-red-500 mt-1">{errors.institution_id.message}</p>}
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
        </FormSection>



        {/* 5. Estado del Registro y Publicación */}
        <FormSection title="Estado del Registro Público" icon={Globe}>
          <p className="text-[10px] text-muted-foreground mb-4">Defina si este registro será visible para el público general en el portal.</p>
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
        </FormSection>

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
          <div className="pt-4">
            <TaxonForm
              id={null}
              footerVariant="sticky"
              onCancel={() => setIsTaxonFormOpen(false)}
              onSuccess={async (newTaxon) => {
                if (newTaxon) {
                  setTaxa(prev => {
                    if (!prev.find(t => t.id === newTaxon.id)) return [newTaxon, ...prev];
                    return prev;
                  });
                  setValue("taxon_id", newTaxon.id);
                  setSelectedTaxon(newTaxon);
                }
                setIsTaxonFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isLocationFormOpen} onOpenChange={setIsLocationFormOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px] md:max-w-[800px] min-w-[40vw]">
          <SheetHeader className="pb-0">
            <SheetTitle>Registrar Ubicación</SheetTitle>
          </SheetHeader>
          <div className="pt-4">
            <LocationForm
              id={null}
              footerVariant="sticky"
              onCancel={() => setIsLocationFormOpen(false)}
              onSuccess={async (newLoc) => {
                if (newLoc) {
                  setLocations(prev => {
                    if (!prev.find(l => l.id === newLoc.id)) return [newLoc, ...prev];
                    return prev;
                  });
                  setValue("location_id", newLoc.id);
                  setSelectedLocation(newLoc);
                }
                setIsLocationFormOpen(false);
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
          <div className="pt-4">
            <InstitutionForm
              footerVariant="sticky"
              onCancel={() => setIsInstitutionFormOpen(false)}
              onSuccess={async (newInst) => {
                const resp = await getInstitutions({ limit: 100 });
                setInstitutions(resp.data);
                setSelectedInstitutionId(newInst.id);
                setValue("institution_id", newInst.id);
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
          <div className="pt-4">
            <CollectionForm
              defaultInstitutionId={selectedInstitutionId || undefined}
              onCancel={() => setIsCollectionFormOpen(false)}
              onSuccess={async (newCol) => {
                const resp = await getCollections({ limit: 100 });
                setCollections(resp.data);
                setValue("collection_id", newCol.id);
                setSelectedInstitutionId(newCol.institution_id);
                setValue("institution_id", newCol.institution_id);
                setIsCollectionFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEcosystemFormOpen} onOpenChange={setIsEcosystemFormOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px] md:max-w-[800px] min-w-[40vw]">
          <SheetHeader className="pb-0">
            <SheetTitle>Registrar Hábitat</SheetTitle>
          </SheetHeader>
          <div className="pt-4">
            <EcosystemForm
              footerVariant="sticky"
              onCancel={() => setIsEcosystemFormOpen(false)}
              onSuccess={async (newEco) => {
                const resp = await getEcosystems({ limit: 100 });
                setEcosystems(resp.data);
                if (newEco) {
                  setValue("ecosystem_id", newEco.id);
                }
                setIsEcosystemFormOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

