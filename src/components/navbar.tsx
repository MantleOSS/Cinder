"use client";

import { useNavigationStore, useWatchlistStore } from "@/stores/navigation-store";
import { Search, X, Film, Tv, Bookmark, Menu, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { currentView, goHome, setView, setSearch } = useNavigationStore();
  const { items } = useWatchlistStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearch(searchInput.trim());
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchInput("");
  };

  const isActive = (view: string) => {
    if (view === "home") return currentView === "home";
    if (view === "movies") return currentView === "movies" || currentView === "movie";
    if (view === "tvshows") return currentView === "tvshows" || currentView === "tv";
    if (view === "watchlist") return currentView === "watchlist";
    return false;
  };

  return (
    <>
      <motion.header
        initial={prefersReducedMotion ? { opacity: 1 } : { y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50"
      >
        <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={goHome}
            className="cursor-pointer flex-shrink-0 flex items-baseline gap-1.5 active:scale-[0.97] transition-transform group"
          >
            <span className="font-exbed tracking-wider text-xl text-foreground group-hover:text-ember transition-colors duration-200">
              CINDER
            </span>
            <span className="text-[10px] font-light tracking-wide text-muted-foreground/60 group-hover:text-muted-foreground transition-colors duration-200">
              by Mantle
            </span>
          </button>

          {/* Navigation - desktop only */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={isActive("home") ? "secondary" : "ghost"}
              size="sm"
              onClick={goHome}
              className="text-sm gap-1.5 active:scale-[0.97] transition-transform"
            >
              <Home size={16} strokeWidth={1.5} />
              Home
            </Button>
            <Button
              variant={isActive("movies") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("movies")}
              className="text-sm gap-1.5 active:scale-[0.97] transition-transform"
            >
              <Film size={16} strokeWidth={1.5} />
              Movies
            </Button>
            <Button
              variant={isActive("tvshows") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("tvshows")}
              className="text-sm gap-1.5 active:scale-[0.97] transition-transform"
            >
              <Tv size={16} strokeWidth={1.5} />
              TV Shows
            </Button>
            <Button
              variant={isActive("watchlist") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("watchlist")}
              className="text-sm gap-1.5 active:scale-[0.97] transition-transform relative"
            >
              <Bookmark size={16} strokeWidth={1.5} />
              Watchlist
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 min-w-4 px-1 bg-ember text-ember-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Button>
          </div>

          {/* Search + Mobile menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1 } : { width: 0, opacity: 0 }}
                  animate={{ width: "min(280px, calc(100vw - 10rem))", opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSearch}>
                    <Input
                      ref={inputRef}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search movies & shows..."
                      className="h-9 bg-secondary/50 border-border/50 focus:border-ember/50 text-sm w-full"
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {searchOpen ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClose}
                className="h-9 w-9 flex-shrink-0 active:scale-[0.97] transition-transform"
              >
                <X size={16} strokeWidth={1.5} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-9 w-9 flex-shrink-0 active:scale-[0.97] transition-transform"
              >
                <Search size={16} strokeWidth={1.5} />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 flex-shrink-0 md:hidden active:scale-[0.97] transition-transform"
            >
              {mobileMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </Button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                <Button
                  variant={isActive("home") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => { goHome(); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-sm gap-2"
                >
                  <Home size={16} strokeWidth={1.5} />
                  Home
                </Button>
                <Button
                  variant={isActive("movies") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => { setView("movies"); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-sm gap-2"
                >
                  <Film size={16} strokeWidth={1.5} />
                  Movies
                </Button>
                <Button
                  variant={isActive("tvshows") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => { setView("tvshows"); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-sm gap-2"
                >
                  <Tv size={16} strokeWidth={1.5} />
                  TV Shows
                </Button>
                <Button
                  variant={isActive("watchlist") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => { setView("watchlist"); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-sm gap-2 relative"
                >
                  <Bookmark size={16} strokeWidth={1.5} />
                  Watchlist
                  {items.length > 0 && (
                    <span className="ml-auto h-5 min-w-5 px-1.5 bg-ember text-ember-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl bg-background/80 border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={goHome}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer transition-colors ${
              isActive("home") ? "text-ember" : "text-muted-foreground"
            }`}
          >
            <Home size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => setView("movies")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer transition-colors ${
              isActive("movies") ? "text-ember" : "text-muted-foreground"
            }`}
          >
            <Film size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Movies</span>
          </button>
          <button
            onClick={() => setView("tvshows")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer transition-colors ${
              isActive("tvshows") ? "text-ember" : "text-muted-foreground"
            }`}
          >
            <Tv size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">TV</span>
          </button>
          <button
            onClick={() => setView("watchlist")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer transition-colors relative ${
              isActive("watchlist") ? "text-ember" : "text-muted-foreground"
            }`}
          >
            <Bookmark size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Watchlist</span>
            {items.length > 0 && (
              <span className="absolute top-0 right-1 h-3.5 min-w-3.5 px-0.5 bg-ember text-ember-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
