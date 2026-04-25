"use client"

import { useState } from "react";
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

export function OrdersClient({ data, count }: { data: Order[]; count: number }) {
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Órdenes Taxonómicos" 
        description="Gestiona los órdenes registrados en el catálogo"
      />

      <div className="flex items-center justify-between">
        <SearchInput placeholder="Buscar por nombre..." />
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
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.class?.name || "Sin Clase"}</TableCell>
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
              ))
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
            defaultValues={currentOrder || undefined} 
            onSuccess={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
