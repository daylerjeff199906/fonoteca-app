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
import { MapPin, Globe, Loader2, Ruler, Mountain, AlignLeft, Info, FileText } from "lucide-react";
import { CountryPicker } from "./country-picker";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { Textarea } from "@/components/ui/textarea";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
      {/* 1. Datos Principales */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Datos de Localidad</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Location ID</label>
            <Input {...register("locationID")} placeholder="Ex: LOC-001" className="bg-background h-9 focus-visible:ring-primary/20" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Localidad *</label>
            <Input {...register("locality")} placeholder="Ex: Río Itaya, Quebrada Tamshiyacu" className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.locality && <p className="text-[10px] text-red-500 mt-1">{errors.locality.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Provincia / Estado</label>
            <Input {...register("stateProvince")} placeholder="Ex: Loreto" className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.stateProvince && <p className="text-[10px] text-red-500 mt-1">{errors.stateProvince.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Distrito / Condado</label>
            <Input {...register("county")} placeholder="Ex: San Juan Bautista" className="bg-background h-9 focus-visible:ring-primary/20" />
            {errors.county && <p className="text-[10px] text-red-500 mt-1">{errors.county.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Geografía Regional */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Geografía Regional</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">País Seleccionado</label>
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Código ISO y Continente</label>
            <div className="flex gap-2">
              <Input {...register("countryCode")} placeholder="Code" className="bg-muted w-16 h-9 focus-visible:ring-primary/20" readOnly />
              <Input {...register("continent")} className="bg-background h-9 focus-visible:ring-primary/20 flex-grow" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Coordenadas y Mapa */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Ruler className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Coordenadas de Precisión</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
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
      </div>

      {/* 4. Ambiente */}
      <div className="space-y-4 bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Mountain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Ambiente y Otros</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1 lg:row-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <AlignLeft className="h-3 w-3" /> Descripción Hábitat
            </label>
            <Textarea 
              {...register("habitat")} 
              placeholder="Ex: Bosque de várzea inundable..." 
              className="bg-background focus-visible:ring-primary/20 h-[100px]" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Elevación (m)</label>
              <Input type="number" step="any" {...register("elevation")} className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Precisión Elev. (m)</label>
              <Input type="number" step="any" {...register("elevationAccuracy")} className="bg-background h-9 focus-visible:ring-primary/20" />
            </div>
          </div>
        </div>
      </div>

      <FormFooter>
        <Button variant="outline" type="button" asChild>
          <Link href="/dashboard/locations">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? "Guardando..." : id ? "Actualizar Ubicación" : "Registrar Ubicación"}
        </Button>
      </FormFooter>
    </form>
  );
}

