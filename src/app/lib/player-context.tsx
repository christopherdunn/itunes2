"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ChartItem } from "@/app/types";
import {lookupPreview}  from '@/app/lib/itunes'

interface PlayerCtx {
  queue: ChartItem[];
  setQueue: (items: ChartItem[]) => void;
  current: (ChartItem & { progressPct: number }) | null;
  currentId: string | null;
  isPlaying: boolean;
  timeLabel: string;
  durLabel: string;
  playByItem: (item: ChartItem) => Promise<void>;
  togglePlayPause: () => void;
  next: () => void;
  prev: () => void;
}

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<ChartItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(30);

  useEffect(() => {
    console.log("Initializing audio element");
    const el = new Audio();
    el.crossOrigin = "anonymous";
    const onTime = () => {
      setTime(el.currentTime);
      setDur(el.duration || 30);
    };
    const onPlay = () => {
      console.log("Audio started playing");
      setIsPlaying(true);
    };
    const onPause = () => {
      console.log("Audio paused");
      setIsPlaying(false);
    };
    const onEnded = () => {
      console.log("Audio ended, moving to next track");
      next();
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    audioRef.current = el;
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.pause();
    };
  }, []);

  const current = useMemo(() => {
    const item = queue.find((i) => i.id === currentId) || null;
    return item ? { ...item, progressPct: Math.min(100, (time / (dur || 30)) * 100) } : null;
  }, [queue, currentId, time, dur]);

  const playByItem = async (item: ChartItem) => {
    console.log("playByItem called", item.name);
    const audio = audioRef.current!;
    if (currentId === item.id) {
      console.log("Same track clicked again — ignoring");
      return;
    }
    setQueue((q) => (q.some((x) => x.id === item.id) ? q : [...q, item]));
    const url = await lookupPreview(item.id);
    if (!url) {
      console.warn("No preview available for", item.name);
      alert("No preview available for this track.");
      return;
    }
    setCurrentId(item.id);
    audio.src = url;
    await audio.play();
  };

  const togglePlayPause = () => {
    const audio = audioRef.current!;
    if (!audio.src) {
      console.log("No audio source loaded");
      return;
    }
    if (audio.paused) {
      console.log("Resuming playback");
      audio.play();
    } else {
      console.log("Pausing playback");
      audio.pause();
    }
  };

  const next = async () => {
    if (!current) return;
    const idx = queue.findIndex((i) => i.id === current.id);
    const nextItem = queue[idx + 1];
    if (nextItem) {
      console.log("Playing next track", nextItem.name);
      const url = await lookupPreview(nextItem.id);
      if (url) {
        audioRef.current!.src = url;
        setCurrentId(nextItem.id);
        await audioRef.current!.play();
      }
    } else {
      console.log("No next track — stopping");
      audioRef.current!.pause();
    }
  };

  const prev = async () => {
    if (!current) return;
    const idx = queue.findIndex((i) => i.id === current.id);
    const prevItem = queue[idx - 1];
    if (prevItem) {
      console.log("Playing previous track", prevItem.name);
      const url = await lookupPreview(prevItem.id);
      if (url) {
        audioRef.current!.src = url;
        setCurrentId(prevItem.id);
        await audioRef.current!.play();
      }
    }
  };

  const timeLabel = `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
  const durLabel = `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, "0")}`;

  return (
    <Ctx.Provider
      value={{
        queue,
        setQueue,
        current,
        currentId,
        isPlaying,
        timeLabel,
        durLabel,
        playByItem,
        togglePlayPause,
        next,
        prev,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
