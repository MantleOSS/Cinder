"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  TMDBMovieList,
  TMDBTVList,
  TMDBTrendingList,
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBSearchResult,
  TMDBGenreList,
  TMDBSeasonDetail,
} from "@/types/tmdb";

const API_BASE = "/api/tmdb";

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  // Sanitize params - strip control characters that could be used for injection
  const sanitizedParams: Record<string, string> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      sanitizedParams[key] = value.replace(/[\x00-\x1f\x7f]/g, "");
    }
  }
  const searchParams = new URLSearchParams({ path, ...sanitizedParams });
  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

const defaultQueryOptions = {
  retry: 1,
  retryDelay: 2000,
};

// Auto-refetch interval for homepage/browse data (5 minutes)
const HOME_REFETCH_INTERVAL = 5 * 60 * 1000;
// Auto-refetch interval for trending data (3 minutes - changes more often)
const TRENDING_REFETCH_INTERVAL = 3 * 60 * 1000;

// Trending - refetches every 3 min
export function useTrending(timeWindow: "day" | "week" = "week") {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["trending", timeWindow],
    queryFn: () => tmdbFetch<TMDBTrendingList>(`/trending/all/${timeWindow}`),
    refetchInterval: TRENDING_REFETCH_INTERVAL,
  });
}

// Popular Movies - refetches every 5 min
export function usePopularMovies(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["popular-movies", page],
    queryFn: () => tmdbFetch<TMDBMovieList>("/movie/popular", { page: String(page) }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// Top Rated Movies
export function useTopRatedMovies(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["top-rated-movies", page],
    queryFn: () => tmdbFetch<TMDBMovieList>("/movie/top_rated", { page: String(page) }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// Now Playing Movies - refetches every 3 min (changes frequently)
export function useNowPlayingMovies(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["now-playing-movies", page],
    queryFn: () => tmdbFetch<TMDBMovieList>("/movie/now_playing", { page: String(page) }),
    refetchInterval: TRENDING_REFETCH_INTERVAL,
  });
}

// Upcoming Movies - refetches every 5 min
export function useUpcomingMovies(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["upcoming-movies", page],
    queryFn: () => tmdbFetch<TMDBMovieList>("/movie/upcoming", { page: String(page) }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// Popular TV Shows
export function usePopularTV(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["popular-tv", page],
    queryFn: () => tmdbFetch<TMDBTVList>("/tv/popular", { page: String(page) }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// Top Rated TV Shows
export function useTopRatedTV(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["top-rated-tv", page],
    queryFn: () => tmdbFetch<TMDBTVList>("/tv/top_rated", { page: String(page) }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// TV Shows Airing Today - refetches every 3 min
export function useAiringTodayTV(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["airing-today-tv", page],
    queryFn: () => tmdbFetch<TMDBTVList>("/tv/airing_today", { page: String(page) }),
    refetchInterval: TRENDING_REFETCH_INTERVAL,
  });
}

// On The Air TV Shows
export function useOnTheAirTV(page: number = 1) {
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["on-the-air-tv", page],
    queryFn: () => tmdbFetch<TMDBTVList>("/tv/on_the_air", { page: String(page) }),
    refetchInterval: TRENDING_REFETCH_INTERVAL,
  });
}

// Movie Detail - no auto-refetch (user-initiated)
export function useMovieDetail(id: number | null) {
  return useQuery({
    queryKey: ["movie-detail", id],
    queryFn: () =>
      tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, {
        append_to_response: "credits,videos,similar,recommendations",
      }),
    enabled: id !== null,
  });
}

// TV Detail - no auto-refetch (user-initiated)
export function useTVDetail(id: number | null) {
  return useQuery({
    queryKey: ["tv-detail", id],
    queryFn: () =>
      tmdbFetch<TMDBTVDetail>(`/tv/${id}`, {
        append_to_response: "credits,videos,similar,recommendations",
      }),
    enabled: id !== null,
  });
}

// TV Season Detail
export function useSeasonDetail(tvId: number | null, seasonNumber: number | null) {
  return useQuery({
    queryKey: ["season-detail", tvId, seasonNumber],
    queryFn: () => tmdbFetch<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`),
    enabled: tvId !== null && seasonNumber !== null,
  });
}

// Search - no auto-refetch (user-initiated)
export function useSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => tmdbFetch<TMDBSearchResult>("/search/multi", { query, page: String(page) }),
    enabled: query.length > 0,
  });
}

// Genres - cached indefinitely (rarely changes, but refetch on window focus)
export function useMovieGenres() {
  return useQuery({
    queryKey: ["movie-genres"],
    queryFn: () => tmdbFetch<TMDBGenreList>("/genre/movie/list"),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - genres rarely change
  });
}

export function useTVGenres() {
  return useQuery({
    queryKey: ["tv-genres"],
    queryFn: () => tmdbFetch<TMDBGenreList>("/genre/tv/list"),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - genres rarely change
  });
}

// Discover movies with genre, sort, year filters
export function useDiscoverMovies(params: {
  genreId?: number | null;
  sortBy?: string;
  year?: number | null;
  page?: number;
}) {
  const { genreId, sortBy = "popularity.desc", year, page = 1 } = params;
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["discover-movies", genreId, sortBy, year, page],
    queryFn: () =>
      tmdbFetch<TMDBMovieList>("/discover/movie", {
        ...(genreId ? { with_genres: String(genreId) } : {}),
        sort_by: sortBy,
        ...(year ? { primary_release_year: String(year) } : {}),
        page: String(page),
        "vote_count.gte": "50",
      }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}

// Discover TV with genre, sort filters
export function useDiscoverTV(params: {
  genreId?: number | null;
  sortBy?: string;
  page?: number;
}) {
  const { genreId, sortBy = "popularity.desc", page = 1 } = params;
  return useQuery({
    ...defaultQueryOptions,
    queryKey: ["discover-tv", genreId, sortBy, page],
    queryFn: () =>
      tmdbFetch<TMDBTVList>("/discover/tv", {
        ...(genreId ? { with_genres: String(genreId) } : {}),
        sort_by: sortBy,
        page: String(page),
        "vote_count.gte": "50",
      }),
    refetchInterval: HOME_REFETCH_INTERVAL,
  });
}
