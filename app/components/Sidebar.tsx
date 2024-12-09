"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./imageUploader";
import { Dropdown } from "./Dropdown";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const handleButtonClick = () => {
    console.log("hello");
  };
  console.log(setIsOpen);

  return (
    <div className="flex h-[94vh]">
      <div
        className={`bg-muted max-h-full transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        {isOpen && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input1">Высота:</Label>
              <Input id="input1" placeholder="Enter value..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input2">Ширина:</Label>
              <Input id="input2" placeholder="Enter value..." />
            </div>
            <div className="space-y-2">
              <Dropdown />
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleButtonClick}
                className="flex items-center space-x-2"
              >
                <span>Применить</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full">
        <div className="flex flex-col items-center space-y-4 w-full">
          <ImageUploader />
        </div>
      </div>
    </div>
  );
}