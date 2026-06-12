import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewType = "home" | "search" | "movie" | "tv" | "movies" | "tvshows" | "watchlist";

export interface BrowseOptions {
  initialTab?: string;
  initialGenreId?: number | null;
}

interface NavigationState {
  currentView: ViewType;
  selectedMovieId: number | null;
  selectedTVId: number | null;
  searchQuery: string;
  moviesBrowseOptions: BrowseOptions;
  tvshowsBrowseOptions: BrowseOptions;
  setView: (view: ViewType, options?: BrowseOptions) => void;
  selectMovie: (id: number) => void;
  selectTV: (id: number) => void;
  setSearch: (query: string) => void;
  goHome: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentView: "home",
  selectedMovieId: null,
  selectedTVId: null,
  searchQuery: "",
  moviesBrowseOptions: {},
  tvshowsBrowseOptions: {},
  setView: (view, options) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    set((state) => ({
      currentView: view,
      ...(view === "movies" && options ? { moviesBrowseOptions: options } : {}),
      ...(view === "tvshows" && options ? { tvshowsBrowseOptions: options } : {}),
    }));
  },
  selectMovie: (id) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    set({ currentView: "movie", selectedMovieId: id });
  },
  selectTV: (id) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    set({ currentView: "tv", selectedTVId: id });
  },
  setSearch: (query) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    set({ currentView: "search", searchQuery: query });
  },
  goHome: () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    set({ currentView: "home", selectedMovieId: null, selectedTVId: null, searchQuery: "" });
  },
}));

interface WatchlistItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  voteAverage: number;
  addedAt: number;
}

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: Omit<WatchlistItem, "addedAt">) => void;
  removeItem: (id: number, mediaType: "movie" | "tv") => void;
  isInWatchlist: (id: number, mediaType: "movie" | "tv") => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id && i.mediaType === item.mediaType);
        if (!exists) {
          set({ items: [...get().items, { ...item, addedAt: Date.now() }] });
        }
      },
      removeItem: (id, mediaType) => {
        set({ items: get().items.filter((i) => !(i.id === id && i.mediaType === mediaType)) });
      },
      isInWatchlist: (id, mediaType) => {
        return get().items.some((i) => i.id === id && i.mediaType === mediaType);
      },
    }),
    {
      name: "cinder-watchlist",
    }
  )
);

// ─── Watch Progress Tracking ────────────────────────────────────────
// Stores playback progress from Vidking player postMessage events.
// Key format: "movie-{id}" or "tv-{id}-{season}-{episode}"

export interface WatchProgressEntry {
  key: string;           // e.g. "movie-299534" or "tv-119051-1-8"
  id: number;            // TMDB ID
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  currentTime: number;   // seconds
  duration: number;      // seconds
  progress: number;      // percentage 0-100
  updatedAt: number;     // timestamp
}

interface WatchProgressState {
  entries: Record<string, WatchProgressEntry>;
  updateProgress: (entry: Omit<WatchProgressEntry, "updatedAt" | "key">) => void;
  getProgress: (id: number, mediaType: "movie" | "tv", season?: number, episode?: number) => WatchProgressEntry | undefined;
  getProgressForItem: (id: number, mediaType: "movie" | "tv") => WatchProgressEntry | undefined;
  removeProgress: (key: string) => void;
}

function buildProgressKey(id: number, mediaType: "movie" | "tv", season?: number, episode?: number): string {
  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `tv-${id}-${season}-${episode}`;
  }
  return `${mediaType}-${id}`;
}

export const useWatchProgressStore = create<WatchProgressState>()(
  persist(
    (set, get) => ({
      entries: {},
      updateProgress: (entry) => {
        const key = buildProgressKey(entry.id, entry.mediaType, entry.season, entry.episode);
        set((state) => ({
          entries: {
            ...state.entries,
            [key]: { ...entry, key, updatedAt: Date.now() },
          },
        }));
      },
      getProgress: (id, mediaType, season, episode) => {
        const key = buildProgressKey(id, mediaType, season, episode);
        return get().entries[key];
      },
      getProgressForItem: (id, mediaType) => {
        // Returns the most recent progress entry for any season/episode of a TV show,
        // or the movie progress
        const entries = Object.values(get().entries);
        const matching = entries.filter((e) => e.id === id && e.mediaType === mediaType);
        if (matching.length === 0) return undefined;
        // Return the most recently updated
        return matching.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      },
      removeProgress: (key) => {
        set((state) => {
          const newEntries = { ...state.entries };
          delete newEntries[key];
          return { entries: newEntries };
        });
      },
    }),
    {
      name: "cinder-watch-progress",
    }
  )
);
