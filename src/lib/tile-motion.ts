const FINISH_PLAYBACK_RATE = 48;

interface TileMotionOptions {
  getAnimation: () => Animation | undefined;
  enabled?: () => boolean;
  observedAttributes?: string[];
}

/** Movimento lento durante hover/focus; uscita rapida alla fine della tile. */
export function initializeTileMotion(
  button: HTMLElement,
  { getAnimation, enabled = () => true, observedAttributes = [] }: TileMotionOptions,
) {
  if (button.dataset.tileMotionInitialized) return;
  button.dataset.tileMotionInitialized = "true";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  let timer: number | undefined;
  let disposed = false;
  let pointerInside = false;
  let keyboardFocused = false;

  const reset = () => {
    window.clearTimeout(timer);
    const animation = getAnimation();
    if (!animation) return;
    animation.pause();
    animation.currentTime = 0;
    animation.updatePlaybackRate(1);
  };

  const update = () => {
    if (disposed) return;
    window.clearTimeout(timer);
    if (reduced.matches || !enabled()) {
      reset();
      return;
    }

    const animation = getAnimation();
    if (!animation) return;
    if (pointerInside || keyboardFocused) {
      animation.updatePlaybackRate(1);
      animation.play();
      return;
    }

    const duration = animation.effect?.getTiming().duration;
    if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
      reset();
      return;
    }
    const currentTime = Number(animation.currentTime ?? 0);
    const position = ((currentTime % duration) + duration) % duration;
    if (position === 0) {
      reset();
      return;
    }

    animation.updatePlaybackRate(FINISH_PLAYBACK_RATE);
    animation.play();
    timer = window.setTimeout(reset, (duration - position) / FINISH_PLAYBACK_RATE);
  };

  // Lo stato :hover può aggiornarsi dopo l'evento del puntatore.
  // Usa gli eventi stessi, come prima dell'unificazione del movimento.
  button.addEventListener("pointerenter", () => {
    pointerInside = true;
    update();
  }, { signal: events.signal });
  button.addEventListener("pointerleave", () => {
    pointerInside = false;
    update();
  }, { signal: events.signal });
  button.addEventListener("focus", () => {
    keyboardFocused = button.matches(":focus-visible");
    update();
  }, { signal: events.signal });
  button.addEventListener("blur", () => {
    keyboardFocused = false;
    update();
  }, { signal: events.signal });
  reduced.addEventListener("change", update, { signal: events.signal });

  const observer = observedAttributes.length ? new MutationObserver(update) : null;
  observer?.observe(button, { attributes: true, attributeFilter: observedAttributes });

  // Gli stili e le animazioni CSS devono essere disponibili anche dopo uno swap.
  const initialFrame = window.requestAnimationFrame(update);
  document.addEventListener("astro:before-swap", () => {
    disposed = true;
    window.cancelAnimationFrame(initialFrame);
    reset();
    observer?.disconnect();
    events.abort();
  }, { once: true });
}
