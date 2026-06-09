"use client"

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema, LocationInput } from "@/lib/validations/fonoteca";
import { 
  createLocation, 
  updateLocation, 
  getLocation, 
  getUbigeoDepartments, 
  getUbigeoProvinces, 
  getUbigeoDistricts 
} from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Loader2, Ruler, Info, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { FormSection } from "@/components/panel-admin/form-section";
import { UbigeoDepartment, UbigeoProvince, UbigeoDistrict } from "@/types/fonoteca";
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

// Dynamic loading of the map picker to avoid SSR issues
const MapPicker = dynamic(() => import("./map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center font-medium">Cargando Mapa...</div>
});

export function LocationForm({ 
  id, 
  onSuccess, 
  onCancel, 
  footerVariant = "fixed" 
}: { 
  id?: string | null, 
  onSuccess?: (data: any) => void,
  onCancel?: () => void,
  footerVariant?: "fixed" | "sticky"
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const [departments, setDepartments] = useState<UbigeoDepartment[]>([]);
  const [provinces, setProvinces] = useState<UbigeoProvince[]>([]);
  const [districts, setDistricts] = useState<UbigeoDistrict[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedProv, setSelectedProv] = useState<string>("");

  const [openDept, setOpenDept] = useState(false);
  const [openProv, setOpenProv] = useState(false);
  const [openDist, setOpenDist] = useState(false);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<LocationInput>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      locationID: "",
      locality: "",
      decimalLatitude: null,
      decimalLongitude: null,
      coordinateUncertaintyInMeters: null,
      ubigeo_district_id: null,
      country: "Perú",
      stateProvince: "",
      geodeticDatum: "WGS84",
      georeferenceProtocol: "",
      georeferenceSources: "",
      georeferencedDate: "",
    }
  });

  const decimalLat = watch("decimalLatitude");
  const decimalLng = watch("decimalLongitude");

  // Initial loads
  useEffect(() => {
    getUbigeoDepartments().then(resp => {
      if (resp.data) setDepartments(resp.data);
    });

    if (id) {
      setIsFetching(true);
      getLocation(id).then((resp) => {
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
          if (resp.data.district) {
            const district = resp.data.district;
            setSelectedDept(district.province?.department_id || "");
            setSelectedProv(district.province_id || "");
            
            // Load provinces and districts for the existing values
            getUbigeoProvinces(district.province?.department_id).then(res => {
              if (res.data) setProvinces(res.data);
            });
            getUbigeoDistricts(district.province_id).then(res => {
              if (res.data) setDistricts(res.data);
            });
          }
        } else {
          showToast.error("Error de Carga", "No se pudo recuperar la información de la ubicación.");
        }
      });
    }
  }, [id, reset]);

  // When Department changes
  const handleDeptChange = async (deptId: string) => {
    setSelectedDept(deptId);
    setSelectedProv("");
    setValue("ubigeo_district_id", null);
    setProvinces([]);
    setDistricts([]);
    setOpenDept(false);
    const resp = await getUbigeoProvinces(deptId);
    if (resp.data) setProvinces(resp.data);
  };

  // When Province changes
  const handleProvChange = async (provId: string) => {
    setSelectedProv(provId);
    setValue("ubigeo_district_id", null);
    setDistricts([]);
    setOpenProv(false);
    const resp = await getUbigeoDistricts(provId);
    if (resp.data) setDistricts(resp.data);
  };

  const onSubmit = async (data: LocationInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateLocation(id, data);
    } else {
      resp = await createLocation(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Ubicación actualizada." : "Ubicación registrada.");
      if (onSuccess) {
        onSuccess(resp.data);
      } else {
        router.push("/dashboard/locations");
      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "Error al procesar.");
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-8 w-full animate-pulse">
        {/* Skeleton Datos de Localidad */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>

        {/* Skeleton Ubicación Política */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Coordenadas y Mapa */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
      {/* 1. Datos de Localidad */}
      <FormSection title="Datos de Localidad" icon={MapPin}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Location ID (Opcional)</label>
            <Input {...register("locationID")} placeholder="Ex: LOC-001" className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Localidad (Nombre específico) *</label>
            <Input {...register("locality")} placeholder="Ex: Río Itaya, Quebrada Tamshiyacu" className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.locality && <p className="text-[10px] text-red-500 mt-1">{errors.locality.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">País (Opcional)</label>
            <Input {...register("country")} placeholder="Ex: Perú" className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Departamento/Estado/Provincia (Opcional)</label>
            <Input {...register("stateProvince")} placeholder="Ex: Loreto" className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>
        </div>
      </FormSection>

      {/* 2. Ubicación Política (Ubigeo) */}
      <FormSection title="Ubicación Política (Perú)" icon={Globe}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Departamento</label>
            <Popover open={openDept} onOpenChange={setOpenDept}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-full justify-between font-normal h-9", !selectedDept && "text-muted-foreground")}
                >
                  {selectedDept ? departments.find(d => d.id === selectedDept)?.name : "Seleccionar..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar departamento..." />
                  <CommandList>
                    <CommandEmpty>No encontrado.</CommandEmpty>
                    <CommandGroup>
                      {departments.map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => handleDeptChange(d.id)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedDept === d.id ? "opacity-100" : "opacity-0")} />
                          {d.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Provincia</label>
            <Popover open={openProv} onOpenChange={setOpenProv}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={!selectedDept}
                  className={cn("w-full justify-between font-normal h-9", !selectedProv && "text-muted-foreground")}
                >
                  {selectedProv ? provinces.find(p => p.id === selectedProv)?.name : "Seleccionar..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar provincia..." />
                  <CommandList>
                    <CommandEmpty>No encontrado.</CommandEmpty>
                    <CommandGroup>
                      {provinces.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => handleProvChange(p.id)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedProv === p.id ? "opacity-100" : "opacity-0")} />
                          {p.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Distrito *</label>
            <Controller
              control={control}
              name="ubigeo_district_id"
              render={({ field }) => (
                <Popover open={openDist} onOpenChange={setOpenDist}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={!selectedProv}
                      className={cn("w-full justify-between font-normal h-9", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? districts.find(d => d.id === field.value)?.name : "Seleccionar..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar distrito..." />
                      <CommandList>
                        <CommandEmpty>No encontrado.</CommandEmpty>
                        <CommandGroup>
                          {districts.map((d) => (
                            <CommandItem
                              key={d.id}
                              value={d.name}
                              onSelect={() => {
                                field.onChange(d.id);
                                setOpenDist(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", field.value === d.id ? "opacity-100" : "opacity-0")} />
                              {d.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.ubigeo_district_id && <p className="text-[10px] text-red-500 mt-1">{errors.ubigeo_district_id.message}</p>}
          </div>
        </div>
      </FormSection>

      {/* 3. Coordenadas y Mapa */}
      <FormSection title="Coordenadas y Mapa" icon={Ruler}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Latitud</label>
              <Input type="number" step="any" {...register("decimalLatitude")} placeholder="-3.749" className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Longitud</label>
              <Input type="number" step="any" {...register("decimalLongitude")} placeholder="-73.25" className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Incertidumbre (m)</label>
              <Input type="number" step="any" {...register("coordinateUncertaintyInMeters")} placeholder="10" className="bg-muted/20 h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Datum Geodésico</label>
              <Input {...register("geodeticDatum")} placeholder="Ex: WGS84" className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Protocolo de Georreferenciación</label>
              <Input {...register("georeferenceProtocol")} placeholder="Ex: GPS de mano" className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Fuentes de Georreferenciación</label>
              <Input {...register("georeferenceSources")} placeholder="Ex: Google Earth, GPS log" className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha de Georreferenciación</label>
              <Input type="date" {...register("georeferencedDate")} className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <MapPicker
              lat={decimalLat}
              lng={decimalLng}
              onChange={(lat, lng) => {
                setValue("decimalLatitude", Number(lat.toFixed(6)));
                setValue("decimalLongitude", Number(lng.toFixed(6)));
              }}
            />
          </div>
        </div>
      </FormSection>

      <FormFooter variant={footerVariant}>
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/locations">Cancelar</Link>
          </Button>
        )}
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? "Guardando..." : id ? "Actualizar Ubicación" : "Registrar Ubicación"}
        </Button>
      </FormFooter>
    </form>
  );
}

