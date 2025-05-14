"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, ImageIcon, Eraser } from "lucide-react";

// Определяем опции меню
const menuOptions = [
  { id: 1, label: "Редактор изображений", icon: ImageIcon },
  { id: 2, label: "Удаление фона", icon: Eraser },
  { id: 3, label: "Опция 3", icon: null },
  { id: 4, label: "Опция 4", icon: null },
];

export default function Navbar({ onOptionChange }) {
  // Устанавливаем Опцию 1 по умолчанию
  const [selectedOption, setSelectedOption] = useState(menuOptions[0]);

  // При первом рендере сообщаем родительскому компоненту, что выбрана Опция 1
  useEffect(() => {
    onOptionChange(selectedOption.id);
  }, []);

  // Обработчик выбора опции
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onOptionChange(option.id);
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-primary">Logo</span>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-1">
                  {selectedOption.icon && (
                    <selectedOption.icon className="h-4 w-4 mr-2" />
                  )}
                  {selectedOption.label}{" "}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
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
          </div>
        </div>
      </div>
    </nav>
  );
}
