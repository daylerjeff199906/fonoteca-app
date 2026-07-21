"use client"

import { useState } from "react";
import { Location } from "@/types/fonoteca";
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
import { Edit, Trash2, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { deleteLocation, deactivateLocation, multipleDeleteLocations } from "@/actions/locations";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { MultipleDeleteConfirmDialog } from "@/components/dashboard/multiple-delete-confirm-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function LocationsClient({ data }: { data: Location[] }) {
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
    await multipleDeleteLocations(selectedIds);
    setSelectedIds([]);
    setIsDeleting(false);
  };

  const handleDeactivate = async (id: string) => {
    setIsDeactivating(id);
    await deactivateLocation(id);
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
            itemNamePlural="ubicaciones" 
            isDeleting={isDeleting} 
          />
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
        </div>
      )}

      <div className="rounded-md border bg-card shadow-sm text-xs">
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
              <TableHead>Localidad</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((loc) => (
                <TableRow key={loc.id} data-state={selectedIds.includes(loc.id!) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(loc.id!)}
                      onCheckedChange={() => toggleSelect(loc.id!)}
                      aria-label={`Seleccionar ${loc.locality}`}
                    />
                  </TableCell>
                  <TableCell className="font-bold text-primary">{loc.locality}</TableCell>
                  <TableCell>{loc.district?.province?.department?.name || "-"}</TableCell>
                  <TableCell>{loc.district?.province?.name || "-"}</TableCell>
                  <TableCell>{loc.district?.name || "-"}</TableCell>
                  <TableCell className="font-mono text-[10px]">
                    {loc.decimalLatitude && loc.decimalLongitude
                      ? `${loc.decimalLatitude}, ${loc.decimalLongitude}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {(loc as any).record_status !== 'inactive' ? (
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
                        disabled={isDeactivating === loc.id}
                        onClick={() => handleDeactivate(loc.id!)}
                      >
                        {(loc as any).record_status !== 'inactive' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Link href={`/dashboard/locations/${loc.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm 
                        id={loc.id!} 
                        onConfirm={deleteLocation} 
                        itemName="lugar / ubicación" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
