import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { DashboardKpiCards, DashboardQuickActions, RecentOccurrences, SpeciesChart } from "@/components/dashboard/home/dashboard-widgets";
import { getDashboardStats } from "@/actions/dashboard";

export default async function Page() {
  const stats = await getDashboardStats();

  return (
    <LayoutWrapper sectionTitle="Dashboard Overview">
      <div className="w-full container mx-auto space-y-8 py-6 px-4">
        
        {/* Indicators */}
        <DashboardKpiCards kpi={stats.kpi} />

        {/* Shortcuts */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Accesos Directos</h2>
          <DashboardQuickActions />
        </div>

        {/* Secondary lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <RecentOccurrences list={stats.recentOccurrences} />
          <SpeciesChart stats={stats.speciesStats || []} />
        </div>

      </div>
    </LayoutWrapper>
  );
}
