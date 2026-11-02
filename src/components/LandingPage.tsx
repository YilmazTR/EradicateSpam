interface LandingPageProps {
  onNavigate: (page: 'landing' | 'demo' | 'how-it-works' | 'code') => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-gray-950 to-gray-950" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Chrome Extension • Gmail API
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            Block Spam Emails
            <br />
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              With One Click
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            GmailShield creates Gmail filters automatically when you block a sender.
            No more spam, no more unwanted newsletters — just a clean inbox.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('demo')}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
              Try Interactive Demo →
            </button>
            <button
              onClick={() => onNavigate('code')}
              className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white font-semibold text-lg hover:bg-gray-700 transition-all"
            >
              View Source Code
            </button>
          </div>

          {/* Extension Preview */}
          <div className="mt-16 relative">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-1 shadow-2xl max-w-md mx-auto">
              <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-400 ml-2">Extension Popup</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🚫</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">spam@annoying.com</p>
                    <p className="text-xs text-gray-400">Click to block this sender</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all">
                  🛡️ Block Completely
                </button>
                <div className="text-center">
                  <p className="text-xs text-green-400">✓ Filter created in Gmail settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How GmailShield Works</h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Uses the official Gmail API to create filters that automatically skip the inbox and archive unwanted emails.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📧"
              title="Select Emails"
              description="Browse your inbox and select the emails you want to block. The extension detects the sender automatically."
            />
            <FeatureCard
              icon="🛡️"
              title="Click Block"
              description="Hit the 'Block Completely' button. The extension uses the Gmail API to create a filter for that sender."
            />
            <FeatureCard
              icon="✨"
              title="Clean Inbox"
              description="Future emails from that sender are automatically skipped and archived. Your inbox stays clean forever."
            />
          </div>
        </div>
      </section>

      {/* Technical Section */}
      <section className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Yes, This Is Possible!</h2>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Gmail API Filter Creation</h3>
                  <p className="text-gray-400">
                    Uses <code className="px-2 py-0.5 bg-gray-800 rounded text-red-400 text-sm">gmail.users.settings.filters.create</code> to programmatically create filters that skip the inbox and apply labels.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">OAuth2 Authentication</h3>
                  <p className="text-gray-400">
                    Secure authentication via Google's OAuth2 with the <code className="px-2 py-0.5 bg-gray-800 rounded text-red-400 text-sm">gmail.settings.basic</code> scope.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Content Script Integration</h3>
                  <p className="text-gray-400">
                    Injects a "Block" button directly into the Gmail interface using content scripts, providing a seamless experience.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Background Service Worker</h3>
                  <p className="text-gray-400">
                    Uses Manifest V3 service workers to handle API calls securely without exposing tokens to content scripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to see it in action?</h2>
          <p className="text-gray-400 mb-8">
            Check out the interactive demo to see exactly how the extension works, or view the source code to build it yourself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('demo')}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Launch Demo
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white font-semibold hover:bg-gray-700 transition-all"
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
