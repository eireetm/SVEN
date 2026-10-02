// This program's version (packages/gui/package.json, put in by vite.config.ts) and platform. Players compare them when they
// can't play together online: both need the same version; the PC program and the Android app of one version play together.

declare const __APP_VERSION__: string;

/** The version ("0.2.1"); "dev" where the build didn't put one in (tests). */
export const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

export type Platform = "pc" | "android";

/** The Android app (vite --mode android), or a computer's browser. */
export const PLATFORM: Platform = import.meta.env.MODE === "android" ? "android" : "pc";
