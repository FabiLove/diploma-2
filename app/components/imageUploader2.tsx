/* -------------------------------------------------------------------------- */
/*  File: /app/components/imageUploader2.tsx                                  */
/* -------------------------------------------------------------------------- */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget, getCldImageUrl } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download, ImageIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/* --------------------------- типы и утилиты -------------------------------- */
type ImageEntry = {
  publicId: string;
  url: string;
  width: number;
  height: number;
};

/** Приводит цвет к формату, который Cloudinary ожидает в background-трансформации */
const cldColor = (color: string): string | undefined => {
  if (!color) return undefined;
  const clean = color.replace("#", "").trim();

  // если hex-код из 3 или 6 символов – добавляем префикс rgb:
  if (/^[0-9a-f]{6}$/i.test(clean) || /^[0-9a-f]{3}$/i.test(clean)) {
    return `rgb:${clean}`;
  }
  // иначе оставляем как есть (например, 'white')
  return clean;
};

/* -------------------------------------------------------------------------- */
/*  Компонент                                                                 */
/* -------------------------------------------------------------------------- */
export function ImageUploader2({
  backgroundColor,
  preserveTransparency,
  downloadFormat,
}: {
  backgroundColor: string;
  preserveTransparency: boolean;
  downloadFormat: "png" | "jpg" | "webp";
}) {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [busy, setBusy] = useState(false);

  /* ------------------------------ upload ---------------------------------- */
  const handleUpload = (res: any) => {
    const make = (i: any): ImageEntry => ({
      publicId: i.public_id,
      url: i.secure_url,
      width: i.width,
      height: i.height,
    });

    const batch: ImageEntry[] = Array.isArray(res.info)
      ? res.info.map(make)
      : [make(res.info)];

    setImages((p) => [...p, ...batch]);
    if (current === null) setCurrent(0);
  };

  const remove = (idx: number) => {
    setImages((p) => p.filter((_, i) => i !== idx));
    if (current === idx) setCurrent(null);
    else if ((current ?? 0) > idx) setCurrent((s) => (s ?? 0) - 1);
  };

  /* ----------------------------- download --------------------------------- */
  const download = async () => {
    if (current === null) return;
    setBusy(true);

    try {
      const { publicId } = images[current];

      /* --- URL без ресайза: сохраняем оригинал --- */
      const url = getCldImageUrl({
        src: publicId,
        removeBackground: !showOriginal,
        background: !preserveTransparency
          ? cldColor(backgroundColor)
          : undefined,
        format: downloadFormat,
      });

      const blob = await fetch(url).then((r) => r.blob());
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bg-removed-${publicId.split("/").pop()}.${downloadFormat}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------- JSX ------------------------------------ */
  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-6xl mx-auto p-4">
      {/* -------- Загрузка -------- */}
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

      {!!images.length && (
        <div className="w-full">
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              <TabsTrigger value="gallery">
                Галерея ({images.length})
              </TabsTrigger>
            </TabsList>

            {/* ------------------------ PREVIEW ------------------------ */}
            <TabsContent value="preview">
              {current !== null ? (
                <div className="flex flex-col items-center space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="toggle-original"
                      checked={showOriginal}
                      onCheckedChange={setShowOriginal}
                    />
                    <Label
                      htmlFor="toggle-original"
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
                          Показать с удалённым фоном
                        </>
                      )}
                    </Label>
                  </div>

                  {/* ---- картинка ---- */}
                  {(() => {
                    const img = images[current];
                    // ограничиваем превью 1000px по ширине, но это только для экрана
                    const maxW = 1000;
                    const w = Math.min(img.width, maxW);
                    const h = Math.round((img.height * w) / img.width);

                    return (
                      <CldImage
                        src={img.publicId}
                        width={w}
                        height={h}
                        sizes={`${w}px`}
                        unoptimized
                        removeBackground={!showOriginal}
                        background={
                          !preserveTransparency
                            ? cldColor(backgroundColor)
                            : undefined
                        }
                        alt="Preview"
                        className="rounded-lg shadow-md"
                      />
                    );
                  })()}

                  <Button onClick={download} disabled={busy} className="mt-2">
                    <Download className="h-4 w-4 mr-2" />
                    {busy ? "Подготовка…" : "Скачать"}
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

            {/* ------------------------ GALLERY ------------------------ */}
            <TabsContent value="gallery">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => {
                  const thumbW = 200;
                  const thumbH = Math.round((img.height * thumbW) / img.width);
                  return (
                    <div
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`relative border rounded-lg p-2 shadow-sm cursor-pointer transition ${
                        current === idx ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(idx);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <CldImage
                        src={img.publicId}
                        width={thumbW}
                        height={thumbH}
                        sizes={`${thumbW}px`}
                        unoptimized
                        alt={`thumb-${idx}`}
                        className="rounded-lg shadow-sm"
                      />

                      <p className="text-xs text-center mt-1 truncate">
                        {img.publicId.split("/").pop()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ключевые изменения                                                        */
/*  • cldColor(): '#ff0000' → 'rgb:ff0000'   →  b_rgb:ff0000                  */
/*  • removeBackground без указания width/height при скачивании               */
/*  • оригинальный размер файла сохраняется, превью лишь масштабируется       */
/* -------------------------------------------------------------------------- */
