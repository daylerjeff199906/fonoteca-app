"use client"

import { useState } from "react";
import { Institution } from "@/types/fonoteca";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Plus, Edit, Building2, MapPin, Trash2, PowerOff, Power } from "lucide-react";
import Link from "next/link";
import { deleteInstitution, deactivateInstitution, multipleDeleteInstitutions } from "@/actions/institutions";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { MultipleDeleteConfirmDialog } from "@/components/dashboard/multiple-delete-confirm-dialog";

export function InstitutionsClient({ data }: { data: Institution[] }) {
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
    await multipleDeleteInstitutions(selectedIds);
    setSelectedIds([]);
    setIsDeleting(false);
  };

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    setIsDeactivating(id);
    // Asumimos que deactivateInstitution actúa como un toggle o que el backend maneja el cambio
    await deactivateInstitution(id);
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
            itemNamePlural="instituciones" 
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
              <TableHead className="w-[300px]">Institución</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ciudad / País</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((inst) => (
                <TableRow key={inst.id} data-state={selectedIds.includes(inst.id!) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(inst.id!)}
                      onCheckedChange={() => toggleSelect(inst.id!)}
                      aria-label={`Seleccionar ${inst.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm line-clamp-1">{inst.name}</span>
                        <span className="text-[10px] text-muted-foreground">{inst.email || "Sin email"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                      {inst.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{inst.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{inst.physical_address?.city || "N/A"}, {inst.physical_address?.country || "Peru"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Fallback si el campo es is_active o record_status activo */}
                    {inst.is_active !== false && (inst as any).record_status !== 'inactive' ? (
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
                        disabled={isDeactivating === inst.id}
                        onClick={() => handleDeactivate(inst.id!, true)}
                      >
                        {inst.is_active !== false && (inst as any).record_status !== 'inactive' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Link href={`/dashboard/geography/institutions/${inst.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm 
                        id={inst.id!} 
                        onConfirm={deleteInstitution} 
                        itemName="institución" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                  No se encontraron instituciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
