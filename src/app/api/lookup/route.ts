import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  console.log("[/api/lookup] id:", id);

  if (!id) {
    console.warn("[/api/lookup] missing id");
    return NextResponse.json({ previewUrl: null });
  }

  const url = `https://itunes.apple.com/lookup?id=${id}&entity=song`;
  console.log("[/api/lookup] fetch:", url);

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn("[/api/lookup] non-OK status:", res.status);
      return NextResponse.json({ previewUrl: null });
    }
    type LookupResult = { previewUrl?: string | null };
    type LookupResponse = { results?: LookupResult[] };

    const data = (await res.json()) as LookupResponse;
    const previewUrl =
      data.results?.find((r) => typeof r.previewUrl === "string")?.previewUrl ||
      null;

    console.log("[/api/lookup] previewUrl:", previewUrl);
    return NextResponse.json({ previewUrl });
  } catch (err) {
    console.error("[/api/lookup] error:", err);
    return NextResponse.json({ previewUrl: null });
  }
}
