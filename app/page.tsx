"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import "./globals.css";

export default function Home() {
  const [quote, setQuote] = useState<{ content: string; author: string }>({ content: "", author: "" });
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function getJSONData(): Promise<[string, string]> {
    const response = await fetch(
      "https://cetuspro-quotify02-03.azurewebsites.net/api/Quote/random",
      {
        method: "GET",
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Błąd pobierania danych");
    return await response.json();
  }

  const handleRandomQuote = async (): Promise<void> => {
    try {
      setLoading(true);
      setShowPopup(false);
      const data = await getJSONData();
      setQuote({ content: data[0], author: data[1] });
      setShowPopup(true);
    } catch (error) {
      console.error("BŁĄD:", error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = (): void => setShowPopup(false);

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/photo.png')" }}
    >
      {/* Napisy - responsywne */}
      <div className="w-full sm:w-[500px] flex flex-col items-center justify-center mb-4 sm:mb-8 text-center px-4 sm:px-0">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[180px] leading-none font-sans">
          Quotify
        </h1>
        <p className="text-center max-w-md text-sm sm:text-base px-2 sm:px-0">
          Każdy dzień niesie ze sobą nowe myśli i inspiracje. Kliknij przycisk i pozwól losowi wybrać cytat, który dziś rozświetli Twój umysł.
        </p>
      </div>

      {/* Przyciski - pionowo na małych ekranach */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto px-4 sm:px-0">
        <button
          onClick={handleRandomQuote}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-6 sm:px-10 py-3 rounded-2xl text-xl sm:text-2xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
        >
          Losuj cytat
        </button>

        {/* Dropdown z trzema kropkami */}
        <div className="relative w-full sm:w-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full sm:w-auto bg-gradient-to-l from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-4 py-3 rounded-2xl text-xl sm:text-2xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faEllipsisV} className="text-white" />
          </button>

          {/* Menu rozwijane */}
          {menuOpen && (
            <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
              >
                Admin Panel
              </Link>
              <Link
                href="/customize"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
              >
                Customize
              </Link>
              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                Kategorie
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up (bez zmian) */}
      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-400 ${
          showPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white p-6 sm:p-8 rounded-2xl w-[95%] sm:w-[90%] max-w-[700px] h-[400px] sm:h-[500px] relative shadow-2xl transition-all duration-400 ${
            showPopup ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <div
            onClick={closePopup}
            className="absolute top-3 right-3 text-2xl font-bold text-black cursor-pointer hover:text-gray-600 transition-colors z-10"
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>

          <div className="h-full flex flex-col items-center justify-center text-center px-2 sm:px-4 overflow-y-auto">
            <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4 break-words">
              {quote.content}
            </p>
            {quote.author && (
              <p className="text-xl sm:text-2xl text-gray-600 italic">
                — {quote.author}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-[9999]">
          <div className="w-[70px] h-[70px] border-4 border-gray-300 border-t-4 border-t-green-500 rounded-full loader-spin"></div>
        </div>
      )}
    </div>
  );
}