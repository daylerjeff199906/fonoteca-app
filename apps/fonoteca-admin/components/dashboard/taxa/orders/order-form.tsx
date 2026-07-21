"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, OrderInput } from "@/lib/validations/fonoteca";
import { createOrder, updateOrder } from "@/actions/orders";
import { getAllClasses } from "@/actions/classes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { FormFooter } from "@/components/panel-admin/form-footer";

export function OrderForm({
  id,
  defaultValues,
  onSuccess,
}: {
  id: string | null;
  defaultValues?: Partial<OrderInput>;
  onSuccess?: () => void;
}) {
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: defaultValues || {
      name: "",
      class_id: ""
    }
  });

  useEffect(() => {
    setIsLoadingClasses(true);
    getAllClasses().then(res => {
      if (res.data) setClasses(res.data);
      if (res.error) showToast.error("No se pudieron cargar las clases", res.error);
      setIsLoadingClasses(false);
    }).catch(() => { showToast.error("No se pudieron cargar las clases", "Verifica tu conexión e inténtalo nuevamente."); setIsLoadingClasses(false); });
  }, []);

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        class_id:
          defaultValues.class_id ||
          (defaultValues as any)?.classId ||
          (defaultValues as any)?.class_obj?.id ||
          (defaultValues as any)?.parent?.id ||
          (defaultValues as any)?.class?.id ||
          "",
      });
    }
  }, [defaultValues, reset, classes]);

  const onSubmit = async (data: OrderInput) => {
    let resp;
    if (id) {
      resp = await updateOrder(id, data);
    } else {
      resp = await createOrder(data);
    }

    if (resp.success) {
      showToast.response(resp, id ? "Orden actualizada" : "Orden registrada", id ? "Los cambios se guardaron correctamente." : "El orden fue registrado correctamente.");
      reset();
      if (onSuccess) onSuccess();
    } else {
      showToast.response(resp, "", "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Clase *</label>
          <select
            {...register("class_id")}
            disabled={isLoadingClasses}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{isLoadingClasses ? "Cargando clases..." : "Seleccione una clase..."}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.class_id && <p className="text-xs text-red-500">{errors.class_id.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre del Orden *</label>
          <Input {...register("name")} className="bg-background" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <FormFooter variant="sticky">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Orden"}
        </Button>
      </FormFooter>
    </form>
  );
}
