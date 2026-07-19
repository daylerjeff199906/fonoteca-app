"use client"

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { showToast } from "@/lib/toast";
import { updateAudioRequestStatus } from "@/actions/audio-requests";
import { AudioRequest } from "@/types/fonoteca";
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  Clock, 
  Loader2, 
  Play, 
  Check, 
  X,
  FileAudio,
  Activity,
  CalendarDays
} from "lucide-react";

interface AudioRequestsClientProps {
  initialRequests: AudioRequest[];
  initialCount: number;
  initialPage: number;
}

export function AudioRequestsClient({
  initialRequests,
  initialCount,
  initialPage,
}: AudioRequestsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeStatus = searchParams.get("status") || "all";

  // Modal detail view state
  const [selectedRequest, setSelectedRequest] = useState<AudioRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Status updating loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'approved' | 'rejected'

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenDetail = (request: AudioRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleUpdateRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(newStatus);
    try {
      const result = await updateAudioRequestStatus(id, newStatus);
      if (result.error) {
        showToast.error("Error", `No se pudo actualizar el estado: ${result.error}`);
      } else {
        showToast.success(
          "Solicitud Actualizada", 
          `La solicitud ha sido ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} exitosamente.`
        );
        
        // Refresh local details view
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({
            ...selectedRequest,
            request_status: newStatus,
            expires_at: newStatus === 'approved' 
              ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
              : null
          });
        }
        
        // Refresh table list
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      showToast.error("Error", "Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setActionLoading(null);
    }
  };

  // Helper formatting functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 font-bold capitalize">
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 font-bold capitalize">
            Rechazada
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 font-bold capitalize">
            Expirada
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10 font-bold capitalize animate-pulse">
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <LayoutWrapper sectionTitle="Mediateca">
      <div className="space-y-6">
        <PageHeader
          title="Solicitudes de Audios"
          description="Gestión y curaduría de solicitudes científicas para la descarga de cantos y grabaciones acústicas."
        />

        {/* Filter Tabs & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todas" },
              { id: "pending", label: "Pendientes" },
              { id: "approved", label: "Aprobadas" },
              { id: "rejected", label: "Rechazadas" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                  activeStatus === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-muted/30 hover:bg-muted/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Total en esta vista: <span className="font-bold text-foreground">{initialCount}</span>
          </div>
        </div>

        {/* Main List Table */}
        <div className="rounded-md border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitante</TableHead>
                <TableHead>Institución / Universidad</TableHead>
                <TableHead>Propósito Científico</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Audios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRequests.length > 0 ? (
                initialRequests.map((req) => {
                  const audioCount = req.items?.length || 0;
                  return (
                    <TableRow key={req.id} className="hover:bg-muted/20">
                      <TableCell className="align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground text-xs">{req.requester_name || "Investigador Anónimo"}</span>
                          <span className="text-[10px] text-muted-foreground font-medium font-mono">{req.requester_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-xs font-semibold text-foreground/80">
                        {req.institution || "N/A"}
                      </TableCell>
                      <TableCell className="align-middle max-w-xs truncate text-xs text-muted-foreground italic" title={req.observation_rationale}>
                        {req.observation_rationale}
                      </TableCell>
                      <TableCell className="align-middle text-xs font-medium text-muted-foreground">
                        {formatDate(req.created_at)}
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant="outline" className="font-semibold text-[10px] flex items-center gap-1 w-fit">
                          <FileAudio className="h-3 w-3 text-primary" />
                          {audioCount} {audioCount === 1 ? 'audio' : 'audios'}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-middle">
                        {getStatusBadge(req.request_status)}
                      </TableCell>
                      <TableCell className="align-middle text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDetail(req)}
                          className="h-8 text-xs font-bold"
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground font-medium">
                    No se encontraron solicitudes registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationButtons totalCount={initialCount} pageSize={10} />

        {/* Detailed Modal view */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto font-sans bg-background border border-muted/20">
            <DialogHeader className="border-b pb-4 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
                <Activity className="h-4 w-4" /> Curaduría Científica
              </div>
              <DialogTitle className="text-xl font-bold flex items-center justify-between gap-4">
                <span>Evaluación de Solicitud de Audios</span>
                {selectedRequest && getStatusBadge(selectedRequest.request_status)}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Revise el rationale del investigador, escuche las muestras de audio y tome la decisión de aprobar o rechazar la solicitud de descarga.
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
                {/* Details Section */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-muted/30 p-4 rounded-xl border border-muted/10 space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Información del Investigador</h3>
                    
                    <div className="flex items-start gap-2 text-xs">
                      <User className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">{selectedRequest.requester_name || "No especificado"}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{selectedRequest.requester_email}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <Building2 className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">Institución Científica</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{selectedRequest.institution || "No especificada"}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CalendarDays className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">Fecha de Solicitud</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{formatDate(selectedRequest.created_at)}</div>
                      </div>
                    </div>

                    {selectedRequest.request_status === "approved" && selectedRequest.expires_at && (
                      <div className="flex items-start gap-2 text-xs bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-600">
                        <Clock className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <div>
                          <div className="font-black uppercase tracking-wider text-[10px]">Enlace Activo</div>
                          <div className="text-[10px] font-semibold">Expira el: {formatDate(selectedRequest.expires_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Propósito del Uso (Rationale Científico)</label>
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-muted/10 text-xs text-foreground/90 italic leading-relaxed whitespace-pre-wrap">
                      "{selectedRequest.observation_rationale}"
                    </div>
                  </div>
                </div>

                {/* Audio Tracks Selection list */}
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Audios Solicitados ({selectedRequest.items?.length || 0})</h3>
                  <div className="divide-y divide-muted/30 border border-muted/20 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto bg-card">
                    {selectedRequest.items && selectedRequest.items.length > 0 ? (
                      selectedRequest.items.map((item, idx) => (
                        <div key={item.id || idx} className="p-3.5 flex flex-col gap-2 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-foreground truncate">{item.title || "Grabación de Audio"}</h4>
                              {item.occurrence?.taxon?.scientificName && (
                                <p className="text-[10px] text-accent-green font-bold italic leading-none mt-0.5">
                                  {item.occurrence.taxon.scientificName}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.format && (
                                <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[9px] font-black text-muted-foreground uppercase">
                                  {item.format}
                                </span>
                              )}
                              {item.duration_seconds && (
                                <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[9px] font-black text-muted-foreground">
                                  {item.duration_seconds.toFixed(1)}s
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Audio Previewer */}
                          {item.identifier ? (
                            <div className="flex items-center gap-2 pt-1">
                              <audio 
                                src={item.identifier} 
                                controls 
                                className="w-full h-8 bg-muted rounded-md focus:outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-[10px] text-destructive font-medium">Archivo original inaccesible o sin URL</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-muted-foreground font-semibold">
                        No hay audios vinculados a esta solicitud.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dialog Footer Actions */}
            <DialogFooter className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center w-full gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsDetailOpen(false)}
                  className="font-bold text-xs"
                >
                  Cerrar
                </Button>

                {selectedRequest && selectedRequest.request_status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateRequestStatus(selectedRequest.id, "rejected")}
                      className="font-bold text-xs flex items-center gap-1.5"
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "rejected" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Rechazar Solicitud
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateRequestStatus(selectedRequest.id, "approved")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "approved" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Aprobar y Generar Enlace
                    </Button>
                  </div>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutWrapper>
  );
}
