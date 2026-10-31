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
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#101112_0%,#08090b_100%)]">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            border: "1px solid #303034",
            color: "#eeeeef",
          },
        }}
      />
    </QueryProvider>
  );
}