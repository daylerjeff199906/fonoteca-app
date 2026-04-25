"use client"

import { useState } from "react";
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

export function FamiliesClient({ data, count }: { data: Family[]; count: number }) {
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Familias Taxonómicas" 
        description="Gestiona las familias registradas en el catálogo"
      />

      <div className="flex items-center justify-between">
        <SearchInput placeholder="Buscar por nombre, orden, clase..." />
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
              <TableHead>Clase</TableHead>
              <TableHead>Reino</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron familias.
                </TableCell>
              </TableRow>
            ) : (
              data.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-semibold">{family.name}</TableCell>
                  <TableCell>{family.order}</TableCell>
                  <TableCell>{family.class}</TableCell>
                  <TableCell>{family.kingdom}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(family)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteButtonWithConfirm 
                        onConfirm={() => deleteFamily(family.id)} 
                        title="¿Eliminar familia?" 
                        description={`Estás a punto de eliminar la familia ${family.name}. Esto podría fallar si tiene géneros asociados.`} 
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
        <SheetContent className="overflow-y-auto min-w-[30vw]">
          <SheetHeader className="pb-4">
            <SheetTitle>{currentFamily ? "Editar Familia" : "Registrar Familia"}</SheetTitle>
          </SheetHeader>
          <FamilyForm 
            id={currentFamily?.id || null} 
            defaultValues={currentFamily || undefined} 
            onSuccess={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
