import type { ImageMetadata } from "astro";
import anatrosoHeaderBackground from "../assets/header/Anatroso nitido.png";
import isuienHeaderBackground from "../assets/header/IsuienNara.png";
import pollinoHeaderBackground from "../assets/header/pollino.png";
import gattistanbulHeaderBackground from "../assets/header/gattistanbul.png";
const additionalHeaderImages = import.meta.glob<ImageMetadata>("../assets/header/*.webp", { eager: true, import: "default" });
// Il punto focale cambia il ritaglio del banner, non il file originale.
const additionalHeaderPositions: Record<string, string> = {
  "../assets/header/golfoTramonto.webp": "50% 0%",
  "../assets/header/himeji2.webp": "50% 63%",
  "../assets/header/himeji3.webp": "50% 22%",
  "../assets/header/rifugioLecco.webp": "50% 10%",
};
// Le correzioni desktop lasciano invariate le inquadrature mobile.
const additionalHeaderDesktopPositions: Record<string, string> = {
  "../assets/header/miramar2.webp": "50% 94%",
  "../assets/header/paeseMarche.webp": "50% 35%",
  "../assets/header/bonomeo2.webp": "50% 90%",
  "../assets/header/dolomiten.webp": "50% 15%",
  "../assets/header/ShibuyaTower.webp": "50% 10%",
  "../assets/header/TokyoBaleno.webp": "50% 65%",
  "../assets/header/himeji.webp": "50% 35%",
  "../assets/header/himeji3.webp": "50% 25%",
};
export const headerBackgroundSources: {
  source: ImageMetadata;
  position: string;
  desktopPosition?: string;
}[] = [
  {
    source: anatrosoHeaderBackground,
    position: "50% 55%",
  },
  {
    source: isuienHeaderBackground,
    position: "50% 45%",
  },
  {
    source: pollinoHeaderBackground,
    position: "50% 60%",
  },
  {
    source: gattistanbulHeaderBackground,
    position: "50% 43%",
  },
  ...Object.entries(additionalHeaderImages).map(([path, source]) => ({
    source,
    position: additionalHeaderPositions[path] ?? "50% 50%",
    desktopPosition: additionalHeaderDesktopPositions[path],
  })),
];
