"use client";

import { MovieCard } from "./movie-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

interface ContentRowProps {
  title?: string;
  items: (TMDBMovie | TMDBTVShow)[];
  mediaType: "movie" | "tv";
  isLoading?: boolean;
}

export function ContentRow({ title, items, mediaType, isLoading }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px]">
            <div className="aspect-[2/3] bg-secondary/30 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="group/row">
      {title && (
        <div className="flex items-center justify-between px-1 mb-3">
          <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-8 w-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-ember/20 hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-8 w-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-ember/20 hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}

        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth py-5"
        >
          {items.map((item, index) => (
            <MovieCard
              key={`${mediaType}-${item.id}`}
              item={item}
              mediaType={mediaType}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Scroll arrows when no title */}
      {!title && (
        <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-ember/20 hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-ember/20 hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
