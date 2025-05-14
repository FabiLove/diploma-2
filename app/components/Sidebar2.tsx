"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageUploader2 } from "./imageUploader2";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar2() {
  const [isOpen, setIsOpen] = useState(true);
  const [preserveTransparency, setPreserveTransparency] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [downloadFormat, setDownloadFormat] = useState("png");

  // Предопределенные цвета для выбора
  const presetColors = [
    { value: "#ffffff", label: "Белый" },
    { value: "#000000", label: "Черный" },
    { value: "#ff0000", label: "Красный" },
    { value: "#00ff00", label: "Зеленый" },
    { value: "#0000ff", label: "Синий" },
    { value: "#ffff00", label: "Желтый" },
    { value: "#ff00ff", label: "Розовый" },
    { value: "#00ffff", label: "Голубой" },
    { value: "#808080", label: "Серый" },
    { value: "#800000", label: "Бордовый" },
  ];

  return (
    <div className="flex h-[94vh]">
      <div
        className={`bg-muted max-h-full transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        {isOpen && (
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            <Tabs defaultValue="background">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="background">Фон</TabsTrigger>
                <TabsTrigger value="export">Экспорт</TabsTrigger>
              </TabsList>

              <TabsContent value="background" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="preserve-transparency"
                      className="text-sm font-medium"
                    >
                      Сохранить прозрачность
                    </Label>
                    <Switch
                      id="preserve-transparency"
                      checked={preserveTransparency}
                      onCheckedChange={setPreserveTransparency}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Если включено, фон будет удален с сохранением прозрачности.
                    Если выключено, фон будет заменен на выбранный цвет.
                  </p>
                </div>

                {!preserveTransparency && (
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Цвет фона</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-9 w-9 rounded-md border"
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between",
                              !backgroundColor && "text-muted-foreground"
                            )}
                          >
                            {backgroundColor ? (
                              <span>
                                {presetColors.find(
                                  (c) => c.value === backgroundColor
                                )?.label || backgroundColor}
                              </span>
                            ) : (
                              <span>Выберите цвет</span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <div className="grid grid-cols-5 gap-1 p-2">
                            {presetColors.map((color) => (
                              <div
                                key={color.value}
                                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md"
                                style={{ backgroundColor: color.value }}
                                onClick={() => setBackgroundColor(color.value)}
                              >
                                {color.value === backgroundColor && (
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      color.value === "#ffffff"
                                        ? "text-black"
                                        : "text-white"
                                    )}
                                  />
                                )}
                                <span className="sr-only">{color.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-2 border-t">
                            <Input
                              id="custom-color"
                              value={backgroundColor}
                              onChange={(e) =>
                                setBackgroundColor(e.target.value)
                              }
                              className="h-8"
                              placeholder="#000000"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="export" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Формат экспорта</Label>
                  <RadioGroup
                    value={downloadFormat}
                    onValueChange={setDownloadFormat}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="png" id="format-png" />
                      <Label htmlFor="format-png">PNG (с прозрачностью)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jpg" id="format-jpg" />
                      <Label htmlFor="format-jpg">JPG (без прозрачности)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="webp" id="format-webp" />
                      <Label htmlFor="format-webp">
                        WebP (оптимизированный)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full">
        <div className="flex flex-col items-center space-y-4 w-full">
          <ImageUploader2
            backgroundColor={backgroundColor}
            preserveTransparency={preserveTransparency}
            downloadFormat={downloadFormat}
          />
        </div>
      </div>
    </div>
  );
}
