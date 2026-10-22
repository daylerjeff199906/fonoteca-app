"use client"



import { routeLabel } from "@/config/route-labels";
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
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTableCard, TableEmptyRow } from "@/components/panel-admin/data-table";
import { recordStatusLabel } from "@/config/glossary";

export function EventsClient({ data, count }: { data: Event[]; count: number }) {
  const hasSearch = Boolean(useSearchParams().get("search"));

  return (
    <div className="space-y-4">
      <PageHeader
        title={routeLabel("/dashboard/monitoring/events")}
        description="Gestión de expediciones y sesiones de grabación."
        action={{
          label: "Registrar Evento",
          href: "/dashboard/monitoring/events/new",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SearchInput placeholder="Buscar por Event ID, protocolo o equipo..." />
        </div>
      </div>

      <DataTableCard>
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
                    <Badge variant={event.record_status === "published" ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
                      {recordStatusLabel(event.record_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/monitoring/events/${event.id}/edit`}>
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
              <TableEmptyRow
                colSpan={7}
                title={hasSearch ? "No hay eventos que coincidan con la búsqueda" : "Aún no hay eventos de muestreo"}
                description={hasSearch ? "Pruebe con otro término o limpie la búsqueda." : "Registre el primer evento para comenzar a cargar ocurrencias."}
                action={hasSearch ? undefined : { label: "Registrar evento", href: "/dashboard/monitoring/events/new", icon: <Plus className="h-4 w-4" /> }}
              />
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      <PaginationButtons totalCount={count} itemLabel="Eventos" />
    </div>
  );
}
