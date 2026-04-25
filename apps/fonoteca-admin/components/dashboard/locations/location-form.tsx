"use client"

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema, LocationInput } from "@/lib/validations/fonoteca";
import { createLocation, updateLocation, getLocation } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Loader2, Ruler, Mountain, AlignLeft, Info } from "lucide-react";
import { CountryPicker } from "./country-picker";

// Dynamic loading of the map picker to avoid SSR issues
const MapPicker = dynamic(() => import("./map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center font-medium">Cargando Mapa...</div>
});

export function LocationForm({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<LocationInput>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      continent: "South America",
      country: "Peru",
      countryCode: "PE",
    }
  });

  const decimalLat = watch("decimalLatitude");
  const decimalLng = watch("decimalLongitude");

  useEffect(() => {
    if (id) {
      setLoading(true);
      getLocation(id).then((resp) => {
        setLoading(false);
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          toast.error("Error al cargar ubicación");
        }
      });
    }
  }, [id, reset]);

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
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Operación Exitosa</span>
          <span className="text-xs opacity-90">{id ? "Ubicación actualizada correctamente." : "Ubicación registrada correctamente."}</span>
        </div>
      );
      router.push("/dashboard/locations");
    } else {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">Error de Proceso</span>
          <span className="text-xs opacity-90">{typeof resp.error === "string" ? resp.error : "Falló la validación."}</span>
        </div>
      );
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-medium">Recuperando geodata...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 w-full max-w-5xl">
      {/* 1. Datos Principales */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Datos de Localidad</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Location ID</label>
            </div>
            <div className="w-3/4">
              <Input {...register("locationID")} placeholder="Ex: LOC-001" className="bg-transparent border-none shadow-none h-9 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Localidad *</label>
            </div>
            <div className="w-3/4">
              <Input {...register("locality")} placeholder="Ex: Río Itaya, Quebrada Tamshiyacu" className="bg-transparent border-none shadow-none h-9 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.locality && <p className="text-xs text-red-500 mt-1 px-2 font-medium">{errors.locality.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Provincia / Estado</label>
            </div>
            <div className="w-3/4">
              <Input {...register("stateProvince")} placeholder="Ex: Loreto" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.stateProvince && <p className="text-xs text-red-500 mt-1 px-2 font-medium">{errors.stateProvince.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Distrito / Condado</label>
            </div>
            <div className="w-3/4">
              <Input {...register("county")} placeholder="Ex: San Juan Bautista" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.county && <p className="text-xs text-red-500 mt-1 px-2 font-medium">{errors.county.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Geografía Regional */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Geografía Regional</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">País Seleccionado</label>
            </div>
            <div className="w-3/4">
              <div className="max-w-xl">
                 <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                        <CountryPicker 
                            value={field.value} 
                            onChange={(c) => {
                                field.onChange(c.name);
                                setValue("countryCode", c.code);
                            }} 
                        />
                    )}
                 />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Código ISO y Continente</label>
            </div>
            <div className="w-3/4 flex gap-4 max-w-xl">
              <Input {...register("countryCode")} placeholder="Code" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 w-16" readOnly />
              <Input {...register("continent")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 flex-grow" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Coordenadas y Mapa */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Coordenadas de Precisión</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Latitud</label>
                    <Input type="number" step="any" {...register("decimalLatitude")} placeholder="-3.749" className="h-9 font-medium" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Longitud</label>
                    <Input type="number" step="any" {...register("decimalLongitude")} placeholder="-73.25" className="h-9 font-medium" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Incertidumbre (m)</label>
                    <Input type="number" step="any" {...register("coordinateUncertaintyInMeters")} placeholder="10" className="h-9 font-medium bg-muted/20" />
                </div>
            </div>
            <div className="md:col-span-2">
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
      </div>

      {/* 4. Ambiente */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Ambiente y Otros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 flex items-center gap-1">
                    <AlignLeft className="h-3 w-3" /> Descripción Hábitat
                </label>
                <Input {...register("habitat")} placeholder="Ex: Bosque de várzea inundable" className="h-9 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Elevación (m)</label>
                    <Input type="number" step="any" {...register("elevation")} className="h-9 font-medium" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Precisión Elev. (m)</label>
                    <Input type="number" step="any" {...register("elevationAccuracy")} className="h-9 font-medium" />
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-muted/20 mt-10">
        <Button variant="outline" asChild className="min-w-[120px]">
          <Link href="/dashboard/locations">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[160px] font-bold">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Actualizar Ubicación" : "Registrar Ubicación"}
        </Button>
      </div>
    </form>
  );
}

