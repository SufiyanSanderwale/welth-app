import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import DevErrorSilencer from "@/components/dev-error-silencer";
import DevConsoleFilter from "@/components/dev-console-filter";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Welth",
  description: "One stop Finance Platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WELTH Finance"
  }
};

export default function RootLayout({ children }) {
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

  const content = (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-sm.png" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WELTH Finance" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}>
        <DevErrorSilencer />
        <DevConsoleFilter />
        <Header />
        <main className="min-h-screen relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/30 to-indigo-50/30 pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>
        <Toaster richColors position="top-right" />

        <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welth Finance Platform
              </h3>
              <p className="text-blue-100 mb-6">
                Empowering your financial journey with AI-driven insights and smart money management.
              </p>
              <p className="text-blue-200 text-sm">
                Made with 💗 by Team of MMEC, Belagavi
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );

  return hasClerkKeys ? (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  ) : content;
}
