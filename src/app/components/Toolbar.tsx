"use client";
import type { FeedType, Storefront } from "@/app/types";

export default function Toolbar({
  feed,
  onFeedChange,
  query,
  onQueryChange,
  country,
  onCountryChange,
  limit,
  onLimitChange,
}: {
  feed: FeedType;
  onFeedChange: (v: FeedType) => void;
  query: string;
  onQueryChange: (v: string) => void;
  country: Storefront;
  onCountryChange: (v: Storefront) => void;
  limit: number;
  onLimitChange: (v: number) => void;
}) {
  return (
    <div className="toolbar">
      <div className="seg" role="tablist" aria-label="Chart type">
        {["topsongs", "topalbums", "topmusicvideos"].map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={feed === k}
            className={feed === k ? "active" : ""}
            onClick={() => {
              console.log("Feed changed to", k);
              onFeedChange(k as FeedType);
            }}
          >
            {k === "topsongs" ? "Songs" : k === "topalbums" ? "Albums" : "Videos"}
          </button>
        ))}
      </div>
      <label className="search" aria-label="Search in list">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 21l-4.35-4.35m1.1-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
        <input
          placeholder="Search title or artist…"
          value={query}
          onChange={(e) => {
            console.log("Search query changed", e.target.value);
            onQueryChange(e.target.value);
          }}
        />
      </label>
      <div className="store">
        <select
          value={country}
          onChange={(e) => {
            console.log("Country changed", e.target.value);
            onCountryChange(e.target.value as Storefront);
          }}
        >
          {(["us", "gb", "ca", "au", "de", "fr", "jp", "br"] as Storefront[]).map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={String(limit)}
          onChange={(e) => {
            console.log("Limit changed", e.target.value);
            onLimitChange(parseInt(e.target.value, 10));
          }}
        >
          {[25, 100, 200].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            console.log("Manual refresh triggered");
            window.location.reload();
          }}
          className="btn"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
