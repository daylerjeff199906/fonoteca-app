"use client"

import { useState } from "react";
import { NaturalRegion } from "@/types/fonoteca";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Edit, Globe, Trash2, Power, PowerOff, Plus } from "lucide-react";
import { deleteNaturalRegion, deactivateNaturalRegion, multipleDeleteNaturalRegions } from "@/actions/natural-regions";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { MultipleDeleteConfirmDialog } from "@/components/dashboard/multiple-delete-confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/panel-admin/page-header";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NaturalRegionForm } from "@/components/dashboard/geography/natural-regions/natural-region-form";

export function NaturalRegionsClient({ data }: { data: NaturalRegion[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditId(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditId(id);
    setSheetOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id!));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    await multipleDeleteNaturalRegions(selectedIds);
    setSelectedIds([]);
    setIsDeleting(false);
  };

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    setIsDeactivating(id);
    await deactivateNaturalRegion(id);
    setIsDeactivating(null);
  };

  return (
    <>
      <PageHeader
        title="Regiones Naturales"
        description="Nivel macro de ecosistemas y biomas."
        action={{
          label: "Añadir Región",
          onClick: handleOpenCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="space-y-4">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-muted">
            <span className="text-sm font-medium">{selectedIds.length} seleccionados</span>
            <MultipleDeleteConfirmDialog
              onConfirm={handleMultipleDelete}
              selectedCount={selectedIds.length}
              itemNamePlural="regiones naturales"
              isDeleting={isDeleting}
            />
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
          </div>
        )}

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((region) => (
                  <TableRow key={region.id} data-state={selectedIds.includes(region.id!) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(region.id!)}
                        onCheckedChange={() => toggleSelect(region.id!)}
                        aria-label={`Seleccionar ${region.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={region.logo_url || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          <Globe className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {region.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-[500px]">
                      {region.description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      {(region as any).record_status !== 'inactive' ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                          title="Desactivar/Activar"
                          disabled={isDeactivating === region.id}
                          onClick={() => handleDeactivate(region.id!, true)}
                        >
                          {(region as any).record_status !== 'inactive' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Editar"
                          onClick={() => handleOpenEdit(region.id!)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteButtonWithConfirm
                          id={region.id!}
                          onConfirm={deleteNaturalRegion}
                          itemName="región natural"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    No se encontraron regiones naturales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editId ? "Editar Región Natural" : "Registrar Región Natural"}</SheetTitle>
            <SheetDescription>
              {editId ? "Actualiza los datos de la región seleccionada." : "Define una nueva región o ecosistema macro."}
            </SheetDescription>
          </SheetHeader>
          <NaturalRegionForm
            id={editId}
            onSuccess={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
            footerVariant="sticky"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
