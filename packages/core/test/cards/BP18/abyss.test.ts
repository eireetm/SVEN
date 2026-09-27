import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Abysscraft (077–096, T07). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of
// your followers. Vampire cards: BP17-085, BP18-080 Vania. 2-cost Togh Keyoh followers: BP18-005 (no Fanfare), BP18-079
// Vedd (a Demon). BP18-085 is a 2-cost Togh Keyoh spell. Tokens: BP01-T15 Forest Bat, BP18-T07 Diurnal Slumber.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BAT = "BP01-T15";
const SLUMBER = "BP18-T07";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP18 Abysscraft", () => {
  it("077 / 078 Ilze & Urze, Centennial Reapers — Fanfare: bury the top 2; evolved: a 2-cost Abysscraft or Togh Keyoh card from the top 5 into the EX area, 2 less; super-evolved: a Diurnal Slumber", () => {
    expect(d({ me: { hand: ["BP18-077"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP18-077").cemetery()).toEqual(["V1", "V3"]);
    const t = d({ me: { field: ["BP18-077"], evolveDeck: ["BP18-078"], deck: ["V3", "BP18-085", "V1"], cemetery: ["BP18-005"], playPoints: 1, ...SUPER } });
    t.evolve("BP18-077", { sep: true }).flush().pick("BP18-085").order().flush();
    expect([t.ex(), t.pp(), t.canPlay("BP18-085@ex")]).toEqual([["BP18-085", SLUMBER], 0, true]);
  });

  it("079 Vedd, Burial Wolf — Fanfare: discard a 2-cost card to draw, else bury this; act (0) once per turn with ten 2-cost cards in the cemetery: 3 damage", () => {
    const t = d({ me: { hand: ["BP18-079", "V2"], deck: ["V1"], playPoints: 2 } }).play("BP18-079").pick("V2");
    expect([t.hand(), t.field()]).toEqual([["V1"], ["BP18-079"]]);
    expect(d({ me: { hand: ["BP18-079"], playPoints: 2 } }).play("BP18-079").cemetery()).toEqual(["BP18-079"]);
    const act = d({ me: { field: ["BP18-079"], cemetery: n(10, "V2") }, opp: { field: ["V5"] } }).activate("BP18-079").pick("opp:V5");
    expect([act.stats("opp:V5"), act.canActivate("BP18-079")]).toEqual([[5, 2], false]);
    expect(d({ me: { field: ["BP18-079"], cemetery: n(9, "V2") } }).canActivate("BP18-079")).toBe(false);
  });

  it("080 / 081 Vania, Crimson Majesty — Fanfare, discard a Vampire card: a Forest Bat into the EX area and draw; evolved: 2 damage; super-evolved: Forest Bats have Storm and Bane", () => {
    const t = d({ me: { hand: ["BP18-080", "BP17-085"], deck: ["V1"], playPoints: 2 } }).play("BP18-080").yes();
    expect([t.ex(), t.hand()]).toEqual([[BAT], ["V1"]]);
    const s = d({ me: { field: ["BP18-080", BAT], evolveDeck: ["BP18-081"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP18-080", { sep: true }).flush();
    expect([s.stats("opp:V5"), s.keywords(BAT)]).toEqual([[5, 3], ["storm", "bane"]]);
    const e = d({ me: { field: ["BP18-080", BAT], evolveDeck: ["BP18-081"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-080");
    expect(e.keywords(BAT)).toEqual([]);
  });

  it("082 / 083 Covetous Serpent — act, engage and reveal two 2-cost cards: 4 damage; evolved: Storm, refresh this", () => {
    const t = d({ me: { field: ["BP18-082"], hand: ["V2", "BP18-079"] }, opp: { field: ["V5"] } }).activate("BP18-082");
    expect([t.stats("opp:V5"), t.engaged("BP18-082")]).toEqual([[5, 1], true]);
    const e = d({ me: { field: [{ card: "BP18-082", engaged: true }], evolveDeck: ["BP18-083"], playPoints: 5 } }).evolve("BP18-082");
    expect([e.engaged("BP18-082"), e.keywords("BP18-082")]).toEqual([false, ["storm"]]);
  });

  it("084 Veight, Twilit Highborn — Fanfare: a Vampire card from the top 3, a Forest Bat if it's a Vania follower; act (0) with 5 Vampire cards: Forest Bats +1/+1", () => {
    const t = d({ me: { hand: ["BP18-084"], deck: ["BP18-080", "V1", "V3"], playPoints: 2 } }).play("BP18-084").pick("BP18-080").order();
    expect([t.hand(), t.field()]).toEqual([["BP18-080"], ["BP18-084", BAT]]);
    const act = d({ me: { field: ["BP18-084", BAT, BAT], cemetery: n(5, "BP17-085") } }).activate("BP18-084");
    expect([act.stats(BAT), act.canActivate("BP18-084")]).toEqual([[2, 2], false]);
  });

  it("085 Crescent Moon of Centennial Death — a 2-cost Togh Keyoh follower from the cemetery", () => {
    expect(d({ me: { hand: ["BP18-085"], cemetery: ["BP18-005", "V2"], playPoints: 2 } }).play("BP18-085").field()).toEqual(["BP18-005"]);
  });

  it("086 / 087 Exhumation Crow — Fanfare, reveal two 2-cost cards: leader +2; evolved: a Demon follower from the cemetery", () => {
    expect(d({ me: { hand: ["BP18-086", "V2", "BP18-079"], playPoints: 2 } }).play("BP18-086").yes().leader()).toBe(22);
    expect(d({ me: { field: ["BP18-086"], evolveDeck: ["BP18-087"], cemetery: ["BP18-079", "V1"], playPoints: 1 } }).evolve("BP18-086").hand()).toEqual(["BP18-079"]);
  });

  it("088 Full Moon of Centennial Demise — 1 damage to the enemy leader and followers, 2 with ten 2-cost cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP18-088"], playPoints: 2 }, opp: { field: ["V5", "V1"] } }).play("BP18-088");
    expect([t.stats("opp:V5"), t.stats("opp:V1"), t.leader("opp")]).toEqual([[5, 4], [2, 1], 19]);
    const ten = d({ me: { hand: ["BP18-088"], cemetery: n(10, "V2"), playPoints: 2 }, opp: { field: ["V5", "V1"] } }).play("BP18-088");
    expect([ten.field("opp"), ten.leader("opp")]).toEqual([["V5"], 18]);
  });

  it("089 Vampire Queen's Castle — Fanfare, discard a Vampire card: draw; act, engage and bury it: a Forest Bat (3 with a Queen Vampire follower)", () => {
    expect(d({ me: { hand: ["BP18-089", "BP17-085"], deck: ["V1"], playPoints: 1 } }).play("BP18-089").yes().hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP18-089"] } }).activate("BP18-089").field()).toEqual([BAT]);
    // SP01-032 Queen Vampire, Sultry Evening has "Queen Vampire" in its name.
    expect(d({ me: { field: ["BP18-089", "SP01-032"] } }).activate("BP18-089").field()).toEqual(["SP01-032", BAT, BAT, BAT]);
  });

  it("090 / 091 Gnawing Rat — when played, discard another 2-cost card: 1 less; Fanfare: draw; evolved: destroy", () => {
    const t = d({ me: { hand: ["BP18-090", "V2"], deck: ["V1"], playPoints: 1 } }).play("BP18-090");
    expect([t.hand(), t.cemetery(), t.pp()]).toEqual([["V1"], ["V2"], 0]);
    expect(d({ me: { hand: ["BP18-090"], playPoints: 1 } }).canPlay("BP18-090")).toBe(false);
    expect(d({ me: { field: ["BP18-090"], evolveDeck: ["BP18-091"], playPoints: 4 }, opp: { field: ["V5"] } }).evolve("BP18-090").field("opp")).toEqual([]);
  });

  it("092 / 093 Beryl, Dreameater — Fanfare: a Forest Bat into the EX area; evolved: 2 Forest Bats, damage per Forest Bat of yours", () => {
    expect(d({ me: { hand: ["BP18-092"], playPoints: 3 } }).play("BP18-092").ex()).toEqual([BAT]);
    const e = d({ me: { field: ["BP18-092", BAT], evolveDeck: ["BP18-093"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-092");
    expect([e.field(), e.stats("opp:V5")]).toEqual([["BP18-092", BAT, BAT, BAT], [5, 2]]);
  });

  it("094 Prince Catacomb — Fanfare and Last Words: a 1-cost follower from the cemetery", () => {
    expect(d({ me: { hand: ["BP18-094"], cemetery: ["V1", "V3"], playPoints: 4 } }).play("BP18-094").field()).toEqual(["BP18-094", "V1"]);
    expect(d({ me: { field: ["BP18-094"], hand: ["QUICK-SAC"], cemetery: ["V1"] } }).play("QUICK-SAC").field()).toEqual(["V1"]);
  });

  it("095 Bloodthirsty Hamster — Fanfare, (3): destroy; whenever a follower goes from the field to the cemetery: +1 attack", () => {
    const t = d({ me: { hand: ["BP18-095"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP18-095").yes();
    expect([t.field("opp"), t.stats("BP18-095")]).toEqual([[], [1, 3]]);
  });

  it("096 Nightscreech — a Vampire card on top may go to the hand; a Forest Bat, +2 attack, Rush and Assail with 5 Vampire cards", () => {
    const t = d({ me: { hand: ["BP18-096"], deck: ["BP17-085"], cemetery: n(5, "BP17-085"), playPoints: 1 } }).play("BP18-096").pick("BP17-085");
    expect([t.hand(), t.stats(BAT), t.keywords(BAT)]).toEqual([["BP17-085"], [3, 1], ["rush", "assail"]]);
    const plain = d({ me: { hand: ["BP18-096"], deck: ["V1"], playPoints: 1 } }).play("BP18-096");
    expect([plain.zone("me", "deck"), plain.stats(BAT), plain.keywords(BAT)]).toEqual([["V1"], [1, 1], []]);
  });

  it("T07 Diurnal Slumber — up to 3 differently named Togh Keyoh cards (2 or less) from the cemetery", () => {
    const t = d({ me: { ex: [SLUMBER], cemetery: ["BP18-005", "BP18-005", "BP18-079", "BP18-085"], playPoints: 1 } });
    t.play(`${SLUMBER}@ex`).pick("BP18-005").pick("BP18-079").pick("BP18-085");
    expect([t.hand(), t.cemetery()]).toEqual([["BP18-005", "BP18-079", "BP18-085"], ["BP18-005"]]);
  });
});
