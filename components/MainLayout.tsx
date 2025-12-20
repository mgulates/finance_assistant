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
      <div className="main-layout">
        <Sidebar />
        <main className={`main-content ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}