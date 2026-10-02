import { describe, expect, it } from "vitest";
import { scriptHasEarthRite } from "../../src/engine/query";
import { ALL_CARDS, ALL_SCRIPTS } from "../../src/sets";

// "A card with Earth Rite" (CR 13.3.3; BP03-054, BP08-049, BP14-038 and BP21-040 look for one) is a card whose own text has
// Earth Rite, however its script writes it: an ability's or a mode's Earth Rite cost, or a play option whose process is Earth
// Rite (BP22-039 "When playing this card, Earth Rite (9): this costs 1"). Checked against the Japanese text of every card:
// a 【土の秘術】 of its own counts, one it only mentions doesn't ("【土の秘術】を持つ" a card with it, "【土の秘術】によって" by
// your Earth Rite), nor one of a token it describes after the "―――" line.

/** Whether a Japanese card text gives the card Earth Rite of its own. */
function ownsEarthRite(ja: string): boolean {
  const own = ja.split(/\n[―]{3,}\n/)[0]!;
  return /【土の秘術[^】]*】(?!を持つ|によって)/.test(own);
}

describe("a card with Earth Rite", () => {
  it("is every card whose own text has Earth Rite, and no other, by its script", () => {
    const wrong = ALL_CARDS.filter((card) => card.text.ja && scriptHasEarthRite(ALL_SCRIPTS[card.id]) !== ownsEarthRite(card.text.ja)).map(
      (card) => `${card.id} script ${scriptHasEarthRite(ALL_SCRIPTS[card.id])}`,
    );
    expect(wrong).toEqual([]);
    // Each way a script writes it: an ability's cost, a mode's, a play option's.
    expect(["BP01-051", "BP10-050", "BP22-039"].map((id) => scriptHasEarthRite(ALL_SCRIPTS[id]))).toEqual([true, true, true]);
    // Cards that only look for one, or count Stack removed by Earth Rite.
    expect(["BP03-054", "BP08-049", "BP14-038", "BP14-037"].map((id) => scriptHasEarthRite(ALL_SCRIPTS[id]))).toEqual([false, false, false, false]);
  });
});
