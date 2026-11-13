import Image from "next/image";
import type { CSSProperties } from "react";
import frames from "@/data/frames.json";

type FrameCropProps = {
  /** 1-based frame number from the desktop set. */
  frame: number;
  /** Point of interest in the frame, in % of its width / height. */
  focusX: number;
  focusY: number;
  /** Extra magnification around the focus point (1 = plain cover crop). */
  zoom?: number;
  alt: string;
  className?: string;
  imageStyle?: CSSProperties;
};

export function frameSrc(frame: number) {
  return frames.pattern.replace("{n}", String(frame).padStart(frames.pad, "0"));
}

/**
 * A detail crop of an existing frame, so no new imagery is needed.
 * `object-position: X% Y%` puts image point (X, Y) at box point (X, Y); scaling around that
 * same point then zooms in on it without ever exposing an empty edge.
 * `unoptimized` serves the original WebP, which shares the browser cache with the canvas preload.
 */
export function FrameCrop({ frame, focusX, focusY, zoom = 1, alt, className, imageStyle }: FrameCropProps) {
  const origin = `${focusX}% ${focusY}%`;
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={frameSrc(frame)}
        alt={alt}
        fill
        unoptimized
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
        style={{ objectPosition: origin, transformOrigin: origin, transform: `scale(${zoom})`, ...imageStyle }}
      />
    </div>
  );
}
