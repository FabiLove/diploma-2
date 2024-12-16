"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./imageUploader";
import { Dropdown } from "./Dropdown";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [removeBackground, setRemoveBackground] = useState(false);

  const handleApply = () => {
    // This function is now handled by real-time updates
    console.log("Applied settings:", {
      width,
      height,
      aspectRatio,
      removeBackground,
    });
  };

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
              <Label htmlFor="width">Ширина:</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Высота:</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Dropdown onAspectRatioChange={setAspectRatio} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="remove-background"
                checked={removeBackground}
                onCheckedChange={setRemoveBackground}
              />
              <Label htmlFor="remove-background">Удалить фон</Label>
            </div>
            <div className="space-y-2">
              <Button onClick={handleApply}>Применить</Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full">
        <div className="flex flex-col items-center space-y-4 w-full">
          <ImageUploader
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            removeBackground={removeBackground}
          />
        </div>
      </div>
    </div>
  );
}
