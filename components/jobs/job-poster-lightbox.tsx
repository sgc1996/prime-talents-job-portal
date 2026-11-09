"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { useState } from "react";
import { Maximize2, X, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobPosterLightboxProps {
  posterUrl: string;
  jobTitle: string;
}

export function JobPosterLightbox({ posterUrl, jobTitle }: JobPosterLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Inline Preview Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Official Vacancy Flyer / Advertisement</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs h-7 px-2.5 flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand Full Screen</span>
          </Button>
        </div>

        <div
          onClick={() => setIsOpen(true)}
          className="relative rounded-xl overflow-hidden cursor-pointer group bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[500px]"
        >
          <img
            src={posterUrl}
            alt={`Advertisement Flyer for ${jobTitle}`}
            className="w-full h-auto max-h-[500px] object-contain rounded-xl group-hover:scale-[1.01] transition duration-200"
          />

          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-2xs">
            <span className="px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4" />
              Click to view full image
            </span>
          </div>
        </div>
      </div>

      {/* Full Screen Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-sm font-semibold truncate max-w-lg">
                {jobTitle} - Official Flyer
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={posterUrl}
                  download="worklanka-job-advertisement"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Flyer</span>
                </a>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Large Image View */}
            <div className="w-full flex-1 overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-white/10">
              <img
                src={posterUrl}
                alt={jobTitle}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
