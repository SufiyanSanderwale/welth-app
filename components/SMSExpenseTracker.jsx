'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function SMSExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [permission, setPermission] = useState('default');
  const [smsText, setSmsText] = useState('');

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'EXPENSE_DETECTED') {
        const newTransaction = {
          id: Date.now(),
          type: 'expense',
          amount: event.data.amount,
          source: 'SMS',
          timestamp: event.data.timestamp,
          description: 'SMS Transaction'
        };
        setTransactions(prev => [newTransaction, ...prev]);
      } else if (event.data.type === 'INCOME_DETECTED') {
        const newTransaction = {
          id: Date.now(),
          type: 'income',
          amount: event.data.amount,
          source: 'SMS',
          timestamp: event.data.timestamp,
          description: 'SMS Transaction'
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
    });
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermission(permission);
    
    if (permission === 'granted') {
      setIsListening(true);
      // Show notification
      new Notification('WELTH Finance', {
        body: 'SMS expense tracking is now active!',
        icon: '/logo.png'
      });
    }
  };

  const processSMS = (text) => {
    const expensePatterns = [
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*debited/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*spent/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*paid/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*withdrawn/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*deducted/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*charged/i
    ];
    
    const incomePatterns = [
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*credited/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*received/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*deposited/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*added/i,
      /Rs\.?\s*(\d+(?:\.\d{2})?)\s*transferred/i
    ];
    
    // Check for expense patterns
    for (const pattern of expensePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const newTransaction = {
          id: Date.now(),
          type: 'expense',
          amount: amount,
          source: 'SMS',
          timestamp: new Date().toISOString(),
          description: 'SMS Transaction'
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return true;
      }
    }
    
    // Check for income patterns
    for (const pattern of incomePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const newTransaction = {
          id: Date.now(),
          type: 'income',
          amount: amount,
          source: 'SMS',
          timestamp: new Date().toISOString(),
          description: 'SMS Transaction'
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return true;
      }
    }
    
    return false;
  };

  const handleManualSMS = () => {
    if (smsText.trim()) {
      const processed = processSMS(smsText);
      if (processed) {
        setSmsText('');
        alert('✅ Transaction detected and added!');
      } else {
        alert('❌ No transaction pattern found in SMS. Please check the format.');
      }
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 SMS Expense Tracker
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track income and expenses from your SMS messages.
            </p>
            
            {permission !== 'granted' && (
              <Button onClick={requestNotificationPermission} className="w-full">
                Enable SMS Tracking
              </Button>
            )}
            
            {permission === 'granted' && (
              <div className="text-sm text-green-600">
                ✅ SMS tracking is enabled. Use manual input below to process SMS.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual SMS Input */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Manual SMS Input</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy and paste your bank SMS here to detect transactions:
            </p>
            
            <Textarea
              placeholder="Paste your SMS here, e.g., 'Rs. 500 debited from account'"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="min-h-[100px]"
            />
            
            <Button onClick={handleManualSMS} className="w-full">
              🔍 Process SMS
            </Button>
            
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              <p><strong>✅ Supported patterns:</strong></p>
              <p>• Rs. 500 debited from account</p>
              <p>• Rs. 1000 credited to account</p>
              <p>• Rs. 250 spent at store</p>
              <p>• Rs. 5000 received</p>
              <p>• Rs. 1500 withdrawn</p>
              <p>• Rs. 2000 deposited</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Detected Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📖 How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>1. 📱 Install this app on your phone</div>
            <div>2. 🔔 Grant notification permissions</div>
            <div>3. 📋 Copy bank SMS and paste in &quot;Manual SMS Input&quot;</div>
            <div>4. 🔍 Click &quot;Process SMS&quot; to detect transactions</div>
            <div>5. 📊 Transactions will be automatically added to your dashboard</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}