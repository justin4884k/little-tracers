import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Tracers",
    short_name: "Little Tracers",
    description:
      "A free, magical handwriting adventure for children ages 3–6. Trace letters, numbers, and shapes across five joyful worlds.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fff9f0",
    theme_color: "#7dd3fc",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
