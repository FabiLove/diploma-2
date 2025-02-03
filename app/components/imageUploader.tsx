"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";

export function ImageUploader({
  width,
  height,
  aspectRatio,
  removeBackground,
}) {
  const [publicId, setPublicId] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  const handleUpload = (result) => {
    setPublicId(result.info.public_id);
    setOriginalImage(result.info.secure_url);
    console.log(result, "result");
  };

  const getTransformation = () => {
    let transformation = `c_fill,w_${width},h_${height},ar_${aspectRatio.replace(
      ":",
      ":"
    )}`;

    if (removeBackground) {
      // Add background removal as the first component in the chain
      transformation = `e_background_removal/${transformation}`;
    }

    // Add gravity auto at the end
    transformation += ",g_auto";

    return transformation;
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
              src={originalImage}
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
              transformation={getTransformation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
