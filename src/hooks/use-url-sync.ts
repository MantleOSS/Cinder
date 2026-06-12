"use client";

import { useEffect, useRef } from "react";
import { useNavigationStore, type ViewType } from "@/stores/navigation-store";

/**
 * Syncs the Zustand navigation store with URL search params.
 * - On mount: reads URL params and initializes the store
 * - On store change: updates URL via pushState (avoids full page reload)
 * - On popstate (browser back/forward): updates store from URL
 */
export function useURLSync() {
  const store = useNavigationStore();
  const isInitialized = useRef(false);
  const isPopstateUpdate = useRef(false);

  // Read URL params on mount and set initial store state
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const view = params.get("view") as ViewType | null;
    const id = params.get("id");
    const q = params.get("q");

    if (!view) return; // Default home view is already set in store

    const validViews: ViewType[] = ["home", "search", "movie", "tv", "movies", "tvshows", "watchlist"];
    if (!validViews.includes(view)) return;

    // Use direct set to avoid triggering URL update during initialization
    if (view === "movie" && id) {
      store.selectMovie(parseInt(id, 10));
    } else if (view === "tv" && id) {
      store.selectTV(parseInt(id, 10));
    } else if (view === "search" && q) {
      store.setSearch(q);
    } else if (view !== "home") {
      store.setView(view);
    }
  }, [store]);

  // Listen to browser back/forward
  useEffect(() => {
    function handlePopstate() {
      isPopstateUpdate.current = true;
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view") as ViewType | null;
      const id = params.get("id");
      const q = params.get("q");

      const validViews: ViewType[] = ["home", "search", "movie", "tv", "movies", "tvshows", "watchlist"];
      const safeView = view && validViews.includes(view) ? view : "home";

      if (safeView === "movie" && id) {
        store.selectMovie(parseInt(id, 10));
      } else if (safeView === "tv" && id) {
        store.selectTV(parseInt(id, 10));
      } else if (safeView === "search" && q) {
        store.setSearch(q);
      } else {
        store.setView(safeView);
      }

      // Reset flag after a tick
      requestAnimationFrame(() => {
        isPopstateUpdate.current = false;
      });
    }

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [store]);

  // Update URL when store changes (but not during popstate)
  useEffect(() => {
    if (isPopstateUpdate.current) return;

    const { currentView, selectedMovieId, selectedTVId, searchQuery } = store;
    const params = new URLSearchParams();

    if (currentView === "home") {
      // Clean URL for home
      if (window.location.search !== "") {
        window.history.pushState({}, "", "/");
      }
      return;
    }

    params.set("view", currentView);

    if (currentView === "movie" && selectedMovieId) {
      params.set("id", String(selectedMovieId));
    } else if (currentView === "tv" && selectedTVId) {
      params.set("id", String(selectedTVId));
    } else if (currentView === "search" && searchQuery) {
      params.set("q", searchQuery);
    }

    const newUrl = `/?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      window.history.pushState({}, "", newUrl);
    }
  }, [store.currentView, store.selectedMovieId, store.selectedTVId, store.searchQuery]);
}
