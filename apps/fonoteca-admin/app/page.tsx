import { getCurrentUser } from "@/lib/backend/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  redirect(await getCurrentUser() ? "/dashboard" : "/login");
}
