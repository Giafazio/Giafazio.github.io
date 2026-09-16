import type { APIRoute } from "astro";
import { withBase } from "../../lib/urls";
export function getStaticPaths() {
  return import.meta.env.DEV ? ["symphojingles", "avventura-autunno"].map(preview => ({ params: { preview } })) : [];
}
export const GET: APIRoute = ({ params, redirect }) => redirect(withBase(params.preview === "symphojingles" ? "/projects/symphojingles/" : "/projects/symphojingles/avventura-autunno/"));
