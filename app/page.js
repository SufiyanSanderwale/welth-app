import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-indigo-100/20 to-purple-100/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features designed to give you complete control over your financial future
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="p-8 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm" key={index}>
                <CardContent className="space-y-6 pt-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-50">
                    <div className="text-blue-600 group-hover:text-blue-700">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/10 via-indigo-100/10 to-purple-100/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Simple steps to transform your financial management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-50">
                    <div className="text-blue-600 group-hover:text-blue-700">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their financial management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-8 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 font-medium">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex items-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 via-purple-800/20 to-indigo-800/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who are already managing their finances
              smarter with AI-powered insights and smart recommendations
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-12 py-6 bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 rounded-2xl"
                >
                  <span className="flex items-center gap-3">
                    Start Free Trial
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              <div className="text-white/80 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free forever plan available
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
      </section>
    </div>
  );
};

export default LandingPage;
