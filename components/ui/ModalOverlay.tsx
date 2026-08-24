"use client";

import { ModalPortal } from "./ModalPortal";

/**
 * The full-screen backdrop every dialog in the app sits on. Always portalled to
 * <body> (see <ModalPortal>) so a transformed ancestor can't shrink the overlay
 * down to the page content box.
 */
export function ModalOverlay({
  labelledBy,
  children,
}: {
  /** id of the dialog's heading; omit only when the dialog has no heading. */
  labelledBy?: string;
  children: React.ReactNode;
}) {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </ModalPortal>
  );
}
