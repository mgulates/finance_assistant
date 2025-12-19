"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Sidebar from "./Sidebar";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within MainLayout");
  }
  return context;
}

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main
          className={`min-h-screen transition-all duration-300 ${
            collapsed ? "ml-[72px]" : "ml-64"
          }`}
        >
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}