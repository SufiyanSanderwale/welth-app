// Service Worker for SMS-based expense tracking
const CACHE_NAME = 'welth-finance-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/transaction',
  '/budgeting'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// SMS detection (when available)
self.addEventListener('message', (event) => {
  if (event.data.type === 'SMS_RECEIVED') {
    const smsData = event.data.sms;
    // Process SMS for expense tracking
    processSMSForExpense(smsData);
  }
});

function processSMSForExpense(smsData) {
  // Parse SMS for bank transactions
  const expensePatterns = [
    /Rs\.?\s*(\d+(?:\.\d{2})?)\s*debited/i,
    /Rs\.?\s*(\d+(?:\.\d{2})?)\s*spent/i,
    /Rs\.?\s*(\d+(?:\.\d{2})?)\s*paid/i
  ];
  
  const incomePatterns = [
    /Rs\.?\s*(\d+(?:\.\d{2})?)\s*credited/i,
    /Rs\.?\s*(\d+(?:\.\d{2})?)\s*received/i
  ];
  
  // Check for expense patterns
  expensePatterns.forEach(pattern => {
    const match = smsData.body.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      // Send to main app
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'EXPENSE_DETECTED',
            amount: amount,
            source: 'SMS',
            timestamp: new Date().toISOString()
          });
        });
      });
    }
  });
  
  // Check for income patterns
  incomePatterns.forEach(pattern => {
    const match = smsData.body.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      // Send to main app
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'INCOME_DETECTED',
            amount: amount,
            source: 'SMS',
            timestamp: new Date().toISOString()
          });
        });
      });
    }
  });
}
