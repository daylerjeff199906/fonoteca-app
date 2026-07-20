"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxonSchema, TaxonInput } from "@/lib/validations/fonoteca";
import { getTaxon, createTaxon, updateTaxon, getGenera } from "@/actions/taxa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GenusForm } from "./genera/genus-form";
import { Skeleton } from "@/components/ui/skeleton";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, FlaskConical, FolderTree, GitBranch, Hash, FileText, Bookmark, Info, Plus, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormSection } from "@/components/panel-admin/form-section";
import { FormFooter } from "@/components/panel-admin/form-footer";

export function TaxonForm({ 
  id, 
  onSuccess, 
  onCancel, 
  footerVariant = "fixed" 
}: { 
  id: string | null; 
  onSuccess: (taxon?: any) => void;
  onCancel?: () => void;
  footerVariant?: "fixed" | "sticky";
}) {
  const [loading, setLoading] = useState(false);
  const [genera, setGenera] = useState<any[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchGenus, setSearchGenus] = useState("");
  const debouncedSearch = useDebounce(searchGenus, 400);
  const [isFetchingGenera, setIsFetchingGenera] = useState(false);
  const [isGenusFormOpen, setIsGenusFormOpen] = useState(false);

  const form = useForm<TaxonInput>({
    resolver: zodResolver(taxonSchema),
    defaultValues: {
      scientificName: "",
      taxonRank: "species",
      nomenclaturalCode: "ICZN",
      genus_id: "",
    }
  });

  const { reset, handleSubmit, watch } = form;
  const currentScientificName = watch("scientificName");

  useEffect(() => {
    setIsFetchingGenera(true);
    getGenera(debouncedSearch).then(res => {
      setIsFetchingGenera(false);
      if (res.data) setGenera(res.data);
    });
  }, [debouncedSearch]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getTaxon(id).then((resp) => {
        setLoading(false);
        if (resp.data) {
          reset({
            ...resp.data,
            genus_id: resp.data.genus_id || "",
          } as any);
        } else {
          showToast.error("Error de Carga", "No se pudo obtener la información del taxón: " + resp.error);
        }
      });
    } else {
      reset({
        taxonRank: "species",
        nomenclaturalCode: "ICZN",
        scientificName: "",
        genus_id: "",
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: TaxonInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateTaxon(id, data);
    } else {
      resp = await createTaxon(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "El taxón ha sido actualizado correctamente." : "El taxón ha sido registrado en el sistema.");
      onSuccess(resp.data);
    } else {
      showToast.error("Error", (typeof resp.error === "string" ? resp.error : "Hubo un problema al procesar el taxón."));
    }
  };

  if (loading && id) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>

        <div className="space-y-4 bg-card border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 h-14 border-b border-muted/50 last:border-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ))}
        </div>

        <div className="space-y-4 bg-card border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 h-14 border-b border-muted/50 last:border-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Header Info context similar to detail sheets */}
          {id && currentScientificName && (
            <div className="flex flex-col gap-1.5 bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-primary/10 text-primary">
                  Taxón
                </div>
                {id && <span className="text-xs text-muted-foreground">ID: {id.split('-')[0]}...</span>}
              </div>
              <h2 className="text-xl font-bold tracking-tight italic text-foreground">{currentScientificName}</h2>
            </div>
          )}

          {/* Sección: Información Científica */}
          <FormSection title="Información Científica" icon={FlaskConical}>
            <p className="text-[10px] text-muted-foreground mb-4">Define la taxonomía principal del taxón.</p>

            <div className="rounded-md border bg-card overflow-hidden">
              <FormField
                control={form.control}
                name="scientificName"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                    <div className="w-1/3 flex items-center gap-2">
                      <FlaskConical className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Nombre Científico *</FormLabel>
                    </div>
                    <div className="w-2/3">
                      <FormControl>
                        <Input {...field} placeholder="p. ej. Leptodactylus" className="font-medium italic border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                      </FormControl>
                      <FormMessage className="text-[10px] absolute mt-0.5" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genus_id"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                    <div className="w-1/3 flex items-center gap-2">
                      <FolderTree className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Género *</FormLabel>
                    </div>

                    <div className="w-2/3">
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal text-sm px-3 bg-background border-input h-9 text-left focus:ring-1 focus:ring-primary/40",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate flex items-center gap-1">
                                {field.value
                                  ? (() => {
                                    const g = genera.find((g) => g.id === field.value);
                                    if (!g) return "Seleccionar Género";
                                    const family = g.family ?? g.parent;
                                    const order = family?.order_obj;
                                    const classObj = order?.class_obj;

                                    return (
                                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium overflow-hidden">
                                        <span className="shrink-0">{classObj?.kingdom || "..."}</span>
                                        <ChevronRight className="h-2.5 w-2.5 opacity-30" />
                                        <span className="shrink-0">{classObj?.name || "..."}</span>
                                        <ChevronRight className="h-2.5 w-2.5 opacity-30" />
                                        <span className="shrink-0">{order?.name || "..."}</span>
                                        <ChevronRight className="h-2.5 w-2.5 opacity-30" />
                                        <span className="shrink-0 font-bold text-foreground text-xs italic">{g.name}</span>
                                      </span>
                                    );

                                  })()
                                  : "Seleccionar Género"}
                              </span>

                              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar género..."
                              className="h-9"
                              value={searchGenus}
                              onValueChange={setSearchGenus}
                            />
                            <CommandList className="max-h-[220px]">
                              {isFetchingGenera ? (
                                <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">Buscando...</div>
                              ) : (
                                <>
                                  <CommandEmpty>No se encontraron géneros.</CommandEmpty>
                                  <CommandGroup>
                                    {genera.map((g) => (
                                      <CommandItem
                                        key={g.id}
                                        value={g.id}
                                        onSelect={() => {
                                          form.setValue("genus_id", g.id);
                                          form.clearErrors("genus_id");
                                          setOpenCombobox(false);
                                        }}
                                        className="py-2"
                                      >
                                        <Check className={cn("mr-2 h-3.5 w-3.5", g.id === field.value ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col gap-0.5">
                                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/90 font-medium tracking-tight">
                                            <span>Familia</span>
                                            <ChevronRight className="h-2 w-2 opacity-30" />
                                            <span>{g.parent?.name || g.family?.name || "Sin familia"}</span>
                                          </div>
                                          <span className="font-semibold text-sm italic text-foreground leading-none">{g.name}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                            <div className="p-1 border-t border-muted/20 bg-muted/10 flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[11px] h-7 text-primary hover:bg-primary/10 flex items-center justify-start gap-2"
                                onClick={() => {
                                  setOpenCombobox(false);
                                  setIsGenusFormOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                Añadir Nuevo Género
                              </Button>
                              <Link
                                href="/dashboard/taxonomy/genera"
                                className="text-[9px] text-muted-foreground hover:text-primary px-2 py-1 flex items-center gap-1 transition-colors"
                                target="_blank"
                              >
                                Gestionar módulo de géneros →
                              </Link>
                            </div>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[10px] absolute mt-0.5" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Sección: Nombres y Autoría */}
          <FormSection title="Identificación y Cita" icon={Bookmark}>
            <div className="rounded-md border bg-card overflow-hidden">
              <FormField
                control={form.control}
                name="vernacularName"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                    <div className="w-1/3 flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Nombre Común</FormLabel>
                    </div>
                    <div className="w-2/3">
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Nombre local..." className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptedNameUsage"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                    <div className="w-1/3 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Nombre Aceptado</FormLabel>
                    </div>
                    <div className="w-2/3">
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Nombre válido actual..." className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8 italic" />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scientificNameAuthorship"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                    <div className="w-1/3 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Autoría (Cita)</FormLabel>
                    </div>
                    <div className="w-2/3">
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="p. ej. Boulenger, 1898" className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormFooter variant={footerVariant}>
            {onCancel && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading} className="min-w-[140px] shadow-sm">
              {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
            </Button>
          </FormFooter>
        </form>
      </Form>

      <Sheet open={isGenusFormOpen} onOpenChange={setIsGenusFormOpen}>
        <SheetContent className="overflow-y-auto md:min-w-[25vw]">
          <SheetHeader>
            <SheetTitle>Nuevo Género</SheetTitle>
          </SheetHeader>
          <div className="px-6">
            <GenusForm
              id={null}
              onSuccess={async (newId) => {
                setIsGenusFormOpen(false);
                const res = await getGenera("");
                if (res.data) {
                  setGenera(res.data);
                  if (newId) {
                    form.setValue("genus_id", newId);
                    form.clearErrors("genus_id");
                  }
                }
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
