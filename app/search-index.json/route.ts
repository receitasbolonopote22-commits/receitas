import { getSearchIndex } from "@/lib/content";

// Gerado uma vez no build e servido como arquivo estático pela CDN.
export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
