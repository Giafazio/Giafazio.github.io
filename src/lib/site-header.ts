import type { TransitionBeforeSwapEvent } from "astro:transitions/client";

let menuScroll: { left: number; top: number } | null = null;
document.addEventListener("astro:before-swap", (event) => {
  // Leggiamo la posizione appena prima dello swap, anche se il caricamento è lento.
  // Avanti/indietro e gli altri link mantengono la gestione dello scroll di Astro.
  menuScroll = event.navigationType !== "traverse"
    && event.sourceElement?.closest("[data-nav-button]")
    ? { left: window.scrollX, top: window.scrollY }
    : null;
});
// La fase capture precede i normali listener che posizionano sfondo e corvo:
// Astro ha già azzerato lo scroll, ma il browser non ha ancora mostrato la pagina.
document.addEventListener("astro:after-swap", () => {
  if (!menuScroll) return;
  window.scrollTo({ ...menuScroll, behavior: "instant" });
  menuScroll = null;
}, { capture: true });

const TREMOR_MIN_DELAY_MS = 5000;
const TREMOR_MAX_DELAY_MS = 13000;
const TREMOR_MIN_DURATION_MS = 650;
const TREMOR_MAX_DURATION_MS = 1050;
const TREMOR_X_PX = 1.4;
const TREMOR_Y_PX = 1;
const TREMOR_ROTATION_DEG = 0.04;
const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);
const initializeHeaderTremor = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const banners = document.querySelectorAll<HTMLElement>("[data-header-banner]");
  banners.forEach((banner) => {
    if (banner.dataset.backgroundMotionInitialized ===
      "true") {
      return;
    }
    banner.dataset.backgroundMotionInitialized =
      "true";
    const image = banner.querySelector<HTMLElement>("[data-header-background-image]");
    if (!image || reducedMotion) {
      return;
    }
    let tremorTimer: number | null = null;
    let tremorAnimation: Animation | null = null;
    let disposed = false;
    function scheduleTremor() {
      if (disposed) {
        return;
      }
      const delay = randomBetween(TREMOR_MIN_DELAY_MS, TREMOR_MAX_DELAY_MS);
      tremorTimer = window.setTimeout(runTremor, delay);
    }
    function runTremor() {
      tremorTimer = null;
      if (disposed ||
        !banner.isConnected ||
        !image) {
        cleanup();
        return;
      }
      const neutralTransform = "translate3d(0, 0, 0) rotate(0deg)";
      const keyframes: Keyframe[] = [
        {
          transform: neutralTransform,
          offset: 0,
        },
      ];
      const intermediateFrames = 6;
      for (let index = 1; index <= intermediateFrames; index += 1) {
        const x = randomBetween(-TREMOR_X_PX, TREMOR_X_PX);
        const y = randomBetween(-TREMOR_Y_PX, TREMOR_Y_PX);
        const rotation = randomBetween(-TREMOR_ROTATION_DEG, TREMOR_ROTATION_DEG);
        keyframes.push({
          transform: `translate3d(${x.toFixed(2)}px, ` +
            `${y.toFixed(2)}px, 0) ` +
            `rotate(${rotation.toFixed(3)}deg)`,
          offset: index /
            (intermediateFrames + 1),
        });
      }
      keyframes.push({
        transform: neutralTransform,
        offset: 1,
      });
      const animation = image.animate(keyframes, {
        duration: randomBetween(TREMOR_MIN_DURATION_MS, TREMOR_MAX_DURATION_MS),
        easing: "linear",
      });
      tremorAnimation = animation;
      animation.onfinish = () => {
        if (tremorAnimation === animation) {
          tremorAnimation = null;
        }
        scheduleTremor();
      };
    }
    function cleanup() {
      if (disposed) {
        return;
      }
      disposed = true;
      if (tremorTimer !== null) {
        window.clearTimeout(tremorTimer);
      }
      if (tremorAnimation) {
        tremorAnimation.onfinish = null;
        tremorAnimation.cancel();
      }
    }
    document.addEventListener("astro:before-swap", cleanup, { once: true });
    scheduleTremor();
  });
};
const initializeAdaptiveNavigationLayout = () => {
  const headers = document.querySelectorAll<HTMLElement>(".webhome-header");
  headers.forEach((header) => {
    if (header.dataset
      .adaptiveNavigationInitialized ===
      "true") {
      return;
    }
    const banner = header.querySelector<HTMLElement>(".webhome-header__banner");
    const navigation = header.querySelector<HTMLElement>(".webhome-nav");
    const buttons = header.querySelector<HTMLElement>(".webhome-nav__buttons");
    if (!banner || !navigation || !buttons) {
      return;
    }
    header.dataset
      .adaptiveNavigationInitialized =
      "true";
    let layoutFrame: number | null = null;
    let disposed = false;
    let navigationFontReady = false;
    const applyLayout = () => {
      layoutFrame = null;
      if (disposed || !navigationFontReady ||
        !header.isConnected) {
        return;
      }
      /*
      * Ogni misurazione parte dalla
      * configurazione a una riga.
      */
      // Misura e visibilità cambiano nello stesso ciclo, senza mostrare lo stato provvisorio.
      navigation.dataset.navigationLayoutReady = "true";
      navigation.classList.remove("webhome-nav--two-rows");
      /*
      * Sommiamo le larghezze effettive dei pulsanti
      * e gli spazi tra loro nella configurazione a una riga.
      */
      const navigationButtons = Array.from(buttons.querySelectorAll<HTMLElement>("[data-nav-button]"));
      const buttonsStyle = window.getComputedStyle(buttons);
      const columnGap = Number.parseFloat(buttonsStyle.columnGap) || 0;
      const requiredWidth = navigationButtons.reduce((total, button) => total +
        button.getBoundingClientRect().width, 0) +
        columnGap *
          Math.max(navigationButtons.length - 1, 0);
      const availableWidth = buttons.getBoundingClientRect().width;
      /*
      * Tolleriamo fino a 1px di eccedenza complessiva
      * per assorbire gli arrotondamenti introdotti dallo zoom.
      */
      const overflowTolerance = 1;
      const rowOverflows = requiredWidth >
        availableWidth +
          overflowTolerance;
      navigation.classList.toggle("webhome-nav--two-rows", rowOverflows);
      navigation.dispatchEvent(new Event("webhome:navigation-layout"));
    };
    const requestLayoutUpdate = () => {
      if (disposed ||
        layoutFrame !== null) {
        return;
      }
      layoutFrame =
        window.requestAnimationFrame(applyLayout);
    };
    const resizeObserver = new ResizeObserver(requestLayoutUpdate);
    /*
    * Osserviamo il banner, la cui larghezza
    * rappresenta lo spazio disponibile.
    * Non osserviamo i tasti, evitando cicli
    * causati dal passaggio tra una e due righe.
    */
    resizeObserver.observe(banner);
    window.addEventListener("resize", requestLayoutUpdate, { passive: true });
    const onNavigationFontReady = () => {
      navigationFontReady = true;
      requestLayoutUpdate();
    };
    // Attendiamo solo il font dei tasti; in caso d'errore resta utilizzabile il fallback.
    void document.fonts.load('28px "Basteleur"').then(onNavigationFontReady, onNavigationFontReady);
    const cleanup = (event: TransitionBeforeSwapEvent) => {
      // Conserva le righe del menù anche prima del primo layout della nuova pagina.
      const nextNavigation = event.newDocument.querySelector<HTMLElement>(".webhome-nav");
      nextNavigation?.classList.toggle(
        "webhome-nav--two-rows",
        navigation.classList.contains("webhome-nav--two-rows"),
      );
      if (nextNavigation && navigation.hasAttribute("data-navigation-layout-ready")) {
        // L'attributo mantiene il menù visibile durante lo swap; solo "true"
        // indica che i font e la misurazione della nuova pagina sono pronti.
        nextNavigation.dataset.navigationLayoutReady = "pending";
      }
      disposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", requestLayoutUpdate);
      if (layoutFrame !== null) {
        window.cancelAnimationFrame(layoutFrame);
      }
    };
    document.addEventListener("astro:before-swap", cleanup, { once: true });
    requestLayoutUpdate();
  });
};
initializeHeaderTremor();
initializeAdaptiveNavigationLayout();
document.addEventListener("astro:after-swap", initializeHeaderTremor);
document.addEventListener("astro:after-swap", initializeAdaptiveNavigationLayout);
document.addEventListener("astro:page-load", initializeHeaderTremor);
document.addEventListener("astro:page-load", initializeAdaptiveNavigationLayout);
