"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";

export function ImageUploader({ width, height, aspectRatio, mode }) {
  const [publicId, setPublicId] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [transformation, setTransformation] = useState("");

  useEffect(() => {
    console.log("ImageUploader props:", { mode, width, height, aspectRatio });
    updateTransformation();
  }, [mode, aspectRatio, width, height]);

  const handleUpload = (result) => {
    setPublicId(result.info.public_id);
    setOriginalImage(result.info.secure_url);
    console.log("Upload result:", result);
  };

  const updateTransformation = () => {
    let newTransformation = `c_fill,w_${width},h_${height}`;

    if (mode === "aspectRatio") {
      const [aspectWidth, aspectHeight] = aspectRatio.split(":").map(Number);
      newTransformation += `,ar_${aspectWidth}:${aspectHeight}`;
    }

    newTransformation += ",g_auto";
    setTransformation(newTransformation);
    console.log("New transformation:", newTransformation);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <CldUploadWidget
        uploadPreset="FabiLinda_preset_1"
        onSuccess={handleUpload}
      >
        {({ open }) => (
          <Button onClick={() => open()}>Загрузить изображение</Button>
        )}
      </CldUploadWidget>

      {publicId && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Оригинальное изображение:</h3>
            <img
              src={originalImage || "/placeholder.svg"}
              alt="Original"
              className="max-w-xs max-h-64 object-contain rounded-lg shadow-md"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Обработанное изображение:</h3>
            <CldImage
              src={publicId}
              width={width}
              height={height}
              crop="fill"
              alt="Processed"
              sizes="100vw"
              className="rounded-lg shadow-md"
              transformation={transformation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
