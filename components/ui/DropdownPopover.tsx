"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { createPortal } from "react-dom";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import "./dropdown.css";

type SurfaceProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition"> & { placement?: "top" | "bottom" };
export type DropdownPopoverProps = SurfaceProps & {
  open: boolean;
  /** Render outside clipping containers; supply fixed coordinates via style. */
  portal?: boolean;
};

const AnimatedSurface = forwardRef<HTMLDivElement, SurfaceProps>(function AnimatedSurface({ children, className = "", style, placement, ...props }, ref) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const menu = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => menu.current!);
  useLayoutEffect(() => {
    if (menu.current) menu.current.inert = !present;
  }, [present]);

  return <motion.div
    {...props}
    className={`ui-dropdown-menu ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.14, ease: "easeOut" }}
    aria-hidden={!present || props["aria-hidden"]}
    data-placement={placement}
    data-exiting={!present || undefined}
    data-reduced-motion={reducedMotion || undefined}
    ref={menu}
    style={{ ...style, pointerEvents: present ? style?.pointerEvents : "none" }}
  >{children}</motion.div>;
});

/** Shared dropdown surface for selectable options or a custom menu layout. */
export const DropdownPopover = forwardRef<HTMLDivElement, DropdownPopoverProps>(function DropdownPopover({ open, portal = false, className = "", ...props }, ref) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (portal) setMounted(true); }, [portal]);
  const content = <AnimatePresence>{open && <AnimatedSurface key="menu" {...props} ref={ref} className={`${portal ? "ui-dropdown-menu--portal " : ""}${className}`} />}</AnimatePresence>;
  return portal ? (mounted ? createPortal(content, document.body) : null) : content;
});
