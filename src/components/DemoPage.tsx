import { useState } from 'react'

interface Email {
  id: string
  from: string
  fromName: string
  subject: string
  preview: string
  time: string
  blocked: boolean
  avatar: string
}

const initialEmails: Email[] = [
  {
    id: '1',
    from: 'spam@marketing-spam.com',
    fromName: 'Marketing Spam Co.',
    subject: '🔥 LAST CHANCE: 90% OFF Everything!',
    preview: 'This is your final reminder! Act now before this incredible deal expires...',
    time: '10:30 AM',
    blocked: false,
    avatar: '📢',
  },
  {
    id: '2',
    from: 'noreply@newsletter-daily.com',
    fromName: 'Daily Newsletter',
    subject: 'Your Daily Digest - Top Stories',
    preview: 'Here are today\'s top stories you might have missed. Click to read more...',
    time: '9:15 AM',
    blocked: false,
    avatar: '📰',
  },
  {
    id: '3',
    from: 'john.david@gmail.com',
    fromName: 'John David',
    subject: 'Meeting notes from yesterday',
    preview: 'Hey, here are the notes from our meeting yesterday. Let me know if you have questions...',
    time: '8:45 AM',
    blocked: false,
    avatar: '👤',
  },
  {
    id: '4',
    from: 'promo@deals-heaven.com',
    fromName: 'Deals Heaven',
    subject: 'Exclusive VIP Deals Just For You!',
    preview: 'As a valued customer, we wanted to share these exclusive deals with you...',
    time: 'Yesterday',
    blocked: false,
    avatar: '💰',
  },
  {
    id: '5',
    from: 'sarah.chen@company.com',
    fromName: 'Sarah Chen',
    subject: 'Re: Project timeline update',
    preview: 'Thanks for the update! I\'ll review the timeline and get back to you by EOD...',
    time: 'Yesterday',
    blocked: false,
    avatar: '👩',
  },
  {
    id: '6',
    from: 'alerts@security-warning.net',
    fromName: 'Security Alert',
    subject: 'URGENT: Your account needs verification',
    preview: 'We detected unusual activity on your account. Please verify your identity immediately...',
    time: '2 days ago',
    blocked: false,
    avatar: '⚠️',
  },
  {
    id: '7',
    from: 'noreply@social-media.com',
    fromName: 'Social Media',
    subject: 'You have 5 new notifications',
    preview: 'People are interacting with your posts. Check out what\'s happening...',
    time: '2 days ago',
    blocked: false,
    avatar: '🔔',
  },
  {
    id: '8',
    from: 'mike.wilson@company.com',
    fromName: 'Mike Wilson',
    subject: 'Lunch tomorrow?',
    preview: 'Hey! Want to grab lunch tomorrow? There\'s a new place downtown I want to try...',
    time: '3 days ago',
    blocked: false,
    avatar: '🧑',
  },
]

export default function DemoPage() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [blockedSenders, setBlockedSenders] = useState<string[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  const handleBlock = (email: Email) => {
    setBlocking(true)
    // Simulate API call delay
    setTimeout(() => {
      setEmails(prev => prev.map(e => e.from === email.from ? { ...e, blocked: true } : e))
      setBlockedSenders(prev => [...prev, email.from])
      setBlocking(false)
      setShowPopup(false)
      setSelectedEmail(null)
      setNotification(`✅ Filter created! Emails from "${email.from}" will now be skipped.`)
      setTimeout(() => setNotification(null), 4000)
    }, 1500)
  }

  const visibleEmails = emails.filter(e => !e.blocked)

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-8">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-900/90 border border-green-500/30 text-green-300 px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            {notification}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interactive Demo</h1>
          <p className="text-gray-400">
            Click on any email to see the extension popup, then click "Block Completely" to create a Gmail filter.
          </p>
          {blockedSenders.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm">
              <span>🛡️</span>
              <span>{blockedSenders.length} filter{blockedSenders.length > 1 ? 's' : ''} created</span>
            </div>
          )}
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Gmail-like Inbox */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Gmail Header */}
              <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span className="text-lg font-medium">Inbox</span>
                  <span className="text-sm text-gray-400">({visibleEmails.length})</span>
                </div>
                <div className="flex-1" />
                <div className="text-sm text-gray-400">
                  {blockedSenders.length > 0 && (
                    <span className="text-green-400">✓ {blockedSenders.length} blocked</span>
                  )}
                </div>
              </div>

              {/* Email List */}
              <div className="divide-y divide-gray-800/50">
                {visibleEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => { setSelectedEmail(email); setShowPopup(true) }}
                    className="px-6 py-4 hover:bg-gray-800/50 cursor-pointer transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                      {email.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{email.fromName}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{email.time}</span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">{email.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{email.preview}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        Click to block
                      </span>
                    </div>
                  </div>
                ))}
                {visibleEmails.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg text-gray-300">All spam blocked!</p>
                    <p className="text-sm text-gray-500 mt-2">Your inbox is now clean.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Extension Popup Preview */}
          <div className="lg:w-80">
            <div className="sticky top-24">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">GmailShield</span>
                </div>

                <div className="p-4">
                  {showPopup && selectedEmail ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl mx-auto mb-3">
                          {selectedEmail.avatar}
                        </div>
                        <p className="font-medium text-white">{selectedEmail.fromName}</p>
                        <p className="text-xs text-gray-400 mt-1">{selectedEmail.from}</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Subject:</p>
                        <p className="text-sm text-white truncate">{selectedEmail.subject}</p>
                      </div>

                      <button
                        onClick={() => handleBlock(selectedEmail)}
                        disabled={blocking}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {blocking ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating filter...
                          </>
                        ) : (
                          <>🛡️ Block Completely</>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        This will create a Gmail filter to skip inbox
                      </p>

                      {blocking && (
                        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-gray-400">API Call:</p>
                          <code className="text-xs text-green-400 block">
                            gmail.users.settings.filters.create()
                          </code>
                          <div className="text-xs text-gray-500">
                            <p>Criteria: from={selectedEmail.from}</p>
                            <p>Action: removeInbox=true, addLabel=ARCHIVED</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">👈</div>
                      <p className="text-sm text-gray-400">
                        Click on an email to see the block popup
                      </p>
                    </div>
                  )}
                </div>

                {/* Blocked Senders List */}
                {blockedSenders.length > 0 && (
                  <div className="border-t border-gray-800 p-4">
                    <p className="text-xs text-gray-400 mb-2 font-medium">Blocked Senders:</p>
                    <div className="space-y-2">
                      {blockedSenders.map((sender, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-green-400">✓</span>
                          <span className="text-gray-300 truncate">{sender}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
