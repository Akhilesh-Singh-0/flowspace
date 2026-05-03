import { redirect } from "next/navigation";

export default function DashboardPage() {
  // We'll redirect straight to workspaces since that's the primary landing page
  redirect("/workspaces");
}
