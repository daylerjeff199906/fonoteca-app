"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";

export function MultipleDeleteConfirmDialog({
  onConfirm,
  selectedCount,
  itemNamePlural = "elementos",
  requiredText = "eliminar",
  isDeleting = false,
}: {
  onConfirm: () => Promise<void>;
  selectedCount: number;
  itemNamePlural?: string;
  requiredText?: string;
  isDeleting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = async () => {
    if (inputValue.toLowerCase() !== requiredText.toLowerCase()) return;
    try {
      await onConfirm();
      setOpen(false);
      setInputValue("");
    } catch (err) {
      showToast.error("Error", "Ocurrió un error inesperado al intentar eliminar los registros.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => {
        if (!isDeleting) setOpen(o);
        if (!o) setInputValue(""); // Reset on close
    }}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Eliminando..." : "Eliminar selección"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {selectedCount} {itemNamePlural}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminarán permanentemente estos {selectedCount} {itemNamePlural}.
            <div className="mt-2">
              Para confirmar, escriba <strong>"{requiredText}"</strong> abajo.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Input 
             placeholder={`Escriba "${requiredText}"`} 
             value={inputValue} 
             onChange={(e) => setInputValue(e.target.value)}
             disabled={isDeleting}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={inputValue.toLowerCase() !== requiredText.toLowerCase() || isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar Todos"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
