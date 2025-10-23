"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LoadingButton } from "./ui/loading-button";
import { PenBox, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import MainMenu from "@/components/main-menu";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-200/50 shadow-sm" suppressHydrationWarning>
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <MainMenu />
          <Link href="/" className="group">
            <div className="flex items-center gap-3 group-hover:scale-105 transition-transform duration-300">
              <Image
                src={"/logo.png"}
                alt="Welth Logo"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Links removed permanently */}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {mounted ? (
            <>
              <SignedIn>
                <LoadingButton
                  href="/dashboard"
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  loadingText="Opening Dashboard..."
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline font-medium">Dashboard</span>
                </LoadingButton>
                <LoadingButton
                  href="/transaction/create"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  loadingText="Opening Form..."
                >
                  <PenBox size={18} />
                  <span className="hidden md:inline font-medium">Add Transaction</span>
                </LoadingButton>
                <LoadingButton
                  href="/profile"
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                  loadingText="Opening Settings..."
                >
                  <Settings size={18} />
                  <span className="hidden md:inline font-medium">Settings</span>
                </LoadingButton>
              </SignedIn>
              <SignedOut>
                <SignInButton forceRedirectUrl="/dashboard">
                  <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 font-medium">
                    Login
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-200",
                    },
                  }}
                />
              </SignedIn>
            </>
          ) : (
            <div className="h-10 w-[200px]" aria-hidden />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
