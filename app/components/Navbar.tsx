"use client";

import React, { ComponentPropsWithoutRef, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, ImageIcon, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

const menuOptions = [
  { id: 1, label: "Редактор изображений", icon: ImageIcon },
  { id: 2, label: "Удаление фона", icon: Eraser },
  { id: 3, label: "Опция 3", icon: null },
  { id: 4, label: "Опция 4", icon: null },
];

interface NavbarProps extends ComponentPropsWithoutRef<"nav"> {
  onOptionChange?: (id: number) => void;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ onOptionChange, className, ...rest }, ref) => {
    const [selectedOption, setSelectedOption] = React.useState(menuOptions[0]);

    React.useEffect(() => {
      onOptionChange?.(selectedOption.id);
    }, [selectedOption, onOptionChange]);

    const handleSelect = (opt: (typeof menuOptions)[number]) => {
      setSelectedOption(opt);
    };

    return (
      <nav
        ref={ref}
        className={cn(
          "flex items-center justify-between px-4 bg-background border-b h-16",
          className
        )}
        {...rest}
      >
        <span className="text-2xl font-bold text-primary">Logo</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-1 rounded-none">
              {selectedOption.icon && (
                <selectedOption.icon className="h-4 w-4 mr-2" />
              )}
              {selectedOption.label}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {menuOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleSelect(option)}
                className="flex justify-between"
              >
                <span className="flex items-center">
                  {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                  {option.label}
                </span>
                {selectedOption.id === option.id && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  }
);
Navbar.displayName = "Navbar";

export default Navbar;
