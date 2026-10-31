import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  return (
    <QueryProvider>
      <div className="flex h-dvh overflow-hidden bg-surface-sidebar">
        <Sidebar />

        <main className="my-2 mr-2 min-w-0 flex-1 overflow-y-auto rounded-lg border border-line bg-surface">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-medium)",
            color: "var(--color-text)",
            fontSize: "var(--text-medium)",
          },
        }}
      />
    </QueryProvider>
  );
}