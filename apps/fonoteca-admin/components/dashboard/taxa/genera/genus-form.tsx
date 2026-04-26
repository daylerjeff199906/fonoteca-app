"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { genusSchema, GenusInput } from "@/lib/validations/fonoteca";
import { createGenus, updateGenus } from "@/actions/genera";
import { getFamilies } from "@/actions/taxa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FormFooter } from "@/components/panel-admin/form-footer";

export function GenusForm({
  id,
  defaultValues,
  onSuccess,
}: {
  id: string | null;
  defaultValues?: Partial<GenusInput>;
  onSuccess?: () => void;
}) {
  const [families, setFamilies] = useState<{ id: string, name: string }[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GenusInput>({
    resolver: zodResolver(genusSchema) as any,
    defaultValues: defaultValues || {
      name: "",
      family_id: ""
    }
  });

  useEffect(() => {
    setIsLoadingFamilies(true);
    getFamilies().then(res => {
      if (res.data) setFamilies(res.data);
      setIsLoadingFamilies(false);
    });
  }, []);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, families]);

  const onSubmit = async (data: GenusInput) => {
    let resp;
    if (id) {
      resp = await updateGenus(id, data);
    } else {
      resp = await createGenus(data);
    }

    if (resp.success) {
      toast.success(id ? "Género actualizado" : "Género registrado");
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error("Error al guardar el género");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Familia *</label>
          <select
            {...register("family_id")}
            disabled={isLoadingFamilies}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{isLoadingFamilies ? "Cargando familias..." : "Seleccione una familia..."}</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.family_id && <p className="text-xs text-red-500">{errors.family_id.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre del Género *</label>
          <Input {...register("name")} className="bg-background" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <FormFooter variant="sticky">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Género"}
        </Button>
      </FormFooter>
    </form>
  );
}
