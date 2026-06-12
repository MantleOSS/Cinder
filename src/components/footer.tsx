"use client";

import { Film, Tv, Bookmark, Heart } from "lucide-react";
import { useNavigationStore } from "@/stores/navigation-store";
import { useMovieGenres } from "@/hooks/use-tmdb";

export function Footer() {
  const { setView } = useNavigationStore();
  const { data: movieGenres } = useMovieGenres();

  // Use genres from TMDB API, fallback to empty array
  const genres = movieGenres?.genres ?? [];
  // Show up to 6 genres in the footer
  const displayGenres = genres.slice(0, 6);

  return (
    <footer className="mt-auto border-t border-border/30 bg-background/50 backdrop-blur-xl pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <span className="font-exbed tracking-wider text-xl text-foreground">
              CINDER
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Stream the latest movies and TV shows for free. Built by Mantle.
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Browse</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setView("movies", { initialTab: "popular" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
                >
                  <Film size={14} strokeWidth={1.5} />
                  Popular Movies
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("movies", { initialTab: "top_rated" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
                >
                  <Film size={14} strokeWidth={1.5} />
                  Top Rated Movies
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("tvshows", { initialTab: "popular" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
                >
                  <Tv size={14} strokeWidth={1.5} />
                  Popular TV Shows
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("tvshows", { initialTab: "top_rated" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
                >
                  <Tv size={14} strokeWidth={1.5} />
                  Top Rated TV Shows
                </button>
              </li>
            </ul>
          </div>

          {/* Genres - dynamically loaded from TMDB API */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Genres</h4>
            <ul className="space-y-2">
              {displayGenres.map((genre) => (
                <li key={genre.id}>
                  <button
                    onClick={() => setView("movies", { initialGenreId: genre.id })}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ember transition-colors cursor-pointer"
                  >
                    <Bookmark size={14} strokeWidth={1.5} />
                    {genre.name}
                  </button>
                </li>
              ))}
              {displayGenres.length === 0 && (
                <li className="text-xs text-muted-foreground/50">Loading genres...</li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cinder does not store any files on its server. All content is provided by non-affiliated third parties.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart size={12} strokeWidth={1.5} fill="currentColor" className="text-ember" /> by <span className="text-foreground font-medium">Mantle</span> using TMDB
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Cinder by Mantle. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
