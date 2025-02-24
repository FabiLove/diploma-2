"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const aspectRatios = [
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "3:2", label: "3:2" },
];

export function Dropdown({ onAspectRatioChange }) {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(
    aspectRatios[0].value
  );

  const handleAspectRatioChange = (value) => {
    setSelectedAspectRatio(value);
    onAspectRatioChange(value);
  };

  return (
    <Select value={selectedAspectRatio} onValueChange={handleAspectRatioChange}>
      <SelectTrigger>Соотношение сторон</SelectTrigger>
      <SelectContent>
        {aspectRatios.map((ratio) => (
          <SelectItem key={ratio.value} value={ratio.value}>
            {ratio.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
