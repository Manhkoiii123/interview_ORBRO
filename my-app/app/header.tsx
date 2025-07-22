"use client";

import { translations } from "@/lib/translate";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  useEffect(() => {
    if (localStorage.getItem("language") as "vi" | "en") {
      setLanguage(localStorage.getItem("language") as "vi" | "en");
    }
  }, []);
  const t = translations[language];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  O
                </span>
              </div>
              <span className="font-bold text-lg sm:text-xl">{t.brand}</span>
            </div>
            <nav className="hidden sm:flex space-x-6 lg:space-x-8 text-sm">
              <Link className="text-gray-900 font-medium" href="/">
                {t.advice}
              </Link>
              <Link
                href="/camera"
                className="text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                {t.camera}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
