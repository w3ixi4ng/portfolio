/**
 * Runtime scroll state shared by the 3D scene and the HTML overlay.
 *
 * We use the page's native scroll (a tall document + fixed canvas) rather than an inner
 * scroll container, so wheel/trackpad/touch/keyboard all behave natively (CLAUDE.md §13)
 * and HTML cards on top never swallow scroll input.
 *
 * `target` is the raw 0→1 scroll fraction; `current` eases toward it once per animation
 * frame. Consumers read `scrollState.current` inside useFrame / rAF; nothing here triggers
 * React renders except a zone change.
 */
import { zoneFromScroll } from "./scroll";
import { useAppStore } from "./store";

export const scrollState = {
  target: 0,
  current: 0,
  reducedMotion: false,
  /** Dev-only: when set, progress is pinned here and page scroll is ignored. */
  pinned: null as number | null,
};

/** Time constant of the scroll easing (seconds). */
const EASE_SECONDS = 0.12;

type FrameListener = (current: number) => void;
const listeners = new Set<FrameListener>();

/** Subscribe to per-frame progress updates (only fires when the value changes). */
export function onScrollFrame(cb: FrameListener): () => void {
  listeners.add(cb);
  cb(scrollState.current);
  return () => {
    listeners.delete(cb);
  };
}

const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

function readTarget() {
  if (scrollState.pinned !== null) {
    scrollState.target = scrollState.pinned;
    return;
  }
  scrollState.target = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
}

/** Starts listening to page scroll and the easing loop. Returns a cleanup function. */
export function startScrollLoop(): () => void {
  readTarget();
  scrollState.current = scrollState.target;

  let raf = 0;
  let last = performance.now();
  // Not NaN: |x − NaN| > ε is always false, which would skip the first emit (e.g. reload mid-page).
  let lastEmitted = -1;

  const tick = (now: number) => {
    const delta = Math.min(0.1, (now - last) / 1000);
    last = now;

    if (scrollState.reducedMotion) {
      scrollState.current = scrollState.target;
    } else {
      // Frame-rate independent exponential ease (no three/maath in the initial bundle).
      scrollState.current +=
        (scrollState.target - scrollState.current) * (1 - Math.exp(-delta / EASE_SECONDS));
    }

    if (Math.abs(scrollState.current - lastEmitted) > 1e-5) {
      lastEmitted = scrollState.current;

      // Zone first, and isolate listeners, so one failing subscriber can't freeze the HUD.
      const zone = zoneFromScroll(scrollState.current).id;
      const store = useAppStore.getState();
      if (store.activeZone !== zone || !store.scrollReady) store.setActiveZone(zone);
      listeners.forEach((cb) => {
        try {
          cb(scrollState.current);
        } catch (err) {
          console.error("scroll listener failed", err);
        }
      });
    }

    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  window.addEventListener("scroll", readTarget, { passive: true });
  window.addEventListener("resize", readTarget);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", readTarget);
    window.removeEventListener("resize", readTarget);
  };
}

/** Smooth-scroll the page to a 0→1 progress value. */
export function scrollToProgress(p: number) {
  window.scrollTo({
    top: Math.min(1, Math.max(0, p)) * maxScroll(),
    behavior: scrollState.reducedMotion ? "auto" : "smooth",
  });
}
