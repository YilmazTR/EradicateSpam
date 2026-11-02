export default function HowItWorks() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">How It Works</h1>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          A detailed breakdown of how GmailShield uses the Gmail API to create filters and block unwanted emails.
        </p>

        {/* Architecture Diagram */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Architecture Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-2xl mb-3">🌐</div>
              <h3 className="font-semibold mb-2">Content Script</h3>
              <p className="text-sm text-gray-400">
                Injected into Gmail pages. Detects email sender addresses and adds "Block" buttons to the UI.
              </p>
              <div className="mt-3 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block">
                content.js
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="font-semibold mb-2">Background Service Worker</h3>
              <p className="text-sm text-gray-400">
                Handles OAuth2 tokens and makes Gmail API calls securely. Never exposes credentials to content scripts.
              </p>
              <div className="mt-3 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded inline-block">
                background.js
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-2xl mb-3">📬</div>
              <h3 className="font-semibold mb-2">Gmail API</h3>
              <p className="text-sm text-gray-400">
                Google's REST API that creates filters, manages labels, and controls email routing in the user's inbox.
              </p>
              <div className="mt-3 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded inline-block">
                gmail.googleapis.com
              </div>
            </div>
          </div>

          {/* Flow arrows */}
          <div className="flex items-center justify-center gap-4 mt-6 text-gray-500">
            <span className="text-sm">Content Script</span>
            <span>→</span>
            <span className="text-sm">chrome.runtime.sendMessage()</span>
            <span>→</span>
            <span className="text-sm">Background Worker</span>
            <span>→</span>
            <span className="text-sm">Gmail API</span>
          </div>
        </div>

        {/* Step by Step */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold">Step-by-Step Flow</h2>

          <StepCard
            step={1}
            title="User Opens Gmail"
            description="The content script is injected into the Gmail page via manifest.json. It monitors the DOM for email elements."
            code={`// manifest.json
{
  "content_scripts": [{
    "matches": ["*://mail.google.com/*"],
    "js": ["content.js"],
    "css": ["content.css"]
  }]
}`}
          />

          <StepCard
            step={2}
            title="Detect Sender Email"
            description="When an email is opened or hovered, the content script extracts the sender's email address from the DOM."
            code={`// content.js
function getSenderEmail() {
  const emailEl = document.querySelector(
    '.gD[email]'
  );
  return emailEl?.getAttribute('email');
}`}
          />

          <StepCard
            step={3}
            title="User Clicks 'Block Completely'"
            description="The injected button sends a message to the background service worker with the sender's email address."
            code={`// content.js
chrome.runtime.sendMessage({
  action: 'BLOCK_SENDER',
  email: senderEmail
}, (response) => {
  if (response.success) {
    showNotification('Filter created!');
  }
});`}
          />

          <StepCard
            step={4}
            title="Background Worker Creates Filter"
            description="The service worker uses the stored OAuth2 token to call the Gmail API and create a filter."
            code={`// background.js
async function createFilter(email) {
  const token = await getAuthToken();
  
  const response = await fetch(
    'https://gmail.googleapis.com/' +
    'gmail/v1/users/me/settings/filters',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        criteria: { from: email },
        action: {
          removeLabelIds: ['INBOX'],
          addLabelIds: ['TRASH']
        }
      })
    }
  );
  
  return response.ok;
}`}
          />

          <StepCard
            step={5}
            title="Filter Takes Effect"
            description="Gmail immediately applies the filter to all future emails from that sender. They skip the inbox and go to Trash (or Archive)."
            code={`// Filter created:
{
  "id": "AHvpgM...",
  "criteria": {
    "from": "spam@example.com"
  },
  "action": {
    "removeLabelIds": ["INBOX"],
    "addLabelIds": ["TRASH"]
  }
}`}
          />
        </div>

        {/* Required Permissions */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Required OAuth2 Scopes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
              <code className="text-sm text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded whitespace-nowrap">
                gmail.settings.basic
              </code>
              <p className="text-sm text-gray-400">
                Required to create, read, update, and delete filters in Gmail settings.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
              <code className="text-sm text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded whitespace-nowrap">
                https://www.googleapis.com/auth/gmail.modify
              </code>
              <p className="text-sm text-gray-400">
                Read/write access to Gmail (to label, archive, or trash emails).
              </p>
            </div>
          </div>
        </div>

        {/* Key API Endpoint */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-6">Key API Endpoint</h2>
          <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">POST</span>
              <span className="text-gray-300">https://gmail.googleapis.com/gmail/v1/users/me/settings/filters</span>
            </div>
            <div className="text-gray-400">
              <p className="mb-2">Request Body:</p>
              <pre className="text-green-400">{`{
  "criteria": {
    "from": "sender@example.com"
  },
  "action": {
    "removeLabelIds": ["INBOX"],
    "addLabelIds": ["TRASH"]
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, title, description, code }: { step: number; title: string; description: string; code: string }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
          {step}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 whitespace-pre">{code}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
