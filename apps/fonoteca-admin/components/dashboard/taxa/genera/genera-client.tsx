"use client"

import { useState } from "react";
import { Genus } from "@/types/fonoteca";
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
import { GenusForm } from "./genus-form";
import { deleteGenus } from "@/actions/genera";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PageHeader } from "@/components/panel-admin/page-header";

export function GeneraClient({ data, count }: { data: Genus[]; count: number }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentGenus, setCurrentGenus] = useState<Genus | null>(null);

  const handleEdit = (genus: Genus) => {
    setCurrentGenus(genus);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCurrentGenus(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Géneros Taxonómicos" 
        description="Gestiona los géneros registrados en el catálogo"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Taxonomía", href: "/dashboard/taxa" },
          { label: "Géneros", href: "/dashboard/taxa/genera", active: true },
        ]}
      />

      <div className="flex items-center justify-between">
        <SearchInput placeholder="Buscar por nombre..." />
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Género
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No se encontraron géneros.
                </TableCell>
              </TableRow>
            ) : (
              data.map((genus) => (
                <TableRow key={genus.id}>
                  <TableCell className="font-semibold">{genus.name}</TableCell>
                  <TableCell>{genus.family?.name || "Sin Familia"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(genus)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteButtonWithConfirm 
                        onConfirm={() => deleteGenus(genus.id)} 
                        title="¿Eliminar género?" 
                        description={`Estás a punto de eliminar el género ${genus.name}. Esto podría fallar si tiene especies (taxones) asociados.`} 
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
            <SheetTitle>{currentGenus ? "Editar Género" : "Registrar Género"}</SheetTitle>
          </SheetHeader>
          <GenusForm 
            id={currentGenus?.id || null} 
            defaultValues={currentGenus || undefined} 
            onSuccess={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
