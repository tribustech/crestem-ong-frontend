"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Renders modal overlays into `document.body` instead of leaving them where
 * they are declared in the tree.
 *
 * `position: fixed` is only viewport-relative while no ancestor establishes a
 * containing block. Any ancestor with a transform (including one that merely
 * has a filling transform animation, like <PageTransition>) makes `inset-0`
 * resolve against that ancestor's box, which shrink-wraps the overlay to the
 * page content — the backdrop covers only part of the screen and the dialog
 * gets centered on the content box instead of the viewport, so it can sit
 * partly off-screen. Portalling to <body> makes the overlay immune to whatever
 * the page happens to render above it.
 *
 * `document` doesn't exist during SSR, so the server snapshot renders nothing
 * and the portal only appears once React has hydrated.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
