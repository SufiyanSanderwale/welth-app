'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SMSExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [permission, setPermission] = useState('default');

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

    // Listen for SMS messages from service worker
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
              Automatically track income and expenses from your SMS messages.
            </p>
            
            {permission !== 'granted' && (
              <Button onClick={requestNotificationPermission} className="w-full">
                Enable SMS Tracking
              </Button>
            )}
            
            {permission === 'granted' && (
              <div className="text-sm text-green-600">
                ✅ SMS tracking is enabled. Transactions will be detected automatically.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
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
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>1. 📱 Install this app on your phone</div>
            <div>2. 🔔 Grant notification permissions</div>
            <div>3. 💳 Bank SMS will be automatically detected</div>
            <div>4. 📊 Transactions will be added to your dashboard</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
