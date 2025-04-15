"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "../Sidebar";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showNavbar?: boolean;
}

export default function Layout({
  children,
  showSidebar = true,
  showNavbar = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <div className="flex flex-1">
        {showSidebar && (
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
