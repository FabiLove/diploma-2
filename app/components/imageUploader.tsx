/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CldImage } from "next-cloudinary";

export function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={handleButtonClick}
        className="flex items-center space-x-2"
      >
        <span>Upload Image</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />

      <CldImage
        src="<Your Public ID>"
        width="300"
        height="300"
        crop="fill"
        alt=""
        sizes="100vw"
      />

      {image && (
        <div className="mt-4">
          <img
            src={image}
            alt="Uploaded preview"
            width={320}
            height={240}
            className="max-w-xs max-h-64 object-contain rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
}