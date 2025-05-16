"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  CldImage,
  CldUploadWidget,
  getCldImageUrl, // ⬅️  новый helper для скачивания
} from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download } from "lucide-react";
import JSZip from "jszip";

type ImageUploaderProps = {
  width: number;
  height: number;
  aspectRatio: string;
  mode: "dimensions" | "aspectRatio";
};

export function ImageUploader({ width, height }: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<
    { publicId: string; originalUrl: string }[]
  >([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});

  /* ---------------------------------------------------------------------- */
  /*  Загрузка                                                              */
  /* ---------------------------------------------------------------------- */
  const handleUpload = (result: any) => {
    // Cloudinary может вернуть один файл или массив
    const makeEntry = (id: string, url: string) => ({
      publicId: id,
      originalUrl: url,
    });

    if (Array.isArray(result.info.secure_url)) {
      const batch = result.info.public_id.map((id: string, i: number) =>
        makeEntry(id, result.info.secure_url[i])
      );
      setUploadedImages((prev) => [...prev, ...batch]);
    } else {
      setUploadedImages((prev) => [
        ...prev,
        makeEntry(result.info.public_id, result.info.secure_url),
      ]);
    }
  };

  const removeImage = (idx: number) =>
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------------------------------------------------------------- */
  /*  Скачивание                                                             */
  /* ---------------------------------------------------------------------- */
  const downloadImages = async () => {
    if (!uploadedImages.length) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      // для каждой загруженной картинки собираем «правильный» URL
      await Promise.all(
        uploadedImages.map(async ({ publicId }, i) => {
          const fileName = `${
            publicId.split("/").pop() || "image"
          }-${width}x${height}.jpg`;

          // генерируем прямой линк на Cloudinary
          const url = getCldImageUrl({
            src: publicId,
            width,
            height,
            crop: { type: "fill", gravity: "auto", source: true },
            format: "jpg",
          });

          // скачиваем файл и кладём в zip
          const blob = await fetch(url).then((res) => res.blob());
          zip.file(fileName, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "images.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("ZIP-error:", err);
      alert("Не удалось сформировать архив. Попробуйте ещё раз.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  JSX                                                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-6xl mx-auto p-4">
      {/* ---------- Загрузка ---------- */}
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
              Поддерживается загрузка нескольких файлов и папок
            </p>
          </div>
        )}
      </CldUploadWidget>

      {/* ---------- Галерея / список ---------- */}
      {!!uploadedImages.length && (
        <>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Сетка</TabsTrigger>
              <TabsTrigger value="list">Список</TabsTrigger>
            </TabsList>

            {/* --- Сетка --- */}
            <TabsContent value="grid" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded-lg p-3 shadow-sm"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 z-10"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* --- главное отличие: фиксируем sizes и unoptimized --- */}
                    <CldImage
                      src={img.publicId}
                      width={width}
                      height={height}
                      crop={{ type: "fill", gravity: "auto", source: true }}
                      sizes={`${width}px`}
                      unoptimized /* -> без responsive-srcset */
                      alt={`Image ${idx + 1}`}
                      className="rounded-lg shadow-md mx-auto"
                      ref={(el) => (imageRefs.current[idx] = el)}
                    />

                    <p className="text-xs text-center mt-2 text-muted-foreground truncate">
                      {img.publicId.split("/").pop()}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* --- Список --- */}
            <TabsContent value="list" className="w-full">
              <div className="space-y-4 mt-4">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 relative"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="flex-shrink-0">
                      <CldImage
                        src={img.publicId}
                        width={width}
                        height={height}
                        crop={{ type: "fill", gravity: "auto", source: true }}
                        sizes={`${width}px`}
                        unoptimized
                        alt={`Image ${idx + 1}`}
                        className="rounded-lg shadow-md"
                        ref={(el) => (imageRefs.current[idx] = el)}
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-medium">Изображение {idx + 1}</h3>
                      <p className="text-sm text-muted-foreground break-all">
                        ID: {img.publicId}
                      </p>
                      <p className="text-sm mt-2">
                        Размеры: {width}×{height}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* ---------- Кнопка «Скачать всё» ---------- */}
          <Button
            onClick={downloadImages}
            className="mt-4"
            variant="default"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Подготовка архива…" : "Скачать результат"}
          </Button>
        </>
      )}
    </div>
  );
}
