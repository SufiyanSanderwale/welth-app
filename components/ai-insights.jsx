"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/simple-insights');
      const data = await res.json();
      
      if (data?.insights) {
        setInsights(data.insights);
        setError(''); // Clear any previous errors
      } else if (data?.error) {
        setError(data.error);
        // Still try to show insights if available
        if (data.insights) {
          setInsights(data.insights);
        }
      } else {
        setError('No insights found');
      }
    } catch (e) {
      setError(`Network error: ${e.message}`);
      // Show fallback insights even on network error
      setInsights(`⚠️ **Connection Issue**

We're having trouble connecting to our AI service. Here are some general financial tips:

1. **Track Your Expenses**: Record every rupee you spend
2. **Create a Budget**: Set monthly limits for different categories
3. **Save First**: Put aside money before spending on wants
4. **Emergency Fund**: Build 3-6 months of expenses as backup
5. **Review Regularly**: Check your spending patterns weekly

Please check your internet connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Financial Insights</h1>
        <p className="text-muted-foreground">
          Get personalized financial advice based on your transaction history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Your Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchInsights}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" showText={false} />
                Analyzing your data...
              </div>
            ) : (
              'Get My Financial Insights'
            )}
          </Button>

          {error && !insights && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {error && insights && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
              <strong>Note:</strong> {error}
            </div>
          )}

          {insights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">💡 Your Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-base leading-relaxed">
                    {insights}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
