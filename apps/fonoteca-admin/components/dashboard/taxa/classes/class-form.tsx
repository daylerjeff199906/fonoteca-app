"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassInput } from "@/lib/validations/fonoteca";
import { createClass, updateClass } from "@/actions/classes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FormFooter } from "@/components/panel-admin/form-footer";

export function ClassForm({
  id,
  defaultValues,
  onSuccess,
}: {
  id: string | null;
  defaultValues?: Partial<ClassInput>;
  onSuccess?: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClassInput>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: defaultValues || {
      kingdom: "Animalia",
      phylum: "Chordata",
      name: ""
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: ClassInput) => {
    let resp;
    if (id) {
      resp = await updateClass(id, data);
    } else {
      resp = await createClass(data);
    }

    if (resp.success) {
      toast.success(id ? "Clase actualizada" : "Clase registrada");
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error("Error al guardar la clase");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Reino *</label>
          <Input {...register("kingdom")} className="bg-background" />
          {errors.kingdom && <p className="text-xs text-red-500">{errors.kingdom.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Filo</label>
          <Input {...register("phylum")} className="bg-background" />
          {errors.phylum && <p className="text-xs text-red-500">{errors.phylum.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre de la Clase *</label>
          <Input {...register("name")} className="bg-background" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <FormFooter variant="sticky">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Clase"}
        </Button>
      </FormFooter>
    </form>
  );
}
