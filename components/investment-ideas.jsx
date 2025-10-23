"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, Target, Shield, DollarSign, BarChart3 } from 'lucide-react';

export default function InvestmentIdeas() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [error, setError] = useState('');

  const fetchInvestmentIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/investment-ideas');
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
        setError('No investment advice found');
      }
    } catch (e) {
      setError(`Network error: ${e.message}`);
      // Show fallback insights even on network error
      setInsights(`⚠️ **Connection Issue**

We're having trouble connecting to our investment advisor. Here are some general investment tips:

1. **Start with Emergency Fund**: Save 3-6 months of expenses first
2. **Begin SIP**: Start with ₹500-1000 monthly in index funds
3. **Tax Saving**: Invest in ELSS mutual funds (₹1.5L limit)
4. **Diversify**: Mix equity, debt, and gold investments
5. **Long-term Focus**: Invest for 5+ years for better returns

Please check your internet connection and try again.`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="text-green-600" />
          AI Investment Ideas
        </h1>
        <p className="text-muted-foreground">
          Get personalized investment recommendations based on your financial profile
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Goal-Based</h3>
            <p className="text-sm text-muted-foreground">Personalized advice</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Risk-Assessed</h3>
            <p className="text-sm text-muted-foreground">Based on your profile</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold">Indian Market</h3>
            <p className="text-sm text-muted-foreground">Local expertise</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Data-Driven</h3>
            <p className="text-sm text-muted-foreground">Real transaction analysis</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Get Your Investment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchInvestmentIdeas}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" showText={false} />
                Analyzing your financial profile...
              </div>
            ) : (
              'Get AI Investment Ideas'
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
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Personalized Investment Plan
                </CardTitle>
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

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">💡 Before You Invest:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Build emergency fund first</li>
                <li>• Start with small amounts</li>
                <li>• Understand your risk tolerance</li>
                <li>• Set clear financial goals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📈 Popular Options:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• SIP in mutual funds</li>
                <li>• ELSS for tax saving</li>
                <li>• Gold ETF or SGB</li>
                <li>• PPF for long-term</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <strong>Disclaimer:</strong> This is general investment advice. Please consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
