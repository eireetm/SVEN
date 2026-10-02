// This program's version (packages/gui/package.json, put in by vite.config.ts) and platform. Players compare them when they
// can't play together online: both need the same version; the PC program and the Android and iOS apps of one version
// play together.

declare const __APP_VERSION__: string;

/** The version ("0.2.1"); "dev" where the build didn't put one in (tests). */
export const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

export type Platform = "pc" | "android" | "ios";

/** The Android or iOS app (vite --mode android / ios), or a computer's browser. */
export const PLATFORM: Platform = import.meta.env.MODE === "android" ? "android" : import.meta.env.MODE === "ios" ? "ios" : "pc";
