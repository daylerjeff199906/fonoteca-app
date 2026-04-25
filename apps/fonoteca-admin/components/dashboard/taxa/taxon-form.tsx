"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxonSchema, TaxonInput } from "@/lib/validations/fonoteca";
import { getTaxon, createTaxon, updateTaxon, getGenera } from "@/actions/taxa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, FlaskConical, FolderTree, GitBranch, Hash, FileText, Bookmark, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaxonForm({ id, onSuccess }: { id: string | null; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [genera, setGenera] = useState<any[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

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
    getGenera().then(res => {
      if (res.data) setGenera(res.data);
    });

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
          toast.error("Error al cargar taxón: " + resp.error);
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
      toast.success(id ? "Taxón actualizado" : "Taxón registrado");
      onSuccess();
    } else {
      toast.error("Error: " + (typeof resp.error === "string" ? resp.error : "Falló la validación"));
    }
  };

  if (loading && id) {
    return <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">Cargando datos del taxón...</div>;
  }

  return (
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
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Información Científica</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Define la taxonomía principal del taxón.</p>

          <div className="rounded-md border bg-card">
            <FormField
              control={form.control}
              name="taxonID"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                  <div className="w-1/3 flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Taxon ID (GUID)</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Ex: TAX-001" className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

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
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Género (Familia) *</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="ghost"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal text-sm px-3 hover:bg-black/5 dark:hover:bg-white/5 border-none h-8 text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? (() => {
                                  const g = genera.find((g) => g.id === field.value);
                                  return g ? `${g.name} (${g.family?.name || "Sin Familia"})` : "Seleccionar Género";
                                })()
                                : "Seleccionar Género"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar género..." className="h-9" />
                          <CommandList className="max-h-[220px]">
                            <CommandEmpty>No se encontraron géneros.</CommandEmpty>
                            <CommandGroup>
                              {genera.map((g) => (
                                <CommandItem
                                  key={g.id}
                                  value={`${g.name} ${g.family?.name || ""}`}
                                  onSelect={() => {
                                    form.setValue("genus_id", g.id);
                                    form.clearErrors("genus_id");
                                    setOpenCombobox(false);
                                  }}
                                  className="py-2"
                                >
                                  <Check className={cn("mr-2 h-3.5 w-3.5", g.id === field.value ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{g.name}</span>
                                    <span className="text-xs text-muted-foreground">{g.family?.name || "Sin Familia"}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px] absolute mt-0.5" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxonRank"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                  <div className="w-1/3 flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Rango Taxonómico</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <FormControl>
                      <Input {...field} placeholder="species" className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                    </FormControl>
                    <FormMessage className="text-[10px] absolute mt-0.5" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomenclaturalCode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                  <div className="w-1/3 flex items-center gap-2">
                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Código Nomenclatural</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <FormControl>
                      <Input {...field} placeholder="ICZN" className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección: Epítetos */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Epítetos</h3>
          </div>

          <div className="rounded-md border bg-card">
            <FormField
              control={form.control}
              name="specificEpithet"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                  <div className="w-1/3 flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Epíteto Específico</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="..." className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="infraspecificEpithet"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 p-3 border-b border-muted/50 last:border-0 h-14">
                  <div className="w-1/3 flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">Epíteto Infraspecífico</FormLabel>
                  </div>
                  <div className="w-2/3">
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="..." className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8" />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección: Nombres y Autoría */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Identificación y Cita</h3>
          </div>

          <div className="rounded-md border bg-card">
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
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
          <Button type="submit" disabled={loading} className="min-w-[140px] shadow-sm">
            {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
