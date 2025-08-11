import { NextResponse } from "next/server";
import type { FeedType, Storefront } from "@/app/types";

function toTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
    const data = await res.json();
    const entries = data?.feed?.entry || [];

    const items = entries.map((e: any, i: number) => {
      const artwork =
        e["im:image"]?.[2]?.label || e["im:image"]?.at?.(-1)?.label || "";
      const price = e["im:price"]?.label || "";
      const name = e["im:name"]?.label || e?.title?.label || "—";
      const artist = e["im:artist"]?.label || "—";
      const time = e["im:duration"]?.label
        ? toTime(parseInt(e["im:duration"].label, 10))
        : "0:30";
      const id =
        e?.id?.attributes?.["im:id"] ||
        e?.id?.label?.match?.(/id(\d+)/)?.[1] ||
        String(i);

      // 🔗 NEW: get the item’s iTunes/Apple Music link from RSS
      // The RSS `link` can be an object or an array depending on the feed.
      const linkUrl =
        e?.link?.attributes?.href ||
        e?.link?.[0]?.attributes?.href ||
        e?.link?.href || // some feeds expose it directly
        "";

      return { index: i + 1, id, name, artist, artwork, price, time, linkUrl };
    });

    console.log("[/api/rss] entries:", entries.length, "items:", items.length);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[/api/rss] error:", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
