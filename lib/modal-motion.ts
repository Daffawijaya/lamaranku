type Size = { width: number; height: number };
type ClosingModal = {
  element: HTMLDialogElement;
  previous: HTMLElement | null;
  overflow: string;
  dispose: (restore: boolean) => void;
};

let closing: ClosingModal | null = null;
const easing = "cubic-bezier(.22, 1, .36, 1)";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Animate native dialogs without giving up their focus trap or top-layer backdrop. */
export function mountModal(dialog: HTMLDialogElement) {
  const outgoing = closing;
  const from = outgoing?.element.getBoundingClientRect();
  const previous = outgoing?.previous ?? document.activeElement as HTMLElement | null;
  const overflow = outgoing?.overflow ?? document.body.style.overflow;
  outgoing?.dispose(false);
  document.body.style.overflow = "hidden";
  dialog.showModal();

  let disposed = false;
  let animation: Animation | undefined;
  let contentAnimations: Animation[] = [];
  let lastSize: Size = { width: dialog.offsetWidth, height: dialog.offsetHeight };
  const resize = (start: Size, target: Size) => {
    animation?.cancel();
    lastSize = target;
    animation = dialog.animate([
      { width: `${start.width}px`, height: `${start.height}px` },
      { width: `${target.width}px`, height: `${target.height}px` },
    ], { duration: 440, easing });
    void animation.finished.then(() => { if (!disposed) measure(); }).catch(() => {});
  };
  const measure = () => {
    if (disposed || animation?.playState === "running") return;
    const target = { width: dialog.offsetWidth, height: dialog.offsetHeight };
    if (Math.abs(target.width - lastSize.width) < 2 && Math.abs(target.height - lastSize.height) < 2) return;
    if (reducedMotion()) { lastSize = target; return; }
    resize(lastSize, target);
  };
  if (!reducedMotion()) {
    if (from) {
      resize(from, lastSize);
      // Fade new content independently so changing the surface size never stretches its text.
      const content = Array.from(dialog.children).filter(child => child.matches("header,.help-modal-body,.help-modal-actions"));
      contentAnimations = content.map(child => child.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: 280, delay: 80, fill: "backwards", easing }));
    } else {
      dialog.dataset.modalEntering = "true";
      animation = dialog.animate([{ opacity: 0, transform: "translateY(10px) scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 340, easing });
      void animation.finished.then(() => { delete dialog.dataset.modalEntering; measure(); }).catch(() => {});
    }
  }
  const observer = new ResizeObserver(measure);
  observer.observe(dialog);

  return () => {
    disposed = true;
    observer.disconnect();
    const rect = dialog.getBoundingClientRect();
    const opacity = getComputedStyle(dialog).opacity;
    // React can remove a dialog immediately. Keep a non-interactive visual copy only for its exit.
    const copy = dialog.cloneNode(true) as HTMLDialogElement;
    copy.removeAttribute("open");
    copy.removeAttribute("id");
    copy.removeAttribute("aria-labelledby");
    copy.removeAttribute("aria-busy");
    copy.removeAttribute("data-modal-entering");
    copy.setAttribute("aria-hidden", "true");
    for (const child of Array.from(copy.children)) (child as HTMLElement).inert = true;
    for (const child of Array.from(copy.querySelectorAll("[id]"))) child.removeAttribute("id");
    copy.addEventListener("cancel", event => event.preventDefault());
    const computed = getComputedStyle(dialog);
    for (const property of Array.from(computed)) if (property.startsWith("--appearance-")) copy.style.setProperty(property, computed.getPropertyValue(property));
    copy.style.width = `${rect.width}px`;
    copy.style.height = `${rect.height}px`;
    animation?.cancel(); contentAnimations.forEach(item => item.cancel());
    dialog.close();
    (dialog.closest("[data-dashboard-ui]") ?? document.body).append(copy);
    copy.showModal();
    let frame = 0, exit: Animation | undefined, removed = false;
    const snapshot: ClosingModal = {
      element: copy, previous, overflow,
      dispose(restore) {
        if (removed) return;
        removed = true;
        cancelAnimationFrame(frame); exit?.cancel(); copy.close(); copy.remove();
        if (closing === snapshot) closing = null;
        if (restore) {
          document.body.style.overflow = overflow;
          if (previous?.isConnected) previous.focus({ preventScroll: true });
        }
      },
    };
    closing = snapshot;
    // A successor mounted in this React commit takes over the current surface dimensions.
    frame = requestAnimationFrame(() => {
      if (reducedMotion()) { snapshot.dispose(true); return; }
      copy.dataset.modalExiting = "true";
      exit = copy.animate([{ opacity, transform: "none" }, { opacity: 0, transform: "translateY(6px) scale(.97)" }], { duration: 190, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "forwards" });
      void exit.finished.then(() => snapshot.dispose(true)).catch(() => {});
    });
  };
}
