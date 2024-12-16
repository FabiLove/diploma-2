"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Dropdown({ onAspectRatioChange }) {
  const [position, setPosition] = React.useState("1:1");

  const handleChange = (value) => {
    setPosition(value);
    onAspectRatioChange(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Расширение: {position}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Соотношение сторон</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={handleChange}>
          <DropdownMenuRadioItem value="1:1">1:1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="16:9">16:9</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="3:4">3:4</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="9:16">9:16</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="4:3">4:3</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
