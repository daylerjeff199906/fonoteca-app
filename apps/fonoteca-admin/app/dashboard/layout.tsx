import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/panel-admin/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/backend/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/unauthorized");

  return <SidebarProvider>
    <AppSidebar userData={{ name: user.name, email: user.email, avatar: user.avatar, role: user.role.toUpperCase() }} />
    <SidebarInset className="max-h-svh overflow-auto">
      <SiteHeader />
      <main className="flex-1 p-4 lg:p-6"><div className="container mx-auto space-y-6">{children}</div></main>
      <footer className="mt-auto p-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">© {new Date().getFullYear()} IIAP. Todos los derechos reservados.</footer>
    </SidebarInset>
  </SidebarProvider>;
}
