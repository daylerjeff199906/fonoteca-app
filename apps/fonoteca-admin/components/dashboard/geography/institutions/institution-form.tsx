"use client"

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { institutionSchema, InstitutionInput } from "@/lib/validations/fonoteca";
import { createInstitution, updateInstitution, getInstitution } from "@/actions/institutions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Loader2,
  Mail,
  Phone,
  Link as LinkIcon,
  Calendar,
  History,
  Info,
  Hash,
  FileText,
  MapIcon
} from "lucide-react";
import { FormFooter } from "@/components/panel-admin/form-footer";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";


const MapPicker = dynamic(() => import("@/components/dashboard/locations/map-picker"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center font-medium text-xs text-muted-foreground">Cargando Mapa...</div>
});

export function InstitutionForm({ id, onSuccess, footerVariant = "fixed" }: { 
  id?: string, 
  onSuccess?: (institution: any) => void,
  footerVariant?: "fixed" | "sticky"
}) {


  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<InstitutionInput>({
    resolver: zodResolver(institutionSchema) as any,
    defaultValues: {
      is_active: true,
      display_on_nhc_portal: true,
      specimen_count: 0,
      type: "Fonoteca",
      physical_address: { city: "", address: "", country: "Peru", province: "" },
      mailing_address: { city: "", address: "", country: "Peru", province: "" },
      additional_names: [],
      phones: []
    }
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  useEffect(() => {
    if (id) {
      getInstitution(id).then((resp) => {
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          showToast.error("Error", "No se pudo cargar la información de la institución.");
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: InstitutionInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateInstitution(id, data);
    } else {
      resp = await createInstitution(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Institución actualizada correctamente." : "Institución registrada correctamente.");
      if (onSuccess) {
        onSuccess(resp.data);
      } else {
        router.push("/dashboard/geography/institutions");
      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "No se pudo procesar la solicitud.");
    }

  };

  if (isFetching) {
    return (
      <div className="space-y-8 w-full pb-10 px-1 animate-in fade-in duration-500">
        {/* 1. Basic Info Skeleton */}
        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contact and Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Map Skeleton */}
        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[350px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full pb-10 px-1">
      {/* 1. Información Básica */}
      <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Identidad Institucional</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 pt-2">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre Oficial de la Institución *</label>
            <Input {...register("name")} placeholder="p. ej. Instituto de Investigaciones de la Amazonía Peruana" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Código (Acrónimo) *</label>
            <Input {...register("code")} placeholder="p. ej. IIAP" className="h-10 uppercase font-bold tracking-wider bg-background/50 focus-visible:ring-primary/20" />
            {errors.code && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.code.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tipo de Entidad</label>
            <select
              {...register("type")}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            >
              <option value="Gubernamental">Gubernamental (Estado)</option>
              <option value="Académica">Académica / Universidad</option>
              <option value="ONG">No Gubernamental (ONG)</option>
              <option value="Privada">Empresa Privada</option>
              <option value="Investigación">Centro de Investigación</option>
              <option value="Otro">Otro</option>
            </select>

          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombres Alternativos o Históricos (separados por coma)</label>
            <Input
              placeholder="p. ej. IIAP Iquitos, Fonoteca Amazónica"
              className="h-10 bg-background/50 focus-visible:ring-primary/20"
              onBlur={(e) => {
                const val = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                setValue("additional_names", val);
              }}
              defaultValue={watch("additional_names")?.join(", ")}
            />
          </div>
        </div>
      </div>

      {/* 2. Contacto y Web */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Contacto Digital</h3>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correo Electrónico Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                <Input {...register("email")} type="email" placeholder="contacto@institucion.gob.pe" className="pl-10 h-10 bg-background/50 focus-visible:ring-primary/20" />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Líneas Telefónicas (separadas por coma)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                <Input
                  placeholder="p. ej. +51 65 243456"
                  className="pl-10 h-10 bg-background/50 focus-visible:ring-primary/20"
                  onBlur={(e) => {
                    const val = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setValue("phones", val);
                  }}
                  defaultValue={watch("phones")?.join(", ")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portal Web / Homepage</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                <Input {...register("homepage_url")} placeholder="https://www.iiap.gob.pe" className="pl-10 h-10 bg-background/50 focus-visible:ring-primary/20" />
              </div>
              {errors.homepage_url && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.homepage_url.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Colección e Historia</h3>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Año de Fundación
              </label>
              <Input type="number" {...register("founding_year", { valueAsNumber: true })} placeholder="1981" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Total Especímenes / Grabaciones
              </label>
              <Input type="number" {...register("specimen_count", { valueAsNumber: true })} className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>

            <div className="flex flex-col gap-4 pt-3 border-t border-muted/10">
              <div className="flex items-center space-x-3 group">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="is_active" checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                  )}
                />
                <Label htmlFor="is_active" className="text-xs font-bold cursor-pointer group-hover:text-primary transition-colors">Institución Activa y Operativa</Label>
              </div>

              <div className="flex items-center space-x-3 group">
                <Controller
                  name="display_on_nhc_portal"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="display_on_nhc_portal" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="display_on_nhc_portal" className="text-xs font-bold cursor-pointer group-hover:text-primary transition-colors">Visible en Portal de Biodiversidad</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Direcciones */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Ubicación Principal</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dirección Física Completa</label>
              <Input {...register("physical_address.address")} placeholder="Av. Abelardo Quiñones km 2.5" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ciudad</label>
              <Input {...register("physical_address.city")} placeholder="Iquitos" className="h-10 bg-background/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Región / Estado</label>
              <Input {...register("physical_address.province")} placeholder="Loreto" className="h-10 bg-background/50" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
          <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Correspondencia Postal</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dirección de Envío / P.O. Box</label>
              <Input {...register("mailing_address.address")} placeholder="Apartado Postal 784" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ciudad</label>
              <Input {...register("mailing_address.city")} placeholder="Iquitos" className="h-10 bg-background/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">País</label>
              <Input {...register("mailing_address.country")} defaultValue="Peru" className="h-10 bg-muted/20" readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mapa y Georreferenciación */}
      <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <MapIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Coordenadas Geográficas</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
          <div className="lg:col-span-1 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latitud Decimal</label>
              <Input type="number" step="any" {...register("latitude")} placeholder="-3.749123" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Longitud Decimal</label>
              <Input type="number" step="any" {...register("longitude")} placeholder="-73.251234" className="h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Utilice el buscador del mapa o marque directamente la ubicación de la sede institucional para georreferenciación en el portal NHC.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2 border border-muted/40 rounded-lg overflow-hidden h-[350px] shadow-inner">
            <MapPicker
              lat={latitude}
              lng={longitude}
              onChange={(lat, lng) => {
                setValue("latitude", Number(lat.toFixed(6)));
                setValue("longitude", Number(lng.toFixed(6)));
              }}
            />
          </div>
        </div>
      </div>

      {/* 5. Descripción */}
      <div className="space-y-4 bg-card border rounded-lg p-6 shadow-sm border-muted/60">
        <div className="flex items-center gap-2 pb-2 border-b border-muted/20">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Reseña Institucional</h3>
        </div>
        <div className="pt-2">
          <Textarea
            {...register("description")}
            placeholder="Describa brevemente la institución, su historia, áreas de investigación y la importancia de su colección..."
            className="min-h-[160px] resize-y bg-background/50 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <FormFooter variant={footerVariant}>

        <Button variant="outline" type="button" asChild className="h-11 px-8">
          <Link href="/dashboard/geography/institutions">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="h-11 min-w-[200px] font-bold shadow-lg shadow-primary/20">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : id ? (
            "Actualizar Institución"
          ) : (
            "Registrar Institución"
          )}
        </Button>
      </FormFooter>

    </form>
  );
}
