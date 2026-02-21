import Link from 'next/link'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Simple Public Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MC</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Medi<span className="text-emerald-600">Connect</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-16">
        {children}
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}