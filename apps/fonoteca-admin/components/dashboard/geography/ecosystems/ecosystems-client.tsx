"use client"

import { useState } from "react";
import { Ecosystem } from "@/types/fonoteca";
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
import { Edit, Trees, MapIcon, Trash2, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { deleteEcosystem, deactivateEcosystem, multipleDeleteEcosystems } from "@/actions/ecosystems";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { MultipleDeleteConfirmDialog } from "@/components/dashboard/multiple-delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";

export function EcosystemsClient({ data }: { data: Ecosystem[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);

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
    await multipleDeleteEcosystems(selectedIds);
    setSelectedIds([]);
    setIsDeleting(false);
  };

  const handleDeactivate = async (id: string) => {
    setIsDeactivating(id);
    await deactivateEcosystem(id);
    setIsDeactivating(null);
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-muted">
          <span className="text-sm font-medium">{selectedIds.length} seleccionados</span>
          <MultipleDeleteConfirmDialog 
            onConfirm={handleMultipleDelete} 
            selectedCount={selectedIds.length} 
            itemNamePlural="hábitats" 
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
              <TableHead>Hábitat</TableHead>
              <TableHead>Región Natural</TableHead>
              <TableHead>Especies Botánicas</TableHead>
              <TableHead>Mapa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((eco) => (
                <TableRow key={eco.id} data-state={selectedIds.includes(eco.id!) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(eco.id!)}
                      onCheckedChange={() => toggleSelect(eco.id!)}
                      aria-label={`Seleccionar ${eco.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                        <Trees className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm line-clamp-1">{eco.name}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{eco.typical_locality || "Sin localidad típica"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                      {eco.region?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {eco.botanical_species?.slice(0, 2).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[9px] italic py-0 h-4">
                          {s}
                        </Badge>
                      ))}
                      {eco.botanical_species && eco.botanical_species.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{eco.botanical_species.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {eco.distribution_geojson ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] flex items-center gap-1">
                        <MapIcon className="h-2.5 w-2.5" /> Disponible
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {(eco as any).record_status !== 'inactive' ? (
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
                        disabled={isDeactivating === eco.id}
                        onClick={() => handleDeactivate(eco.id!)}
                      >
                        {(eco as any).record_status !== 'inactive' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Link href={`/dashboard/geography/ecosystems/${eco.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm 
                        id={eco.id!} 
                        onConfirm={deleteEcosystem} 
                        itemName="hábitat" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                  No se encontraron hábitats.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
