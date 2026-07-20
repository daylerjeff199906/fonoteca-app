"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export function GeneraClient({ data, count, families }: { data: Genus[]; count: number; families: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const filterByFamily = (familyId: string) => { const params = new URLSearchParams(searchParams.toString()); familyId ? params.set("family_id", familyId) : params.delete("family_id"); params.delete("page"); router.push(`?${params}`); };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Géneros Taxonómicos" 
        description="Gestiona los géneros registrados en el catálogo"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row"><SearchInput placeholder="Buscar por nombre..." /><select value={searchParams.get("family_id") || ""} onChange={(event) => filterByFamily(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Todas las familias</option>{families.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
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
              data.map((genus) => {
                const familyName =
                  genus.parent?.name ||
                  genus.family?.name ||
                  (genus as any).family_obj?.name ||
                  families.find(
                    (f) =>
                      f.id ===
                      (genus.family_id ||
                        (genus as any).familyId ||
                        genus.parent?.id ||
                        genus.family?.id ||
                        (genus as any).family_obj?.id)
                  )?.name ||
                  "Sin Familia";

                return (
                  <TableRow key={genus.id}>
                    <TableCell className="font-semibold">{genus.name}</TableCell>
                    <TableCell>{familyName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(genus)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteButtonWithConfirm
                          id={genus.id}
                          onConfirm={deleteGenus}
                          itemName={`género ${genus.name}`}
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
            <SheetTitle>{currentGenus ? "Editar Género" : "Registrar Género"}</SheetTitle>
          </SheetHeader>
          <GenusForm
            id={currentGenus?.id || null}
            defaultValues={
              currentGenus
                ? {
                    ...currentGenus,
                    family_id:
                      currentGenus.family_id ||
                      (currentGenus as any)?.familyId ||
                      currentGenus.family?.id ||
                      currentGenus.parent?.id ||
                      (currentGenus as any)?.family_obj?.id ||
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
