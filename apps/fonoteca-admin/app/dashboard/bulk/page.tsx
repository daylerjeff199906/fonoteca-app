import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { BulkClient } from "@/components/dashboard/bulk/bulk-client";

export default function BulkPage() {
  return (
    <LayoutWrapper sectionTitle="Operaciones Masivas">
      <BulkClient />
    </LayoutWrapper>
  );
}
