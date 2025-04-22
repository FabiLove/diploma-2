"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type {
  CloudinaryUploadWidgetResults,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Download,
  Code,
  AlertTriangle,
  Bug,
  CheckCircle,
  Info,
} from "lucide-react";
import JSZip from "jszip";

// Типы для props компонента
interface ImageUploaderProps {
  bgColor: string;
  bgIntensity: number;
  preserveEdges: boolean;
  mode: string;
}

// Тип для загруженного изображения
interface UploadedImage {
  publicId: string;
  originalUrl: string;
  timestamp: number;
  size?: number;
  format?: string;
  transformation?: string;
}

// Тип для логов
type LogLevel = "info" | "warning" | "error" | "success" | "debug";
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

export function ImageUploader({
  bgColor,
  bgIntensity,
  preserveEdges,
  mode,
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [transformations, setTransformations] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const imageRefs = useRef<Record<number, HTMLImageElement>>({});

  // Отладочные состояния
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [imageLoadStatus, setImageLoadStatus] = useState<
    Record<number, "loading" | "success" | "error">
  >({});
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Функция для логирования с разными уровнями
  const log = (level: LogLevel, message: string, data?: unknown) => {
    const newLog: LogMessage = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    console[level === "error" ? "error" : level === "warning" ? "warn" : "log"](
      `[${newLog.timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`,
      data ? data : ""
    );

    setLogs((prevLogs) => {
      // Ограничиваем количество логов до 100
      const updatedLogs = [newLog, ...prevLogs].slice(0, 100);

      // Автоматическая прокрутка к последнему логу
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = 0;
        }
      }, 10);

      return updatedLogs;
    });
  };

  // Очистка логов
  const clearLogs = () => {
    setLogs([]);
    log("info", "Логи очищены");
  };

  useEffect(() => {
    log("info", "ImageUploader инициализирован с параметрами:", {
      mode,
      bgColor,
      bgIntensity,
      preserveEdges,
    });
    updateTransformations();
  }, []);

  useEffect(() => {
    log("info", "Обновлены настройки обработки изображений:", {
      mode,
      bgColor,
      bgIntensity,
      preserveEdges,
    });
    updateTransformations();
  }, [mode, bgColor, bgIntensity, preserveEdges]);

  const handleUpload = (result: CloudinaryUploadWidgetResults) => {
    log("debug", "Получен результат загрузки:", result);

    if (result.event !== "success" || !result.info) {
      log("error", "Ошибка загрузки изображения", result);
      return;
    }

    const info = result.info as CloudinaryUploadWidgetInfo;
    log("success", "Успешная загрузка изображения:", info);

    // Handle multiple uploads
    if (Array.isArray(info.public_id)) {
      log("info", "Загружено несколько изображений:", {
        count: info.public_id.length,
      });

      const newImages = info.public_id.map((id: string, index: number) => ({
        publicId: id,
        originalUrl: Array.isArray(info.secure_url)
          ? info.secure_url[index]
          : "",
        timestamp: Date.now(),
        format: Array.isArray(info.format)
          ? info.format[index]
          : (info.format as string),
        size: Array.isArray(info.bytes)
          ? info.bytes[index]
          : (info.bytes as number),
      }));
      setUploadedImages((prev) => [...prev, ...newImages]);
    } else {
      // Handle single upload
      log("info", "Загружено одно изображение:", { publicId: info.public_id });

      setUploadedImages((prev) => [
        ...prev,
        {
          publicId: info.public_id as string,
          originalUrl: info.secure_url as string,
          timestamp: Date.now(),
          format: info.format as string,
          size: info.bytes as number,
        },
      ]);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    log("info", `Удаление изображения #${index + 1}:`, imageToRemove);
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImageLoadStatus((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateTransformations = () => {
    // Формируем массив дополнительных трансформаций (preserveEdges, brightness)
    const newTransformations: string[] = [];
    if (preserveEdges) {
      newTransformations.push("e_background_removal:fineedges_y");
      log("debug", "Добавлена трансформация для сохранения краев");
    }
    if (bgIntensity !== 0) {
      newTransformations.push(`e_brightness:${bgIntensity}`);
      log("debug", `Добавлена настройка яркости: ${bgIntensity}`);
    }
    setTransformations(newTransformations);
    log(
      "info",
      "Сформированы дополнительные трансформации:",
      newTransformations
    );
  };

  // Функция для получения изображения из DOM и преобразования в Blob
  const getImageFromDOM = (imageElement: HTMLImageElement) => {
    return new Promise((resolve, reject) => {
      try {
        log("debug", "Начало извлечения изображения из DOM", {
          width: imageElement.naturalWidth,
          height: imageElement.naturalHeight,
        });

        // Создаем canvas элемент
        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        // Получаем контекст и рисуем изображение
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imageElement, 0, 0);
          log("debug", "Изображение отрисовано на canvas");

          // Преобразуем canvas в Blob в формате PNG для сохранения прозрачности
          canvas.toBlob(
            (blob) => {
              if (blob) {
                log("success", "Изображение успешно преобразовано в Blob", {
                  size: blob.size,
                  type: blob.type,
                });
                resolve(blob);
              } else {
                const error = new Error("Failed to convert image to blob");
                log("error", "Ошибка преобразования изображения в Blob", {
                  error,
                });
                reject(error);
              }
            },
            "image/png",
            1.0
          ); // Качество PNG 100%
        } else {
          const error = new Error("Failed to get canvas context");
          log("error", "Ошибка получения контекста canvas", { error });
          reject(error);
        }
      } catch (error) {
        log("error", "Непредвиденная ошибка при обработке изображения", {
          error,
        });
        reject(error);
      }
    });
  };

  const downloadImages = async () => {
    if (uploadedImages.length === 0) {
      log("warning", "Попытка скачать результат без загруженных изображений");
      return;
    }

    setIsDownloading(true);
    log("info", "Начинается подготовка архива с изображениями", {
      imageCount: uploadedImages.length,
    });

    try {
      // Создаем новый экземпляр JSZip
      const zip = new JSZip();
      log("debug", "Инициализирован новый ZIP-архив");

      // Массив для хранения промисов
      const imagePromises = [];

      // Для каждого изображения в imageRefs
      for (let index = 0; index < uploadedImages.length; index++) {
        const imageElement = imageRefs.current[index];

        if (imageElement) {
          // Получаем имя файла из publicId или создаем новое
          const fileName =
            uploadedImages[index].publicId.split("/").pop() ||
            `image-${index + 1}`;

          log("debug", `Обработка изображения #${index + 1}`, {
            fileName,
            publicId: uploadedImages[index].publicId,
          });

          // Создаем промис для обработки изображения
          const imagePromise = getImageFromDOM(imageElement)
            .then((blob) => {
              // Добавляем изображение в архив с расширением .png
              const fileNameWithExt = fileName.includes(".")
                ? fileName.replace(/\.[^/.]+$/, ".png")
                : `${fileName}.png`;

              zip.file(fileNameWithExt, blob as Blob);
              log("success", `Изображение #${index + 1} добавлено в архив`, {
                fileName: fileNameWithExt,
              });
              return true;
            })
            .catch((error) => {
              log("error", `Ошибка обработки изображения #${index + 1}`, {
                error,
              });
              return false;
            });

          imagePromises.push(imagePromise);
        } else {
          log("warning", `Изображение #${index + 1} не найдено в DOM`);
        }
      }

      // Ждем обработки всех изображений
      log("info", "Ожидание завершения обработки всех изображений...");
      const results = await Promise.all(imagePromises);
      const successCount = results.filter(Boolean).length;
      log("info", "Обработка изображений завершена", {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
      });

      // Генерируем ZIP-файл
      log("info", "Генерация ZIP-архива...");
      const content = await zip.generateAsync({ type: "blob" });
      log("success", "ZIP-архив успешно создан", {
        size: content.size,
        type: content.type,
      });

      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.zip";

      // Добавляем ссылку в DOM и кликаем по ней
      log("debug", "Инициирование скачивания архива");
      document.body.appendChild(link);
      link.click();

      // Удаляем ссылку из DOM
      document.body.removeChild(link);

      // Освобождаем URL
      URL.revokeObjectURL(url);
      log("success", "Архив отправлен на скачивание");
    } catch (error) {
      log("error", "Ошибка создания ZIP-архива", { error });
      alert(
        "Произошла ошибка при создании архива. Пожалуйста, попробуйте еще раз."
      );
    } finally {
      setIsDownloading(false);
      log("info", "Процесс скачивания завершен");
    }
  };

  // Функция для сохранения ссылки на DOM-элемент изображения
  const setImageRef = (index: number, element: HTMLImageElement | null) => {
    if (element) {
      imageRefs.current[index] = element;
      // Логируем через консоль без обновления состояния
      console.debug(`Ref saved for image #${index + 1}`, element);
    }
  };

  // Функция для отслеживания загрузки изображения
  const handleImageLoad = (index: number) => {
    log("success", `Изображение #${index + 1} успешно загружено и обработано`);
    setImageLoadStatus((prev) => ({ ...prev, [index]: "success" }));
  };

  // Функция для отслеживания ошибок загрузки изображения
  const handleImageError = (index: number, error: unknown) => {
    log("error", `Ошибка загрузки изображения #${index + 1}`, { error });
    setImageLoadStatus((prev) => ({ ...prev, [index]: "error" }));
  };

  // UI для отображения текущих настроек трансформации
  const renderTransformationInfo = () => (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm mt-2">
      <h4 className="font-medium mb-1">Текущие настройки трансформации:</h4>
      <div className="space-y-1">
        <div className="flex items-center">
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-2">
            Режим:
          </span>
          <span>
            {mode === "transparent" ? "Прозрачный фон" : "Сплошной фон"}
          </span>
        </div>
        {mode === "solidColor" && (
          <>
            <div className="flex items-center">
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-2">
                Цвет:
              </span>
              <div
                className={`w-4 h-4 rounded-full mr-1`}
                style={{ backgroundColor: `#${bgColor}` }}
              ></div>
              <span>#{bgColor}</span>
            </div>
            <div className="flex items-center">
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-2">
                Яркость:
              </span>
              <span>{bgIntensity}</span>
            </div>
          </>
        )}
        <div className="flex items-center">
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-2">
            Сохранение краев:
          </span>
          <span>{preserveEdges ? "Включено" : "Выключено"}</span>
        </div>
        <div className="mt-2">
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-2">
            Cloudinary трансформации:
          </span>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded block mt-1 overflow-x-auto">
            {JSON.stringify(transformations, null, 2)}
          </code>
        </div>
      </div>
    </div>
  );

  // UI для отладочной панели
  const renderDebugPanel = () => (
    <div
      className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-gray-800 border-t border-l shadow-lg z-50 transition-transform"
      style={{
        height: "40vh",
        transform: showDebugPanel ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Отладочная панель</h3>
        </div>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={clearLogs}>
            Очистить
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDebugPanel(false)}
          >
            Свернуть
          </Button>
        </div>
      </div>
      <div
        className="overflow-auto p-2 h-[calc(100%-40px)]"
        ref={logContainerRef}
      >
        {logs.length === 0 ? (
          <div className="text-center text-sm text-gray-500 p-4">
            Нет доступных логов
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  log.level === "error"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    : log.level === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                    : log.level === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : log.level === "debug"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "bg-gray-50 dark:bg-gray-700/50"
                }`}
              >
                <div className="flex items-start">
                  {log.level === "error" && (
                    <AlertTriangle className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                  )}
                  {log.level === "warning" && (
                    <AlertTriangle className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                  )}
                  {log.level === "success" && (
                    <CheckCircle className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                  )}
                  {log.level === "debug" && (
                    <Code className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                  )}
                  {log.level === "info" && (
                    <Info className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs opacity-75 mb-1">
                      <span>[{log.level.toUpperCase()}]</span>
                      <span>{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.data != null && (
                      <pre className="mt-1 text-xs overflow-x-auto p-1 bg-black/5 dark:bg-white/5 rounded">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-6xl mx-auto p-4">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold">Удаление фона</h2>
        <Button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <Bug className="h-4 w-4 mr-2" />
          {showDebugPanel ? "Скрыть отладку" : "Показать отладку"}
        </Button>
      </div>

      {renderTransformationInfo()}

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
                    <div className="relative">
                      {imageLoadStatus[index] === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 z-10 rounded-lg">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {imageLoadStatus[index] === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100/80 dark:bg-red-900/80 z-10 rounded-lg">
                          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                          <p className="text-xs text-center">Ошибка загрузки</p>
                        </div>
                      )}
                      <CldImage
                        src={image.publicId}
                        width={800}
                        height={600}
                        alt={`Image ${index + 1}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg shadow-md mx-auto"
                        removeBackground
                        format="png"
                        background={
                          mode === "solidColor" ? `#${bgColor}` : undefined
                        }
                        transformations={transformations}
                        ref={(el) => setImageRef(index, el)}
                        crossOrigin="anonymous"
                        onLoad={() => handleImageLoad(index)}
                        onError={(e) => handleImageError(index, e)}
                        onLoadStart={() =>
                          setImageLoadStatus((prev) => ({
                            ...prev,
                            [index]: "loading",
                          }))
                        }
                      />
                    </div>
                    <div className="text-xs text-center mt-2 space-y-1">
                      <p className="font-medium truncate">
                        {image.publicId.split("/").pop()}
                      </p>
                      <div className="flex justify-center space-x-2 text-gray-500">
                        {image.format && <span>Формат: {image.format}</span>}
                        {image.size && (
                          <span>
                            Размер: {Math.round(image.size / 1024)} KB
                          </span>
                        )}
                      </div>
                    </div>
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
                    <div className="flex-shrink-0 relative">
                      {imageLoadStatus[index] === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 z-10 rounded-lg">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {imageLoadStatus[index] === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100/80 dark:bg-red-900/80 z-10 rounded-lg">
                          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                          <p className="text-xs text-center">Ошибка загрузки</p>
                        </div>
                      )}
                      <CldImage
                        src={image.publicId}
                        width={800}
                        height={600}
                        alt={`Image ${index + 1}`}
                        className="rounded-lg shadow-md"
                        removeBackground
                        format="png"
                        background={
                          mode === "solidColor" ? `#${bgColor}` : undefined
                        }
                        transformations={transformations}
                        ref={(el) => setImageRef(index, el)}
                        crossOrigin="anonymous"
                        onLoad={() => handleImageLoad(index)}
                        onError={(e) => handleImageError(index, e)}
                        onLoadStart={() =>
                          setImageLoadStatus((prev) => ({
                            ...prev,
                            [index]: "loading",
                          }))
                        }
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">Изображение {index + 1}</h3>
                      <p className="text-sm text-muted-foreground break-all">
                        ID: {image.publicId}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {image.format && (
                          <p>Формат: {image.format.toUpperCase()}</p>
                        )}
                        {image.size && (
                          <p>Размер: {Math.round(image.size / 1024)} KB</p>
                        )}
                        {image.timestamp && (
                          <p>
                            Загружено:{" "}
                            {new Date(image.timestamp).toLocaleString()}
                          </p>
                        )}

                        <div className="mt-3 space-y-1 pt-2 border-t">
                          <p>
                            Режим фона:{" "}
                            {mode === "transparent" ? "Прозрачный" : "Сплошной"}
                          </p>
                          {mode === "solidColor" && (
                            <>
                              <p className="flex items-center">
                                Цвет фона:
                                <span
                                  className="inline-block w-4 h-4 rounded-full mx-1"
                                  style={{ backgroundColor: `#${bgColor}` }}
                                ></span>
                                #{bgColor}
                              </p>
                              <p>Яркость: {bgIntensity}</p>
                            </>
                          )}
                          <p>
                            Сохранение краев: {preserveEdges ? "Да" : "Нет"}
                          </p>
                        </div>
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

      {renderDebugPanel()}
    </div>
  );
}
