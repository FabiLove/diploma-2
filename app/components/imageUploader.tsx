"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget, getCldImageUrl } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download } from "lucide-react";
import JSZip from "jszip";

/* -------------------------------------------------------------------------- */
/*  Типы                                                                     */
/* -------------------------------------------------------------------------- */

interface CloudinaryInfo {
  public_id: string;
  secure_url: string;
  original_filename: string;
  width: number;
  height: number;
}
type CloudinaryWidgetResult = { info: CloudinaryInfo | CloudinaryInfo[] };

type Uploaded = {
  publicId: string;
  originalUrl: string;
  originalName: string;
};

/* -------------------------------------------------------------------------- */
/*  Утилита                                                                   */
/* -------------------------------------------------------------------------- */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* -------------------------------------------------------------------------- */
/*  Компонент                                                                 */
/* -------------------------------------------------------------------------- */

interface ImageUploaderProps {
  width: number;
  height: number;
  aspectRatio: string;
  mode: "dimensions" | "aspectRatio";
}

export function ImageUploader({ width, height }: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<Uploaded[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});

  /* ------------------------------- upload --------------------------------- */

  const toUploaded = (a: CloudinaryInfo): Uploaded => ({
    publicId: a.public_id,
    originalUrl: a.secure_url,
    originalName:
      a.original_filename || a.public_id.split("/").pop() || "image",
  });

  const handleUpload = (result: unknown): void => {
    /*  `onSuccess` из next-cloudinary присылает объект { info: ... }.
        Используем type-guard вместо `any`. */
    const isValid = (r: unknown): r is CloudinaryWidgetResult =>
      !!r && typeof r === "object" && "info" in r && r.info !== undefined;

    if (!isValid(result)) return;

    const batch = Array.isArray(result.info)
      ? result.info.map(toUploaded)
      : [toUploaded(result.info)];

    setUploadedImages((prev) => [...prev, ...batch]);
  };

  const removeImage = (idx: number): void =>
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));

  /* ------------------------------ download -------------------------------- */

  const downloadImages = async (): Promise<void> => {
    if (!uploadedImages.length) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      await Promise.all(
        uploadedImages.map(async ({ publicId, originalName }, i) => {
          const index = String(i + 1).padStart(2, "0");
          const fileName = `${index}-${slugify(
            originalName
          )}-${width}x${height}.jpg`;

          const url = getCldImageUrl({
            src: publicId,
            width,
            height,
            crop: { type: "fill", gravity: "auto", source: true },
            format: "jpg",
          });

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

  /* -------------------------------- JSX ----------------------------------- */

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
            <Button onClick={() => open()} className="w-full rounded-none">
              Загрузить изображения
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Поддерживается загрузка нескольких файлов и папок
            </p>
          </div>
        )}
      </CldUploadWidget>

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
                    className="relative border rounded-none p-3 shadow-sm"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 z-10 rounded-none"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <CldImage
                      src={img.publicId}
                      width={width}
                      height={height}
                      crop={{ type: "fill", gravity: "auto", source: true }}
                      sizes={`${width}px`}
                      unoptimized
                      alt={`Image ${idx + 1}`}
                      className="shadow-md mx-auto"
                      ref={(el) => {
                        imageRefs.current[idx] = el;
                      }}
                    />

                    <p className="text-xs text-center mt-2 text-muted-foreground truncate">
                      {img.originalName}
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
                    className="flex flex-col md:flex-row gap-4 border rounded-none p-4 relative"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-none"
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
                        className="shadow-md"
                        ref={(el) => {
                          imageRefs.current[idx] = el;
                        }}
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-medium">{img.originalName}</h3>
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

          <Button
            onClick={downloadImages}
            className="mt-4 rounded-none"
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
