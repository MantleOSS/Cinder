"use client";

import { useDiscoverMovies, usePopularMovies, useTopRatedMovies, useNowPlayingMovies, useUpcomingMovies, useMovieGenres } from "@/hooks/use-tmdb";
import { MovieCard } from "./movie-card";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useNavigationStore } from "@/stores/navigation-store";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "revenue.desc", label: "Top Box Office" },
];

const TABS = [
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "now_playing", label: "Now Playing" },
  { key: "upcoming", label: "Upcoming" },
] as const;

type TabKey = typeof TABS[number]["key"];

function PageNumbers({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const maxVisible = 5;
  const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  const adjustedStart = Math.max(1, end - maxVisible + 1);

  const pages: number[] = [];
  for (let i = adjustedStart; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1">
      {adjustedStart > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="h-8 w-8 rounded-full text-xs text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">1</button>
          {adjustedStart > 2 && <span className="text-xs text-muted-foreground px-1">…</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            page === currentPage
              ? "bg-ember text-ember-foreground"
              : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-xs text-muted-foreground px-1">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="h-8 w-8 rounded-full text-xs text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">{totalPages}</button>
        </>
      )}
    </div>
  );
}

export function MoviesBrowseView() {
  const { moviesBrowseOptions } = useNavigationStore();
  const [selectedGenre, setSelectedGenre] = useState<number | null>(moviesBrowseOptions.initialGenreId ?? null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [activeTab, setActiveTab] = useState<TabKey>(
    (moviesBrowseOptions.initialTab as TabKey) ?? "popular"
  );
  const [page, setPage] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const { data: genres } = useMovieGenres();

  // Use discover when a genre or custom sort is selected, otherwise use category tabs
  const isDiscoverMode = selectedGenre !== null;

  const discoverQuery = useDiscoverMovies({
    genreId: selectedGenre,
    sortBy,
    page,
  });

  const popularQuery = usePopularMovies(page);
  const topRatedQuery = useTopRatedMovies(page);
  const nowPlayingQuery = useNowPlayingMovies(page);
  const upcomingQuery = useUpcomingMovies(page);

  const activeQuery = isDiscoverMode
    ? discoverQuery
    : activeTab === "popular"
      ? popularQuery
      : activeTab === "top_rated"
        ? topRatedQuery
        : activeTab === "now_playing"
          ? nowPlayingQuery
          : upcomingQuery;

  const movies = activeQuery.data?.results ?? [];
  const totalPages = Math.min(activeQuery.data?.total_pages ?? 1, 500);
  const totalResults = activeQuery.data?.total_results ?? 0;

  const handleGenreClick = useCallback((genreId: number | null) => {
    setSelectedGenre(genreId);
    setPage(1);
  }, []);

  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSelectedGenre(null);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setPage(1);
  }, []);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="pt-20 pb-12"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-exbed text-3xl sm:text-4xl tracking-wider">Movies</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalResults > 0 ? `${totalResults.toLocaleString()} movies` : "Browse movies"}
            </p>
          </div>
          {/* Sort dropdown */}
          <div className="hidden sm:flex items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={1.5} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-ember/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key && !isDiscoverMode ? "default" : "outline"}
              size="sm"
              onClick={() => handleTabClick(tab.key)}
              className={
                activeTab === tab.key && !isDiscoverMode
                  ? "bg-ember hover:bg-ember/90 text-ember-foreground flex-shrink-0 rounded-full active:scale-[0.97] transition-transform"
                  : "flex-shrink-0 rounded-full active:scale-[0.97] transition-transform"
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Genre pills */}
        {genres?.genres && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <Button
              variant={selectedGenre === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleGenreClick(null)}
              className="flex-shrink-0 rounded-full text-xs active:scale-[0.97] transition-transform"
            >
              All
            </Button>
            {genres.genres.map((genre) => (
              <Button
                key={genre.id}
                variant={selectedGenre === genre.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleGenreClick(genre.id)}
                className="flex-shrink-0 rounded-full text-xs active:scale-[0.97] transition-transform"
              >
                {genre.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Movie grid */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto mt-6">
        {activeQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} strokeWidth={1.5} className="text-ember animate-spin" />
            <p className="text-sm text-muted-foreground">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium text-muted-foreground">No movies found</p>
            <p className="text-sm text-muted-foreground mt-1">Try different filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 py-2">
              {movies.map((movie, index) => (
                <MovieCard
                  key={`movie-${movie.id}`}
                  item={movie}
                  mediaType="movie"
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-full gap-1 active:scale-[0.97] transition-transform"
                >
                  <ChevronLeft size={14} strokeWidth={1.5} />
                  Prev
                </Button>
                <PageNumbers currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-full gap-1 active:scale-[0.97] transition-transform"
                >
                  Next
                  <ChevronRight size={14} strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
