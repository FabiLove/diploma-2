"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Sidebar2 from "./components/Sidebar2";

export default function Home() {
  // Состояние для отслеживания выбранной опции
  const [selectedOption, setSelectedOption] = useState(1); // По умолчанию выбрана Опция 1

  return (
    <div>
      {/* Отображаем Sidebar только если выбрана Опция 1 */}
      {selectedOption === 1 && <Sidebar />}

      {/* Отображаем Sidebar2 только если выбрана Опция 2 */}
      {selectedOption === 2 && <Sidebar2 />}

      {/* Здесь можно добавить другие компоненты для других опций */}
      {selectedOption === 3 && (
        <div className="flex justify-center items-center h-[94vh] bg-muted/20">
          <div className="text-center p-8 rounded-lg border shadow-sm max-w-md">
            <h2 className="text-2xl font-bold mb-4">Опция 3</h2>
            <p className="text-muted-foreground">
              Здесь будет содержимое для Опции 3. Сейчас эта функциональность
              находится в разработке.
            </p>
          </div>
        </div>
      )}

      {selectedOption === 4 && (
        <div className="flex justify-center items-center h-[94vh] bg-muted/20">
          <div className="text-center p-8 rounded-lg border shadow-sm max-w-md">
            <h2 className="text-2xl font-bold mb-4">Опция 4</h2>
            <p className="text-muted-foreground">
              Здесь будет содержимое для Опции 4. Сейчас эта функциональность
              находится в разработке.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
