import { describe, expect, it } from "vitest";
import { goBack, pushBack } from "../src/app/back";
import { computeLayout, MAT_BOX_HEIGHT, WIDE_WIDTH } from "../src/game/board/layout";
import { mergeResources } from "../src/host/bundled";
import { resourcePathInZip } from "../src/host/zip-paths";

// The Android app: where the files of an imported zip go, the resources built into a release, the back
// button, the table on a phone.

describe("importing resources from a zip", () => {
  it("puts the resource folders into public/, however the zip holds them, and nothing else", () => {
    // The folders themselves, a "public" folder with them, or one folder around either.
    expect(resourcePathInZip("images/cards/BP01-001.png")).toBe("images/cards/BP01-001.png");
    expect(resourcePathInZip("public/audio/bgm/menu.mp3")).toBe("audio/bgm/menu.mp3");
    expect(resourcePathInZip("MyPack/textures/board/field.png")).toBe("textures/board/field.png");
    expect(resourcePathInZip("MyPack/public/fonts/a.woff2")).toBe("fonts/a.woff2");
    expect(resourcePathInZip("theme.css")).toBe("theme.css");
    expect(resourcePathInZip("MyPack/theme.css")).toBe("theme.css");
    expect(resourcePathInZip("images\\backs\\default.png")).toBe("images/backs/default.png");
    // Not resources: folders, other files, hidden files, macOS copies, climbing out, two folders deep around them.
    for (const name of ["images/", "readme.txt", "MyPack/readme.txt", "images/.DS_Store", "__MACOSX/images/cards/a.png", "../images/cards/a.png", "images/../../x.png", "A/B/images/cards/a.png", "images"]) {
      expect(resourcePathInZip(name)).toBeNull();
    }
  });
});

describe("resources built into the app", () => {
  it("are used where the player has no file of the same name in the same folder, whatever its type", () => {
    const own = ["images/cards/BP01-001.png", "textures/menu/background_m.jpg", "theme.css"];
    const bundled = ["audio/bgm/menu.wav", "images/cards/BP01-001.webp", "images/cards/BP01-002.webp", "textures/menu/background_m.png"];
    expect(mergeResources(own, bundled)).toEqual([
      "audio/bgm/menu.wav",
      "images/cards/BP01-001.png",
      "images/cards/BP01-002.webp",
      "textures/menu/background_m.jpg",
      "theme.css",
    ]);
    // None built in (a plain build), or no files of the player's.
    expect(mergeResources(own, [])).toEqual([...own].sort());
    expect(mergeResources([], bundled)).toEqual([...bundled].sort());
  });
});

describe("the back button", () => {
  it("closes what was opened last and still is, else says there was nothing", () => {
    const closed: string[] = [];
    const removeScreen = pushBack(() => closed.push("screen"));
    const removeDrawer = pushBack(() => closed.push("drawer"));
    const removeMenu = pushBack(() => closed.push("menu"));
    removeMenu(); // closed another way (a click elsewhere)
    expect(goBack()).toBe(true);
    removeDrawer();
    expect(goBack()).toBe(true);
    removeScreen();
    expect(goBack()).toBe(false);
    expect(closed).toEqual(["drawer", "screen"]);
  });
});

describe("the table on a phone held sideways", () => {
  it("gives the mats the height, and puts your hand beside your mat", () => {
    for (const [width, height] of [
      [915, 412],
      [800, 360],
      [740, 360],
      [932, 430],
    ] as const) {
      const l = computeLayout(width, height);
      expect(l.compact).toBe(true);
      expect(l.matWidth / l.matHeight).toBeCloseTo(WIDE_WIDTH / MAT_BOX_HEIGHT, 5);
      // The opponent's hand strip and the two mats fill the height; your hand is not under them.
      expect(l.opponentHandHeight + 2 * l.matHeight).toBeLessThanOrEqual(height);
      expect(l.opponentHandHeight + 2 * l.matHeight).toBeGreaterThan(height * 0.9);
      // The mats and the room on both sides fit the width; your hand fits its side, its cards larger than the mat's.
      expect(l.matWidth + 2 * l.sideWidth).toBeLessThanOrEqual(width);
      expect(l.handCardWidth).toBeLessThanOrEqual(l.handWidth);
      expect(l.handCardWidth).toBeGreaterThanOrEqual(l.cardWidth);
      expect(l.handHeight).toBeLessThan(height / 2);
    }
    // A tablet or a computer keeps the usual layout.
    expect(computeLayout(1280, 800).compact).toBe(false);
  });
});
