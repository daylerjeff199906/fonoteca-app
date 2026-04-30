"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { naturalRegionSchema, NaturalRegionInput } from "@/lib/validations/fonoteca";
import { createNaturalRegion, updateNaturalRegion, getNaturalRegion } from "@/actions/natural-regions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Loader2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function NaturalRegionForm({ id, onSuccess, onCancel, footerVariant = "fixed" }: { 
  id?: string | null, 
  onSuccess?: (region: any) => void,
  onCancel?: () => void,
  footerVariant?: "fixed" | "sticky"
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NaturalRegionInput>({
    resolver: zodResolver(naturalRegionSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      logo_url: ""
    }
  });

  useEffect(() => {
    if (id) {
      getNaturalRegion(id).then((resp) => {
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          showToast.error("Error", "No se pudo cargar la información de la región natural.");
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: NaturalRegionInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateNaturalRegion(id, data);
    } else {
      resp = await createNaturalRegion(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Región Natural actualizada correctamente." : "Región Natural registrada correctamente.");
      if (onSuccess) {
        onSuccess(resp.data);
      } else {
        router.push("/dashboard/geography/natural-regions");
      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "No se pudo procesar la solicitud.");
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="space-y-4 bg-card border rounded-lg p-5">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
      <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Detalles de la Región Natural</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre de la Región *</label>
            <Input 
              {...register("name")} 
              placeholder="p. ej. Selva Baja, Yungas, etc." 
              className="h-10 bg-background/50 focus-visible:ring-primary/20" 
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> URL del Logo / Icono
            </label>
            <Input 
              {...register("logo_url")} 
              placeholder="https://..." 
              className="h-10 bg-background/50 focus-visible:ring-primary/20" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <FileText className="h-3 w-3" /> Descripción
            </label>
            <Textarea
              {...register("description")}
              placeholder="Breve descripción de las características de la región..."
              className="min-h-[120px] bg-background/50 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <FormFooter variant={footerVariant}>
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/geography/natural-regions">Cancelar</Link>
          </Button>
        )}

        <Button type="submit" disabled={loading} className="min-w-[150px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : id ? (
            "Actualizar Región"
          ) : (
            "Registrar Región"
          )}
        </Button>
      </FormFooter>
    </form>
  );
}
