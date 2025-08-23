import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/logs', label: 'System Logs', icon: '📋' },
    { href: '/workflow-logs', label: 'Workflow Logs', icon: '⚡' },
    { href: '/workflows', label: 'Workflows', icon: '🔄' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 ease-in-out fixed h-full z-30`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && <h1 className="text-xl font-bold">SaaS Dashboard</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-16'} flex-1 transition-all duration-300 ease-in-out`}>
        {/* Top navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">SaaS Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ☰
              </button>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}