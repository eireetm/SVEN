import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD07 (Swordcraft deck; its other cards are reprints). V1 is 1c 2/2 (Neutral). BP02-025 Jeno, Levin Vanguard is a Levin card.
// BP02-054 Dragonsong Flute (act with Overflow: engage, discard a card) discards cards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("SD07", () => {
  it("012 レヴィオンアックス・ジェノ — discarded from your hand: may take a Levin card from the top; Storm with 5 Levin cards in the cemetery", () => {
    const t = d({ me: { field: ["BP02-054"], hand: ["SD07-012"], deck: ["BP02-025", "V1"], maxPlayPoints: 7 } }).activate("BP02-054").flush();
    expect(t.pick("BP02-025").hand()).toEqual(["BP02-025"]);
    const s = d({ me: { hand: ["SD07-012"], cemetery: n(5, "BP02-025"), playPoints: 2 } }).play("SD07-012");
    expect([s.keywords("SD07-012"), s.attackTargets("SD07-012")]).toEqual([["storm"], ["opp:leader"]]);
    expect(d({ me: { hand: ["SD07-012"], cemetery: n(4, "BP02-025"), playPoints: 2 } }).play("SD07-012").keywords("SD07-012")).toEqual([]);
  });
});
