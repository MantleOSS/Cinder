"use client";

import { useTVDetail, useSeasonDetail } from "@/hooks/use-tmdb";
import { useNavigationStore, useWatchlistStore, useWatchProgressStore } from "@/stores/navigation-store";
import { VideoPlayer } from "./video-player";
import { ContentRow } from "./content-row";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, Star, Clock, Calendar, Bookmark, Play, Globe, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";

const IMG_BASE = "https://image.tmdb.org/t/p/original";
const STILLS_BASE = "https://image.tmdb.org/t/p/w500";
const PROFILE_IMG_BASE = "https://image.tmdb.org/t/p/w185";

export function TVDetail() {
  const { selectedTVId, goHome } = useNavigationStore();
  const { data: show, isLoading } = useTVDetail(selectedTVId);
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const getProgress = useWatchProgressStore((s) => s.getProgress);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { data: seasonDetail } = useSeasonDetail(
    selectedTVId,
    selectedSeason
  );

  if (isLoading || !show) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-secondary/30 rounded" />
          <div className="h-[400px] bg-secondary/30 rounded-xl" />
        </div>
      </div>
    );
  }

  // Auto-select first season
  const currentSeason = selectedSeason ?? (show.seasons?.find((s) => s.season_number >= 1)?.season_number ?? 1);
  if (selectedSeason === null && show.seasons?.length > 0) {
    setSelectedSeason(currentSeason);
  }

  const inWatchlist = isInWatchlist(show.id, "tv");

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeItem(show.id, "tv");
    } else {
      addItem({
        id: show.id,
        mediaType: "tv",
        title: show.name,
        posterPath: show.poster_path,
        voteAverage: show.vote_average,
      });
    }
  };

  const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(episodeNum);
    setShowPlayer(true);
  };

  // Auto-advance to next episode when current one ends
  const handleEpisodeEnd = (_endedSeason: number, endedEpisode: number) => {
    const nextEp = endedEpisode + 1;
    const episodes = seasonDetail?.episodes;
    if (episodes) {
      const nextExists = episodes.some((e) => e.episode_number === nextEp);
      if (nextExists) {
        setSelectedEpisode(nextEp);
        // Don't close player, just update the episode — VideoPlayer will remount
      }
    }
  };

  const creator = show.created_by?.[0];
  const trailer = show.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  const filteredSeasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        {show.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${IMG_BASE}${show.backdrop_path})` }}
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
            {show.poster_path ? (
              <motion.img
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                src={`${IMG_BASE}${show.poster_path}`}
                alt={show.name}
                className="w-[240px] sm:w-[280px] rounded-xl shadow-2xl shadow-black/50"
              />
            ) : (
              <div className="w-[240px] sm:w-[280px] aspect-[2/3] bg-secondary/30 rounded-xl flex items-center justify-center">
                <Tv size={40} strokeWidth={1.5} className="text-muted-foreground" />
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
            <div>
              <h1 className="font-semibold tracking-tighter text-3xl sm:text-4xl lg:text-5xl leading-tight">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-ember italic text-sm mt-1">&quot;{show.tagline}&quot;</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {show.first_air_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} strokeWidth={1.5} />
                  {new Date(show.first_air_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Tv size={16} strokeWidth={1.5} />
                {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={1.5} />
                {show.number_of_episodes} Episodes
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={16} strokeWidth={1.5} fill="currentColor" className="text-ember" />
                <span className="font-semibold text-foreground">{show.vote_average.toFixed(1)}</span>
                <span>/ 10</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="bg-secondary/50 border border-border/30 text-xs"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => {
                  // Resume from last watched episode, or default to S01E01
                  const lastProgress = getProgress(show.id, "tv");
                  if (lastProgress && lastProgress.season && lastProgress.episode) {
                    handlePlayEpisode(lastProgress.season, lastProgress.episode);
                  } else {
                    handlePlayEpisode(currentSeason, 1);
                  }
                }}
                size="lg"
                className="bg-ember hover:bg-ember/90 text-ember-foreground gap-2 rounded-xl active:scale-[0.97] transition-transform"
              >
                <Play size={20} strokeWidth={1.5} fill="currentColor" />
                {(() => {
                  const lastProgress = getProgress(show.id, "tv");
                  if (lastProgress && lastProgress.season && lastProgress.episode && lastProgress.progress < 95) {
                    return `Resume S${String(lastProgress.season).padStart(2, "0")}E${String(lastProgress.episode).padStart(2, "0")}`;
                  }
                  return `Play S${String(currentSeason).padStart(2, "0")}E01`;
                })()}
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

            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Overview
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                {show.overview}
              </p>
            </div>

            {creator && (
              <div className="space-y-1">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Created By
                </h3>
                <p className="text-sm">{creator.name}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Video Player */}
        {showPlayer && selectedSeason !== null && selectedEpisode !== null && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <VideoPlayer
              type="tv"
              tmdbId={show.id}
              season={selectedSeason}
              episode={selectedEpisode}
              title={show.name}
              onClose={() => setShowPlayer(false)}
              onEpisodeEnd={handleEpisodeEnd}
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

        {/* Season & Episode selector */}
        <div className="space-y-4">
          <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
            Episodes
          </h2>

          {/* Season tabs */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filteredSeasons.map((season) => (
              <Button
                key={season.id}
                variant={currentSeason === season.season_number ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeason(season.season_number)}
                className={
                  currentSeason === season.season_number
                    ? "bg-ember hover:bg-ember/90 text-ember-foreground flex-shrink-0 rounded-full active:scale-[0.97] transition-transform"
                    : "flex-shrink-0 rounded-full active:scale-[0.97] transition-transform"
                }
              >
                Season {season.season_number}
              </Button>
            ))}
          </div>

          {/* Episode list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSeason}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="divide-y divide-border/20"
            >
              {seasonDetail?.episodes.map((episode) => (
                <motion.div
                  key={episode.id}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : episode.episode_number * 0.01 }}
                  className="flex items-start gap-4 p-3 hover:bg-secondary/30 transition-colors group cursor-pointer"
                  onClick={() => handlePlayEpisode(episode.season_number, episode.episode_number)}
                >
                  {/* Episode still */}
                  <div className="relative flex-shrink-0 w-[140px] sm:w-[180px] aspect-video rounded-xl overflow-hidden bg-secondary/30">
                    {episode.still_path ? (
                      <Image
                        src={`${STILLS_BASE}${episode.still_path}`}
                        alt={episode.name}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} strokeWidth={1.5} className="text-muted-foreground" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-ember/90 flex items-center justify-center border border-white/20">
                        <Play size={16} strokeWidth={1.5} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>
                    {/* Episode progress bar */}
                    {(() => {
                      const epProgress = getProgress(show.id, "tv", episode.season_number, episode.episode_number);
                      if (!epProgress || epProgress.progress <= 0) return null;
                      const isWatched = epProgress.progress >= 95;
                      return (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                          <div
                            className={`h-full transition-all ${isWatched ? "bg-ember" : "bg-ember/70"}`}
                            style={{ width: `${Math.min(epProgress.progress, 100)}%` }}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Episode info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ember font-semibold">
                        E{String(episode.episode_number).padStart(2, "0")}
                      </span>
                      <h4 className="text-sm font-medium line-clamp-1">
                        {episode.name}
                      </h4>
                    </div>
                    {episode.overview && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {episode.overview}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {episode.runtime && (
                        <span>{episode.runtime} min</span>
                      )}
                      {episode.air_date && (
                        <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {!seasonDetail && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Loading episodes...
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cast */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {show.credits.cast.slice(0, 20).map((person) => (
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
        {show.recommendations?.results && show.recommendations.results.length > 0 && (
          <ContentRow
            title="You Might Also Like"
            items={show.recommendations.results}
            mediaType="tv"
          />
        )}

        {/* Similar */}
        {show.similar?.results && show.similar.results.length > 0 && (
          <ContentRow
            title="Similar Shows"
            items={show.similar.results}
            mediaType="tv"
          />
        )}
      </div>
    </motion.div>
  );
}
