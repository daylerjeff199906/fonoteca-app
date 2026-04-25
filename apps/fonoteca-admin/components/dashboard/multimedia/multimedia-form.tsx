"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { multimediaSchema, MultimediaInput } from "@/lib/validations/fonoteca";
import { createMultimedia, updateMultimedia, getMultimedia } from "@/actions/multimedia";
import { getOccurrences } from "@/actions/occurrences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Occurrence } from "@/types/fonoteca";

export function MultimediaForm({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MultimediaInput>({
    resolver: zodResolver(multimediaSchema) as any,
    defaultValues: {
      type: "Sound",
      format: "audio/wav",
      rightsHolder: "Instituto de Investigaciones de la Amazonía Peruana (IIAP)",
      license: "http://creativecommons.org/licenses/by-nc/4.0/",
      order_index: 0,
      record_status: "draft",
      is_public: true,
      guano_metadata: {}
    }
  });

  useEffect(() => {
    // Load lists for the pickers
    getOccurrences({ limit: 100 }).then(resp => setOccurrences(resp.data));

    if (id) {
      setLoading(true);
      getMultimedia(id).then((resp) => {
        setLoading(false);
        if (resp.data) {
          reset(resp.data as any);
        } else {
          toast.error("Error al cargar archivo multimedia");
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: MultimediaInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateMultimedia(id, data);
    } else {
      resp = await createMultimedia(data);
    }
    setLoading(false);

    if (resp.success) {
      toast.success(id ? "Archivo actualizado" : "Archivo registrado");
      router.push("/dashboard/multimedia");
    } else {
      toast.error("Error: " + (typeof resp.error === "string" ? resp.error : "Falló la validación"));
    }
  };

  if (loading && id) {
    return <div className="text-center py-4">Cargando datos...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl bg-card border p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ocurrencia *</label>
          <select
            {...register("occurrence_id")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Seleccionar Ocurrencia...</option>
            {occurrences.map(oc => (
              <option key={oc.id} value={oc.id}>{oc.occurrenceID} ({oc.taxon?.scientificName || "Desconocido"})</option>
            ))}
          </select>
          {errors.occurrence_id && <p className="text-xs text-red-500">{errors.occurrence_id.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Identifier / URL *</label>
          <Input {...register("identifier")} placeholder="Ex: https://mi-servidor.com/audio.mp3" />
          {errors.identifier && <p className="text-xs text-red-500">{errors.identifier.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input {...register("title")} placeholder="Ex: Canto de ave en amanecer" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Creador *</label>
          <Input {...register("creator")} placeholder="Ex: Juan Pérez" />
          {errors.creator && <p className="text-xs text-red-500">{errors.creator.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre de Archivo Original</label>
          <Input {...register("originalFilename")} placeholder="Ex: recording_001.wav" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado del Registro</label>
          <select
            {...register("record_status")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="deleted">Eliminado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo *</label>
          <Input {...register("type")} placeholder="Sound, Still, MovingImage" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Formato *</label>
          <Input {...register("format")} placeholder="audio/mp3, video/mp4" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Índice de Orden</label>
          <Input type="number" {...register("order_index", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <Input {...register("description")} placeholder="Detalles de la grabación." />
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Equipamiento</label>
          <Input {...register("equipmentUsed")} placeholder="Ex: Zoom H4n" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Software</label>
          <Input {...register("software")} placeholder="Ex: Audacity" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sampling Rate (Hz)</label>
          <Input type="number" {...register("samplingRate", { valueAsNumber: true })} placeholder="44100" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bitrate</label>
          <Input {...register("bitrate")} placeholder="128kbps" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Canales</label>
          <Input {...register("audioChannel")} placeholder="Stereo / Mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Titular Derechos</label>
          <Input {...register("rightsHolder")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Licencia</label>
          <Input {...register("license")} />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="is_public"
          {...register("is_public")}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="is_public" className="text-sm font-medium">
          Es público y accesible para todos
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => router.push("/dashboard/multimedia")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
