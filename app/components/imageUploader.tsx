"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

export function ImageUploader({ width, height, aspectRatio, mode }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [transformation, setTransformation] = useState("");

  useEffect(() => {
    console.log("ImageUploader props:", { mode, width, height, aspectRatio });
    updateTransformation();
  }, [mode, aspectRatio, width, height]);

  const handleUpload = (result) => {
    // Handle multiple uploads
    if (Array.isArray(result.info.secure_url)) {
      const newImages = result.info.public_id.map((id, index) => ({
        publicId: id,
        originalUrl: result.info.secure_url[index],
      }));
      setUploadedImages((prev) => [...prev, ...newImages]);
    } else {
      // Handle single upload
      setUploadedImages((prev) => [
        ...prev,
        {
          publicId: result.info.public_id,
          originalUrl: result.info.secure_url,
        },
      ]);
    }
    console.log("Upload result:", result);
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
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
    <div className="flex flex-col items-center space-y-4 w-full max-w-6xl mx-auto p-4">
      <CldUploadWidget
        uploadPreset="FabiLinda_preset_1"
        onSuccess={handleUpload}
        options={{
          sources: ["local", "url", "camera", "google_drive", "dropbox"],
          multiple: true,
          maxFiles: 10,
          folder: "user_uploads",
        }}
      >
        {({ open }) => (
          <div className="space-y-4">
            <Button onClick={() => open()} className="w-full">
              Загрузить изображения
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Поддерживается загрузка нескольких файлов и папок
            </p>
          </div>
        )}
      </CldUploadWidget>

      {uploadedImages.length > 0 && (
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Сетка</TabsTrigger>
            <TabsTrigger value="list">Список</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-3 shadow-sm"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 z-10"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CldImage
                    src={image.publicId}
                    width={width}
                    height={height}
                    crop="fill"
                    alt={`Image ${index + 1}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-lg shadow-md mx-auto"
                    transformation={transformation}
                  />
                  <p className="text-xs text-center mt-2 text-muted-foreground truncate">
                    {image.publicId.split("/").pop()}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="w-full">
            <div className="space-y-4 mt-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 relative"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex-shrink-0">
                    <CldImage
                      src={image.publicId}
                      width={width}
                      height={height}
                      crop="fill"
                      alt={`Image ${index + 1}`}
                      className="rounded-lg shadow-md"
                      transformation={transformation}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">Изображение {index + 1}</h3>
                    <p className="text-sm text-muted-foreground break-all">
                      ID: {image.publicId}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm">
                        Размеры: {width}x{height}
                      </p>
                      {mode === "aspectRatio" && (
                        <p className="text-sm">
                          Соотношение сторон: {aspectRatio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
