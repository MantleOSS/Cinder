"use client";

import { useTrending } from "@/hooks/use-tmdb";
import { useNavigationStore } from "@/stores/navigation-store";
import { motion, useReducedMotion } from "motion/react";
import { Play, ChevronRight, Star, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TMDBMediaItem } from "@/types/tmdb";
import { useState, useEffect, useCallback } from "react";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

function getMediaTitle(item: TMDBMediaItem): string {
  return item.media_type === "movie" ? item.title : item.name;
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}

export function HeroBanner() {
  const { data, isLoading, error } = useTrending("week");
  const { selectMovie, selectTV } = useNavigationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const items = data?.results?.filter(
    (item) => item.backdrop_path && (item.media_type === "movie" || item.media_type === "tv")
  ) ?? [];

  const currentItem = items[currentIndex];

  // Auto-rotate with spring physics feel
  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : 180);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      goToSlide((currentIndex + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length, currentIndex, goToSlide]);

  const handlePlay = () => {
    if (!currentItem) return;
    if (currentItem.media_type === "movie") {
      selectMovie(currentItem.id);
    } else {
      selectTV(currentItem.id);
    }
  };

  const handleDetails = () => {
    if (!currentItem) return;
    if (currentItem.media_type === "movie") {
      selectMovie(currentItem.id);
    } else {
      selectTV(currentItem.id);
    }
  };

  const animOpts = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 30 };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-secondary/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 max-w-[1440px] mx-auto">
          <div className="max-w-xl space-y-4">
            <div className="h-4 w-28 bg-secondary/30 rounded-full animate-pulse" />
            <div className="h-14 w-80 bg-secondary/30 rounded animate-pulse" />
            <div className="h-4 w-64 bg-secondary/30 rounded-full animate-pulse" />
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-32 bg-secondary/30 rounded-xl animate-pulse" />
              <div className="h-12 w-32 bg-secondary/30 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / no data state - fallback
  if (error || !currentItem) {
    return (
      <div className="relative w-full min-h-[100dvh] overflow-hidden flex items-center">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ember/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ember/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-xl space-y-5"
          >
            {/* Eyebrow */}
            <span className="text-xs uppercase tracking-widest text-ember font-semibold">
              By Mantle
            </span>
            {/* Headline */}
            <h1 className="font-exbed text-5xl md:text-6xl lg:text-7xl tracking-wider leading-none text-foreground">
              CINDER
            </h1>
            {/* Subtext */}
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md">
              Stream movies and TV shows.
            </p>
            {/* CTA */}
            <Button
              size="lg"
              disabled
              className="bg-ember/50 text-ember-foreground/50 gap-2 rounded-xl"
            >
              Browse
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden flex items-center">
      {/* Background image - fills right/background */}
      <motion.div
        key={currentItem.id}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
        animate={{ opacity: isTransitioning ? 0 : 1, scale: isTransitioning ? 1.03 : 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMG_BASE}${currentItem.backdrop_path})` }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />

      {/* Content */}
      <motion.div
        key={`content-${currentItem.id}`}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 16 : 0 }}
        transition={{ ...animOpts, delay: prefersReducedMotion ? 0 : 0.05 }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto
          pb-28 sm:pb-8"
      >
        <div className="max-w-xl space-y-5">
          {/* 1. Eyebrow with media type + rating */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-ember font-semibold">
              Now Streaming
            </span>
            <Badge variant="secondary" className="bg-ember/20 text-ember border-ember/30 text-[10px] gap-1 px-2">
              {currentItem.media_type === "movie" ? (
                <><Film size={10} strokeWidth={2} /> Movie</>
              ) : (
                <><Tv size={10} strokeWidth={2} /> TV Show</>
              )}
            </Badge>
            <div className="flex items-center gap-1">
              <Star size={12} strokeWidth={1.5} fill="currentColor" className="text-ember" />
              <span className="text-xs font-semibold">{currentItem.vote_average.toFixed(1)}</span>
            </div>
          </div>

          {/* 2. Headline */}
          <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-none text-foreground">
            {getMediaTitle(currentItem)}
          </h1>

          {/* 3. Subtext */}
          {currentItem.overview && (
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-2 max-w-md leading-relaxed">
              {truncateWords(currentItem.overview, 20)}
            </p>
          )}

          {/* 4. CTAs */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handlePlay}
              size="lg"
              className="bg-ember hover:bg-ember/90 text-ember-foreground gap-2 rounded-xl active:scale-[0.97] transition-transform"
            >
              <Play size={20} strokeWidth={1.5} fill="currentColor" />
              Play
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border/50 bg-background/30 backdrop-blur-xl gap-2 rounded-xl active:scale-[0.97] transition-transform"
              onClick={handleDetails}
            >
              <ChevronRight size={20} strokeWidth={1.5} />
              Details
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Slide indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {items.slice(0, 6).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-150 cursor-pointer ${
                index === currentIndex
                  ? "w-8 bg-ember"
                  : "w-4 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
