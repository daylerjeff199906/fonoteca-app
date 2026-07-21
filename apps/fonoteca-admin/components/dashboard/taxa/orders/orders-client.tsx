"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Order } from "@/types/fonoteca";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/dashboard/search-input";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrderForm } from "./order-form";
import { deleteOrder } from "@/actions/orders";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PageHeader } from "@/components/panel-admin/page-header";

export function OrdersClient({ data, count, classes }: { data: Order[]; count: number; classes: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const handleEdit = (item: Order) => {
    setCurrentOrder(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCurrentOrder(null);
    setIsFormOpen(true);
  };
  const filterByClass = (classId: string) => { const params = new URLSearchParams(searchParams.toString()); classId ? params.set("class_id", classId) : params.delete("class_id"); params.delete("page"); router.push(`?${params}`); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes Taxonómicos"
        description="Gestiona los órdenes registrados en el catálogo"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row"><SearchInput placeholder="Buscar por nombre..." /><select value={searchParams.get("class_id") || ""} onChange={(event) => filterByClass(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Todas las clases</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Orden
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Clase</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No se encontraron órdenes.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const className =
                  item.parent?.name ||
                  item.class_obj?.name ||
                  (item as any).class?.name ||
                  classes.find(
                    (c) =>
                      c.id ===
                      (item.class_id ||
                        (item as any).classId ||
                        item.parent?.id ||
                        item.class_obj?.id ||
                        (item as any).class?.id)
                  )?.name ||
                  "Sin Clase";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell>{className}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteButtonWithConfirm
                          id={item.id}
                          onConfirm={deleteOrder}
                          itemName={`orden ${item.name}`}
                          requiredText="eliminar"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationButtons totalCount={count} />

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto min-w-[35vw] p-6">
          <SheetHeader className="pb-4">
            <SheetTitle>{currentOrder ? "Editar Orden" : "Registrar Orden"}</SheetTitle>
          </SheetHeader>
          <OrderForm
            id={currentOrder?.id || null}
            defaultValues={
              currentOrder
                ? {
                    ...currentOrder,
                    class_id:
                      currentOrder.class_id ||
                      (currentOrder as any)?.classId ||
                      currentOrder.class_obj?.id ||
                      currentOrder.parent?.id ||
                      (currentOrder as any)?.class?.id ||
                      "",
                  }
                : undefined
            }
            onSuccess={() => setIsFormOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
