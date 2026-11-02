import { useState } from 'react'

interface CodeFile {
  name: string
  language: string
  content: string
  description: string
}

const files: CodeFile[] = [
  {
    name: 'manifest.json',
    language: 'json',
    description: 'Chrome Extension manifest (Manifest V3)',
    content: `{
  "manifest_version": 3,
  "name": "GmailShield - Block Email Senders",
  "version": "1.0.0",
  "description": "Block unwanted email senders by creating Gmail filters with one click.",
  "permissions": [
    "identity",
    "storage"
  ],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/gmail.settings.basic",
      "https://www.googleapis.com/auth/gmail.modify"
    ]
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["*://mail.google.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,
  },
  {
    name: 'background.js',
    language: 'javascript',
    description: 'Service worker that handles Gmail API calls',
    content: `// background.js - Service Worker for GmailShield

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'BLOCK_SENDER') {
    blockSender(request.email)
      .then(result => sendResponse({ success: true, filterId: result.id }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'GET_TOKEN') {
    getAuthToken()
      .then(token => sendResponse({ success: true, token }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'GET_BLOCKED_SENDERS') {
    getBlockedSenders()
      .then(senders => sendResponse({ success: true, senders }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'UNBLOCK_SENDER') {
    unblockSender(request.filterId)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Get OAuth2 token
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

// Create a Gmail filter to block a sender
async function blockSender(email) {
  const token = await getAuthToken();

  const filterData = {
    criteria: {
      from: email
    },
    action: {
      removeLabelIds: ['INBOX'],
      addLabelIds: ['TRASH']  // Send to trash. Use 'SPAM' or remove both for archive
    }
  };

  const response = await fetch(
    \`\${GMAIL_API_BASE}/users/me/settings/filters\`,
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filterData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create filter');
  }

  const filter = await response.json();

  // Store the blocked sender info
  await storeBlockedSender({
    email,
    filterId: filter.id,
    blockedAt: new Date().toISOString()
  });

  return filter;
}

// Remove a filter (unblock a sender)
async function unblockSender(filterId) {
  const token = await getAuthToken();

  const response = await fetch(
    \`\${GMAIL_API_BASE}/users/me/settings/filters/\${filterId}\`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${token}\`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete filter');
  }

  // Remove from storage
  await removeBlockedSender(filterId);
}

// Get list of all blocked senders from storage
async function getBlockedSenders() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['blockedSenders'], (result) => {
      resolve(result.blockedSenders || []);
    });
  });
}

// Store a blocked sender
async function storeBlockedSender(senderInfo) {
  const senders = await getBlockedSenders();
  senders.push(senderInfo);
  return new Promise((resolve) => {
    chrome.storage.local.set({ blockedSenders: senders }, resolve);
  });
}

// Remove a blocked sender from storage
async function removeBlockedSender(filterId) {
  const senders = await getBlockedSenders();
  const filtered = senders.filter(s => s.filterId !== filterId);
  return new Promise((resolve) => {
    chrome.storage.local.set({ blockedSenders: filtered }, resolve);
  });
}`,
  },
  {
    name: 'content.js',
    language: 'javascript',
    description: 'Content script injected into Gmail pages',
    content: `// content.js - Injected into Gmail pages

let currentSenderEmail = null;
let observer = null;

// Initialize when page loads
function init() {
  // Watch for email content changes
  observer = new MutationObserver(debounce(() => {
    injectBlockButton();
  }, 500));

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  setTimeout(injectBlockButton, 1000);
}

// Debounce utility
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Inject the block button into the email view
function injectBlockButton() {
  // Remove existing button if any
  const existingBtn = document.querySelector('.gmailshield-block-btn');
  if (existingBtn) existingBtn.remove();

  // Find the sender email element in the open email
  const senderElements = document.querySelectorAll('.gD[email]');
  if (senderElements.length === 0) return;

  // Get the first (primary) sender
  const senderEl = senderElements[0];
  const senderEmail = senderEl.getAttribute('email');
  const senderName = senderEl.getAttribute('name') || senderEmail;

  if (!senderEmail) return;
  currentSenderEmail = senderEmail;

  // Create the block button
  const blockBtn = document.createElement('button');
  blockBtn.className = 'gmailshield-block-btn';
  blockBtn.innerHTML = '🛡️ Block Completely';
  blockBtn.title = \`Block all future emails from \${senderEmail}\`;

  blockBtn.addEventListener('click', () => handleBlock(senderEmail, senderName));

  // Insert button near the sender info
  const actionBar = senderEl.closest('.gs')?.querySelector('.gH') 
    || senderEl.parentElement;
  
  if (actionBar) {
    actionBar.style.position = 'relative';
    actionBar.appendChild(blockBtn);
  }
}

// Handle the block action
async function handleBlock(email, name) {
  const btn = document.querySelector('.gmailshield-block-btn');
  if (!btn) return;

  // Show loading state
  btn.innerHTML = '⏳ Blocking...';
  btn.disabled = true;

  try {
    // Send message to background service worker
    const response = await chrome.runtime.sendMessage({
      action: 'BLOCK_SENDER',
      email: email
    });

    if (response.success) {
      btn.innerHTML = '✅ Blocked!';
      btn.classList.add('blocked');

      // Show notification
      showNotification(\`Filter created! Emails from \${name} will be sent to trash.\`);

      // Reset button after 3 seconds
      setTimeout(() => {
        btn.innerHTML = '🛡️ Block Completely';
        btn.disabled = false;
        btn.classList.remove('blocked');
      }, 3000);
    } else {
      throw new Error(response.error || 'Unknown error');
    }
  } catch (error) {
    btn.innerHTML = '❌ Error - Try Again';
    btn.disabled = false;
    console.error('GmailShield Error:', error);

    setTimeout(() => {
      btn.innerHTML = '🛡️ Block Completely';
    }, 3000);
  }
}

// Show a notification toast
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'gmailshield-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Start the extension
init();`,
  },
  {
    name: 'content.css',
    language: 'css',
    description: 'Styles for injected UI elements',
    content: `/* content.css - Styles for GmailShield injected elements */

.gmailshield-block-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-left: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.gmailshield-block-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.gmailshield-block-btn:active {
  transform: translateY(0);
}

.gmailshield-block-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.gmailshield-block-btn.blocked {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
}

.gmailshield-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  background: #1f2937;
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 99999;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.gmailshield-notification.show {
  opacity: 1;
  transform: translateY(0);
}`,
  },
  {
    name: 'popup.html',
    language: 'html',
    description: 'Extension popup UI',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #fff;
      padding: 16px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #333;
    }
    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #ef4444, #f97316);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .title { font-size: 16px; font-weight: 700; }
    .subtitle { font-size: 11px; color: #888; }
    .stats {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat {
      flex: 1;
      background: #16213e;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #ef4444;
    }
    .stat-label {
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
    .blocked-list {
      max-height: 200px;
      overflow-y: auto;
    }
    .blocked-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #16213e;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .blocked-item .email {
      color: #ccc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
    .unblock-btn {
      background: none;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      cursor: pointer;
    }
    .unblock-btn:hover {
      background: #ef4444;
      color: white;
    }
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 13px;
    }
    .manual-block {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #333;
    }
    .manual-block input {
      width: 100%;
      padding: 8px 12px;
      background: #16213e;
      border: 1px solid #333;
      border-radius: 6px;
      color: #fff;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .manual-block input::placeholder { color: #666; }
    .manual-block button {
      width: 100%;
      padding: 8px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️</div>
    <div>
      <div class="title">GmailShield</div>
      <div class="subtitle">Block unwanted senders</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-number" id="blocked-count">0</div>
      <div class="stat-label">Blocked</div>
    </div>
    <div class="stat">
      <div class="stat-number" id="today-count">0</div>
      <div class="stat-label">Today</div>
    </div>
  </div>

  <div class="blocked-list" id="blocked-list">
    <div class="empty-state">
      No blocked senders yet.<br>
      Open an email in Gmail and click "Block Completely"
    </div>
  </div>

  <div class="manual-block">
    <input type="email" id="manual-email" placeholder="Enter email to block manually..." />
    <button id="manual-block-btn">🛡️ Block This Sender</button>
  </div>

  <script src="popup.js"></script>
</body>
</html>`,
  },
  {
    name: 'popup.js',
    language: 'javascript',
    description: 'Popup script that manages the extension UI',
    content: `// popup.js - Extension popup logic

document.addEventListener('DOMContentLoaded', () => {
  loadBlockedSenders();
  setupManualBlock();
});

// Load and display blocked senders
async function loadBlockedSenders() {
  const response = await chrome.runtime.sendMessage({
    action: 'GET_BLOCKED_SENDERS'
  });

  if (response.success) {
    const senders = response.senders;
    const listEl = document.getElementById('blocked-list');
    const countEl = document.getElementById('blocked-count');
    const todayEl = document.getElementById('today-count');

    countEl.textContent = senders.length;

    // Count today's blocks
    const today = new Date().toDateString();
    const todayBlocks = senders.filter(
      s => new Date(s.blockedAt).toDateString() === today
    ).length;
    todayEl.textContent = todayBlocks;

    if (senders.length === 0) {
      listEl.innerHTML = \`
        <div class="empty-state">
          No blocked senders yet.<br>
          Open an email in Gmail and click "Block Completely"
        </div>
      \`;
      return;
    }

    listEl.innerHTML = senders.map(sender => \`
      <div class="blocked-item">
        <span class="email">\${sender.email}</span>
        <button class="unblock-btn" data-filter-id="\${sender.filterId}">
          Unblock
        </button>
      </div>
    \`).join('');

    // Add unblock handlers
    listEl.querySelectorAll('.unblock-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filterId = btn.dataset.filterId;
        const result = await chrome.runtime.sendMessage({
          action: 'UNBLOCK_SENDER',
          filterId
        });
        if (result.success) {
          loadBlockedSenders(); // Refresh list
        }
      });
    });
  }
}

// Setup manual email blocking
function setupManualBlock() {
  const btn = document.getElementById('manual-block-btn');
  const input = document.getElementById('manual-email');

  btn.addEventListener('click', async () => {
    const email = input.value.trim();
    if (!email) return;

    // Basic email validation
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    btn.textContent = '⏳ Blocking...';
    btn.disabled = true;

    const result = await chrome.runtime.sendMessage({
      action: 'BLOCK_SENDER',
      email
    });

    if (result.success) {
      input.value = '';
      btn.textContent = '✅ Blocked!';
      setTimeout(() => {
        btn.textContent = '🛡️ Block This Sender';
        btn.disabled = false;
        loadBlockedSenders();
      }, 2000);
    } else {
      btn.textContent = '❌ Error - Try Again';
      setTimeout(() => {
        btn.textContent = '🛡️ Block This Sender';
        btn.disabled = false;
      }, 2000);
    }
  });
}`,
  },
]

export default function ExtensionCode() {
  const [activeFile, setActiveFile] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Extension Source Code</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete source code for the GmailShield Chrome extension. Copy these files to build your own extension.
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>📋</span> Quick Setup Instructions
          </h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li>1. Create a new folder for the extension</li>
            <li>2. Copy all files below into the folder</li>
            <li>3. Go to Google Cloud Console → Create a project → Enable Gmail API</li>
            <li>4. Create OAuth2 credentials (Chrome Extension type)</li>
            <li>5. Replace <code className="px-1 bg-gray-800 rounded text-yellow-400">YOUR_CLIENT_ID</code> in manifest.json</li>
            <li>6. Go to <code className="px-1 bg-gray-800 rounded text-yellow-400">chrome://extensions</code> → Enable Developer Mode → Load Unpacked</li>
            <li>7. Select the extension folder</li>
          </ol>
        </div>

        {/* File Tabs */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b border-gray-800 bg-gray-900/50">
            {files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(index)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFile === index
                    ? 'border-red-500 text-white bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>

          {/* File Description */}
          <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">{files[activeFile].description}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre font-mono leading-relaxed">
              {files[activeFile].content}
            </pre>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>⚠️</span> Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• You need a Google Cloud project with Gmail API enabled</li>
              <li>• OAuth2 consent screen must be configured</li>
              <li>• For publishing, you need to verify your app with Google</li>
              <li>• The extension uses Manifest V3 (latest Chrome standard)</li>
              <li>• Test thoroughly before publishing to Chrome Web Store</li>
            </ul>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>🚀</span> Enhancement Ideas
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Add option to block entire domains (@example.com)</li>
              <li>• Include "Report as Spam" alongside blocking</li>
              <li>• Add keyboard shortcut (e.g., Ctrl+Shift+B)</li>
              <li>• Sync blocked list across devices</li>
              <li>• Add whitelist for important senders</li>
              <li>• Create a dashboard with blocking statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
