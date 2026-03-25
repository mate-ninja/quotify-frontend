"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEllipsisV, faStar } from "@fortawesome/free-solid-svg-icons";
import { faQuoteLeft, faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import "./globals.css";

type Quote = {
  content: string;
  author: string;
  image_url?: string; 
};

type CustomizeSettings = {
  background: string; 
  quoteColor: string;
  quoteFont: string;
  quoteSize: number;
  category: string;
};

export default function Home() {
  const [quote, setQuote] = useState<Quote>({ content: "", author: "" });
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [errorPopup, setErrorPopup] = useState<boolean>(false);
  const [errorPopupTranslate, setErrorPopupTranslate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [customizeOpen, setCustomizeOpen] = useState<boolean>(false);
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(false);
  const quoteRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const errorPopupRef = useRef<HTMLDivElement>(null);
  const favPopupRef = useRef<HTMLDivElement>(null);

  // Domyślne ustawienia
  const defaultSettings: CustomizeSettings = {
    background: "url('/images/photo.png')",
    quoteColor: "#111827",
    quoteFont: "Arial, sans-serif",
    quoteSize: 2.25,
    category: ""
  };

  const [settings, setSettings] = useState<CustomizeSettings>(defaultSettings);

  // Wczytaj z localstorage
  useEffect(() => {
    const saved = localStorage.getItem("customizeSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Błąd ustawień", e);
      }
    }
    const savedFav = localStorage.getItem("favorites");
    if (savedFav) {
      try {
        setFavorites(JSON.parse(savedFav));
      } catch (e) {
        console.error("Błąd ulubionych", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customizeSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  async function getJSONData(): Promise<[string, string, string?]> {
    const response = await fetch(
      `https://cetuspro-quotify02-03.azurewebsites.net/api/Quote/random${settings.category ? "?kategoria=" + settings.category : ""}`,
      {
        method: "GET",
        cache: "no-store"
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
      setQuote({ 
        content: data[0], 
        author: data[1], 
        image_url: data[2]
      });
      setShowPopup(true);
    } catch (error) {
      console.error("BŁĄD:", error);
      setErrorPopup(true);
      setTimeout(() => setErrorPopupTranslate(true), 10);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => setShowPopup(false);
  
  const closeErrorPopup = () => {
    if (errorPopupTranslate){
      setErrorPopupTranslate(false);
      setTimeout(()=>setErrorPopup(false), 500);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quoteRef.current && !quoteRef.current.contains(event.target as Node)) {
        closePopup();
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setCustomizeOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (errorPopupRef.current && !errorPopupRef.current.contains(event.target as Node)) {
        closeErrorPopup();
      }
      if (favPopupRef.current && !favPopupRef.current.contains(event.target as Node)) {
        setFavoritesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomizeClick = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setCustomizeOpen(true);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings({ ...settings, background: `url('${url}')` });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, quoteColor: e.target.value });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, quoteFont: e.target.value });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, quoteSize: parseFloat(e.target.value) });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, category: e.target.value });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const getOutlineColor = (color: string) => {
    const darkColors = ['#111827', '#000000', '#000'];
    return darkColors.includes(color.toLowerCase()) ? '#ffffff' : '#000000';
  };

  const addToFavorites = () => {
    const exists = favorites.some(
      (fav) => fav.content === quote.content && fav.author === quote.author
    );
    if (!exists) {
      setFavorites([...favorites, quote]);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(quote);
    } else {
      addToFavorites();
    }
  };

  const isFavorite = favorites.some(
    (fav) => fav.content === quote.content && fav.author === quote.author
  );

  const removeFromFavorites = (favToRemove: Quote) => {
    setFavorites(
      favorites.filter(
        (fav) =>
          !(fav.content === favToRemove.content && fav.author === favToRemove.author)
      )
    );
  };

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center relative transition-all duration-300"
      style={{ backgroundImage: settings.background }}
    >
      {/* Panel Customize */}
      {customizeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={customizeRef}
            className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Dostosuj wygląd</h3>
              <button
                onClick={() => setCustomizeOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tło */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tło strony
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <button
                  onClick={() => setSettings({ ...settings, background: defaultSettings.background })}
                  className="mt-2 text-xs text-emerald-600 hover:text-emerald-800"
                >
                  Przywróć domyślne tło
                </button>
              </div>

              {/* Kolor cytatu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kolor tekstu cytatu
                </label>
                <input
                  type="color"
                  value={settings.quoteColor}
                  onChange={handleColorChange}
                  className="w-full h-10 p-1 rounded border border-gray-300"
                />
              </div>

              {/* Czcionka */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Czcionka cytatu
                </label>
                <select
                  value={settings.quoteFont}
                  onChange={handleFontChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Segoe UI', sans-serif">Segoe UI</option>
                </select>
              </div>

              {/* Rozmiar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rozmiar cytatu: {settings.quoteSize}rem
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.125"
                  value={settings.quoteSize}
                  onChange={handleSizeChange}
                  className="w-full"
                />
              </div>

              <button
                onClick={resetSettings}
                className="w-full mt-2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors text-sm"
              >
                Przywróć domyślne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Kategorie */}
      {categoriesOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={categoriesRef}
            className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Wybierz kategorię</h3>
              <button
                onClick={() => setCategoriesOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategoria cytatu
                </label>
                <select
                  value={settings.category}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Wszystko</option>
                  <option value="Zabawne">Zabawne</option>
                  <option value="Głębokie">Głębokie</option>
                  <option value="Motywujące">Motywujące</option>
                  <option value="Zycie">Życie</option>
                  <option value="Milosc">Miłość</option>
                  <option value="Sukces">Sukces</option>
                  <option value="Szczescie">Szczęście</option>
                  <option value="Nauka">Nauka</option>
                  <option value="Przyjazn">Przyjaźń</option>
                  <option value="Limbus Company">Limbus Company</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {favoritesOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 relative" ref={favPopupRef}>
            <button
              onClick={() => setFavoritesOpen(false)}
              className="absolute top-3 right-3 text-xl"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2 className="text-xl font-bold mb-4">Ulubione cytaty</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-500">Brak ulubionych cytatów</p>
            ) : (
              <div className="space-y-4">
                {favorites.map((fav, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-semibold">{fav.content}</p>
                    <p className="text-sm text-gray-500 italic">{fav.author}</p>
                    <button
                      onClick={() => removeFromFavorites(fav)}
                      className="text-red-500 text-sm"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {errorPopup && (
        <div
          ref={errorPopupRef}
          className={`fixed bottom-20 right-4 sm:right-8 w-72 sm:w-80 bg-red-300 rounded-xl shadow-2xl z-30 p-5 border-2 border-red-400 transform ${errorPopupTranslate ? "" : "translate-x-full"} transition-transform duration-500 ease-in-out`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Błąd pobierania cytatów z bazy</h3>
            <button
              onClick={closeErrorPopup}
              className="text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-700">Spróbuj zmienić filtry kategorii albo spróbuj później</p>
            </div>
          </div>
        </div>
      )}

      {/* Napisy */}
      <div className="w-full sm:w-[500px] flex flex-col items-center justify-center mb-4 sm:mb-8 text-center px-4 sm:px-0">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[180px] leading-none font-sans">
          Quotify
        </h1>
        <p className="text-center max-w-md text-sm sm:text-base px-2 sm:px-0">
          Każdy dzień niesie ze sobą nowe myśli i inspiracje. Kliknij przycisk i pozwól losowi wybrać cytat, który dziś rozświetli Twój umysł.
        </p>
      </div>

      {/* Przyciski */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto px-4 sm:px-0">
        <button
          onClick={handleRandomQuote}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-6 sm:px-10 py-3 rounded-2xl text-xl sm:text-2xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
        >
          Losuj cytat
        </button>

        {/* Dropdown */}
        <div className="relative w-full sm:w-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full sm:w-auto bg-gradient-to-l from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white px-4 py-3 rounded-2xl text-xl sm:text-3xl font-bold shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faEllipsisV} className="text-white" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <Link
                href="/admin"
                onClick={() => {
                    setMenuOpen(false);
                    setCategoriesOpen(false);
                  }
                }
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
              >
                Admin Panel
              </Link>
              <button
                onClick={handleCustomizeClick}
                className="w-full text-left block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
              >
                Customize
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setCustomizeOpen(false);
                  setCategoriesOpen(true);
                }}
                className="w-full text-left block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
              >
                Kategorie
              </button>
              <button onClick={() => {setFavoritesOpen(true); setMenuOpen(false);}} className="w-full text-left block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0">Ulubione</button>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up z cytatem */}
      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-400 ${
          showPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`p-5 sm:p-8 rounded-2xl w-[95%] sm:w-[90%] max-w-[850px] h-[400px] sm:h-[500px] relative shadow-2xl transition-all duration-400 bg-cover bg-center ${
            showPopup ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          style={{
            backgroundColor: !quote.image_url ? '#ffffff' : undefined,
            backgroundImage: quote.image_url ? `url('${quote.image_url}')` : undefined,
          }}
          ref={quoteRef}
        >
          <div
            onClick={closePopup}
            className="absolute top-3 right-3 text-2xl font-bold text-black cursor-pointer hover:text-gray-600 transition-colors z-10"
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <div
            onClick={toggleFavorite}
            className="absolute top-3 left-3 text-2xl cursor-pointer z-10"
          >
            <FontAwesomeIcon 
              icon={faStar}
              className={isFavorite ? "text-yellow-400" : "text-gray-400"}  
            />
          </div>

          <div className="h-full flex flex-col items-start justify-center px-2 sm:px-4 overflow-y-auto">
            <FontAwesomeIcon 
              icon={faQuoteLeft} 
              className="text-emerald-600 w-20 h-20 mb-4" 
            />
            <p
              className="font-semibold text-gray-900 mb-4 break-words transition-all duration-300 text-left"
              style={{
                color: settings.quoteColor,
                fontFamily: settings.quoteFont,
                fontSize: `${settings.quoteSize}rem`,
                textShadow: `1px 1px 0 ${getOutlineColor(settings.quoteColor)}, 
                            -1px -1px 0 ${getOutlineColor(settings.quoteColor)}, 
                            1px -1px 0 ${getOutlineColor(settings.quoteColor)}, 
                            -1px 1px 0 ${getOutlineColor(settings.quoteColor)}`,
              }}
            >
              {quote.content}
            </p>
            {quote.author && (
              <div className="w-full flex flex-col items-end">
                <p className="text-xl sm:text-2xl text-gray-600 italic text-right">
                  {quote.author}
                </p>
                <hr className="w-20 border-2 border-emerald-600 h-0 rounded mt-2" />
              </div>
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