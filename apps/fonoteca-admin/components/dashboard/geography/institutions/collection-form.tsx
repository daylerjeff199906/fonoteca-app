"use client"

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema, CollectionInput } from "@/lib/validations/fonoteca";
import { createCollection, updateCollection, getCollection } from "@/actions/collections";
import { getInstitutions } from "@/actions/institutions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Institution } from "@/types/fonoteca";
import { 
  Building2,
  Hash,
  FileText,
  Link as LinkIcon,
  Loader2,
  Check,
  ChevronsUpDown,
  BookOpen
} from "lucide-react";
import { FormSection } from "@/components/panel-admin/form-section";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CollectionForm({ 
  id, 
  onSuccess, 
  onCancel,
  defaultInstitutionId 
}: { 
  id?: string, 
  onSuccess?: (collection: any) => void,
  onCancel?: () => void,
  defaultInstitutionId?: string
}) {
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [openInstitution, setOpenInstitution] = useState(false);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<CollectionInput>({
    resolver: zodResolver(collectionSchema) as any,
    defaultValues: {
      institution_id: defaultInstitutionId || "",
      record_status: "published"
    }
  });

  const institutionId = watch("institution_id");

  useEffect(() => {
    getInstitutions({ limit: 100 }).then(resp => setInstitutions(resp.data));

    if (id) {
      getCollection(id).then((resp) => {
        if (resp.data) {
          reset(resp.data as any);
        }
      });
    }
  }, [id, reset]);

  const onSubmit = async (data: CollectionInput) => {
    setLoading(true);
    let resp;
    if (id) {
      resp = await updateCollection(id, data);
    } else {
      resp = await createCollection(data);
    }
    setLoading(false);

    if (resp.success) {
      showToast.success("Operación Exitosa", id ? "Colección actualizada correctamente." : "Colección registrada correctamente.");
      if (onSuccess) {
        onSuccess((resp as any).data);

      }
    } else {
      showToast.error("Error", typeof resp.error === "string" ? resp.error : "No se pudo procesar la solicitud.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <FormSection title="Detalles de la Colección" icon={BookOpen}>
        <div className="space-y-4">
          {!defaultInstitutionId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Institución Propietaria *</label>
              <Controller
                control={control}
                name="institution_id"
                render={({ field }) => (
                  <Popover open={openInstitution} onOpenChange={setOpenInstitution}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal h-10 bg-background/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? institutions.find((inst) => inst.id === field.value)?.name
                          : "Seleccionar institución..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar institución..." />
                        <CommandList>
                          <CommandEmpty>No se encontró la institución.</CommandEmpty>
                          <CommandGroup>
                            {institutions.map((inst) => (
                              <CommandItem
                                key={inst.id}
                                value={inst.name}
                                onSelect={() => {
                                  setValue("institution_id", inst.id);
                                  setOpenInstitution(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    inst.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {inst.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.institution_id && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.institution_id.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre de la Colección *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                <Input {...register("name")} placeholder="Ej: Colección Acústica..." className="pl-9 h-10 bg-background/50 focus-visible:ring-primary/20" />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Código *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                <Input {...register("code")} placeholder="Ej: Fonoteca" className="pl-9 h-10 bg-background/50 focus-visible:ring-primary/20" />
              </div>
              {errors.code && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">URL de Registro (GBIF/GRSciColl)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
              <Input {...register("registry_url")} placeholder="https://..." className="pl-9 h-10 bg-background/50 focus-visible:ring-primary/20" />
            </div>
            {errors.registry_url && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.registry_url.message}</p>}
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} className="h-10 px-6">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="h-10 min-w-[140px] font-bold">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : id ? (
            "Actualizar"
          ) : (
            "Registrar Colección"
          )}
        </Button>
      </div>
    </form>
  );
}
