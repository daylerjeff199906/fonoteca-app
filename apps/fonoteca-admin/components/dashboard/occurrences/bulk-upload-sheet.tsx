"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Upload, Download, Loader2 } from "lucide-react";
import { bulkCreateOccurrences } from "@/actions/occurrences";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function BulkUploadSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ successCount: number; errorCount: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const csvContent = "occurrenceID,basisOfRecord,taxon_id,location_id,eventDate,recordedBy,institutionCode,collectionCode\n" +
      "FON-001,HumanObservation,UUID_DEL_TAXON,UUID_DE_UBICACION,2024-03-24,Juan Perez,IIAP,Fonoteca";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_ocurrencias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResults(null);

    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;

      try {
        let items: any[] = [];
        if (file.type === "application/json" || file.name.endsWith(".json")) {
          items = JSON.parse(text);
        } else {
          // Fallback to basic CSV parser
          const lines = text.split("\n").filter(Boolean);
          if (lines.length === 0) {
            toast.error("Archivo vacío");
            setLoading(false);
            return;
          }
          const header = lines[0] ? lines[0].split(",").map((h: string) => h.trim()) : [];

          items = lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim());
            const obj: any = {};
            header.forEach((key, index) => {
              obj[key] = values[index] || "";
            });
            return obj;
          });
        }

        if (items.length === 0) {
          toast.error("Archivo vacío o formato inválido");
          setLoading(false);
          return;
        }

        const resp = await bulkCreateOccurrences(items);
        setResults({
          successCount: resp.successCount || 0,
          errorCount: resp.errorCount || 0,
          errors: resp.errors || []
        });

        if ((resp.successCount || 0) > 0) {
          toast.success(`Carga completada: ${resp.successCount} subidos correctamente`);
          router.refresh();
        } else {
          toast.error("No se pudo subir ningún registro");
        }

      } catch (err) {
        toast.error("Error procesando el archivo");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Carga Masiva
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Carga Masiva de Ocurrencias</SheetTitle>
          <SheetDescription>
            Sube un archivo **JSON** o **CSV** para registrar múltiples ocurrencias a la vez. El archivo debe contener los encabezados correctos.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 border-t mt-4">
          <div>
            <h4 className="font-medium text-sm mb-2">1. Obtener Plantilla</h4>
            <Button variant="secondary" size="sm" className="w-full gap-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4" /> Descargar Plantilla (.csv)
            </Button>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">2. Subir Archivo</h4>
            <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">Click para seleccionar</span>
              <span className="text-xs text-muted-foreground mt-1">Soporta .json o .csv</span>
              <input 
                 type="file" 
                 accept=".csv,.json" 
                 className="hidden" 
                 onChange={handleFileUpload} 
                 disabled={loading}
              />
            </label>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Procesando carga...
            </div>
          )}

          {results && (
            <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
              <h5 className="font-semibold text-sm">Resultados:</h5>
              <p className="text-sm text-green-600 font-medium">✓ Éxitos: {results.successCount}</p>
              <p className="text-sm text-red-600 font-medium">✕ Errores: {results.errorCount}</p>
              
              {results.errors.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Detalle Errores:</p>
                  <ul className="list-disc pl-4 text-xs text-red-500 max-h-40 overflow-auto">
                    {results.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
