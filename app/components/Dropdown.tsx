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

export function Dropdown() {
  const [position, setPosition] = React.useState("1:1");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Расширение</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
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

