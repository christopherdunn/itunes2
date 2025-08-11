import type { ChartItem, FeedType, Storefront } from "@/app/types";

export async function fetchRss({
  feed,
  country,
  limit,
  genre,
}: {
  feed: FeedType;
  country: Storefront;
  limit: number;
  genre: string;
}): Promise<ChartItem[]> {
  console.log("fetchRss called", { feed, country, limit, genre });
  const qs = new URLSearchParams({ feed, country, limit: String(limit), genre });
  const res = await fetch(`/api/rss?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch feed");
  const json = await res.json();
  console.log("fetchRss returned", json.items.length, "items");
  return json.items as ChartItem[];
}

export async function lookupPreview(trackId: string): Promise<string | null> {
  console.log("lookupPreview called for", trackId);
  const res = await fetch(`/api/lookup?id=${trackId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { previewUrl } = await res.json();
  console.log("lookupPreview got", previewUrl);
  return previewUrl || null;
}
