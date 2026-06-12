"use client";

import { useState, useEffect, useRef } from "react";
import { X, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchProgressStore } from "@/stores/navigation-store";

// Cinder's ember/amber theme color (oklch 0.65 0.18 40 ≈ #E8890C)
const CINDER_COLOR = "E8890C";

interface VideoPlayerProps {
  type: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  title: string;
  onClose: () => void;
  /** Called when a TV episode ends — enables auto-advance */
  onEpisodeEnd?: (season: number, episode: number) => void;
}

interface VidkingEventData {
  type: "PLAYER_EVENT";
  data: {
    event: "timeupdate" | "play" | "pause" | "ended" | "seeked";
    currentTime: number;
    duration: number;
    progress: number;
    id: string;
    mediaType: "movie" | "tv";
    season?: number;
    episode?: number;
    timestamp: number;
  };
}

export function VideoPlayer({ type, tmdbId, season, episode, title, onClose, onEpisodeEnd }: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const updateProgress = useWatchProgressStore((s) => s.updateProgress);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build Vidking embed URL with all customization parameters
  const buildSrc = () => {
    const params = new URLSearchParams({
      color: CINDER_COLOR,
      autoPlay: "true",
    });

    if (type === "tv") {
      params.set("nextEpisode", "true");
      params.set("episodeSelector", "true");
    }

    // Resume from saved progress
    const saved = useWatchProgressStore.getState().getProgress(tmdbId, type, season, episode);
    if (saved && saved.currentTime > 0 && saved.progress < 95) {
      params.set("progress", String(Math.floor(saved.currentTime)));
    }

    const base =
      type === "movie"
        ? `https://www.vidking.net/embed/movie/${tmdbId}`
        : `https://www.vidking.net/embed/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`;

    return `${base}?${params.toString()}`;
  };

  const [src] = useState(buildSrc);

  // Listen for progress events from Vidking iframe via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "string") return;

      let parsed: VidkingEventData;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      if (parsed.type !== "PLAYER_EVENT" || !parsed.data) return;

      const { event: playerEvent, currentTime, duration, progress, id, mediaType, season: evSeason, episode: evEpisode } = parsed.data;
      const contentId = parseInt(id, 10);
      if (isNaN(contentId)) return;

      if (playerEvent === "timeupdate" || playerEvent === "pause" || playerEvent === "seeked" || playerEvent === "ended") {
        updateProgress({
          id: contentId,
          mediaType: mediaType === "tv" ? "tv" : "movie",
          season: evSeason,
          episode: evEpisode,
          currentTime,
          duration,
          progress: Math.min(progress, 100),
        });
      }

      if (playerEvent === "ended" && mediaType === "tv" && onEpisodeEnd && evSeason !== undefined && evEpisode !== undefined) {
        onEpisodeEnd(evSeason, evEpisode);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [updateProgress, onEpisodeEnd]);

  const toggleFullscreen = () => {
    const container = document.getElementById("player-container");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      id="player-container"
      className="relative w-full bg-black rounded-xl overflow-hidden z-30"
    >
      {/* Player header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-ember animate-pulse" />
          <span className="text-sm font-medium line-clamp-1">{title}</span>
          {type === "tv" && season && episode && (
            <span className="text-xs text-muted-foreground">
              S{String(season).padStart(2, "0")}E{String(episode).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 active:scale-[0.97] transition-transform"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize size={16} strokeWidth={1.5} />
            ) : (
              <Maximize size={16} strokeWidth={1.5} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 active:scale-[0.97] transition-transform"
            onClick={onClose}
          >
            <X size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-4 w-full max-w-md px-6">
            <div className="w-full space-y-3">
              <div className="h-4 w-3/4 bg-white/10 rounded shimmer" />
              <div className="h-3 w-1/2 bg-white/10 rounded shimmer" />
            </div>
            <div className="w-full aspect-video bg-white/5 rounded-xl shimmer" />
            <span className="text-sm text-muted-foreground">Loading player…</span>
          </div>
        </div>
      )}

      {/* Vidking iframe — no sandbox attribute, matches their documented embed code */}
      <iframe
        ref={iframeRef}
        src={src}
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        title={title}
        onLoad={() => setIsLoading(false)}
        className="w-full aspect-video sm:aspect-video"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
