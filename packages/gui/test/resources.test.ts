import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findCardArt, ownCardArt } from "../host/resources";
import {
  battleImageUrl,
  builderImageUrl,
  cardBackUrl,
  evolveBackUrl,
  menuImageUrl,
  ownCardArtUrl,
  setResourceLists,
} from "../src/resources/lookup";

// Where the three background pictures come from: the player's files in public/textures/menu/ first, then the Misc images
// of the assets folder. Missing, the deck builder's falls back to the main menu's picture; the others to the built-in
// colors.

let dir: string | null = null;
afterEach(() => {
  setResourceLists([], []);
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

describe("background pictures", () => {
  it("come from the player's files first, then from the assets' Misc folder", () => {
    setResourceLists(
      ["textures/menu/background_m.png", "textures/menu/background_d.jpg", "textures/menu/background_f.webp"],
      ["background_m", "background_d", "background_f", "field"],
    );
    expect(menuImageUrl()).toBe("/textures/menu/background_m.png");
    expect(builderImageUrl()).toBe("/textures/menu/background_d.jpg");
    expect(battleImageUrl()).toBe("/textures/menu/background_f.webp");

    setResourceLists([], ["background_m", "background_d", "background_f", "field"]);
    expect(menuImageUrl()).toBe("/api/misc/background_m");
    expect(builderImageUrl()).toBe("/api/misc/background_d");
    expect(battleImageUrl()).toBe("/api/misc/background_f");
  });

  it("fall back: the deck builder to the main menu's picture, the others to none (not to the playmat)", () => {
    setResourceLists(["textures/menu/background_m.png"], ["field"]);
    expect(builderImageUrl()).toBe("/textures/menu/background_m.png");
    expect(battleImageUrl()).toBeNull();

    setResourceLists([], ["field", "back", "unknown"]);
    expect(menuImageUrl()).toBeNull();
    expect(builderImageUrl()).toBeNull();
    expect(battleImageUrl()).toBeNull();
  });
});

describe("card backs", () => {
  it("give the evolve deck its own back (public/images/backs/evolve, Misc/back_e), else the main deck's", () => {
    setResourceLists(["images/backs/default.png", "images/backs/evolve.png"], ["back", "back_e"]);
    expect(cardBackUrl()).toBe("/images/backs/default.png");
    expect(evolveBackUrl()).toBe("/images/backs/evolve.png");

    setResourceLists([], ["back", "back_e"]);
    expect(cardBackUrl()).toBe("/api/misc/back");
    expect(evolveBackUrl()).toBe("/api/misc/back_e");

    setResourceLists([], ["back"]);
    expect(evolveBackUrl()).toBe("/api/misc/back");
    setResourceLists([], []);
    expect(evolveBackUrl()).toBeNull();
  });
});

// Card images by printing number, also the leaders' printings with a circled S (BP03-LDⓈ01), which may be written with a
// plain S as well: the local servers (host/resources.ts) and the Android app (the list of public/ files).
describe("card images", () => {
  it("are found by the local servers, a circled S as it is or as a plain S", () => {
    dir = mkdtempSync(join(tmpdir(), "sve-art-"));
    const cards = join(dir, "public", "images", "cards");
    mkdirSync(cards, { recursive: true });
    mkdirSync(join(dir, "assets", "BP06-LDⓈ01"), { recursive: true });
    for (const file of ["BP03-LDⓈ01.webp", "BP04-LDS01.png", "BP09-005_back.png"]) writeFileSync(join(cards, file), "");
    writeFileSync(join(dir, "assets", "BP06-LDⓈ01", "BP06-LDⓈ01.webp"), "");
    expect(ownCardArt(join(dir, "public"), "BP03-LDⓈ01", "BP03-LD01")).toBe(join(cards, "BP03-LDⓈ01.webp"));
    expect(ownCardArt(join(dir, "public"), "BP04-LDⓈ01", "BP04-LD01")).toBe(join(cards, "BP04-LDS01.png"));
    expect(ownCardArt(join(dir, "public"), "BP09-005", "BP09-005_back", true)).toBe(join(cards, "BP09-005_back.png"));
    expect(ownCardArt(join(dir, "public"), "BP06-LDⓈ01", "BP06-LD01")).toBeNull();
    const cfg = { root: dir, publicDir: join(dir, "public"), decksDir: "", replaysDir: "", assetsDir: join(dir, "assets"), miscDir: "" };
    expect(findCardArt(cfg, "BP06-LDⓈ01", "BP06-LD01")).toBe(join(dir, "assets", "BP06-LDⓈ01", "BP06-LDⓈ01.webp"));
    expect(findCardArt(cfg, "../BP06-LDⓈ01", null)).toBeNull();
  });

  it("are found in the Android app's files the same way", () => {
    setResourceLists(["images/cards/BP03-LDⓈ01.webp", "images/cards/BP04-LDS01.png"], []);
    expect(ownCardArtUrl("BP03-LDⓈ01", "BP03-LD01")).toBe("/images/cards/BP03-LD%E2%93%8801.webp");
    expect(ownCardArtUrl("BP04-LDⓈ01", "BP04-LD01")).toBe("/images/cards/BP04-LDS01.png");
    expect(ownCardArtUrl("BP06-LDⓈ01", "BP06-LD01")).toBeNull();
  });
});
