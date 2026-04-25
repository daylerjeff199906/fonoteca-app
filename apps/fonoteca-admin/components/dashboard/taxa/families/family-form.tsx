"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familySchema, FamilyInput } from "@/lib/validations/fonoteca";
import { createFamily, updateFamily } from "@/actions/families";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FormFooter } from "@/components/panel-admin/form-footer";

export function FamilyForm({
  id,
  defaultValues,
  onSuccess,
}: {
  id: string | null;
  defaultValues?: Partial<FamilyInput>;
  onSuccess?: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FamilyInput>({
    resolver: zodResolver(familySchema) as any,
    defaultValues: defaultValues || {
      kingdom: "Animalia",
      phylum: "Chordata",
      class: "",
      order: "",
      name: ""
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: FamilyInput) => {
    let resp;
    if (id) {
      resp = await updateFamily(id, data);
    } else {
      resp = await createFamily(data);
    }

    if (resp.success) {
      toast.success(id ? "Familia actualizada" : "Familia registrada");
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error("Error al guardar la familia");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="text-xs font-semibold text-muted-foreground uppercase">Clase *</label>
          <Input {...register("class")} className="bg-background" />
          {errors.class && <p className="text-xs text-red-500">{errors.class.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Orden *</label>
          <Input {...register("order")} className="bg-background" />
          {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre de la Familia *</label>
          <Input {...register("name")} className="bg-background" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <FormFooter>
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Familia"}
        </Button>
      </FormFooter>
    </form>
  );
}
