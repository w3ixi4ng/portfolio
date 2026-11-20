"use client";

import { Html } from "@react-three/drei";
import type { MutableRefObject, ReactNode } from "react";
import { worldHtmlLayer } from "./worldHtmlLayer";

interface WorldHtmlProps {
  position: [number, number, number];
  /** Hide without unmounting (unmounting drei <Html> mid-render makes React warn). */
  visible?: boolean;
  children: ReactNode;
}

/**
 * Real HTML pinned to a point in the 3D world (signs, speech bubbles). Keeps text
 * selectable, keyboard-focusable and readable by screen readers (CLAUDE.md §8).
 * Bottom-anchored: the label sits *above* `position` (a sign's pole or a bubble's tail
 * touches the point), so it never covers the thing it labels.
 */
export function WorldHtml({ position, visible = true, children }: WorldHtmlProps) {
  return (
    <Html
      position={position}
      portal={worldHtmlLayer as MutableRefObject<HTMLElement>}
      zIndexRange={[5, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div
        aria-hidden={!visible}
        inert={!visible}
        className="transition-opacity duration-300"
        style={{
          transform: "translate(-50%, -100%)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          width: "max-content",
        }}
      >
        {children}
      </div>
    </Html>
  );
}
