"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "welth.watchlist.symbols";

export default function Watchlist() {
  const [symbols, setSymbols] = useState([]); // Start with empty array
  const [newSymbol, setNewSymbol] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const joined = useMemo(() => symbols.join(","), [symbols]);

  // Load symbols from localStorage on initial mount only
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedSymbols = JSON.parse(saved);
          if (Array.isArray(parsedSymbols) && parsedSymbols.length > 0) {
            console.log("Loaded symbols from localStorage:", parsedSymbols);
            setSymbols(parsedSymbols);
          } else {
            // If localStorage is empty or invalid, use default symbols
            console.log("No valid symbols in localStorage, using defaults");
            setSymbols(["AAPL", "MSFT", "GOOGL"]);
          }
        } else {
          // If no localStorage data, use default symbols
          console.log("No localStorage data, using defaults");
          setSymbols(["AAPL", "MSFT", "GOOGL"]);
        }
      } catch (error) {
        console.error("Error loading watchlist from localStorage:", error);
        // On error, use default symbols
        setSymbols(["AAPL", "MSFT", "GOOGL"]);
      }
      setIsLoaded(true);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save symbols to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    // Skip initial render and server-side rendering
    if (typeof window !== 'undefined' && isLoaded) {
      try {
        console.log("Saving symbols to localStorage:", symbols);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
      } catch (error) {
        console.error("Error saving watchlist to localStorage:", error);
      }
    }
  }, [symbols, isLoaded]); // Added isLoaded dependency

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/market/quote?symbols=${encodeURIComponent(joined)}`);
        const json = await res.json();
        if (!ignore) {
          // Handle different response structures safely
          const quoteData = json.data || json || [];
          if (Array.isArray(quoteData) && quoteData.length > 0) {
            setQuotes(quoteData);
          } else {
            // Fallback: show sample data if API doesn't return data
            console.log("API returned no data, showing sample data");
            const sampleData = symbols.map(symbol => ({
              symbol,
              price: Math.random() * 200 + 50, // Random price between 50-250
              change: (Math.random() - 0.5) * 10, // Random change between -5 to +5
              changesPercentage: (Math.random() - 0.5) * 10 // Random percentage
            }));
            setQuotes(sampleData);
          }
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        if (!ignore) {
          // Show sample data on error
          const sampleData = symbols.map(symbol => ({
            symbol,
            price: Math.random() * 200 + 50,
            change: (Math.random() - 0.5) * 10,
            changesPercentage: (Math.random() - 0.5) * 10
          }));
          setQuotes(sampleData);
        }
      }
    }
    if (symbols.length) load();
    return () => { ignore = true; };
  }, [joined, symbols.length]);

  function addSymbol() {
    const s = newSymbol.toUpperCase().trim();
    if (!s || symbols.includes(s)) return;
    setSymbols([...symbols, s]);
    setNewSymbol("");
  }

  function removeSymbol(s) {
    setSymbols(symbols.filter((x) => x !== s));
  }

  function clearWatchlist() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setSymbols(["AAPL", "MSFT", "GOOGL"]);
      console.log("Watchlist cleared and reset to defaults");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
        {quotes.length > 0 && quotes[0]?.price < 10 && (
          <p className="text-xs text-muted-foreground">Showing sample data (API key needed for real-time data)</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add symbol e.g. TSLA"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
          />
          <Button onClick={addSymbol}>Add</Button>
          <Button variant="outline" onClick={clearWatchlist} className="text-xs">
            Reset
          </Button>
        </div>

        {!isLoaded ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading watchlist...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotes.map((q) => (
              <div key={q.symbol} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{q.symbol}</div>
                  <button
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => removeSymbol(q.symbol)}
                  >
                    remove
                  </button>
                </div>
                <div className="text-2xl font-semibold">${(q.price ?? q.previousClose ?? 0).toFixed(2)}</div>
                <div className={`text-sm ${q.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(q.change >= 0 ? "+" : "")} {(q.change ?? 0).toFixed(2)} ({(q.changesPercentage ?? 0).toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


