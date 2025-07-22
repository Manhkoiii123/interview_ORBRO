"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translate";

interface AdviceData {
  slip: {
    id: number;
    advice: string;
  };
}

export default function AdvicePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [advices, setAdvices] = useState<string[]>(["", "", ""]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isRunningRef = useRef(false);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const t = translations[language];

  const fetchAdvice = async (index: number): Promise<string> => {
    try {
      const response = await fetch(`https://api.adviceslip.com/advice`);
      const data: AdviceData = await response.json();
      return data.slip.advice;
    } catch (error) {
      console.log(error);
      return index === 0
        ? t.defaultAdvice1
        : index === 1
        ? t.defaultAdvice2
        : t.defaultAdvice3;
    }
  };

  const makeRandomImageUrl = () =>
    `https://picsum.photos/800?random=${Math.random()}`;

  const updateContent = async () => {
    const newImages = [0, 1, 2].map(makeRandomImageUrl);

    const advicePromises = [0, 1, 2].map((i) => fetchAdvice(i));
    const newAdvices = await Promise.all(advicePromises);

    setImages(newImages);
    setAdvices(newAdvices);
  };

  const scheduleNext = () => {
    if (!isRunningRef.current) return;
    timerRef.current = setTimeout(async () => {
      if (!isRunningRef.current) return;
      await updateContent();
      scheduleNext();
    }, 2000);
  };

  const startProcess = async () => {
    if (isRunningRef.current) return;
    setIsRunning(true);
    await updateContent();
    scheduleNext();
  };

  const stopProcess = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
    localStorage.setItem("language", language === "vi" ? "en" : "vi");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-4xl mb-2 leading-relaxed">
            {t.subtitle}
          </p>
          <p className="text-gray-500 italic mb-6 sm:mb-8">{t.author}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={isRunning ? stopProcess : startProcess}
              className={`px-6 sm:px-8 py-3 font-medium rounded-lg transition-all duration-200 ${
                isRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isRunning ? <>{t.stop}</> : <>{t.start}</>}
            </Button>

            <Button
              onClick={toggleLanguage}
              className="px-6 sm:px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200"
            >
              {t.language}
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 bg-white shadow-sm text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {t.adviceTitle}
          </h2>

          <div className="space-y-6 xl:space-y-8">
            {[0, 1, 2].map((index) => (
              <div key={`advice-block-${index}`}>
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-lg text-left">
                  {index === 0
                    ? t.advice1
                    : index === 1
                    ? t.advice2
                    : t.advice3}
                </h3>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 ${
                    index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                  }`}
                >
                  <div
                    className={`space-y-3 ${
                      index % 2 === 1 ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="relative">
                      {images[index] ? (
                        <img
                          key={images[index]}
                          src={images[index]}
                          alt={`${t.imageAlt} ${index + 1}`}
                          className="w-full h-40 sm:h-48 lg:h-48 xl:h-56 object-cover rounded-lg border border-gray-200 transition-opacity duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-48 lg:h-48 xl:h-56 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">
                            {t.imageAlt} {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`space-y-3 ${
                      index % 2 === 1 ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 lg:h-48 xl:h-56 lg:flex lg:items-start">
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-base">
                        {advices[index] ||
                          (index === 0
                            ? t.defaultAdvice1
                            : index === 1
                            ? t.defaultAdvice2
                            : t.defaultAdvice3)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
