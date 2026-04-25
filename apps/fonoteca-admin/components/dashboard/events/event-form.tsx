"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventInput } from "@/lib/validations/fonoteca";
import { createEvent, updateEvent, getEvent } from "@/actions/events";
import { getLocations } from "@/actions/locations";
import { getProfiles, getCurrentProfile } from "@/actions/profiles";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Location, Event } from "@/types/fonoteca";
import { FileText, MapPin, Calendar, User, Clock, Settings, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EventForm({ id, redirectUrl }: { id?: string, redirectUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [locations, setLocations] = useState<Location[]>([]);
  const [profiles, setProfiles] = useState<{ id: string, first_name: string, last_name: string }[]>([]);

  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<EventInput>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      record_status: "draft",
      dynamicProperties: {}
    }
  });

  useEffect(() => {
    // Load lists for the pickers
    getLocations({ limit: 100 }).then(resp => setLocations(resp.data));
    getProfiles().then(resp => {
      if (resp.data) setProfiles(resp.data);
    });

    if (!id) {
      // Set current user as default profile
      getCurrentProfile().then(resp => {
        if (resp.data) {
          setValue("profile_id", resp.data.id);
        }
      });
    }

    if (id) {
      setLoading(true);
      getEvent(id).then((resp) => {
        setLoading(false);
        setIsFetching(false);
        if (resp.data) {
          reset(resp.data as any);

          if (resp.data.location) {
            setLocations(prev => {
              if (!prev.find(l => l.id === resp.data.location?.id)) {
                return [resp.data.location as Location, ...prev];
              }
              return prev;
            });
          }
        } else {
          toast.error("Error al cargar evento");
        }
      });
    }
  }, [id, reset, setValue]);

  const onSubmit = async (data: EventInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateEvent(id, data);
    } else {
      resp = await createEvent(data);
    }
    setLoading(false);

    if (resp.success) {
      toast.success(id ? "Evento actualizado" : "Evento registrado");
      if (redirectUrl && resp.data?.id) {
        // Replace [id] with actual event id if present in the redirectUrl
        const finalUrl = redirectUrl.replace('[id]', resp.data.id);
        router.push(finalUrl);
      } else {
        router.push("/dashboard/events");
      }
    } else {
      toast.error("Error: " + (typeof resp.error === "string" ? resp.error : "Falló la validación"));
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full max-w-7xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-medium">Cargando detalles del evento...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full max-w-7xl">
      {/* 1. Datos del Evento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Información del Evento</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Event ID *</label>
            </div>
            <div className="w-3/4">
              <Input {...register("eventID")} placeholder="Ex: EXP-2024-001" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.eventID && <p className="text-xs text-red-500 mt-1 px-2">{errors.eventID.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Protocolo de Muestreo</label>
            </div>
            <div className="w-3/4">
              <Input {...register("samplingProtocol")} placeholder="Ex: Grabación pasiva / Transecto" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ubicación y Responsable */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Ubicación y Responsable</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
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

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Responsable *</label>
            </div>
            <div className="w-3/4">
              <select
                {...register("profile_id")}
                className="flex h-8 w-full max-w-xl rounded-md border-none bg-transparent px-2 text-sm shadow-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              >
                <option value="">Seleccionar Responsable...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
              {errors.profile_id && <p className="text-xs text-red-500 mt-1 px-2">{errors.profile_id.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Temporalidad */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Temporalidad</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha *</label>
            </div>
            <div className="w-3/4">
              <Input type="date" {...register("eventDate")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
              {errors.eventDate && <p className="text-xs text-red-500 mt-1 px-2">{errors.eventDate.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Hora</label>
            </div>
            <div className="w-3/4">
              <Input type="time" step="1" {...register("eventTime")} className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Equipamiento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Equipamiento</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Marca (Make)</label>
            </div>
            <div className="w-3/4">
              <Input {...register("make")} placeholder="Ex: AudioMoth / Wildlife Acoustics" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="w-1/4 flex items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Modelo (Model)</label>
            </div>
            <div className="w-3/4">
              <Input {...register("model")} placeholder="Ex: SM4 / 1.2.0" className="bg-transparent border-none shadow-none h-8 font-medium focus-visible:ring-1 focus-visible:ring-primary/20 px-2 max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Estado */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Estado y Configuración</h3>
        </div>
        <div className="divide-y divide-muted/10 border-t border-b border-muted/10">
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
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-muted/20 mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/events">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
