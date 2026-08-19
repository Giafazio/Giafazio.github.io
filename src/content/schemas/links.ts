import { z } from "astro/zod";

export const internalOrExternalHref = z
  .string()
  .min(1)
  .refine(
    (href) => {
      /*
       * Percorso interno assoluto rispetto
       * alla radice del sito.
       */
      if (
        href.startsWith("/") &&
        !href.startsWith("//")
      ) {
        return true;
      }

      try {
        const url = new URL(href);

        return (
          url.protocol === "http:" ||
          url.protocol === "https:"
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Use a root-relative path or an http(s) URL",
    },
  );