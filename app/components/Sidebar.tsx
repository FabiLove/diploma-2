"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./imageUploader";
import { Dropdown } from "./Dropdown";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleApply = () => {
    // This function is now handled by real-time updates
    console.log("Applied settings:", {
      width,
      height,
      aspectRatio,
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
          />
        </div>
      </div>
    </div>
  );
}

//   return (
//     <aside className="w-64 bg-gray-100 p-4">
//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="width">Ширина</Label>
//           <input
//             type="number"
//             id="width"
//             value={width}
//             onChange={(e) => setWidth(Number.parseInt(e.target.value, 10))}
//             className="w-full border border-gray-300 rounded px-2 py-1"
//           />
//         </div>
//         <div>
//           <Label htmlFor="height">Высота</Label>
//           <input
//             type="number"
//             id="height"
//             value={height}
//             onChange={(e) => setHeight(Number.parseInt(e.target.value, 10))}
//             className="w-full border border-gray-300 rounded px-2 py-1"
//           />
//         </div>
//         <div>
//           <Label htmlFor="aspect-ratio">Соотношение сторон</Label>
//           <input
//             type="number"
//             id="aspect-ratio"
//             value={aspectRatio}
//             onChange={(e) => setAspectRatio(Number.parseFloat(e.target.value))}
//             className="w-full border border-gray-300 rounded px-2 py-1"
//           />
//         </div>
//         {/* Removed code block */}
//         <button onClick={handleApply} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//           Применить
//         </button>
//       </div>
//       <ImageUploader width={width} height={height} aspectRatio={aspectRatio} />
//     </aside>
//   )
// }
