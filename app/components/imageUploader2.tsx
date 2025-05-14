"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download, ImageIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ImageUploader2({
  backgroundColor,
  preserveTransparency,
  downloadFormat,
}) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUpload = (result) => {
    // Handle multiple uploads
    if (Array.isArray(result.info.secure_url)) {
      const newImages = result.info.public_id.map((id, index) => ({
        publicId: id,
        originalUrl: result.info.secure_url[index],
      }));
      setUploadedImages((prev) => [...prev, ...newImages]);
      if (selectedImageIndex === null && newImages.length > 0) {
        setSelectedImageIndex(0);
      }
    } else {
      // Handle single upload
      setUploadedImages((prev) => [
        ...prev,
        {
          publicId: result.info.public_id,
          originalUrl: result.info.secure_url,
        },
      ]);
      if (selectedImageIndex === null) {
        setSelectedImageIndex(0);
      }
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(uploadedImages.length > 1 ? 0 : null);
    } else if (selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const downloadImage = async () => {
    if (selectedImageIndex === null) return;

    setIsDownloading(true);

    try {
      const image = uploadedImages[selectedImageIndex];

      // Создаем URL для скачивания с учетом параметров
      let transformationString = "c_limit,w_1000";

      // Добавляем удаление фона
      if (!showOriginal) {
        transformationString += ",e_background_removal";

        // Если указан цвет фона и не нужно сохранять прозрачность
        if (backgroundColor && !preserveTransparency) {
          transformationString += `,b_${backgroundColor.replace("#", "")}`;
        }
      }

      const format = downloadFormat || "png";
      const baseUrl = "https://res.cloudinary.com/demo/image/upload/";
      const downloadUrl = `${baseUrl}${transformationString}/${image.publicId}.${format}`;

      // Создаем ссылку для скачивания
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `bg-removed-${
        image.publicId.split("/").pop() || "image"
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-6xl mx-auto p-4">
      <CldUploadWidget
        uploadPreset="FabiLinda_preset_1"
        onSuccess={handleUpload}
        options={{
          sources: ["local", "url", "camera", "google_drive", "dropbox"],
          multiple: true,
          folder: "user_uploads",
        }}
      >
        {({ open }) => (
          <div className="space-y-4">
            <Button onClick={() => open()} className="w-full">
              Загрузить изображения
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Загрузите изображения для удаления фона
            </p>
          </div>
        )}
      </CldUploadWidget>

      {uploadedImages.length > 0 && (
        <div className="w-full">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              <TabsTrigger value="gallery">
                Галерея ({uploadedImages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="w-full">
              {selectedImageIndex !== null ? (
                <div className="flex flex-col items-center space-y-4 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="show-original"
                      checked={showOriginal}
                      onCheckedChange={setShowOriginal}
                    />
                    <Label
                      htmlFor="show-original"
                      className="flex items-center"
                    >
                      {showOriginal ? (
                        <>
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Показать оригинал
                        </>
                      ) : (
                        <>
                          <EyeOffIcon className="h-4 w-4 mr-2" />
                          Показать с удаленным фоном
                        </>
                      )}
                    </Label>
                  </div>

                  <div className="relative border rounded-lg p-4 shadow-sm w-full max-w-2xl">
                    {/* Шахматный фон для прозрачных изображений */}
                    <div
                      className="absolute inset-0 m-4 rounded-lg"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition:
                          "0 0, 0 10px, 10px -10px, -10px 0px",
                        zIndex: 0,
                      }}
                    />

                    <CldImage
                      src={uploadedImages[selectedImageIndex].publicId}
                      width={800}
                      height={600}
                      crop="limit"
                      alt={`Selected Image`}
                      className="rounded-lg shadow-md mx-auto relative z-10"
                      removeBackground={!showOriginal}
                      backgroundColor={
                        !preserveTransparency && backgroundColor
                          ? backgroundColor
                          : undefined
                      }
                    />
                  </div>

                  <Button
                    onClick={downloadImage}
                    className="mt-4"
                    variant="default"
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading
                      ? "Подготовка изображения..."
                      : `Скачать ${
                          showOriginal ? "оригинал" : "с удаленным фоном"
                        }`}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg mt-4">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-4">
                    Выберите изображение из галереи
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-lg p-2 shadow-sm cursor-pointer transition-all ${
                      selectedImageIndex === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CldImage
                      src={image.publicId}
                      width={200}
                      height={150}
                      crop="fill"
                      alt={`Image ${index + 1}`}
                      className="rounded-lg shadow-sm"
                    />
                    <p className="text-xs text-center mt-2 text-muted-foreground truncate">
                      {image.publicId.split("/").pop()}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
