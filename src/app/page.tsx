"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import TrackTable from "./components/TrackTable";
import PlayerBadge from "./components/PlayerBadge";
import { fetchRss } from "./lib/itunes";
import type { ChartItem, FeedType, Storefront } from "./types";

export default function Home() {
  const [feed, setFeed] = useState<FeedType>("topsongs");
  const [country, setCountry] = useState<Storefront>("us");
  const [limit, setLimit] = useState<number>(100);
  const [genre, setGenre] = useState<string>("all");
  const [items, setItems] = useState<ChartItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    console.log("Fetching feed", { feed, country, limit, genre });
    let canceled = false;
    (async () => {
      const data = await fetchRss({ feed, country, limit, genre });
      if (!canceled) {
        console.log("Feed loaded", data.length);
        setItems(data);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [feed, country, limit, genre]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = items.filter((r) =>
      !q || `${r.name} ${r.artist}`.toLowerCase().includes(q)
    );
    console.log("Filtered items", result.length);
    return result;
  }, [items, query]);

  return (
    <div className="window">
      <div className="titlebar">
        <div className="traffic">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        
        <Toolbar
          feed={feed}
          onFeedChange={setFeed}
          query={query}
          onQueryChange={setQuery}
          country={country}
          onCountryChange={setCountry}
          limit={limit}
          onLimitChange={setLimit}
        />
        <PlayerBadge />
      </div>

      <div className="content">
        <Sidebar activeGenre={genre} onSelectGenre={setGenre} total={filtered.length} />
        <div className="main">
          <TrackTable items={filtered} />
        </div>
      </div>
    </div>
  );
}
