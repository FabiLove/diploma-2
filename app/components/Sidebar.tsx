"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./imageUploader";
import { Dropdown } from "./Dropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(562);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [mode, setMode] = useState("dimensions"); // 'dimensions' or 'aspectRatio'

  useEffect(() => {
    if (mode === "aspectRatio") {
      const [aspectWidth, aspectHeight] = aspectRatio.split(":").map(Number);
      const newWidth = 1000; // Base width
      const newHeight = Math.round((newWidth / aspectWidth) * aspectHeight);
      setWidth(newWidth);
      setHeight(newHeight);
    }
    console.log("Sidebar state:", { mode, width, height, aspectRatio });
  }, [mode, aspectRatio, width, height]);

  const handleAspectRatioChange = (newAspectRatio) => {
    setAspectRatio(newAspectRatio);
    const [aspectWidth, aspectHeight] = newAspectRatio.split(":").map(Number);
    const newWidth = 1000; // Base width
    const newHeight = Math.round((newWidth / aspectWidth) * aspectHeight);
    setWidth(newWidth);
    setHeight(newHeight);
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
            <RadioGroup value={mode} onValueChange={setMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dimensions" id="dimensions" />
                <Label htmlFor="dimensions">Размеры</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aspectRatio" id="aspectRatio" />
                <Label htmlFor="aspectRatio">Соотношение сторон</Label>
              </div>
            </RadioGroup>

            {mode === "dimensions" && (
              <>
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
              </>
            )}

            {mode === "aspectRatio" && (
              <div className="space-y-2">
                <Dropdown onAspectRatioChange={handleAspectRatioChange} />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full">
        <div className="flex flex-col items-center space-y-4 w-full">
          <ImageUploader
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}
