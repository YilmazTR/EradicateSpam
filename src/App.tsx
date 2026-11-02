import { useState } from 'react'
import LandingPage from './components/LandingPage'
import DemoPage from './components/DemoPage'
import HowItWorks from './components/HowItWorks'
import ExtensionCode from './components/ExtensionCode'

type Page = 'landing' | 'demo' | 'how-it-works' | 'code'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                GmailShield
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={() => setCurrentPage('landing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'landing' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('demo')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'demo' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => setCurrentPage('how-it-works')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'how-it-works' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => setCurrentPage('code')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'code' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Source Code
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-16">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'demo' && <DemoPage />}
        {currentPage === 'how-it-works' && <HowItWorks />}
        {currentPage === 'code' && <ExtensionCode />}
      </main>
    </div>
  )
}

export default App
