"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { createPortal } from "react-dom";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import "./dropdown.css";

type SurfaceProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition"> & { placement?: "top" | "bottom" };
export type DropdownPopoverProps = SurfaceProps & {
  open: boolean;
  /** Render outside clipping containers; supply fixed coordinates via style. */
  portal?: boolean;
};

const AnimatedSurface = forwardRef<HTMLDivElement, SurfaceProps & { open: boolean }>(function AnimatedSurface({ children, className = "", style, placement, open, ...props }, ref) {
  const reducedMotion = useReducedMotion();
  const menu = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => menu.current!, []);
  useLayoutEffect(() => {
    if (menu.current) menu.current.inert = !open;
  }, [open]);

  return <motion.div
    {...props}
    className={`ui-dropdown-menu ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: open ? 1 : 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.14, ease: "easeOut" }}
    aria-hidden={!open || props["aria-hidden"]}
    data-open={open}
    data-placement={placement}
    data-exiting={!open || undefined}
    data-reduced-motion={reducedMotion || undefined}
    ref={menu}
    style={{ ...style, pointerEvents: open ? style?.pointerEvents : "none" }}
  >{children}</motion.div>;
});

/** Shared dropdown surface for selectable options or a custom menu layout. */
export const DropdownPopover = forwardRef<HTMLDivElement, DropdownPopoverProps>(function DropdownPopover({ open, portal = false, className = "", ...props }, ref) {
  const [mounted, setMounted] = useState(false);
  const [hasOpened, setHasOpened] = useState(open);
  // Retain one surface after first use. Rapid reopen reverses the same animation
  // rather than competing with an exiting portal and its ref cleanup.
  if (open && !hasOpened) setHasOpened(true);
  useEffect(() => { if (portal) setMounted(true); }, [portal]);
  const content = hasOpened ? <AnimatedSurface {...props} open={open} ref={ref} className={`${portal ? "ui-dropdown-menu--portal " : ""}${className}`} /> : null;
  return portal ? (mounted ? createPortal(content, document.body) : null) : content;
});
