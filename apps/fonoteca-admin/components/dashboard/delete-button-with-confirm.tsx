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
import { toast } from "react-toastify";

export function DeleteButtonWithConfirm({
  id,
  onConfirm,
  itemName = "elemento",
  requiredText = "delete",
}: {
  id: string;
  onConfirm: (id: string) => Promise<{ success?: boolean; error?: string }>;
  itemName?: string;
  requiredText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (inputValue.toLowerCase() !== requiredText.toLowerCase()) return;
    setLoading(true);
    try {
      const result = await onConfirm(id);
      if (result.success) {
        toast.success(`${itemName} eliminado correctamente`);
        setOpen(false);
        setInputValue("");
      } else {
        toast.error(result.error || "Error al eliminar");
      }
    } catch (err) {
      toast.error("Error inesperado al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => {
        setOpen(o);
        if (!o) setInputValue(""); // Reset on close
    }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-destructive hover:text-destructive" size="icon" title="Eliminar">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente este {itemName}.
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
             disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={inputValue.toLowerCase() !== requiredText.toLowerCase() || loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
