import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trees, Music, MapPin, Database, ChevronRight, PlusCircle, FolderOpen, List } from "lucide-react";
import Link from "next/link";

export function DashboardKpiCards({ kpi }: { kpi: any }) {
  const cards = [
    { title: "Especies", value: kpi.species, icon: Trees, color: "text-green-600", bg: "bg-green-50/50 dark:bg-green-950/20" },
    { title: "Ocurrencias", value: kpi.occurrences, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
    { title: "Archivos Multimedia", value: kpi.multimedia, icon: Database, color: "text-purple-600", bg: "bg-purple-50/50 dark:bg-purple-950/20" },
    { title: "Voces / Audios", value: kpi.sounds, icon: Music, color: "text-amber-600", bg: "bg-amber-50/50 dark:bg-amber-950/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="border-muted/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.title}</p>
                <p className="text-2xl font-bold tracking-tight">{c.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.bg}`}>
                <Icon className={`h-6 w-6 ${c.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DashboardQuickActions() {
  const actions = [
    { title: "Crear Ocurrencia", href: "/dashboard/occurrences/create", icon: PlusCircle, color: "bg-blue-600" },
    { title: "Ver Taxonomía", href: "/dashboard/taxa", icon: List, color: "bg-green-600" },
    { title: "Banco Multimedia", href: "/dashboard/multimedia", icon: FolderOpen, color: "bg-purple-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <Link href={act.href} key={i}>
            <Button variant="outline" className="w-full h-24 flex items-center justify-center flex-col gap-2 rounded-xl border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all hover:bg-muted/30">
              <div className={`p-2 rounded-lg text-white ${act.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{act.title}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

export function RecentOccurrences({ list }: { list: any[] }) {
  return (
    <Card className="border-muted/50 shadow-sm col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-sm font-semibold">Ocurrencias Recientes</CardTitle>
        <Link href="/dashboard/occurrences" className="text-xs text-primary hover:underline flex items-center">
          Ver todas <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-muted/50">
          {list.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">No hay registros recientes</div>
          )}
          {list.map((occ, i) => (
            <div key={i} className="p-4 hover:bg-muted/20 transition-colors flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold tracking-tight">
                  {occ.taxa?.scientificName || "Especie desconocida"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{occ.basisOfRecord}</span>
                  <span>/</span>
                  <span>{occ.recordedBy}</span>
                </div>
              </div>
              <Link href={`/dashboard/occurrences/${occ.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SpeciesChart({ stats }: { stats: { name: string, count: number }[] }) {
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <Card className="border-muted/50 shadow-sm col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-sm font-semibold">Especies con Más Registros</CardTitle>
        <span className="text-xs text-muted-foreground">(Muestra de 100)</span>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="space-y-4">
          {stats.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">No hay suficientes datos todavía</div>
          )}
          {stats.map((sp, i) => {
            const percentage = (sp.count / maxCount) * 100;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="italic truncate max-w-[70%]">{sp.name}</span>
                  <span className="text-muted-foreground">{sp.count} reg.</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
