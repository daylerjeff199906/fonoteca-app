"use client"

import { useState, useEffect } from "react";
import { Taxon } from "@/types/fonoteca";
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
import { Plus, Edit, Filter, X, Upload, Check, Download, ChevronDown, LayoutList } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TaxonForm } from "./taxon-form";
import { deleteTaxon, getFamilies, getGenera, getAllTaxaForExport } from "@/actions/taxa";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/panel-admin/page-header";
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
import { Trash2, Copy } from "lucide-react";

export function TaxaClient({ data, count }: { data: Taxon[]; count: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTaxonId, setCurrentTaxonId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [families, setFamilies] = useState<any[]>([]);
  const [genera, setGenera] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]); // Reset selection on page/filter change
  }, [data, searchParams]);

  useEffect(() => {
    getFamilies().then(res => setFamilies(res.data || []));
    getGenera().then(res => setGenera(res.data || []));
  }, []);

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

  const getExportData = (items: Taxon[], format: "csv" | "json" | "template" | "excel"): string => {
    if (format === "json") return JSON.stringify(items, null, 2);

    // Technical headers (Darwin Core based)
    const bulkHeaders = ["id", "taxonID", "scientificName", "acceptedNameUsage", "specificEpithet", "infraspecificEpithet", "taxonRank", "scientificNameAuthorship", "vernacularName", "nomenclaturalCode", "genus_id"];

    const csvRows = [bulkHeaders.join(",")];
    items.forEach(item => {
      const row = [
        item.id,
        item.taxonID || "",
        item.scientificName || "",
        item.acceptedNameUsage || "",
        item.specificEpithet || "",
        item.infraspecificEpithet || "",
        item.taxonRank || "",
        item.scientificNameAuthorship || "",
        item.vernacularName || "",
        item.nomenclaturalCode || "",
        item.genus_id || ""
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

  const handleExport = async (format: "csv" | "json" | "template" | "excel", mode: "single" | "all" | "selected" = "all", singleItem?: Taxon) => {
    try {
      let dataToExport: Taxon[] = [];

      if (mode === "single" && singleItem) {
        dataToExport = [singleItem];
      } else if (mode === "selected") {
        dataToExport = data.filter(t => selectedIds.includes(t.id));
      } else {
        setIsExporting(true);
        const search = searchParams.get("search") || "";
        const kingdom = searchParams.get("kingdom") || "";
        const family_id = searchParams.get("family_id") || "";
        const genus_id = searchParams.get("genus_id") || "";
        const hasScientificName = searchParams.get("hasScientificName") || "all";
        const hasVernacularName = searchParams.get("hasVernacularName") || "all";

        const res = await getAllTaxaForExport({
          search, kingdom, family_id, genus_id, hasScientificName, hasVernacularName
        });
        dataToExport = res.data;
      }

      if (dataToExport.length === 0) {
        showToast.info("Sin datos para exportar", "No hay registros que coincidan con los filtros actuales.");
        return;
      }

      const content = getExportData(dataToExport, format);
      const timestamp = new Date().toISOString().split('T')[0];
      const name = singleItem ? `taxon_${singleItem.scientificName?.replace(/\s+/g, '_')}` : `taxones_catalogo_${timestamp}`;

      if (format === "json") {
        downloadFile(content, `${name}.json`, "application/json");
      } else if (format === "excel") {
        downloadFile("\uFEFF" + content, `${name}.csv`, "text/csv;charset=utf-8;");
      } else if (format === "template") {
        downloadFile(content, `${name}_plantilla.csv`, "text/csv");
      } else {
        downloadFile(content, `${name}.csv`, "text/csv");
      }

      if (mode !== "single") showToast.success("Exportación completada", `${dataToExport.length} registro(s) fueron exportados.`);
    } catch (error) {
      console.error(error);
      showToast.error("No se pudo exportar", error instanceof Error ? error.message : "No se pudieron preparar los datos para la exportación.");
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
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} taxones?`)) return;

    showToast.info("Eliminando registros", `Se eliminarán ${selectedIds.length} taxones.`);
    try {
      const results = await Promise.all(selectedIds.map(id => deleteTaxon(id)));
      const failed = results.find(result => !result.success);
      if (failed) return showToast.error("No se pudieron eliminar todos los taxa", failed.error || "El backend rechazó una o más eliminaciones.");
      showToast.success("Taxa eliminados", `${selectedIds.length} registro(s) fueron eliminados correctamente.`);
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      showToast.error("No se pudo completar la eliminación", err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  const currentKingdom = searchParams.get("kingdom") || "all";
  const currentFamily = searchParams.get("family_id") || "all";
  const currentGenus = searchParams.get("genus_id") || "all";
  const currentHasScientific = searchParams.get("hasScientificName") || "all";
  const currentHasVernacular = searchParams.get("hasVernacularName") || "all";

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

  const handleCreate = () => {
    setCurrentTaxonId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setCurrentTaxonId(id);
    setIsFormOpen(true);
  };

  const getActiveFilters = () => {
    const filters = [];
    if (currentKingdom !== "all") filters.push({ key: "kingdom", label: `Reino: ${currentKingdom}` });
    if (currentFamily !== "all") {
      const family = families.find(f => f.id === currentFamily);
      filters.push({ key: "family_id", label: `Familia: ${family?.name || currentFamily}` });
    }
    if (currentGenus !== "all") {
      const genus = genera.find(g => g.id === currentGenus);
      filters.push({ key: "genus_id", label: `Género: ${genus?.name || currentGenus}` });
    }
    if (currentHasScientific !== "all") filters.push({ key: "hasScientificName", label: currentHasScientific === "yes" ? "Con N. Científico" : "Sin N. Científico" });
    if (currentHasVernacular !== "all") filters.push({ key: "hasVernacularName", label: currentHasVernacular === "yes" ? "Con N. Común" : "Sin N. Común" });
    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Catálogo de Taxones"
        description="Gestión de familias, géneros y especies."
        action={{
          label: "Registrar Taxón",
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <Link href="/dashboard/bulk" target="_blank" rel="noopener noreferrer">
              <Upload className="h-3.5 w-3.5" />
              <span>Carga Masiva</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border-primary/20 border rounded-lg p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 ml-2">
            <span className="text-xs font-semibold text-primary">
              {selectedIds.length} taxones seleccionados
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
          <SearchInput placeholder="Buscar por nombre científico..." />
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
                className="px-2 py-1 h-7 text-[11px] font-medium gap-1 cursor-default bg-muted/60 border-muted-foreground/10"
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
              Filtrar Catálogo
            </SheetTitle>
            <SheetDescription>
              Ajusta los parámetros para filtrar la lista de taxones.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0 space-y-8 h-[calc(100vh-140px)] overflow-y-auto">

            {/* INLINE SEARCHABLE KINGDOM */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Reino</label>
              <div className="border rounded-md overflow-hidden bg-background/40">
                <Command className="rounded-none border-none">
                  <CommandInput placeholder="Filtrar reinos..." className="h-8 text-xs px-2" />
                  <CommandList className="min-h-[80px] max-h-[100px]">
                    <CommandEmpty className="text-[10px] py-4">Sin resultados.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleFilterChange("kingdom", "all")}
                        className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentKingdom === "all" && "bg-accent/60 text-accent-foreground font-semibold")}
                      >
                        Todos los componentes
                        {currentKingdom === "all" && <Check className="h-3 w-3" />}
                      </CommandItem>
                      {["Animalia", "Plantae", "Fungi"].map((k) => (
                        <CommandItem
                          key={k}
                          onSelect={() => handleFilterChange("kingdom", k)}
                          className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentKingdom === k && "bg-accent/60 text-accent-foreground font-semibold")}
                        >
                          {k}
                          {currentKingdom === k && <Check className="h-3 w-3" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            {/* INLINE SEARCHABLE FAMILY */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Familia</label>
              <div className="border rounded-md overflow-hidden bg-background/40">
                <Command className="rounded-none border-none">
                  <CommandInput placeholder="Buscar familia..." className="h-8 text-xs px-2" />
                  <CommandList className="min-h-[120px] max-h-[180px]">
                    <CommandEmpty className="text-[10px] py-4">Sin familias.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleFilterChange("family_id", "all")}
                        className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentFamily === "all" && "bg-accent/60 text-accent-foreground font-semibold")}
                      >
                        Todas las familias
                        {currentFamily === "all" && <Check className="h-3 w-3" />}
                      </CommandItem>
                      {families.map((f) => (
                        <CommandItem
                          key={f.id}
                          onSelect={() => handleFilterChange("family_id", f.id)}
                          className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentFamily === f.id && "bg-accent/60 text-accent-foreground font-semibold")}
                        >
                          {f.name}
                          {currentFamily === f.id && <Check className="h-3 w-3" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            {/* INLINE SEARCHABLE GENUS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Género</label>
              <div className="border rounded-md overflow-hidden bg-background/40">
                <Command className="rounded-none border-none">
                  <CommandInput placeholder="Buscar género..." className="h-8 text-xs px-2" />
                  <CommandList className="min-h-[120px] max-h-[180px]">
                    <CommandEmpty className="text-[10px] py-4">Sin géneros.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleFilterChange("genus_id", "all")}
                        className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentGenus === "all" && "bg-accent/60 text-accent-foreground font-semibold")}
                      >
                        Todos los géneros
                        {currentGenus === "all" && <Check className="h-3 w-3" />}
                      </CommandItem>
                      {genera.map((g) => (
                        <CommandItem
                          key={g.id}
                          onSelect={() => handleFilterChange("genus_id", g.id)}
                          className={cn("flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs", currentGenus === g.id && "bg-accent/60 text-accent-foreground font-semibold")}
                        >
                          {g.name}
                          {currentGenus === g.id && <Check className="h-3 w-3" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            {/* RADIO GROUPS FOR NAMES */}
            <div className="space-y-4 border-t pt-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nombre Científico</Label>
                <RadioGroup value={currentHasScientific} onValueChange={(val: string) => handleFilterChange("hasScientificName", val)} className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="sc-all" />
                    <Label htmlFor="sc-all" className="font-normal cursor-pointer">Todos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sc-yes" />
                    <Label htmlFor="sc-yes" className="font-normal cursor-pointer">Con Nombre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sc-no" />
                    <Label htmlFor="sc-no" className="font-normal cursor-pointer">Sin Nombre</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nombre Común</Label>
                <RadioGroup value={currentHasVernacular} onValueChange={(val: string) => handleFilterChange("hasVernacularName", val)} className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="vr-all" />
                    <Label htmlFor="vr-all" className="font-normal cursor-pointer">Todos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="vr-yes" />
                    <Label htmlFor="vr-yes" className="font-normal cursor-pointer">Con Nombre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="vr-no" />
                    <Label htmlFor="vr-no" className="font-normal cursor-pointer">Sin Nombre</Label>
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
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Nombre Científico</TableHead>
              <TableHead>Reino</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Rango</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((taxon) => (
                <TableRow key={taxon.id} className={cn(selectedIds.includes(taxon.id) && "bg-primary/5")}>
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.includes(taxon.id)}
                      onCheckedChange={() => toggleItem(taxon.id)}
                      aria-label={`Seleccionar ${taxon.scientificName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium italic">{taxon.scientificName}</TableCell>
                  <TableCell>{taxon.genus?.family?.order_obj?.class_obj?.kingdom || "-"}</TableCell>
                  <TableCell>{taxon.genus?.family?.name || "-"}</TableCell>
                  <TableCell>{taxon.parent?.name || taxon.genus?.name || "-"}</TableCell>
                  <TableCell>{taxon.taxonRank}</TableCell>
                  <TableCell>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(taxon.id)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>

                      <DeleteButtonWithConfirm
                        id={taxon.id}
                        onConfirm={deleteTaxon}
                        itemName="taxón"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto md:min-w-[60vw] max-w-5xl">
          <SheetHeader className="pb-0">
            <SheetTitle>{currentTaxonId ? "Editar Taxón" : "Registrar Taxón"}</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-0">
            <TaxonForm id={currentTaxonId} onSuccess={() => { setIsFormOpen(false); router.refresh(); }} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
