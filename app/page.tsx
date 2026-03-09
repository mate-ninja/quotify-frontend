"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import "./globals.css";

export default function Home() {
  const [quote, setQuote] = useState<{ content: string; author: string }>({ content: "", author: "" });
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/photo.png')" }}
    >
      {/* Napisy */}
      <div className="w-[500px] flex flex-col items-center justify-center mb-8 text-center">
        <h1 className="text-[180px] leading-none font-sans">Quotify</h1>
        <p className="text-center max-w-md">
          Każdy dzień niesie ze sobą nowe myśli i inspiracje. Kliknij przycisk i pozwól losowi wybrać cytat, który dziś rozświetli Twój umysł.
        </p>
      </div>

      {/* Przyciski */}
      <div className="flex gap-2">
        <button
          onClick={handleRandomQuote}
          className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-10 py-3 rounded-2xl text-2xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
        >
          Losuj cytat
        </button>
        <Link href="/admin">
          <button
            className="bg-gradient-to-l from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-4 py-3 rounded-2xl text-2xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
          >
            <FontAwesomeIcon icon={faUser} className="text-white" />
          </button>
        </Link>
      </div>

      {/* Pop-up */}
      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-400 ${
          showPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white p-8 rounded-2xl w-[90%] max-w-[700px] h-[500px] relative shadow-2xl transition-all duration-400 ${
            showPopup ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          {/* Przycisk zamknięcia */}
          <div
            onClick={closePopup}
            className="absolute top-3 right-3 text-2xl font-bold text-black cursor-pointer hover:text-gray-600 transition-colors z-10"
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>

          {/* Wyśrodkowana treść */}
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-4xl font-semibold text-gray-900 mb-4">
              {quote.content}
            </p>
            {quote.author && (
              <p className="text-2xl text-gray-600 italic">
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