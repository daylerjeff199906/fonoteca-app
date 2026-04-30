"use client"

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ecosystemSchema, EcosystemInput } from "@/lib/validations/fonoteca";
import { createEcosystem, updateEcosystem, getEcosystem } from "@/actions/ecosystems";
import { getNaturalRegions } from "@/actions/natural-regions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trees,
  Loader2,
  FileText,
  Globe,
  Plus,
  X,
  MapIcon,
  Info
} from "lucide-react";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { NaturalRegion } from "@/types/fonoteca";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/panel-admin/form-section";

export function EcosystemForm({ id, onSuccess, onCancel, footerVariant = "fixed" }: {
  id?: string | null,
  onSuccess?: (ecosystem: any) => void,
  onCancel?: () => void,
  footerVariant?: "fixed" | "sticky"
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [regions, setRegions] = useState<NaturalRegion[]>([]);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<EcosystemInput>({
    resolver: zodResolver(ecosystemSchema) as any,
    defaultValues: {
      diagnostic_factors: [],
      botanical_species: [],
    }
  });

  const diagnosticFactors = watch("diagnostic_factors") || [];
  const botanicalSpecies = watch("botanical_species") || [];

  useEffect(() => {
    getNaturalRegions({ limit: 100 }).then(resp => setRegions(resp.data));

    if (id) {
      getEcosystem(id).then((resp) => {
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          showToast.error("Error", "No se pudo cargar la información del hábitat.");
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: EcosystemInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateEcosystem(id, data);
    } else {
      resp = await createEcosystem(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Hábitat actualizado correctamente." : "Hábitat registrado correctamente.");
      if (onSuccess) {
        onSuccess(resp.data);
      } else {
        router.push("/dashboard/geography/ecosystems");
      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "No se pudo procesar la solicitud.");
    }
  };

  const addItem = (field: "diagnostic_factors" | "botanical_species", value: string) => {
    if (!value.trim()) return;
    const current = watch(field) || [];
    if (!current.includes(value.trim())) {
      setValue(field, [...current, value.trim()]);
    }
  };

  const removeItem = (field: "diagnostic_factors" | "botanical_species", value: string) => {
    const current = watch(field) || [];
    setValue(field, current.filter(item => item !== value));
  };

  if (isFetching) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full pb-10">
      {/* 1. Clasificación y Nombre */}
      <FormSection title="Clasificación del Hábitat" icon={Trees}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Región Natural *</label>
            <select
              {...register("region_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
            >
              <option value="">Seleccionar Región...</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.region_id && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.region_id.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Nombre del Hábitat *</label>
            <Input
              {...register("name")}
              placeholder="p. ej. Bosque de terraza no inundable"
              className="h-10 bg-background/50 focus-visible:ring-primary/20"
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Definición Formal *</label>
            <Textarea
              {...register("definition")}
              placeholder="Definición científica o técnica del hábitat..."
              className="min-h-[100px] bg-background/50 focus-visible:ring-primary/20"
            />
            {errors.definition && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.definition.message}</p>}
          </div>
        </div>
      </FormSection>

      {/* 2. Factores y Especies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Factores Diagnósticos */}
        <FormSection title="Factores Diagnósticos" icon={Info}>
          <div className="flex gap-2">
            <Input
              id="new-factor"
              placeholder="Añadir factor..."
              className="h-9 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem("diagnostic_factors", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                const input = document.getElementById("new-factor") as HTMLInputElement;
                addItem("diagnostic_factors", input.value);
                input.value = "";
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {diagnosticFactors.map(factor => (
              <Badge key={factor} variant="outline" className="flex items-center gap-1 py-1 px-2 bg-primary/5">
                {factor}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeItem("diagnostic_factors", factor)} />
              </Badge>
            ))}
            {diagnosticFactors.length === 0 && <p className="text-[10px] text-muted-foreground italic">No hay factores añadidos.</p>}
          </div>
        </FormSection>

        {/* Especies Botánicas */}
        <FormSection title="Especies Botánicas Típicas" icon={Trees}>
          <div className="flex gap-2">
            <Input
              id="new-species"
              placeholder="Nombre científico..."
              className="h-9 bg-background/50 italic"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem("botanical_species", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                const input = document.getElementById("new-species") as HTMLInputElement;
                addItem("botanical_species", input.value);
                input.value = "";
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {botanicalSpecies.map(species => (
              <Badge key={species} variant="outline" className="flex items-center gap-1 py-1 px-2 bg-emerald-500/5 italic border-emerald-500/20">
                {species}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeItem("botanical_species", species)} />
              </Badge>
            ))}
            {botanicalSpecies.length === 0 && <p className="text-[10px] text-muted-foreground italic">No hay especies añadidas.</p>}
          </div>
        </FormSection>
      </div>

      {/* 3. Detalles Adicionales */}
      <FormSection title="Información Complementaria" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Localidad Típica</label>
            <Input {...register("typical_locality")} placeholder="Lugar donde se observa comúnmente..." className="h-10 bg-background/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Fuentes Bibliográficas</label>
            <Input {...register("sources")} placeholder="p. ej. MINAM 2019, etc." className="h-10 bg-background/50" />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Observaciones</label>
            <Textarea {...register("observation")} placeholder="Notas adicionales..." className="min-h-[80px] bg-background/50" />
          </div>
        </div>
      </FormSection>

      {/* 4. Distribución (GeoJSON placeholder for now) */}
      <FormSection title="Interactividad Espacial (GeoJSON)" icon={MapIcon}>
        <Textarea
          placeholder='{"type": "FeatureCollection", "features": [...]}'
          className="font-mono text-xs bg-muted/30 min-h-[100px]"
          onChange={(e) => {
            try {
              const json = JSON.parse(e.target.value);
              setValue("distribution_geojson", json);
            } catch (err) {
              // Invalid JSON
            }
          }}
          defaultValue={watch("distribution_geojson") ? JSON.stringify(watch("distribution_geojson"), null, 2) : ""}
        />
        <p className="text-[10px] text-muted-foreground mt-2">Pegue aquí el GeoJSON de la distribución espacial para visualizarlo en el mapa.</p>
      </FormSection>

      <FormFooter variant={footerVariant}>
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/geography/ecosystems">Cancelar</Link>
          </Button>
        )}

        <Button type="submit" disabled={loading} className="min-w-[150px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : id ? (
            "Actualizar Hábitat"
          ) : (
            "Registrar Hábitat"
          )}
        </Button>
      </FormFooter>
    </form>
  );
}
