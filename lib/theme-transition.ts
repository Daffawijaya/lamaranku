import { flushSync } from "react-dom";

let activeTransition: { skipTransition(): void } | undefined;

/** Capture the old palette before React renders the new one. */
export function transitionTheme(update: () => void, reduceMotion: boolean) {
  const themeDocument = document as Document & {
    startViewTransition?: (callback: () => void) => { skipTransition(): void; finished: Promise<void> };
  };
  if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !themeDocument.startViewTransition) {
    update();
    return;
  }
  activeTransition?.skipTransition();
  const transition = themeDocument.startViewTransition(() => flushSync(update));
  activeTransition = transition;
  void transition.finished.catch(() => {}).finally(() => {
    if (activeTransition === transition) activeTransition = undefined;
  });
}
