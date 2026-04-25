import { getMultimediaList, deleteMultimedia } from "@/actions/multimedia";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";

export default async function MultimediaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const type = typeof params.type === "string" ? params.type : "";

  const { data: multimedia, count, error } = await getMultimediaList({
    page,
    limit: 10,
    type,
  });

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <LayoutWrapper sectionTitle="Mediateca">
      <div className="space-y-4">
        <PageHeader
          title="Archivos Multimedia"
          description="Gestión de grabaciones o audios relativos a las ocurrencias."
          action={{
            label: "Subir Archivo",
            href: "/dashboard/multimedia/create",
            icon: <Plus className="h-4 w-4" />,
          }}
        />


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Creador</TableHead>
              <TableHead>Ocurrencia / Taxón</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {multimedia.length > 0 ? (
              multimedia.map((media) => (
                <TableRow key={media.id}>
                  <TableCell className="font-medium">{media.title || "Sin Título"}</TableCell>
                  <TableCell className="capitalize">{media.type}</TableCell>
                  <TableCell>{media.format}</TableCell>
                  <TableCell>{media.creator}</TableCell>
                  <TableCell>
                    {media.occurrence?.taxon?.scientificName ? (
                        <span className="italic">{media.occurrence?.taxon?.scientificName}</span>
                    ) : "General"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/multimedia/${media.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm 
                        id={media.id} 
                        onConfirm={deleteMultimedia} 
                        itemName="archivo multimedia" 
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

      <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}

