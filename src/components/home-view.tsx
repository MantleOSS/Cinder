"use client";

import { useTrending, usePopularMovies, useNowPlayingMovies, useTopRatedMovies, usePopularTV, useTopRatedTV, useUpcomingMovies, useDiscoverMovies, useDiscoverTV, useMovieGenres, useTVGenres } from "@/hooks/use-tmdb";
import { HeroBanner } from "./hero-banner";
import { ContentRow } from "./content-row";
import { useNavigationStore, useWatchlistStore, useWatchProgressStore } from "@/stores/navigation-store";
import { MovieCard } from "./movie-card";
import { motion, useReducedMotion } from "motion/react";
import { Bookmark, Key, ChevronRight, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

function ApiKeyPrompt() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center justify-center px-4"
    >
      <Card className="max-w-lg w-full bg-secondary/20 border-ember/20 border">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-ember/10 border border-ember/20 flex items-center justify-center">
            <Key size={32} strokeWidth={1.5} className="text-ember" />
          </div>
          <h3 className="font-semibold tracking-tighter text-xl sm:text-2xl">
            Set Up Your TMDB API Key
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To start streaming, Cinder needs a TMDB API key. Get yours free in under a minute:
          </p>
          <ol className="text-sm text-muted-foreground text-left space-y-2 max-w-xs mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-ember font-bold">1.</span>
              <span>Visit <code className="text-ember/80 bg-secondary/50 px-1.5 py-0.5 rounded text-xs">themoviedb.org/settings/api</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ember font-bold">2.</span>
              <span>Create a free account and request an API key</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ember font-bold">3.</span>
              <span>Add it to your environment configuration as <code className="text-ember/80 bg-secondary/50 px-1.5 py-0.5 rounded text-xs">TMDB_API_KEY</code></span>
            </li>
          </ol>
          <Button
            variant="outline"
            className="border-ember/30 hover:bg-ember/10 gap-2 rounded-xl active:scale-[0.97] transition-transform"
            onClick={() => window.open("https://www.themoviedb.org/settings/api", "_blank")}
          >
            Get API Key
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
        {title}
      </h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
        >
          See All
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

// Dynamically renders movie genre rows using the TMDB genre API
function MovieGenreRows() {
  const { data: genresData } = useMovieGenres();
  const { setView } = useNavigationStore();
  const genres = genresData?.genres ?? [];
  // Show the first 5 genres from the API
  const displayGenres = genres.slice(0, 5);

  if (displayGenres.length === 0) return null;

  return (
    <>
      {displayGenres.map((genre) => (
        <MovieGenreRow key={`movie-${genre.id}`} genreId={genre.id} genreName={genre.name} onSeeAll={() => setView("movies", { initialGenreId: genre.id })} />
      ))}
    </>
  );
}

function MovieGenreRow({ genreId, genreName, onSeeAll }: { genreId: number; genreName: string; onSeeAll: () => void }) {
  const query = useDiscoverMovies({ genreId });
  return (
    <div className="space-y-3">
      <SectionHeader title={`${genreName} Movies`} onSeeAll={onSeeAll} />
      <ContentRow
        items={query.data?.results ?? []}
        mediaType="movie"
        isLoading={query.isLoading}
      />
    </div>
  );
}

// Dynamically renders TV genre rows using the TMDB genre API
function TVGenreRows() {
  const { data: genresData } = useTVGenres();
  const { setView } = useNavigationStore();
  const genres = genresData?.genres ?? [];
  // Show the first 3 genres from the API
  const displayGenres = genres.slice(0, 3);

  if (displayGenres.length === 0) return null;

  return (
    <>
      {displayGenres.map((genre) => (
        <TVGenreRow key={`tv-${genre.id}`} genreId={genre.id} genreName={genre.name} onSeeAll={() => setView("tvshows", { initialGenreId: genre.id })} />
      ))}
    </>
  );
}

function TVGenreRow({ genreId, genreName, onSeeAll }: { genreId: number; genreName: string; onSeeAll: () => void }) {
  const query = useDiscoverTV({ genreId });
  return (
    <div className="space-y-3">
      <SectionHeader title={`${genreName} TV`} onSeeAll={onSeeAll} />
      <ContentRow
        items={query.data?.results ?? []}
        mediaType="tv"
        isLoading={query.isLoading}
      />
    </div>
  );
}

export function HomeView() {
  const trending = useTrending("week");
  const popularMovies = usePopularMovies();
  const nowPlaying = useNowPlayingMovies();
  const topRatedMovies = useTopRatedMovies();
  const upcoming = useUpcomingMovies();
  const popularTV = usePopularTV();
  const topRatedTV = useTopRatedTV();

  const { items } = useWatchlistStore();
  const progressEntries = useWatchProgressStore((s) => s.entries);
  const { setView } = useNavigationStore();
  const prefersReducedMotion = useReducedMotion();

  const hasApiError = (trending.error && !trending.data) || (popularMovies.error && !popularMovies.data);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Hero */}
      <HeroBanner />

      {/* Content rows */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto -mt-16 sm:-mt-20 relative z-10 space-y-10 pb-12">
        {/* API Key prompt */}
        {hasApiError && <ApiKeyPrompt />}

        {/* Continue Watching */}
        {Object.values(progressEntries).filter((e) => e.progress > 0 && e.progress < 95).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <PlayCircle size={20} strokeWidth={1.5} className="text-ember" />
              <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
                Continue Watching
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 py-5">
              {Object.values(progressEntries)
                .filter((e) => e.progress > 0 && e.progress < 95)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 10)
                .map((entry, index) => (
                  <MovieCard
                    key={entry.key}
                    item={{
                      id: entry.id,
                      title: entry.mediaType === "movie" ? "" : undefined,
                      name: entry.mediaType === "tv" ? "" : undefined,
                      poster_path: null,
                      backdrop_path: null,
                      vote_average: 0,
                      vote_count: 0,
                      release_date: entry.mediaType === "movie" ? "" : undefined,
                      first_air_date: entry.mediaType === "tv" ? "" : undefined,
                      overview: "",
                      genre_ids: [],
                      adult: false,
                      original_language: "",
                      origin_country: [],
                      popularity: 0,
                    } as TMDBMovie & TMDBTVShow}
                    mediaType={entry.mediaType}
                    index={index}
                    showMediaType
                  />
                ))}
            </div>
          </div>
        )}

        {/* Watchlist */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Bookmark size={20} strokeWidth={1.5} fill="currentColor" className="text-ember" />
              <h2 className="font-semibold tracking-tighter text-xl sm:text-2xl">
                My Watchlist
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 py-5">
              {items.map((item, index) => (
                <MovieCard
                  key={`${item.mediaType}-${item.id}`}
                  item={
                    {
                      id: item.id,
                      title: item.mediaType === "movie" ? item.title : undefined,
                      name: item.mediaType === "tv" ? item.title : undefined,
                      poster_path: item.posterPath,
                      backdrop_path: null,
                      vote_average: item.voteAverage,
                      vote_count: 0,
                      release_date: item.mediaType === "movie" ? "" : undefined,
                      first_air_date: item.mediaType === "tv" ? "" : undefined,
                      overview: "",
                      genre_ids: [],
                      adult: false,
                      original_language: "",
                      origin_country: [],
                      popularity: 0,
                    } as TMDBMovie & TMDBTVShow
                  }
                  mediaType={item.mediaType}
                  index={index}
                  showMediaType
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard TMDB category rows - always fresh from the API */}
        <div className="space-y-3">
          <SectionHeader title="Now Playing" onSeeAll={() => setView("movies", { initialTab: "now_playing" })} />
          <ContentRow
            items={nowPlaying.data?.results ?? []}
            mediaType="movie"
            isLoading={nowPlaying.isLoading}
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Trending This Week" onSeeAll={() => setView("movies", { initialTab: "popular" })} />
          <ContentRow
            items={
              trending.data?.results
                ?.filter((item) => item.media_type === "movie")
                .map((item) => ({
                  ...item,
                  title: item.title ?? "",
                })) as TMDBMovie[] ?? []
            }
            mediaType="movie"
            isLoading={trending.isLoading}
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Popular TV Shows" onSeeAll={() => setView("tvshows", { initialTab: "popular" })} />
          <ContentRow
            items={popularTV.data?.results ?? []}
            mediaType="tv"
            isLoading={popularTV.isLoading}
          />
        </div>

        {/* Dynamic movie genre rows - genres fetched from TMDB API */}
        <MovieGenreRows />

        <div className="space-y-3">
          <SectionHeader title="Top Rated Movies" onSeeAll={() => setView("movies", { initialTab: "top_rated" })} />
          <ContentRow
            items={topRatedMovies.data?.results ?? []}
            mediaType="movie"
            isLoading={topRatedMovies.isLoading}
          />
        </div>

        {/* Dynamic TV genre rows - genres fetched from TMDB API */}
        <TVGenreRows />

        <div className="space-y-3">
          <SectionHeader title="Top Rated TV Shows" onSeeAll={() => setView("tvshows", { initialTab: "top_rated" })} />
          <ContentRow
            items={topRatedTV.data?.results ?? []}
            mediaType="tv"
            isLoading={topRatedTV.isLoading}
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Upcoming Movies" onSeeAll={() => setView("movies", { initialTab: "upcoming" })} />
          <ContentRow
            items={upcoming.data?.results ?? []}
            mediaType="movie"
            isLoading={upcoming.isLoading}
          />
        </div>

        {/* Trending TV */}
        <div className="space-y-3">
          <SectionHeader title="Trending TV Shows" onSeeAll={() => setView("tvshows", { initialTab: "popular" })} />
          <ContentRow
            items={
              trending.data?.results
                ?.filter((item) => item.media_type === "tv")
                .map((item) => ({
                  ...item,
                  name: item.name ?? "",
                })) as TMDBTVShow[] ?? []
            }
            mediaType="tv"
            isLoading={trending.isLoading}
          />
        </div>
      </div>
    </motion.div>
  );
}
