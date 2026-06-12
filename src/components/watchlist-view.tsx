"use client";

import { useNavigationStore, useWatchlistStore } from "@/stores/navigation-store";
import { MovieCard } from "./movie-card";
import { motion, useReducedMotion } from "motion/react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

export function WatchlistView() {
  const { items, removeItem } = useWatchlistStore();
  const { selectMovie, selectTV } = useNavigationStore();
  const prefersReducedMotion = useReducedMotion();

  const movieItems = items.filter((item) => item.mediaType === "movie");
  const tvItems = items.filter((item) => item.mediaType === "tv");

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bookmark size={28} strokeWidth={1.5} fill="currentColor" className="text-ember" />
        <div>
          <h1 className="font-exbed text-3xl sm:text-4xl tracking-wider">My Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <Card className="max-w-lg mx-auto bg-secondary/20 border-border/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary/50 border border-border/30 flex items-center justify-center">
              <Bookmark size={32} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold tracking-tighter text-xl">
              Your watchlist is empty
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start adding movies and TV shows to your watchlist by clicking the bookmark icon on any title.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Movies section */}
      {movieItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
            Movies ({movieItems.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 py-2">
            {movieItems.map((item, index) => (
              <div key={`movie-${item.id}`} className="relative group/card">
                <MovieCard
                  item={
                    {
                      id: item.id,
                      title: item.title,
                      poster_path: item.posterPath,
                      backdrop_path: null,
                      vote_average: item.voteAverage,
                      vote_count: 0,
                      release_date: "",
                      overview: "",
                      genre_ids: [],
                      adult: false,
                      original_language: "",
                      popularity: 0,
                    } as TMDBMovie
                  }
                  mediaType="movie"
                  index={index}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id, "movie");
                  }}
                  className="absolute top-2 left-2 h-7 w-7 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-pointer z-20"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TV Shows section */}
      {tvItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
            TV Shows ({tvItems.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 py-2">
            {tvItems.map((item, index) => (
              <div key={`tv-${item.id}`} className="relative group/card">
                <MovieCard
                  item={
                    {
                      id: item.id,
                      name: item.title,
                      poster_path: item.posterPath,
                      backdrop_path: null,
                      vote_average: item.voteAverage,
                      vote_count: 0,
                      first_air_date: "",
                      overview: "",
                      genre_ids: [],
                      origin_country: [],
                      original_language: "",
                      popularity: 0,
                    } as TMDBTVShow
                  }
                  mediaType="tv"
                  index={index}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id, "tv");
                  }}
                  className="absolute top-2 left-2 h-7 w-7 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-pointer z-20"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
