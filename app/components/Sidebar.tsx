"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./imageUploader";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function Sidebar() {
  const [bgColor, setBgColor] = useState("ffffff"); // белый цвет по умолчанию
  const [bgIntensity, setBgIntensity] = useState(0); // яркость фона по умолчанию
  const [preserveEdges, setPreserveEdges] = useState(false); // сохранение краев по умолчанию выключено
  const [mode, setMode] = useState("transparent"); // режим по умолчанию - прозрачный фон

  // Доступные цвета фона
  const colorOptions = [
    {
      value: "ffffff",
      label: "Белый",
      class: "bg-white border border-gray-200",
    },
    { value: "f8f9fa", label: "Светло-серый", class: "bg-gray-100" },
    { value: "e9ecef", label: "Серый", class: "bg-gray-200" },
    { value: "ced4da", label: "Тёмно-серый", class: "bg-gray-300" },
    { value: "f8f0e5", label: "Бежевый", class: "bg-[#f8f0e5]" },
    { value: "eafdfc", label: "Голубой", class: "bg-[#eafdfc]" },
    { value: "f7f5fb", label: "Лавандовый", class: "bg-[#f7f5fb]" },
    { value: "fdf2f8", label: "Розовый", class: "bg-[#fdf2f8]" },
  ];

  return (
    <div className="flex h-[94vh]">
      <div className="bg-muted max-h-full w-64 transition-all duration-300 ease-in-out overflow-hidden">
        <div className="p-4 space-y-4">
          <h3 className="font-medium mb-2">Режим фона</h3>
          <RadioGroup value={mode} onValueChange={setMode}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transparent" id="transparent" />
              <Label htmlFor="transparent">Прозрачный фон</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solidColor" id="solidColor" />
              <Label htmlFor="solidColor">Сплошной фон</Label>
            </div>
          </RadioGroup>

          {mode === "solidColor" && (
            <>
              <div className="space-y-2 mt-4">
                <Label htmlFor="bgColor">Цвет фона:</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-full h-10 rounded-md ${color.class} ${
                        bgColor === color.value
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:opacity-80"
                      }`}
                      onClick={() => setBgColor(color.value)}
                      title={color.label}
                      aria-label={`Выбрать ${color.label} цвет`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bgIntensity">Яркость фона:</Label>
                  <span className="text-sm text-muted-foreground">
                    {bgIntensity}
                  </span>
                </div>
                <Slider
                  id="bgIntensity"
                  min={-100}
                  max={100}
                  step={10}
                  value={[bgIntensity]}
                  onValueChange={(value: number[]) => setBgIntensity(value[0])}
                />
              </div>
            </>
          )}

          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="preserveEdges">Сохранять края:</Label>
              <Switch
                id="preserveEdges"
                checked={preserveEdges}
                onCheckedChange={setPreserveEdges}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Включите для изображений с мелкими деталями по краям (например,
              волосы, мех)
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center w-full">
        <div className="flex flex-col items-center space-y-4 w-full">
          <ImageUploader
            bgColor={bgColor}
            bgIntensity={bgIntensity}
            preserveEdges={preserveEdges}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}
