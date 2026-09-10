type HeaderBackground = {
  src: string;
  position: string;
  desktopPosition: string;
};
let selectedHeaderBackground: HeaderBackground | null = null;
const applyHeaderBackground = (header: HTMLElement, background: HeaderBackground) => {
  header.style.setProperty("--header-background", `url("${background.src}")`);
  header.style.setProperty("--header-background-position", background.position);
  header.style.setProperty("--header-background-desktop-position", background.desktopPosition);
};
const initializeRandomHeaderBackground = () => {
  const headers = document.querySelectorAll<HTMLElement>("[data-header-backgrounds]");
  headers.forEach((header) => {
    if (header.dataset
      .randomBackgroundInitialized ===
      "true") {
      return;
    }
    let backgrounds: HeaderBackground[] = [];
    try {
      backgrounds = JSON.parse(header.dataset.headerBackgrounds ??
        "[]") as HeaderBackground[];
    }
    catch {
      backgrounds = [];
    }
    if (backgrounds.length === 0) {
      return;
    }
    /*
    * La variabile resta valorizzata durante
    * la navigazione interna di Astro.
    * Una ricarica completa esegue invece
    * una nuova estrazione.
    */
    const selectedBackgroundIsAvailable = selectedHeaderBackground
      ? backgrounds.some((background) => background.src ===
        selectedHeaderBackground?.src)
      : false;
    if (!selectedBackgroundIsAvailable) {
      const randomIndex = Math.floor(Math.random() *
        backgrounds.length);
      selectedHeaderBackground =
        backgrounds[randomIndex] ??
          null;
    }
    if (!selectedHeaderBackground) {
      return;
    }
    applyHeaderBackground(header, selectedHeaderBackground);
    const homeLink = header.querySelector<HTMLAnchorElement>(".webhome-header__title");
    homeLink?.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const alternatives = backgrounds.filter((background) => background.src !== selectedHeaderBackground?.src);
      const nextBackground = alternatives[Math.floor(Math.random() * alternatives.length)];
      if (nextBackground) {
        selectedHeaderBackground = nextBackground;
        applyHeaderBackground(header, nextBackground);
      }
      // In Home preserviamo il DOM e lo stato dei componenti.
      // Dalle altre pagine il link resta gestito dal router di Astro.
      if (homeLink.pathname === window.location.pathname
        && homeLink.search === window.location.search) {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0 });
      }
    });
    header.dataset
      .randomBackgroundInitialized =
      "true";
  });
};
const PARALLAX_RATE = 0.16;
const TREMOR_MIN_DELAY_MS = 5000;
const TREMOR_MAX_DELAY_MS = 13000;
const TREMOR_MIN_DURATION_MS = 650;
const TREMOR_MAX_DURATION_MS = 1050;
const TREMOR_X_PX = 1.4;
const TREMOR_Y_PX = 1;
const TREMOR_ROTATION_DEG = 0.04;
const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);
const initializeHeaderBackgroundMotion = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const banners = document.querySelectorAll<HTMLElement>("[data-header-banner]");
  banners.forEach((banner) => {
    if (banner.dataset.backgroundMotionInitialized ===
      "true") {
      return;
    }
    banner.dataset.backgroundMotionInitialized =
      "true";
    const track = banner.querySelector<HTMLElement>("[data-header-background-track]");
    const image = banner.querySelector<HTMLElement>("[data-header-background-image]");
    if (!track || !image || reducedMotion) {
      return;
    }
    let parallaxFrame: number | null = null;
    let tremorTimer: number | null = null;
    let tremorAnimation: Animation | null = null;
    let disposed = false;
    let lastMovement = NaN;
    const applyParallax = () => {
      parallaxFrame = null;
      if (disposed) {
        return;
      }
      /*
      * Coordinata del bordo inferiore del banner
      * rispetto all'intero documento.
      */
      const bannerBottomInDocument = banner.getBoundingClientRect().bottom +
        window.scrollY;
      /*
      * Il movimento viene limitato soltanto quando
      * il banner è ormai interamente uscito dallo schermo.
      */
      const relevantScroll = Math.min(Math.max(window.scrollY, 0), bannerBottomInDocument);
      const movement = -relevantScroll * PARALLAX_RATE;
      if (Number.isNaN(lastMovement) ||
        Math.abs(lastMovement - movement) > 0.25) {
        track.style.setProperty("--header-parallax-y", `${movement}px`);
        lastMovement = movement;
      }
    };
    const requestParallaxUpdate = () => {
      if (parallaxFrame !== null) {
        return;
      }
      parallaxFrame =
        window.requestAnimationFrame(applyParallax);
    };
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
      window.removeEventListener("scroll", requestParallaxUpdate);
      window.removeEventListener("resize", requestParallaxUpdate);
      if (parallaxFrame !== null) {
        window.cancelAnimationFrame(parallaxFrame);
      }
      if (tremorTimer !== null) {
        window.clearTimeout(tremorTimer);
      }
      if (tremorAnimation) {
        tremorAnimation.onfinish = null;
        tremorAnimation.cancel();
      }
    }
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate, { passive: true });
    document.addEventListener("astro:before-swap", cleanup, { once: true });
    applyParallax();
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
    const applyLayout = () => {
      layoutFrame = null;
      if (disposed ||
        !header.isConnected) {
        return;
      }
      /*
      * Ogni misurazione parte dalla
      * configurazione a una riga.
      */
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
    document.fonts.ready.then(requestLayoutUpdate);
    const cleanup = () => {
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
initializeRandomHeaderBackground();
initializeHeaderBackgroundMotion();
initializeAdaptiveNavigationLayout();
document.addEventListener("astro:page-load", initializeRandomHeaderBackground);
document.addEventListener("astro:page-load", initializeHeaderBackgroundMotion);
document.addEventListener("astro:page-load", initializeAdaptiveNavigationLayout);
