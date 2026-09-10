// @ts-check
// Eseguito inline prima del banner: la foto e la sua inquadratura sono definitive
// prima che il browser incontri l'elemento che le mostra. Astro esegue questo
// script una volta; lo stato resta nella closure durante la navigazione interna.
(() => {
  /** @typedef {{ src: string, position: string, desktopPosition: string }} HeaderBackground */
  /** @type {HeaderBackground | null} */
  let selected = null;
  let selectionVersion = 0;
  const PARALLAX_RATE = 0.16;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const updateParallax = () => {
    const header = document.querySelector("[data-header-backgrounds]");
    if (!(header instanceof HTMLElement)) return;
    const banner = header.querySelector("[data-header-banner]");
    // All'avvio il banner può non essere ancora stato analizzato. Gli eventi di
    // scroll (incluso il ripristino del browser) aggiorneranno il limite effettivo.
    const bannerBottom = banner ? banner.getBoundingClientRect().bottom + scrollY : Infinity;
    const offset = reducedMotion.matches ? 0 : -Math.min(Math.max(scrollY, 0), bannerBottom) * PARALLAX_RATE;
    const value = `${offset}px`;
    if (header.style.getPropertyValue("--header-parallax-y") !== value) {
      header.style.setProperty("--header-parallax-y", value);
    }
  };

  /** @param {HTMLElement} header @param {HeaderBackground} background */
  const applyBackground = (header, background) => {
    header.style.setProperty("--header-background", `url("${background.src}")`);
    header.style.setProperty("--header-background-position", background.position);
    header.style.setProperty("--header-background-desktop-position", background.desktopPosition);
  };

  /** @param {HTMLElement | null} header */
  const initialize = (header) => {
    if (!header || header.dataset.randomBackgroundInitialized === "true") return;
    /** @type {HeaderBackground[]} */
    let backgrounds;
    try {
      backgrounds = JSON.parse(header.dataset.headerBackgrounds ?? "[]");
    } catch {
      return;
    }
    if (!backgrounds.length) return;
    if (!selected || !backgrounds.some((background) => background.src === selected?.src)) {
      selected = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }
    if (!selected) return;
    applyBackground(header, selected);
    header.dataset.randomBackgroundInitialized = "true";

    // Il link viene analizzato dopo questo script, quindi usiamo la delegazione.
    header.addEventListener("click", (event) => {
      const homeLink = event.target instanceof Element
        ? event.target.closest(".webhome-header__title") : null;
      if (!(homeLink instanceof HTMLAnchorElement) || event.defaultPrevented
        || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const alternatives = backgrounds.filter((background) => background.src !== selected?.src);
      const nextBackground = alternatives[Math.floor(Math.random() * alternatives.length)];
      if (nextBackground) {
        const version = ++selectionVersion;
        const image = new Image();
        image.src = nextBackground.src;
        // Mantieni la foto corrente finché la nuova è decodificata. Il caricamento
        // può terminare dopo il cambio pagina: aggiorna il nuovo header, non quello staccato.
        void image.decode().then(() => {
          if (version !== selectionVersion) return;
          selected = nextBackground;
          const currentHeader = document.querySelector("[data-header-backgrounds]");
          if (currentHeader instanceof HTMLElement) applyBackground(currentHeader, selected);
        }).catch(() => {
          // Se la foto non si carica, conserva quella visibile.
        });
      }
      // In Home preserviamo il DOM; dalle altre pagine il router segue il link.
      if (homeLink.pathname === location.pathname && homeLink.search === location.search) {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0 });
      }
    });
  };

  initialize(document.currentScript?.parentElement ?? null);
  updateParallax();
  // Registrati subito, senza aspettare i moduli: anche lo scroll ripristinato
  // durante una ricarica deve trovare lo sfondo già nella posizione corretta.
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax, { passive: true });
  reducedMotion.addEventListener("change", updateParallax);
  document.addEventListener("astro:before-swap", (event) => {
    const header = event.newDocument.querySelector("[data-header-backgrounds]");
    if (header instanceof HTMLElement && selected) applyBackground(header, selected);
  });
  document.addEventListener("astro:after-swap", () => {
    const header = document.querySelector("[data-header-backgrounds]");
    if (header instanceof HTMLElement) initialize(header);
    updateParallax();
  });
})();
