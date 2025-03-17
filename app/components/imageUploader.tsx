"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download } from "lucide-react";
import JSZip from "jszip";

export function ImageUploader({ width, height, aspectRatio, mode }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [transformation, setTransformation] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const imageRefs = useRef({});

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

  // Функция для получения изображения из DOM и преобразования в Blob
  const getImageFromDOM = (imageElement) => {
    return new Promise((resolve, reject) => {
      try {
        // Создаем canvas элемент
        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        // Получаем контекст и рисуем изображение
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imageElement, 0, 0);

        // Преобразуем canvas в Blob в формате JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image to blob"));
            }
          },
          "image/jpeg",
          0.9
        ); // Качество JPEG 90%
      } catch (error) {
        reject(error);
      }
    });
  };

  const downloadImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsDownloading(true);

    try {
      // Создаем новый экземпляр JSZip
      const zip = new JSZip();

      // Массив для хранения промисов
      const imagePromises = [];

      // Для каждого изображения в imageRefs
      for (let index = 0; index < uploadedImages.length; index++) {
        const imageElement = imageRefs.current[index];

        if (imageElement) {
          // Получаем имя файла из publicId или создаем новое
          const fileName =
            uploadedImages[index].publicId.split("/").pop() ||
            `image-${index + 1}.jpg`;

          // Создаем промис для обработки изображения
          const imagePromise = getImageFromDOM(imageElement)
            .then((blob) => {
              // Добавляем изображение в архив с расширением .jpg
              const fileNameWithExt = fileName.includes(".")
                ? fileName.replace(/\.[^/.]+$/, ".jpg")
                : `${fileName}.jpg`;

              zip.file(fileNameWithExt, blob);
              return true;
            })
            .catch((error) => {
              console.error(`Error processing image ${index}:`, error);
              return false;
            });

          imagePromises.push(imagePromise);
        }
      }

      // Ждем обработки всех изображений
      await Promise.all(imagePromises);

      // Генерируем ZIP-файл
      const content = await zip.generateAsync({ type: "blob" });

      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.zip";

      // Добавляем ссылку в DOM и кликаем по ней
      document.body.appendChild(link);
      link.click();

      // Удаляем ссылку из DOM
      document.body.removeChild(link);

      // Освобождаем URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert(
        "Произошла ошибка при создании архива. Пожалуйста, попробуйте еще раз."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Функция для сохранения ссылки на DOM-элемент изображения
  const setImageRef = (index, element) => {
    if (element) {
      imageRefs.current[index] = element;
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
        <>
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
                      ref={(el) => setImageRef(index, el)}
                      crossOrigin="anonymous"
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
                        ref={(el) => setImageRef(index, el)}
                        crossOrigin="anonymous"
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

          <Button
            onClick={downloadImages}
            className="mt-4"
            variant="default"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Подготовка архива..." : "Скачать результат"}
          </Button>
        </>
      )}
    </div>
  );
}
