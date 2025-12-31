import { NextResponse } from "next/server";
import type { FeedType, Storefront } from "@/app/types";

function toTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getLabel(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const label = (value as { label?: unknown }).label;
  return typeof label === "string" ? label : undefined;
}

function getImageLabel(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const preferred = value[2] ?? value[value.length - 1];
  return getLabel(preferred) || "";
}

function getHref(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const attrs = (value as { attributes?: unknown }).attributes;
  const hrefAttr =
    attrs && typeof attrs === "object"
      ? (attrs as { href?: unknown }).href
      : undefined;
  const href = (value as { href?: unknown }).href;
  return (typeof hrefAttr === "string" && hrefAttr) ||
    (typeof href === "string" && href) ||
    "";
}

function getId(value: unknown, fallback: string): string {
  if (!value || typeof value !== "object") return fallback;
  const attrs = (value as { attributes?: unknown }).attributes;
  const imId =
    attrs && typeof attrs === "object"
      ? (attrs as { "im:id"?: unknown })["im:id"]
      : undefined;
  if (typeof imId === "string") return imId;

  const label = (value as { label?: unknown }).label;
  if (typeof label === "string") {
    const m = label.match(/id(\d+)/);
    if (m?.[1]) return m[1];
  }
  return fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const feed = (searchParams.get("feed") || "topsongs") as FeedType;
  const country = (searchParams.get("country") || "us") as Storefront;
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const genre = searchParams.get("genre") || "all";

  const rssUrl = `https://itunes.apple.com/${country}/rss/${feed}/${
    genre === "all" ? "" : `genre=${genre}/`
  }limit=${limit}/json`;

  console.log("[/api/rss] params:", { feed, country, limit, genre });
  console.log("[/api/rss] fetch:", rssUrl);

  try {
    const res = await fetch(rssUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn("[/api/rss] non-OK status:", res.status);
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    const data = (await res.json()) as { feed?: { entry?: unknown[] } };
    const entries = data.feed?.entry ?? [];

    const items = entries.map((entry, i: number) => {
      const e = entry as Record<string, unknown>;

      const artwork = getImageLabel(e["im:image"]);
      const price = getLabel(e["im:price"]) || "";
      const name = getLabel(e["im:name"]) || getLabel(e.title) || "—";
      const artist = getLabel(e["im:artist"]) || "—";
      const duration = getLabel(e["im:duration"]);
      const time = duration
        ? toTime(parseInt(duration, 10))
        : "0:30";
      const id = getId(e.id, String(i));

      // 🔗 NEW: get the item’s iTunes/Apple Music link from RSS
      // The RSS `link` can be an object or an array depending on the feed.
      const link =
        getHref(e.link) || (Array.isArray(e.link) ? getHref(e.link[0]) : "");
      const linkUrl = link || "";

      return { index: i + 1, id, name, artist, artwork, price, time, linkUrl };
    });

    console.log("[/api/rss] entries:", entries.length, "items:", items.length);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[/api/rss] error:", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
