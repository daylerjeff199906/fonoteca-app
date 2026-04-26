"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familySchema, FamilyInput } from "@/lib/validations/fonoteca";
import { createFamily, updateFamily } from "@/actions/families";
import { getAllOrders } from "@/actions/orders";
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
  const [orders, setOrders] = useState<{ id: string, name: string }[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FamilyInput>({
    resolver: zodResolver(familySchema) as any,
    defaultValues: defaultValues || {
      name: "",
      order_id: ""
    }
  });

  useEffect(() => {
    setIsLoadingOrders(true);
    getAllOrders().then(res => {
      if (res.data) setOrders(res.data);
      setIsLoadingOrders(false);
    });
  }, []);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, orders]);

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Orden *</label>
          <select
            {...register("order_id")}
            disabled={isLoadingOrders}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{isLoadingOrders ? "Cargando órdenes..." : "Seleccione un orden..."}</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          {errors.order_id && <p className="text-xs text-red-500">{errors.order_id.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre de la Familia *</label>
          <Input {...register("name")} className="bg-background" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <FormFooter variant="sticky">
        <Button variant="outline" type="button" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Registrar Familia"}
        </Button>
      </FormFooter>
    </form>
  );
}
