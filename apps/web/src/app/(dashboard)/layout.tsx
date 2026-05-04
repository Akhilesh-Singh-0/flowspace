import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import QueryProvider from '@/providers/query-provider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          {/* Subtle radial gradient for depth */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(243_75%_65%_/_0.08),transparent)]" />
          <div className="relative mx-auto max-w-4xl px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}