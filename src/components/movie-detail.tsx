"use client";

import { useMovieDetail } from "@/hooks/use-tmdb";
import { useNavigationStore, useWatchlistStore, useWatchProgressStore } from "@/stores/navigation-store";
import { VideoPlayer } from "./video-player";
import { ContentRow } from "./content-row";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Star, Clock, Calendar, Bookmark, Play, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const IMG_BASE = "https://image.tmdb.org/t/p/original";
const PROFILE_IMG_BASE = "https://image.tmdb.org/t/p/w185";

export function MovieDetail() {
  const { selectedMovieId, goHome } = useNavigationStore();
  const { data: movie, isLoading } = useMovieDetail(selectedMovieId);
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const getProgress = useWatchProgressStore((s) => s.getProgress);
  const [showPlayer, setShowPlayer] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-secondary/30 rounded" />
          <div className="h-[400px] bg-secondary/30 rounded-xl" />
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id, "movie");
  const watchProgress = movie ? getProgress(movie.id, "movie") : undefined;
  const hasProgress = watchProgress && watchProgress.progress > 0 && watchProgress.progress < 95;
  const resumeTime = hasProgress ? watchProgress.currentTime : 0;

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeItem(movie.id, "movie");
    } else {
      addItem({
        id: movie.id,
        mediaType: "movie",
        title: movie.title,
        posterPath: movie.poster_path,
        voteAverage: movie.vote_average,
      });
    }
  };

  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="min-h-screen"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        {movie.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})` }}
          />
        )}
        <div className="absolute inset-0 backdrop-blur-3xl bg-background/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={goHome}
          className="gap-2 text-muted-foreground hover:text-foreground active:scale-[0.97] transition-transform bg-background/40 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </Button>

        {/* Main info */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            {movie.poster_path ? (
              <motion.img
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                src={`${IMG_BASE}${movie.poster_path}`}
                alt={movie.title}
                className="w-[240px] sm:w-[280px] rounded-xl shadow-2xl shadow-black/50"
              />
            ) : (
              <div className="w-[240px] sm:w-[280px] aspect-[2/3] bg-secondary/30 rounded-xl flex items-center justify-center">
                <Play size={40} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: prefersReducedMotion ? 0 : 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 space-y-5"
          >
            {/* Title & tagline */}
            <div>
              <h1 className="font-semibold tracking-tighter text-3xl sm:text-4xl lg:text-5xl leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-ember italic text-sm mt-1">&quot;{movie.tagline}&quot;</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {movie.release_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} strokeWidth={1.5} />
                  {new Date(movie.release_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock size={16} strokeWidth={1.5} />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </div>
              )}
              {movie.original_language && (
                <div className="flex items-center gap-1.5">
                  <Globe size={16} strokeWidth={1.5} />
                  {movie.original_language.toUpperCase()}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Star size={16} strokeWidth={1.5} fill="currentColor" className="text-ember" />
                <span className="font-semibold text-foreground">{movie.vote_average.toFixed(1)}</span>
                <span>/ 10</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="bg-secondary/50 border border-border/30 text-xs"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setShowPlayer(true)}
                size="lg"
                className="bg-ember hover:bg-ember/90 text-ember-foreground gap-2 rounded-xl active:scale-[0.97] transition-transform"
              >
                <Play size={20} strokeWidth={1.5} fill="currentColor" />
                {hasProgress ? `Resume from ${Math.floor(resumeTime / 60)}m ${Math.floor(resumeTime % 60)}s` : "Play Now"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWatchlist}
                className={`gap-2 rounded-xl active:scale-[0.97] transition-transform ${
                  inWatchlist
                    ? "border-ember/50 bg-ember/10 text-ember"
                    : "border-border/50"
                }`}
              >
                <Bookmark
                  size={20}
                  strokeWidth={1.5}
                  fill={inWatchlist ? "currentColor" : "none"}
                />
                {inWatchlist ? "In Watchlist" : "Watchlist"}
              </Button>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Overview
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                {movie.overview}
              </p>
            </div>

            {/* Director */}
            {director && (
              <div className="space-y-1">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Director
                </h3>
                <p className="text-sm">{director.name}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Video Player */}
        {showPlayer && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <VideoPlayer
              type="movie"
              tmdbId={movie.id}
              title={movie.title}
              onClose={() => setShowPlayer(false)}
            />
          </motion.div>
        )}

        {/* Trailer */}
        {trailer && !showPlayer && (
          <div className="space-y-3">
            <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
              Trailer
            </h2>
            <div className="relative aspect-video rounded-xl overflow-hidden max-w-4xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        )}

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {movie.credits.cast.slice(0, 20).map((person) => (
                <div
                  key={person.id}
                  className="flex-shrink-0 w-[100px] text-center space-y-2"
                >
                  <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden bg-secondary/30 mx-auto">
                    {person.profile_path ? (
                      <img
                        src={`${PROFILE_IMG_BASE}${person.profile_path}`}
                        alt={person.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium line-clamp-1">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
          <ContentRow
            title="You Might Also Like"
            items={movie.recommendations.results}
            mediaType="movie"
          />
        )}

        {/* Similar */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <ContentRow
            title="Similar Movies"
            items={movie.similar.results}
            mediaType="movie"
          />
        )}
      </div>
    </motion.div>
  );
}
