"use client"



import { Event } from "@/types/fonoteca";
import { Button } from "@/components/ui/button";
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
import { Plus, Edit, Calendar, MapPin, User, Trash2 } from "lucide-react";
import { deleteEvent } from "@/actions/events";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EventsClient({ data, count }: { data: Event[]; count: number }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Eventos de Muestreo"
        description="Gestión de expediciones y sesiones de grabación."
        action={{
          label: "Registrar Evento",
          href: "/dashboard/events/new",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SearchInput placeholder="Buscar por Event ID, protocolo o equipo..." />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event ID</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Protocolo</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-bold">{event.eventID}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{event.location?.locality || "Desconocida"}</span>
                      <span className="text-xs text-muted-foreground">{event.location?.stateProvince || event.location?.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{event.eventDate}</span>
                      {event.eventTime && (
                        <span className="text-muted-foreground italic">({event.eventTime})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{event.samplingProtocol || "-"}</TableCell>
                  <TableCell className="text-xs">
                    {event.make} {event.model}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.record_status === "published" ? "default" : "secondary"} className="capitalize text-[10px] h-5 px-1.5">
                      {event.record_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <DeleteButtonWithConfirm
                        id={event.id}
                        onConfirm={deleteEvent}
                        itemName="evento"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron eventos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end">
        <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </div>
  );
}
