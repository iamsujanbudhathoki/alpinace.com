"use client";

import BiggerPicture from "bigger-picture";

export interface LightboxMediaItem {
  img?: string;
  thumb?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  element?: HTMLElement | EventTarget;
  iframe?: string;
}

let bpInstance: any = null;

export function getLightbox() {
  if (typeof window === "undefined") return null;
  if (!bpInstance) {
    bpInstance = BiggerPicture({
      target: document.body,
    });
  }
  return bpInstance;
}

export function openLightbox({
  items,
  position = 0,
  el,
  scale = 0.96,
  intro = "fadeup",
}: {
  items: LightboxMediaItem[];
  position?: number;
  el?: HTMLElement | EventTarget;
  scale?: number;
  intro?: string;
}) {
  const bp = getLightbox();
  if (!bp) return;

  const validItems = items.filter((item) => item.img || item.iframe);
  if (validItems.length === 0) return;

  const formattedItems = validItems.map((item) => ({
    img: item.img,
    thumb: item.thumb || item.img,
    alt: item.alt || "AlpineAce Media",
    caption: item.caption || item.alt,
    width: item.width || 2560,
    height: item.height || 1700,
    element: item.element,
    iframe: item.iframe,
  }));

  bp.open({
    items: formattedItems,
    position: Math.min(position, formattedItems.length - 1),
    el,
    scale,
    intro,
  });
}

export function openSingleImage(
  url: string,
  alt = "AlpineAce Image Preview",
  el?: HTMLElement | EventTarget,
  caption?: string
) {
  if (!url) return;
  openLightbox({
    items: [
      {
        img: url,
        thumb: url,
        alt,
        caption: caption || alt,
        element: el,
      },
    ],
    position: 0,
    el,
  });
}
