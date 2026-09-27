import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Swordcraft (012–025), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Swordcraft", () => {
  it("012 Rin Shibuya — Storm; Fanfare, Lesson (2): damage equal to the Cool followers on your field", () => {
    const t = d({ me: { hand: ["ECP02-012"], field: ["CP02-042", "CP02-039"], ex: [ITEM, ITEM], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP02-012").yes();
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 2], []]);
  });

  it("013 / 014 Mio Honda — Fanfare, Lesson (1): draw, discard; evolved: an iM@S CG card from the top 2; super: a Passion follower from the hand", () => {
    const t = d({ me: { hand: ["ECP02-013", "V1"], ex: [ITEM], deck: ["V3"], playPoints: 2 } }).play("ECP02-013").yes().pick("V1");
    expect([t.hand(), t.cemetery()]).toEqual([["V3"], ["V1"]]);
    expect(d({ me: { field: ["ECP02-013"], evolveDeck: ["ECP02-014"], deck: ["V1", "CP02-047"], playPoints: 1 } }).evolve("ECP02-013").pick("CP02-047").hand()).toEqual(["CP02-047"]);
    const s = d({ me: { field: ["ECP02-013"], evolveDeck: ["ECP02-014"], hand: ["CP02-047", "ECP02-005"], deck: ["V1", "V3"], playPoints: 1, ...SUPER } });
    s.evolve("ECP02-013", { sep: true }).pending("ECP02-014").order().pick("CP02-047");
    expect([s.field(), s.hand()]).toEqual([["ECP02-013", "CP02-047"], ["ECP02-005"]]);
  });

  it("015 Uzuki Shimamura — Fanfare: an iM@S CG card other than itself into the EX area (up to 2 with 5 Cute cards in the cemetery); Lesson (1): one in the EX area costs 5 less", () => {
    expect(d({ me: { hand: ["ECP02-015"], deck: ["V1", "CP02-042", "ECP02-015"], playPoints: 6 } }).play("ECP02-015").pick("CP02-042").ex()).toEqual(["CP02-042"]);
    const two = d({ me: { hand: ["ECP02-015"], deck: ["CP02-042", "CP02-047"], cemetery: Array<string>(5).fill("CP02-014"), playPoints: 6 } });
    expect(two.play("ECP02-015").pick("CP02-042", "CP02-047").ex()).toEqual(["CP02-042", "CP02-047"]);
    const a = d({ me: { field: ["ECP02-015"], ex: [ITEM, "ECP02-005"], playPoints: 2 } }).activate("ECP02-015").pick("ECP02-005");
    expect([a.canPlay("ECP02-005"), a.canActivate("ECP02-015")]).toEqual([true, false]);
  });

  it("016 Karen Hojo — Fanfare: may take the top card if Cool; Last Words: a Magical Item", () => {
    expect(d({ me: { hand: ["ECP02-016"], deck: ["CP02-042"], playPoints: 1 } }).play("ECP02-016").pick("CP02-042").hand()).toEqual(["CP02-042"]);
    expect(d({ me: { field: ["ECP02-016"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([ITEM]);
  });

  it("017 / 018 Airi Totoki — Fanfare (1), Lesson (1), discard a Passion card: 3 damage; evolved: 2 damage and a Magical Item with 5 Passion cards", () => {
    const t = d({ me: { hand: ["ECP02-017", "CP02-047"], ex: [ITEM], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-017").yes();
    expect([t.stats("opp:V5"), t.pp(), t.ex(), t.cemetery()]).toEqual([[5, 2], 0, [], ["CP02-047"]]);
    const e = d({ me: { field: ["ECP02-017"], evolveDeck: ["ECP02-018"], cemetery: Array<string>(5).fill("CP02-047"), playPoints: 1 }, opp: { field: ["V5"] } });
    expect([e.evolve("ECP02-017").stats("opp:V5"), e.ex()]).toEqual([[5, 3], [ITEM]]);
  });

  it("019 / 020 Mayu Sakuma — Fanfare: each player draws; evolved: damage equal to its controller's hand", () => {
    const t = d({ me: { hand: ["ECP02-019"], deck: ["V1"], playPoints: 3 }, opp: { deck: ["V3"] } }).play("ECP02-019");
    expect([t.hand(), t.hand("opp")]).toEqual([["V1"], ["V3"]]);
    const e = d({ me: { field: ["ECP02-019"], evolveDeck: ["ECP02-020"], playPoints: 1 }, opp: { field: ["V5"], hand: ["V1", "V1", "V1"] } }).evolve("ECP02-019");
    expect(e.stats("opp:V5")).toEqual([5, 2]);
  });

  it("021 / 022 Chieri Ogata — Fanfare: evolve when not put onto the field from hand; evolved: an iM@S CG spell; Lesson: the next cheap one costs 2 less", () => {
    const h = d({ me: { hand: ["ECP02-021"], evolveDeck: ["ECP02-022"], playPoints: 2 } }).play("ECP02-021");
    expect(h.stats("ECP02-021")).toEqual([2, 2]);
    // Played from the EX area (ruling).
    const x = d({ me: { ex: ["ECP02-021"], evolveDeck: ["ECP02-022"], deck: ["V1", "CP02-028"], playPoints: 2 } }).play("ECP02-021").yes().pick("CP02-028");
    expect([x.stats("ECP02-021"), x.hand()]).toEqual([[3, 3], ["CP02-028"]]);
    const cute = Array<string>(5).fill("CP02-014");
    const a = d({ me: { field: [{ card: "ECP02-021", evolvedInto: "ECP02-022" }], hand: ["CP02-028"], ex: [ITEM], cemetery: cute, playPoints: 1 } });
    a.activate("ECP02-021");
    expect([a.pp(), a.canPlay("CP02-028"), a.canActivate("ECP02-021")]).toEqual([0, true, false]);
  });

  it("023 Nagi Hisakawa — Fanfare with 5 iM@S CG cards in the cemetery: Sparkling☆Days into the EX area; act (2), engage, bury with 10: a Nagi Hisakawa", () => {
    const t = d({ me: { hand: ["ECP02-023"], deck: ["V1", "CP02-028"], cemetery: Array<string>(5).fill("CP02-042"), playPoints: 1 } }).play("ECP02-023").pick("CP02-028");
    expect([t.ex(), t.canPlay("CP02-028")]).toEqual([["CP02-028"], true]);
    const a = d({ me: { field: ["ECP02-023"], deck: ["V1", "ECP02-023"], cemetery: Array<string>(10).fill("CP02-042"), playPoints: 2 } }).activate("ECP02-023").pick("ECP02-023");
    expect([a.field(), a.cemetery().length, a.pp()]).toEqual([["ECP02-023"], 11, 0]);
  });

  it("024 Miho Kohinata — Ward; Fanfare, discard 2 Cute cards: leader +2, draw 2; act, Lesson (1), engage: 2 damage to up to 2 (3 with 5 Cute cards)", () => {
    const t = d({ me: { hand: ["ECP02-024", "CP02-014", "CP02-060"], deck: ["V1", "V3"], playPoints: 4 } }).play("ECP02-024").none().yes();
    expect([t.leader(), t.hand()]).toEqual([22, ["V1", "V3"]]);
    const a = d({ me: { field: ["ECP02-024"], ex: [ITEM], cemetery: Array<string>(5).fill("CP02-014") }, opp: { field: ["V5", "V3"] } });
    a.activate("ECP02-024").pick("opp:V5", "opp:V3");
    expect([a.stats("opp:V5"), a.stats("opp:V3"), a.engaged("ECP02-024")]).toEqual([[5, 2], [3, 1], true]);
  });

  it("025 Dancing in the Rain — Fanfare: a Nao Kamiya from the deck; act, engage, bury: a Cool follower gets Rush and Assail", () => {
    expect(d({ me: { hand: ["ECP02-025"], deck: ["V1", "CP02-029"], playPoints: 1 } }).play("ECP02-025").pick("CP02-029").hand()).toEqual(["CP02-029"]);
    const a = d({ me: { field: ["ECP02-025", "CP02-042"] } }).activate("ECP02-025");
    expect([a.keywords("CP02-042"), a.field()]).toEqual([["rush", "assail"], ["CP02-042"]]);
  });
});
