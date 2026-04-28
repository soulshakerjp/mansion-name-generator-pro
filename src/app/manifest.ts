import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "マンション名ジェネレーター Pro",
    short_name: "マンション名Pro",
    description:
      "投資用一棟アパート・マンション向けに、由来のある斬新なネーミング候補を生成する実務特化アプリ。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/mansion-name-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/mansion-name-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/mansion-name-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
