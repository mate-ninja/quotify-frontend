"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faSignInAlt,
  faSignOutAlt,
  faPencilAlt,
  faTrashAlt,
  faSyncAlt,
  faTimes,
  faUpload,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { json } from "stream/consumers";
import { Quote } from "lucide-react";

// Typy
type Quote = {
  id: string;         
  cytat: string;
  autor: string;
  czasUtworzenia: string;
  image_url: string;
  kategorie: string;
};

type LoginData = {
  email: string;
  password: string;
};

type User = {
  token: string;
  email?: string;
};

export default function AdminPage() {
  // Autoryzacja
  const [user, setUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [loginStatus, setLoginStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);

  // Lista cytatów
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesFiltered, setQuotesFiltered] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  // Modal dodawania/edycji
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [AIQuote, setAIQuote] = useState(false);
  const [formData, setFormData] = useState<{ cytat: string; autor: string, image_url: string, kategorie: string}>({
    cytat: "",
    autor: "",
    image_url: "",
    kategorie: "",
  });
  const [searchData, setSearchData] = useState<{ text: string; kategorie: string }>({
    text: "",
    kategorie: "",
  });
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  function CheckToken(token:string){
    if(!token){
      return false;
    } else{
      let middle = token.split(".")[1];
      let decoded = JSON.parse(atob(middle));
      let timestamp = new Date(decoded.exp * 1000);
      return timestamp > new Date()
    }
  }

  // Sprawdzanie tokenu
  useEffect(() => {
    const token = localStorage.getItem("token")||"";
    const email = localStorage.getItem("email");
    if (CheckToken(token)) {
      setUser({ token, email: email || undefined });
    }
  }, []);

  // Pobieranie listy cytatów
  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

 const fetchQuotes = async () => {
    if (!user) return;
    setQuotesLoading(true);
    setQuotesError(null);
    try {
      const response = await fetch("https://cetuspro-quotify02-03.azurewebsites.net/api/Quote", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error("Błąd pobierania cytatów");
      let data = await response.json();
      

      data.sort((a: Quote, b: Quote) => Number(a.id) - Number(b.id));
      setQuotes(data);
      setQuotesFiltered(data);
    } catch (error: any) {
      setQuotesError(error.message);
    } finally {
      setQuotesLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];
    if (searchData.text) {
      filtered = filtered.filter((quote: Quote) => 
        quote.cytat.toLowerCase().includes(searchData.text.toLowerCase())
      );
    }
    if (searchData.kategorie) {
      filtered = filtered.filter((quote: Quote) => 
        quote.kategorie === searchData.kategorie
      );
    }
    setQuotesFiltered(filtered);
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginStatus({ type: null, message: "" });
    setLoginLoading(true);
    try {
      const response = await fetch("https://cetuspro-quotify02-03.azurewebsites.net/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Błąd logowania");
      }
      const data = await response.json();
      const token = data.token || data.accessToken;
      if (!token) throw new Error("Brak tokena w odpowiedzi");
      localStorage.setItem("token", token);
      if (data.email) localStorage.setItem("email", data.email);
      setUser({ token, email: data.email });
      setLoginStatus({ type: "success", message: "Zalogowano pomyślnie!" });
      setLoginData({ email: "", password: "" });
    } catch (error: any) {
      setLoginStatus({
        type: "error",
        message: error.message || "Nieprawidłowa nazwa użytkownika lub hasło",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    setQuotes([]);
    setShowModal(false);
  };

  const openAddModal = () => {
    setEditingQuote(null);
    setAIQuote(false);
    setFormData({ cytat: "", autor: "", image_url: "", kategorie: ""});
    setFormStatus({ type: null, message: "" });
    setShowModal(true);
  };

  const openEditModal = (quote: Quote) => {
    setEditingQuote(quote);
    setAIQuote(false);
    setFormData({ cytat: quote.cytat, autor: quote.autor, image_url: "", kategorie: ""});
    setFormStatus({ type: null, message: "" });
    setShowModal(true);
  };

  const openAIModal = () => {
    setEditingQuote(null);
    setAIQuote(true);
    setFormData({ cytat: "", autor: "", image_url: "", kategorie: ""});
    setFormStatus({ type: null, message: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ cytat: "", autor: "", image_url: "", kategorie: ""});
    setFormStatus({ type: null, message: "" });
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten cytat?")) return;
    try {
      const response = await fetch(`https://cetuspro-quotify02-03.azurewebsites.net/api/Quote/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error("Błąd usuwania cytatu");
      fetchQuotes();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ type: null, message: "" });
    setFormLoading(true);

    if (!formData.cytat.trim() || (!formData.autor.trim() && !AIQuote)) {
      setFormStatus({
        type: "error",
        message: AIQuote ? "Temat zapytania jest wymagana" : "Treść cytatu i autor są wymagane",
      });
      setFormLoading(false);
      return;
    }

    const payload = AIQuote ? {
      AIprompt: formData.cytat,
      czasUtworzenia: new Date().toISOString()
    }
    : {
      ...formData,
      czasUtworzenia: new Date().toISOString()
    };

    try {
      const url = editingQuote
        ? `https://cetuspro-quotify02-03.azurewebsites.net/api/Quote/${editingQuote.id}`
        : ( AIQuote ? "https://cetuspro-quotify02-03.azurewebsites.net/api/Quote/generate-ai" : "https://cetuspro-quotify02-03.azurewebsites.net/api/Quote");
      const method = editingQuote ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleLogout();
        closeModal();
        return;
      }
      if (!response.ok) throw new Error(editingQuote ? "Błąd edycji cytatu" : "Błąd dodawania cytatu");
      let result = await response.json()

      setFormStatus({
        type: "success",
        message: editingQuote ? "Cytat zaktualizowany pomyślnie!" : `Cytat dodany pomyślnie! Id cytatu: ${result.id}`,
      });

      setTimeout(() => {
        closeModal();
        fetchQuotes();
      }, 1500);
    } catch (error: any) {
      setFormStatus({
        type: "error",
        message: error.message || "Nie udało się zapisać cytatu",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Formatowanie daty i godziny
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/images/photo.png')" }}>
      {/* Przycisk powrotu */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Strona główna
          </Button>
        </Link>
      </div>

      {/* Panel użytkownika (jeśli zalogowany) */}
      {user && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-white bg-black/30 px-3 py-1 rounded-full text-sm">
            {user.email || "Zalogowano"}
          </span>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center justify-start min-h-screen bg-black/20 p-4 pt-24">
        {!user ? (
          // Formularz logowania
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-emerald-700">Logowanie</CardTitle>
              <CardDescription>Wprowadź dane logowania, aby zarządzać cytatami</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Wpisz nazwę użytkownika"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Hasło</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Wpisz hasło"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                {loginStatus.type && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      loginStatus.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={loginStatus.type === "success" ? faCheck : faExclamationTriangle}
                      className="h-5 w-5"
                    />
                    {loginStatus.message}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                      Logowanie...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} className="mr-2 h-4 w-4" />
                      Zaloguj się
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-5xl bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-4xl text-emerald-700">Panel Administratora</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchQuotes}
                  disabled={quotesLoading}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  <FontAwesomeIcon icon={faSyncAlt} className={`mr-2 h-4 w-4 ${quotesLoading ? "animate-spin" : ""}`} />
                  Odśwież
                </Button>
                <Button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  Dodaj
                </Button>
                <Button
                  onClick={openAIModal}
                  className="bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-white"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2 h-4 w-4" />
                  Dodaj za pomocą AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quotesLoading && !quotes.length ? (
                <div className="flex justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-emerald-600" />
                </div>
              ) : quotesError ? (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-300 flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5" />
                  {quotesError}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] flex flex-col">
                  <div className="sticky top-0 bg-white border-b flex justify-center p-1 gap-2">
                    <Input id="input-quote-search" placeholder="Wyszukaj cytaty" type="text" className="max-w-[80%]" 
                    onChange={(e) => {
                      setSearchData({ ...searchData, text: e.target.value })
                    }}></Input>
                    <Button
                      onClick={filterQuotes}
                      className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white"
                    >
                      <FontAwesomeIcon icon={faSearch} className="mr-2 h-4 w-4" />
                      Wyszukaj
                    </Button>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-11 bg-white border-b">
                      <tr>
                        <th className="pb-2 pr-4">ID</th>
                        <th className="pb-2 pr-4">Cytat</th>
                        <th className="pb-2 pr-4">Autor</th>
                        <th className="pb-2 pr-4">Data dodania</th>
                        <th className="pb-2">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotesFiltered.map((quote) => (
                        <tr key={quote.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-4 align-top font-mono text-sm text-center align-middle"><b>{quote.id}</b></td>
                          <td className="py-3 pr-4 max-w-md break-words">{quote.cytat}</td>
                          <td className="py-3 pr-4">{quote.autor}</td>
                          <td className="py-3 pr-4 text-sm text-gray-600">{formatDateTime(quote.czasUtworzenia)}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(quote)}
                               className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 flex items-center justify-center rounded-full transition-colors text-center align-middle"
                                title="Edytuj"
                              >
                                <FontAwesomeIcon icon={faPencilAlt} className="h-4 w-4 b" />
                              </button>
                              <button
                                onClick={() => handleDelete(quote.id)}
                                className="bg-red-600 hover:bg-red-700 text-white w-9 h-9 flex items-center justify-center rounded-full transition-colorstext-center align-middle"
                                title="Usuń"
                              >
                                <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {quotes.length === 0 && !quotesLoading && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            Brak cytatów. Kliknij "Dodaj", aby dodać pierwszy.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center text-sm text-gray-500 border-t pt-4">
              Łącznie cytatów: {quotes.length}, Cytaty wyświetlane: {quotesFiltered.length}
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Modal dodawania/edycji 
      mate_ninja edit: AI handling*/}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800 transition-colors z-10"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-emerald-700 mb-4">
                {editingQuote ? "Edytuj cytat" : "Dodaj nowy cytat"}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="modal-content">
                    {AIQuote ? "Temat cytatu" : "Treść cytatu"} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="modal-content"
                    placeholder= {AIQuote ? "Wpisz temat zapytania..." : "Wpisz treść cytatu..."}
                    value={formData.cytat}
                    onChange={(e) => setFormData({ ...formData, cytat: e.target.value })}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                { !AIQuote && (
                  <div className="space-y-2">
                    <Label htmlFor="modal-author">
                      Autor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="modal-author"
                      placeholder="Wpisz autora cytatu..."
                      value={formData.autor}
                      onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                      required
                    />
                  </div>
                )}
                {formStatus.type && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-2 ${
                      formStatus.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={formStatus.type === "success" ? faCheck : faExclamationTriangle}
                      className="h-5 w-5"
                    />
                    {formStatus.message}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                        {AIQuote ? "Generowanie..." : "Zapisywanie..."}
                      </>
                    ) : editingQuote ? (
                      "Zapisz zmiany"
                    ) : (
                      "Dodaj cytat"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}