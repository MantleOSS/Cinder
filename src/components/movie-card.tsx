"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Star, Play, Film, Tv, Check } from "lucide-react";
import { useNavigationStore, useWatchProgressStore } from "@/stores/navigation-store";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";

interface MovieCardProps {
  item: TMDBMovie | TMDBTVShow;
  mediaType: "movie" | "tv";
  index?: number;
  showMediaType?: boolean;
}

function isMovie(item: TMDBMovie | TMDBTVShow): item is TMDBMovie {
  return "title" in item;
}

export function MovieCard({ item, mediaType, index = 0, showMediaType = false }: MovieCardProps) {
  const { selectMovie, selectTV } = useNavigationStore();
  const getProgressForItem = useWatchProgressStore((s) => s.getProgressForItem);
  const prefersReducedMotion = useReducedMotion();
  const title = isMovie(item) ? item.title : item.name;
  const date = isMovie(item) ? item.release_date : item.first_air_date;

  // Get watch progress for this item
  const watchProgress = getProgressForItem(item.id, mediaType);
  const hasProgress = watchProgress && watchProgress.progress > 0 && watchProgress.progress < 95;
  const isWatched = watchProgress && watchProgress.progress >= 95;
  const progressPercent = watchProgress ? Math.min(watchProgress.progress, 100) : 0;

  const handleClick = () => {
    if (mediaType === "movie") {
      selectMovie(item.id);
    } else {
      selectTV(item.id);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -6, transition: { type: "spring", stiffness: 500, damping: 25 } }}
      onClick={handleClick}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer active:scale-[0.98] transition-transform hover:z-20"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary/30">
        {item.poster_path ? (
          <Image
            src={`${IMG_BASE}${item.poster_path}`}
            alt={title}
            fill
            sizes="(max-width: 640px) 160px, 180px"
            className="object-cover transition-all duration-150 group-hover:brightness-75"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            {mediaType === "movie" ? (
              <Film size={28} strokeWidth={1.5} className="text-muted-foreground" />
            ) : (
              <Tv size={28} strokeWidth={1.5} className="text-muted-foreground" />
            )}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150">
          <div className="h-12 w-12 rounded-full bg-ember/90 flex items-center justify-center border-2 border-white/20 scale-50 group-hover:scale-100 transition-transform duration-150">
            <Play size={20} strokeWidth={1.5} fill="white" className="text-white ml-0.5" />
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-xl rounded-full px-2 py-0.5">
          <Star size={12} strokeWidth={1.5} fill="currentColor" className="text-ember" />
          <span className="text-[11px] font-semibold">{item.vote_average.toFixed(1)}</span>
        </div>

        {/* Media type badge */}
        {showMediaType && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-ember/90 rounded-full px-2 py-0.5">
            {mediaType === "movie" ? (
              <Film size={10} strokeWidth={2} className="text-ember-foreground" />
            ) : (
              <Tv size={10} strokeWidth={2} className="text-ember-foreground" />
            )}
            <span className="text-[10px] font-bold text-ember-foreground uppercase">
              {mediaType === "movie" ? "Movie" : "TV"}
            </span>
          </div>
        )}

        {/* Watched badge */}
        {isWatched && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-ember rounded-full px-2 py-0.5">
            <Check size={10} strokeWidth={2.5} className="text-ember-foreground" />
            <span className="text-[10px] font-bold text-ember-foreground uppercase">Watched</span>
          </div>
        )}

        {/* Bottom gradient for title on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <p className="text-xs text-white/80 line-clamp-2">{item.overview || ""}</p>
        </div>

        {/* Watch progress bar */}
        {(hasProgress || isWatched) && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
            <div
              className={`h-full transition-all ${isWatched ? "bg-ember" : "bg-ember/80"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-ember transition-colors duration-150">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {date ? new Date(date).getFullYear() : "N/A"}
          </p>
          {hasProgress && (
            <span className="text-[10px] text-ember font-medium">
              {Math.floor(progressPercent)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
