import { afterEach, describe, expect, it } from "vitest";
import { battleImageUrl, builderImageUrl, menuImageUrl, setResourceLists } from "../src/resources/lookup";

// Where the three background pictures come from: the player's files in public/textures/menu/ first, then the Misc images
// of the assets folder. Missing, the deck builder's falls back to the main menu's picture; the others to the built-in
// colors.

afterEach(() => setResourceLists([], []));

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
