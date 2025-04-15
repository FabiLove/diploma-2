"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  logo?: ReactNode;
  children?: ReactNode;
}

export default function Navbar({ logo, children }: NavbarProps) {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            {logo || (
              <span className="text-2xl font-bold text-primary">Logo</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {children || <Button>Action</Button>}
          </div>
        </div>
      </div>
    </nav>
  );
}
