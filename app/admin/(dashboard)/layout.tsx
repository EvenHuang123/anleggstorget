import { requireAdmin } from '@/lib/admin/auth'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      fontFamily: 'Barlow, system-ui, sans-serif',
      color: '#e6edf3',
    }}>
      <AdminTopbar />
      <div style={{ display: 'flex', paddingTop: 56 }}>
        <AdminSidebar />
        <main style={{
          flex: 1, padding: '32px 40px',
          minWidth: 0, overflowX: 'auto',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
