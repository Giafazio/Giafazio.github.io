import type { APIRoute } from "astro";
import { getSiteData } from "../lib/content";
import { withBase } from "../lib/urls";
import { absolutePublicUrl, collectCanonicalPaths, renderSitemap } from "../lib/site-discovery";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const data = await getSiteData();
  const urls = collectCanonicalPaths(data).map((path) =>
    absolutePublicUrl(withBase(path), site),
  );
  return new Response(renderSitemap(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
