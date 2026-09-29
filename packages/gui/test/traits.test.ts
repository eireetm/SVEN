import { ALL_CARDS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import { TRAIT_NAMES, traitName, traitNames } from "../src/app/traits";
import { NO_FILTERS, filterPool } from "../src/decks/filters";

// Trait names in English and Chinese for the Core's Japanese traits (display and search only).

describe("trait names", () => {
  it("has an English and a Chinese name for every trait of the card pool (a new set's traits go into app/traits.ts)", () => {
    const traits = new Set(ALL_CARDS.flatMap((c) => c.traits));
    const missing = [...traits].filter((t) => !TRAIT_NAMES[t]?.en || !TRAIT_NAMES[t]?.cn);
    expect(missing).toEqual([]);
  });

  it("names a trait in each card language, and keeps an unknown one as it is", () => {
    expect(traitName("獣", "en")).toBe("Beast");
    expect(traitName("獣", "cn")).toBe("野兽");
    expect(traitName("獣", "ja")).toBe("獣");
    expect(traitName("新しい種族", "en")).toBe("新しい種族");
    expect(traitNames("兵士")).toEqual(["兵士", "Officer", "士兵"]);
  });

  it("lets the pool's trait filter match any language", () => {
    const byTrait = (trait: string) => filterPool(ALL_CARDS, { ...NO_FILTERS, trait }).map((c) => c.id);
    const beasts = byTrait("獣");
    expect(beasts.length).toBeGreaterThan(50);
    expect(byTrait("beast")).toEqual(beasts);
    expect(byTrait("野兽")).toEqual(beasts);
  });
});
