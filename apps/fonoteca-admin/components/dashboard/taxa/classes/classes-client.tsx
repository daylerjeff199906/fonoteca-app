"use client"

import { useState } from "react";
import { Class } from "@/types/fonoteca";
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
import { ClassForm } from "./class-form";
import { deleteClass } from "@/actions/classes";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PageHeader } from "@/components/panel-admin/page-header";

export function ClassesClient({ data, count }: { data: Class[]; count: number }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);

  const handleEdit = (item: Class) => {
    setCurrentClass(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCurrentClass(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clases Taxonómicas" 
        description="Gestiona las clases registradas en el catálogo"
      />

      <div className="flex items-center justify-between">
        <SearchInput placeholder="Buscar por nombre..." />
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Clase
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Filo</TableHead>
              <TableHead>Reino</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No se encontraron clases.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.phylum}</TableCell>
                  <TableCell>{item.kingdom}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteButtonWithConfirm 
                        id={item.id}
                        onConfirm={deleteClass} 
                        itemName={`clase ${item.name}`} 
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
            <SheetTitle>{currentClass ? "Editar Clase" : "Registrar Clase"}</SheetTitle>
          </SheetHeader>
          <ClassForm 
            id={currentClass?.id || null} 
            defaultValues={currentClass ? {
              ...currentClass,
              phylum: currentClass.phylum ?? undefined
            } : undefined} 
            onSuccess={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
