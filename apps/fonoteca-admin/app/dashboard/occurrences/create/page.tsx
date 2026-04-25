import { PageHeader } from "@/components/panel-admin/page-header";
import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";

export default function CreateOccurrencePage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 py-6 px-4">
      <PageHeader 
        title="Registrar Ocurrencia" 
        description="Monitoreo de especies avistadas en ubicaciones registradas." 
        backUrl="/dashboard/occurrences" 
      />
      <OccurrenceForm />
    </div>
  );
}
