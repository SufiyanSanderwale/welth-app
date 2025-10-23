import React from "react";
import Header from "@/components/header";
import MainMenu from "@/components/main-menu";
// import { NavigationLoading } from "@/components/navigation-loading";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto my-32 px-4">
        {/* <NavigationLoading /> */}
        <div className="flex items-center gap-3 fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm z-40 h-16 px-4">
          <MainMenu />
          <div className="flex-1">
            <Header />
          </div>
        </div>
        <div className="pt-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
