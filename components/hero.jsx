"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-40 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50" />
      <div className="container mx-auto text-center relative z-10">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title leading-tight">
            Manage Your Finances <br /> with Intelligence
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            An AI-powered financial management platform that helps you track,
            analyze, and optimize your spending with real-time insights and smart recommendations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 animate-slide-in">
          <LoadingButton 
            href="/dashboard"
            size="lg" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl"
            loadingText="Opening Dashboard..."
          >
            <span className="flex items-center gap-2">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </LoadingButton>
          <Link href="https://www.moneycontrol.com/">
            <Button size="lg" variant="outline" className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Invest
              </span>
            </Button>
          </Link>
          <LoadingButton
            href="/chatbot"
            size="lg"
            variant="outline"
            className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl"
            loadingText="Opening Chat..."
          >
            <Image
              src="/Chatbot.jpg"
              alt="Chat"
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
          </LoadingButton>
        </div>
        <div className="hero-image-wrapper mt-8 md:mt-12">
          <div ref={imageRef} className="hero-image">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-purple-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="Dashboard Preview"
                className="relative rounded-2xl shadow-2xl border-2 border-white/20 mx-auto group-hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
