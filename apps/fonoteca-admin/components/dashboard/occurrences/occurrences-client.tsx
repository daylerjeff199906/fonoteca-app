"use client"

import { useState, useEffect } from "react";
import { Occurrence, Taxon } from "@/types/fonoteca";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Plus, Edit, Eye, Filter, X, Check, Download,
  ChevronDown, LayoutList, Music, Image as ImageIcon, Trash2
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { deleteOccurrence, deleteOccurrences, getAllOccurrencesForExport } from "@/actions/occurrences";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { showToast } from "@/lib/toast";
import { getDriveThumbnailUrl } from "@/utils/multimedia";
import { BASIS_OF_RECORD_LABELS } from "@/types/fonoteca";

export function OccurrencesClient({
  data,
  count,
  taxa
}: {
  data: Occurrence[];
  count: number;
  taxa: Taxon[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]); // Reset selection on page/filter change
  }, [data, searchParams]);

  const currentLimit = searchParams.get("limit") || "10";
  const isShowingAll = currentLimit === "1000";

  const toggleShowAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isShowingAll) {
      params.delete("limit");
      params.delete("page");
    } else {
      params.set("limit", "1000");
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`);
  };

  const getExportData = (items: Occurrence[], format: "csv" | "json" | "template" | "excel"): string => {
    if (format === "json") return JSON.stringify(items, null, 2);

    // Darwin Core Technical Headers
    const bulkHeaders = ["id", "occurrenceID", "taxon_id", "location_id", "basisOfRecord", "recordedBy", "identifiedBy", "eventDate", "eventTime", "institutionCode", "collectionCode", "catalogNumber", "samplingProtocol", "lifeStage", "sex", "reproductiveCondition", "occurrenceRemarks"];

    const csvRows = [bulkHeaders.join(",")];
    items.forEach(item => {
      const row = [
        item.id,
        item.occurrenceID || "",
        item.taxon_id || "",
        item.location_id || "",
        item.basisOfRecord || "",
        item.recordedBy || "",
        item.identifiedBy || "",
        item.catalogNumber || "",
        item.lifeStage || "",
        item.sex || "",
        item.reproductiveCondition || "",
        item.occurrenceRemarks || ""
      ].map(v => {
        const val = v === null || v === undefined ? "" : v;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    });
    return csvRows.join("\n");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format: "csv" | "json" | "template" | "excel", mode: "single" | "all" | "selected" = "all", singleItem?: Occurrence) => {
    try {
      let dataToExport: Occurrence[] = [];

      if (mode === "single" && singleItem) {
        dataToExport = [singleItem];
      } else if (mode === "selected") {
        dataToExport = data.filter(t => selectedIds.includes(t.id));
      } else {
        setIsExporting(true);
        const search = searchParams.get("search") || "";
        const taxonId = searchParams.get("taxonId") || "";
        const hasImage = searchParams.get("hasImage") || "all";
        const hasAudio = searchParams.get("hasAudio") || "all";

        const res = await getAllOccurrencesForExport({
          search, taxonId, hasImage, hasAudio
        });
        dataToExport = res.data;
      }

      if (dataToExport.length === 0) {
        showToast.info("Sin Datos", "No hay registros que coincidan con los criterios para exportar.");
        return;
      }

      const content = getExportData(dataToExport, format);
      const timestamp = new Date().toISOString().split('T')[0];
      const name = singleItem ? `ocurrencia_${singleItem.occurrenceID?.replace(/\s+/g, '_')}` : `ocurrencias_fonoteca_${timestamp}`;

      if (format === "json") {
        downloadFile(content, `${name}.json`, "application/json");
      } else if (format === "excel") {
        downloadFile("\uFEFF" + content, `${name}.csv`, "text/csv;charset=utf-8;");
      } else if (format === "template") {
        downloadFile(content, `${name}_plantilla.csv`, "text/csv");
      } else {
        downloadFile(content, `${name}.csv`, "text/csv");
      }

      if (mode !== "single") showToast.success("Exportación Exitosa", "Los registros han sido descargados correctamente.");
    } catch (error) {
      console.error(error);
      showToast.error("Error", "Ocurrió un fallo al intentar exportar los datos.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(t => t.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} registros de monitoreo?`)) return;

    // Note: showToast doesn't support .loading directly, I'll use standard toast for long ops if needed
    // but for now I'll just show the result.
    try {
      await deleteOccurrences(selectedIds);
      showToast.success("Registros Eliminados", `Se han eliminado ${selectedIds.length} registros correctamente.`);
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      showToast.error("Error", "No se pudo completar la eliminación por lotes.");
    }
  };

  const currentTaxonId = searchParams.get("taxonId") || "all";
  const currentHasImage = searchParams.get("hasImage") || "all";
  const currentHasAudio = searchParams.get("hasAudio") || "all";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("?");
  };

  const getActiveFilters = () => {
    const filters = [];
    if (currentTaxonId !== "all") {
      const taxon = taxa.find(t => t.id === currentTaxonId);
      filters.push({ key: "taxonId", label: `Taxón: ${taxon?.scientificName || currentTaxonId}` });
    }
    if (currentHasImage !== "all") filters.push({ key: "hasImage", label: currentHasImage === "yes" ? "Con Imágenes" : "Sin Imágenes" });
    if (currentHasAudio !== "all") filters.push({ key: "hasAudio", label: currentHasAudio === "yes" ? "Con Audio" : "Sin Audio" });
    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-4">
      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border-primary/20 border rounded-lg p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 ml-2">
            <span className="text-xs font-semibold text-primary">
              {selectedIds.length} registros seleccionados
            </span>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setSelectedIds([])}>
              Cancelar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs gap-1.5")}>
                <Download className="h-3.5 w-3.5" />
                <span>Exportar Selección</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Exportar {selectedIds.length} items</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv", "selected")} className="text-xs">Exportar CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel", "selected")} className="text-xs">Exportar Excel (BOM)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json", "selected")} className="text-xs">Exportar JSON</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SearchInput placeholder="Buscar por código u observador..." />
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9 gap-2", activeFilters.length > 0 && "border-primary bg-primary/5")}
            onClick={() => setIsFilterSheetOpen(true)}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}</span>
          </Button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="px-2 py-1 h-7 text-[11px] font-medium gap-1 rounded-full cursor-default bg-muted/60 border-muted-foreground/10"
              >
                {filter.label}
                <button
                  className="hover:bg-muted rounded-full p-0.5"
                  onClick={() => handleFilterChange(filter.key, "all")}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              onClick={clearAllFilters}
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </div>

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent className="sm:max-w-[400px]">
          <SheetHeader className="pb-0">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar Monitoreo
            </SheetTitle>
            <SheetDescription>
              Ajusta los parámetros para filtrar la lista de ocurrencias.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0 space-y-8 h-[calc(100vh-140px)] overflow-y-auto">

            {/* TAXON FILTER */}
            <div className="space-y-2 pt-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Taxón</label>
              <div className="border rounded-md overflow-hidden bg-background/40">
                <Command className="rounded-none border-none">
                  <CommandInput placeholder="Filtrar por nombre..." className="h-8 text-xs px-2" />
                  <CommandList className="min-h-[150px] max-h-[300px]">
                    <CommandEmpty className="text-[10px] py-4">Sin resultados.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleFilterChange("taxonId", "all")}
                        className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentTaxonId === "all" && "bg-accent/60 text-accent-foreground font-semibold")}
                      >
                        Todos los taxones
                        {currentTaxonId === "all" && <Check className="h-3 w-3" />}
                      </CommandItem>
                      {taxa.map((t) => (
                        <CommandItem
                          key={t.id}
                          onSelect={() => handleFilterChange("taxonId", t.id)}
                          className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentTaxonId === t.id && "bg-accent/60 text-accent-foreground font-semibold")}
                        >
                          <span className="italic">{t.scientificName}</span>
                          {currentTaxonId === t.id && <Check className="h-3 w-3" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            {/* RADIO GROUPS FOR MEDIA */}
            <div className="space-y-4 border-t pt-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Presencia de Imágenes</Label>
                <RadioGroup value={currentHasImage} onValueChange={(val: string) => handleFilterChange("hasImage", val)} className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="mi-all" />
                    <Label htmlFor="mi-all" className="font-normal cursor-pointer">Todas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="mi-yes" />
                    <Label htmlFor="mi-yes" className="font-normal cursor-pointer">Con Imágenes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="mi-no" />
                    <Label htmlFor="mi-no" className="font-normal cursor-pointer">Sin Imágenes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Presencia de Audio</Label>
                <RadioGroup value={currentHasAudio} onValueChange={(val: string) => handleFilterChange("hasAudio", val)} className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="ma-all" />
                    <Label htmlFor="ma-all" className="font-normal cursor-pointer">Todos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ma-yes" />
                    <Label htmlFor="ma-yes" className="font-normal cursor-pointer">Con Audio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ma-no" />
                    <Label htmlFor="ma-no" className="font-normal cursor-pointer">Sin Audio</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
            <Button className="w-full h-10 shadow-sm font-semibold" onClick={() => setIsFilterSheetOpen(false)}>Ver Resultados</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  checked={selectedIds.length === data.length && data.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todas"
                />
              </TableHead>
              <TableHead className="w-[80px]">Media</TableHead>
              <TableHead>Occurrence ID</TableHead>
              <TableHead>Basis</TableHead>
              <TableHead>Taxón</TableHead>
              <TableHead>Hábitat</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Registrado Por</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((oc) => {
                const stillImage = oc.multimedia?.find(m => m.type === 'Still');
                const hasSound = oc.multimedia?.some(m => m.type === 'Sound');
                const thumbUrl = stillImage ? (getDriveThumbnailUrl(stillImage.identifier) || stillImage.identifier) : null;

                return (
                  <TableRow key={oc.id} className={cn(selectedIds.includes(oc.id) && "bg-primary/5")}>
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedIds.includes(oc.id)}
                        onCheckedChange={() => toggleItem(oc.id)}
                        aria-label={`Seleccionar ${oc.occurrenceID}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 min-w-[60px]">
                        {thumbUrl ? (
                          <div className="h-8 w-8 rounded overflow-hidden border bg-muted">
                            <img src={thumbUrl} className="h-full w-full object-cover" alt="Thumb" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded border bg-muted/30 flex items-center justify-center">
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </div>
                        )}
                        {hasSound && (
                          <div title="Tiene Audio" className="p-1 rounded-full bg-blue-50 text-blue-600">
                            <Music className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{oc.occurrenceID}</TableCell>
                    <TableCell>
                      <p className="  max-w-[150px] text-[10px] font-semibold">
                        {BASIS_OF_RECORD_LABELS[oc.basisOfRecord] || oc.basisOfRecord}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-[180px]">
                        <span className="italic font-bold text-primary">{oc.taxon?.scientificName || "Desconocido"}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-tight line-clamp-1">
                          {oc.taxon?.genus?.family?.order_obj?.class_obj?.name || "?"} / {oc.taxon?.genus?.family?.order_obj?.name || "?"} / {oc.taxon?.genus?.family?.name || "?"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {oc.ecosystem ? (
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-[11px] font-semibold line-clamp-1">{oc.ecosystem.name}</span>
                          <span className="text-[9px] text-muted-foreground line-clamp-1 italic">{oc.ecosystem.typical_locality}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{oc.location?.locality || "Desconocida"}</TableCell>
                    <TableCell>
                      <span className="text-xs truncate">
                        {oc.event?.eventDate || oc.occurrence_date || "S/F"}
                      </span>
                    </TableCell>
                    <TableCell>{oc.recordedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/occurrences/${oc.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")} title="Ver Detalles">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/dashboard/occurrences/${oc.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteButtonWithConfirm
                          id={oc.id}
                          onConfirm={deleteOccurrence}
                          itemName="ocurrencia / registro"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isShowingAll ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-2 text-xs"
              onClick={toggleShowAll}
            >
              <LayoutList className="h-4 w-4" />
              Ver todos
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-3 gap-2 text-xs"
              onClick={toggleShowAll}
            >
              <LayoutList className="h-4 w-4" />
              Paginar vista
            </Button>
          )}
          {isShowingAll && (
            <span className="text-xs text-muted-foreground italic">
              Mostrando {data.length} de {count} registros
            </span>
          )}
        </div>
        {!isShowingAll && <PaginationButtons totalCount={count} pageSize={10} />}
      </div>
    </div>
  );
}
