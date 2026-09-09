"use client";
import { useState } from "react";

type Props = {
  src: string;
  className?: string;
};

// Image with graceful failure: removes itself when the source 404s,
// mirroring the previous inline onError={() => hide} pattern but safe
// to render from Server Components (event handlers can't live there
// once a Client Component enters the same tree).
export default function FaviconImg({ src, className }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img src={src} alt="" className={className} onError={() => setFailed(true)} />
  );
}