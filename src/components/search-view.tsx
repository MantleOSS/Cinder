"use client";

import { useSearch } from "@/hooks/use-tmdb";
import { useNavigationStore } from "@/stores/navigation-store";
import { MovieCard } from "./movie-card";
import { motion, useReducedMotion } from "motion/react";
import { Search, Loader2, Film, Tv, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TMDBMovie, TMDBTVShow, TMDBMediaItem } from "@/types/tmdb";
import { useState, useCallback } from "react";

type SearchFilter = "all" | "movie" | "tv";

export function SearchView() {
  const { searchQuery, setSearch } = useNavigationStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { data, isLoading, error } = useSearch(searchQuery, page);
  const prefersReducedMotion = useReducedMotion();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearch(inputValue.trim());
      setPage(1);
    }
  };

  const handleFilterChange = useCallback((newFilter: SearchFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  const allResults = data?.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  ) ?? [];

  const filteredResults = filter === "all"
    ? allResults
    : allResults.filter((item) => item.media_type === filter);

  const totalPages = data?.total_pages ?? 1;

  const movieCount = allResults.filter((item) => item.media_type === "movie").length;
  const tvCount = allResults.filter((item) => item.media_type === "tv").length;

  const filterTabs: { key: SearchFilter; label: string; icon: typeof Film; count: number }[] = [
    { key: "all", label: "All", icon: Sparkles, count: allResults.length },
    { key: "movie", label: "Movies", icon: Film, count: movieCount },
    { key: "tv", label: "TV Shows", icon: Tv, count: tvCount },
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-8"
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <Search size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for movies and TV shows..."
            maxLength={200}
            className="h-14 pl-12 pr-28 text-lg bg-secondary/30 border-border/30 focus:border-ember/50 rounded-xl"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-ember hover:bg-ember/90 text-ember-foreground h-10 rounded-xl active:scale-[0.97] transition-transform"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Results */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} strokeWidth={1.5} className="text-ember animate-spin" />
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={48} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Unable to search</p>
          <p className="text-sm mt-1">Make sure the service is properly configured</p>
        </div>
      )}

      {data && allResults.length === 0 && (
        <div className="text-center py-20">
          <Search size={48} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}

      {allResults.length > 0 && (
        <div className="space-y-6">
          {/* Results header with filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {data?.total_results?.toLocaleString()} result{data?.total_results !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </p>
            <div className="flex gap-2">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.key;
                return (
                  <Button
                    key={tab.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(tab.key)}
                    className={
                      isActive
                        ? "bg-ember hover:bg-ember/90 text-ember-foreground gap-1.5 rounded-full active:scale-[0.97] transition-transform"
                        : "gap-1.5 rounded-full active:scale-[0.97] transition-transform"
                    }
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-[10px] ${isActive ? "text-ember-foreground/70" : "text-muted-foreground"}`}>
                        {tab.count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtered results grid */}
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 py-2">
              {filteredResults.map((item, index) => (
                <div key={`${item.media_type}-${item.id}`} className="w-full">
                  <MovieCard
                    item={
                      item.media_type === "movie"
                        ? (item as TMDBMovie & { media_type: "movie" })
                        : (item as TMDBTVShow & { media_type: "tv" })
                    }
                    mediaType={item.media_type as "movie" | "tv"}
                    index={index}
                    showMediaType
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {filter === "movie" ? "movies" : "TV shows"} found for this search</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-full active:scale-[0.97] transition-transform"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.min(totalPages, 500)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="rounded-full active:scale-[0.97] transition-transform"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
