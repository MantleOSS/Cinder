"use client";

import { QueryProvider } from "@/providers/query-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeView } from "@/components/home-view";
import { MovieDetail } from "@/components/movie-detail";
import { TVDetail } from "@/components/tv-detail";
import { SearchView } from "@/components/search-view";
import { MoviesBrowseView } from "@/components/movies-browse-view";
import { TVShowsBrowseView } from "@/components/tvshows-browse-view";
import { WatchlistView } from "@/components/watchlist-view";
import { useNavigationStore } from "@/stores/navigation-store";
import { useURLSync } from "@/hooks/use-url-sync";
import { AnimatePresence } from "motion/react";

function AppContent() {
  const { currentView } = useNavigationStore();

  // Sync navigation state with URL search params
  useURLSync();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          {currentView === "home" && <HomeView key="home" />}
          {currentView === "movies" && <MoviesBrowseView key="movies" />}
          {currentView === "tvshows" && <TVShowsBrowseView key="tvshows" />}
          {currentView === "movie" && <MovieDetail key="movie" />}
          {currentView === "tv" && <TVDetail key="tv" />}
          {currentView === "search" && <SearchView key="search" />}
          {currentView === "watchlist" && <WatchlistView key="watchlist" />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}
