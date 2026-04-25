"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Upload, Loader2, AlertCircle, CheckCircle,
  FileSpreadsheet, FileJson, Trash2, Info,
  ArrowRight, Table as TableIcon, MapPin,
  History, Image, FileSearch, X
} from "lucide-react";
import { bulkUpsert } from "@/actions/bulk";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";

const TABLES = [
  {
    id: "taxa",
    label: "Taxonomía (Taxones)",
    icon: <FileSearch className="h-5 w-5" />,
    description: "Familias, géneros y especies del catálogo biológico.",
    headers: ["id", "taxonID", "scientificName", "acceptedNameUsage", "specificEpithet", "infraspecificEpithet", "taxonRank", "scientificNameAuthorship", "vernacularName", "nomenclaturalCode", "genus_id"]
  },
  {
    id: "occurrences",
    label: "Monitoreo (Ocurrencias)",
    icon: <History className="h-5 w-5" />,
    description: "Registros de campo, avistamientos y colectas.",
    headers: ["id", "occurrenceID", "taxon_id", "location_id", "basisOfRecord", "recordedBy", "identifiedBy", "eventDate", "eventTime", "institutionCode", "collectionCode", "catalogNumber", "samplingProtocol", "lifeStage", "sex", "reproductiveCondition", "occurrenceRemarks"]
  },
  {
    id: "locations",
    label: "Geografía (Ubicaciones)",
    icon: <MapPin className="h-5 w-5" />,
    description: "Países, estados, departamentos y coordenadas.",
    headers: ["id", "locationID", "continent", "country", "countryCode", "stateProvince", "county", "locality", "decimalLatitude", "decimalLongitude", "coordinateUncertaintyInMeters", "elevation", "elevationAccuracy", "habitat"]
  },
  {
    id: "multimedia",
    label: "Mediateca (Multimedia)",
    icon: <Image className="h-5 w-5" />,
    description: "Archivos de audio, fotos y espectrogramas relacionados.",
    headers: ["id", "occurrence_id", "identifier", "type", "format", "order_index", "title", "description", "creator", "rightsHolder", "license", "tag", "parent_multimedia_id"]
  },
] as const;

