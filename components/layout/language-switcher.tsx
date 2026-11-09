"use client";

import * as React from "react";
import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "si", label: "සිංහල", flag: "🇱🇰" },
  { code: "ta", label: "தமிழ்", flag: "🇱🇰" },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (code: string, label: string) => {
    setCurrentLang(code);
    setIsOpen(false);
    toast.success(`Language set to ${label}`);
  };

  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]!;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span>{selected.label}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 py-1 text-xs">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code, lang.label)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                  currentLang === lang.code ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {currentLang === lang.code && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
