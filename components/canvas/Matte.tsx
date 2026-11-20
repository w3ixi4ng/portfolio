"use client";

interface MatteProps {
  color: string;
  side?: 0 | 1 | 2;
  /** 0.6–0.9 per design/STYLE.md §4; plastics/tiles can go lower for a soft sheen. */
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * Shared soft matte material for code-built props (design/STYLE.md §4): no toon ramp,
 * no outlines, so they sit next to KayKit models.
 */
export function Matte({ color, side, roughness = 0.8, transparent, opacity }: MatteProps) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      side={side}
      transparent={transparent}
      opacity={opacity}
    />
  );
}