export function BulkClient() {
  const [selectedTable, setSelectedTable] = useState<string>(TABLES[0]?.id || "taxa");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [results, setResults] = useState<{ successCount: number; errorCount: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTable = TABLES.find(t => t.id === selectedTable) || TABLES[0];

  const downloadCSVTemplate = () => {
    if (!currentTable) return;
    // Add sep=, for Excel auto-detection
    const csvContent = `sep=,\n${currentTable.headers.join(",")}\n` +
      currentTable.headers.map(h => h === 'id' ? 'uuid-de-ejemplo' : 'VALOR').join(",");

    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `plantilla_${selectedTable}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadXLSXTemplate = () => {
    if (!currentTable) return;
    const data = [[...currentTable.headers], currentTable.headers.map(h => h === 'id' ? 'uuid-opcional' : 'Dato de ejemplo')];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, `plantilla_${selectedTable}.xlsx`);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();

    if (file.name.endsWith('.xlsx')) {
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          if (!firstSheet) {
            toast.error("El archivo no contiene hojas");
            return;
          }
          const worksheet = workbook.Sheets[firstSheet];
          if (!worksheet) {
            toast.error("No se pudo encontrar la hoja en el archivo");
            return;
          }
          const jsonData = XLSX.utils.sheet_to_json(worksheet as XLSX.WorkSheet, { 
            header: 0, 
            defval: null
          });
          setPreviewData(jsonData);
          setSelectedFile(file);
          setResults(null);
          toast.success(`Archivo Excel "${file.name}" cargado`);
        } catch (err) {
          toast.error("Error al leer el archivo Excel");
        }
      };
      reader.readAsBinaryString(file);
      return;
    }

    reader.onload = (event) => {
      let text = event.target?.result as string;
      if (text.startsWith('\uFEFF') || text.startsWith('\ufeff')) text = text.substring(1);
      if (text.startsWith('sep=')) {
        const lines = text.split(/\r\n|\n|\r/);
        lines.shift();
        text = lines.join('\n');
      }

      try {
        if (file.type === "application/json" || file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          setPreviewData(Array.isArray(data) ? data : [data]);
        } else {
          // Robust multi-line CSV Parser
          const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim() !== "");
          if (lines.length === 0) { setPreviewData([]); return; }

          // Separator detection (top-level only)
          const detectSeparator = (str: string) => {
            let inQuotes = false; let commas = 0; let semis = 0;
            for (let char of str) {
              if (char === '"') inQuotes = !inQuotes;
              if (!inQuotes) {
                if (char === ',') commas++;
                if (char === ';') semis++;
              }
            }
            return semis > commas ? ';' : ',';
          };
          const separator = detectSeparator(lines.slice(0, 5).join("\n"));

          const parseRobustCSV = (csvText: string, sep: string) => {
            const rows = []; let row: string[] = []; let cell = ""; let inQuotes = false;
            for (let i = 0; i < csvText.length; i++) {
              const char = csvText[i];
              const nextChar = csvText[i + 1];
              if (char === '"') {
                if (inQuotes && nextChar === '"') { cell += '"'; i++; }
                else inQuotes = !inQuotes;
              } else if (char === sep && !inQuotes) { row.push(cell.trim()); cell = ""; }
              else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') i++;
                row.push(cell.trim());
                if (row.length > 0) rows.push(row);
                row = []; cell = "";
              } else cell += char;
            }
            if (cell || row.length > 0) { row.push(cell.trim()); rows.push(row); }
            return rows;
          };

          const rows = parseRobustCSV(text, separator);
          
          if (rows.length === 0) {
            toast.error("El archivo está vacío");
            return;
          }

          const header = rows[0]!.map(h => h.trim());
          const dataRows = rows.slice(1).map(row => {
            const obj: any = {};
            header.forEach((key, idx) => {
              const val = row[idx];
              obj[key] = (val === "" || val === "null" || val === undefined) ? null : val;
            });
            return obj;
          });
          setPreviewData(dataRows);
        }
        setSelectedFile(file);
        setResults(null);
        toast.info(`Archivo cargado: ${file.name}`);
      } catch (err) {
        toast.error("Error procesando CSV/JSON");
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShowConfirmDialog(false);
    try {
      const resp = await bulkUpsert(selectedTable, previewData);
      setResults({
        successCount: resp.successCount || 0,
        errorCount: resp.errorCount || 0,
        errors: resp.errors || []
      });
      if (resp.success) toast.success("Carga completada");
      else toast.error("La carga tuvo errores");
    } catch (err) {
      toast.error("Error en servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Operaciones Masivas"
        description="Gestione grandes volúmenes de datos con plantillas profesionales."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* CONFIGURATION COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-lg font-bold">Seleccionar Tabla</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {TABLES.map(table => (
                <Card
                  key={table.id}
                  className={cn(
                    "cursor-pointer transition-all border-2 hover:border-primary/50 relative overflow-hidden",
                    selectedTable === table.id ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20" : "border-muted"
                  )}
                  onClick={() => { setSelectedTable(table.id); setPreviewData([]); setResults(null); setSelectedFile(null); }}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      selectedTable === table.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {table.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{table.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{table.description}</p>
                    </div>
                    {selectedTable === table.id && (
                      <div className="absolute right-3 top-3">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-lg font-bold">Descargar Plantilla</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10 gap-2 border-dashed bg-background" onClick={downloadCSVTemplate}>
                <FileJson className="h-3.5 w-3.5 text-blue-500" /> .CSV
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-dashed bg-background" onClick={downloadXLSXTemplate}>
                <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" /> .XLSX
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground px-1 italic">
              <Info className="h-3 w-3 inline mr-1" />
              Recomendamos usar <strong>.XLSX</strong> para evitar errores de formato en Excel.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="text-lg font-bold">Subir Archivo</h3>
            </div>

            {!selectedFile ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01] shadow-xl ring-4 ring-primary/5" : "border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/30"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 shadow-sm",
                  isDragging ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}>
                  <Upload className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {isDragging ? "¡Suéltalo ahora!" : "Arrastra tu archivo aquí"}
                </span>
                <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                  o haga click para buscar en su equipo
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.json,.xlsx"
                />
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  {selectedFile.name.endsWith('.xlsx') ? <FileSpreadsheet className="h-6 w-6" /> : <FileJson className="h-6 w-6" />}
                </div>
                <p className="text-sm font-bold truncate max-w-full px-4">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                  onClick={handleRemoveFile}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Quitar archivo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-muted/60 h-full flex flex-col min-h-[600px]">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-primary" />
                    Previsualización de Datos
                  </CardTitle>
                  <CardDescription>
                    {previewData.length > 0
                      ? `${previewData.length} registros listos para procesar en ${currentTable.label}.`
                      : "Los datos aparecerán aquí una vez cargado el archivo."
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0 min-h-[400px]">
              {previewData.length > 0 ? (
                <div className="relative">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background shadow-sm z-10 font-bold uppercase tracking-wider">
                      <TableRow className="hover:bg-transparent">
                        {Object.keys(previewData[0]).map(k => (
                          <TableHead key={k} className="text-[10px] font-black text-foreground py-4 min-w-[120px] whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              {currentTable.headers.includes(k as any) ? (
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                              )}
                              {k}
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 50).map((row, idx) => (
                        <TableRow key={idx} className="group hover:bg-muted/30">
                          {Object.keys(previewData[0]).map((k, i) => (
                            <TableCell key={i} className="text-[11px] py-1.5 truncate max-w-[200px] border-r border-muted last:border-0 group-hover:border-primary/10">
                              {(row[k] !== null && row[k] !== undefined) ? String(row[k]) : <span className="text-muted-foreground italic">vacio</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground opacity-60">
                  <div className="h-20 w-20 bg-muted/60 rounded-3xl flex items-center justify-center mb-4">
                    <TableIcon className="h-10 w-10" />
                  </div>
                  <p className="text-sm italic">Cargue un archivo para ver la estructura</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 px-10 w-full max-w-2xl text-[11px] font-medium leading-relaxed">
                    <div className="flex gap-3 bg-muted/30 p-3 rounded-xl">
                      <div className="h-5 w-5 shrink-0 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px]">!</div>
                      <span><strong>Acción de ID:</strong> Si incluye una columna <code>id</code> con un UUID existente, el registro se actualizará. Si el campo está vacío, se creará uno nuevo.</span>
                    </div>
                    <div className="flex gap-3 bg-muted/30 p-3 rounded-xl">
                      <div className="h-5 w-5 shrink-0 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px]">✓</div>
                      <span><strong>Campos Requeridos:</strong> Asegúrese de que los nombres de las columnas coincidan exactamente con la plantilla original para evitar errores.</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {previewData.length > 0 && (
              <CardFooter className="border-t bg-muted/5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight px-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  Mostrando primeros {Math.min(previewData.length, 50)} registros
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={handleRemoveFile} disabled={loading} className="h-10 px-6 font-semibold">Limpiar</Button>

                  <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogTrigger asChild>
                      <Button disabled={loading || previewData.length === 0} className="h-10 px-10 gap-3 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Confirmar y Procesar Carga
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de continuar?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          Esta acción procesará <strong>{previewData.length} registros</strong> en la tabla <strong>{currentTable.label}</strong>.
                          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                            <span className="font-bold block mb-1">⚠️ IMPORTANTE:</span>
                            Los registros con UUIDs coincidentes serán sobrescritos. Los registros nuevos se crearán automáticamente. Esta operación no se puede deshacer fácilmente.
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
                        <AlertDialogCancel className="h-10 font-semibold">Cerrar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSubmit}
                          className="h-10 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/10"
                        >
                          Sí, Procesar Datos
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {results && (
        <Alert variant={results.errorCount > 0 ? "destructive" : "default"} className={cn("rounded-2xl border-2 transition-all animate-in slide-in-from-bottom-10", results.errorCount === 0 ? "border-green-500 bg-green-50 shadow-green-100/50 shadow-xl" : "shadow-xl")}>
          <div className="flex gap-4 p-2">
            <div className={cn("p-2 rounded-xl text-white shadow-sm", results.errorCount === 0 ? "bg-green-600" : "bg-destructive")}>
              {results.errorCount === 0 ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <AlertTitle className="text-lg font-bold">Proceso Finalizado</AlertTitle>
              <AlertDescription>
                <div className="flex gap-6 mt-3 mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-green-700">{results.successCount}</span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Registros Exitosos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-red-500">{results.errorCount}</span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Errores Encontrados</span>
                  </div>
                </div>
                {results.errors.length > 0 && (
                  <div className="mt-4 border-t border-destructive/20 pt-4">
                    <p className="text-sm font-bold mb-2">Detalle de errores:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {results.errors.map((e, idx) => (
                        <li key={idx} className="flex gap-2 items-start py-0.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="text-muted-foreground leading-tight italic">{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}
