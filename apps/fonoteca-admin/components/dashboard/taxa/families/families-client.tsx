"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Family } from "@/types/fonoteca";
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
import { FamilyForm } from "./family-form";
import { deleteFamily } from "@/actions/families";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PageHeader } from "@/components/panel-admin/page-header";

export function FamiliesClient({ data, count, orders }: { data: Family[]; count: number; orders: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);

  const handleEdit = (family: Family) => {
    setCurrentFamily(family);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCurrentFamily(null);
    setIsFormOpen(true);
  };
  const filterByOrder = (orderId: string) => { const params = new URLSearchParams(searchParams.toString()); orderId ? params.set("order_id", orderId) : params.delete("order_id"); params.delete("page"); router.push(`?${params}`); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Familias Taxonómicas"
        description="Gestiona las familias registradas en el catálogo"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row"><SearchInput placeholder="Buscar por nombre..." /><select value={searchParams.get("order_id") || ""} onChange={(event) => filterByOrder(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Todos los órdenes</option>{orders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Familia
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No se encontraron familias.
                </TableCell>
              </TableRow>
            ) : (
              data.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-semibold">{family.name}</TableCell>
                  <TableCell>{family.parent?.name || family.order_obj?.name || "Sin Orden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(family)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteButtonWithConfirm
                        id={family.id}
                        onConfirm={deleteFamily}
                        itemName={`familia ${family.name}`}
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
            <SheetTitle>{currentFamily ? "Editar Familia" : "Registrar Familia"}</SheetTitle>
          </SheetHeader>
          <FamilyForm
            id={currentFamily?.id || null}
            defaultValues={currentFamily ? {
              ...currentFamily,
              order_id: currentFamily.order_id ?? ""
            } : undefined}
            onSuccess={() => setIsFormOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
