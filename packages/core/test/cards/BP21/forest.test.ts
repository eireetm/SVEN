import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Forestcraft (001–018, T01, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. Academic / Beast followers: BP21-011 (1c 1/1), BP21-005 (2c), BP21-013 (1c 1/2), BP21-009 (3c). Puppetry:
// BP05-014 (2c), BP05-T03 Puppet. Pixie: BP01-011 (2c follower), BP01-023 (a spell), BP01-T03 Fairy. BP20-070 (act 0: 1
// damage to a follower of yours). Tokens: BP21-T01 Lyelth's Marionette, BP21-T02 Verdant Prayer.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const FAIRY = "BP01-T03";

describe("BP21 Forestcraft", () => {
  it("001 Castelle, Budding Mage — your other Academic and Beast followers take no ability damage; Fanfare with 3 of them: a Verdant Prayer", () => {
    const t = d({ me: { field: ["BP21-001", "BP21-009", "BP20-070"] } }).activate("BP20-070").pick("BP21-009");
    expect(t.stats("BP21-009")).toEqual([2, 3]);
    expect(d({ me: { field: ["BP21-001", "BP20-070"] } }).activate("BP20-070").pick("BP21-001").stats("BP21-001")).toEqual([1, 1]);
    expect(d({ me: { hand: ["BP21-001"], field: ["BP21-011", "BP21-005"], playPoints: 1 } }).play("BP21-001").ex()).toEqual(["BP21-T02"]);
    expect(d({ me: { hand: ["BP21-001"], field: ["BP21-011"], playPoints: 1 } }).play("BP21-001").ex()).toEqual([]);
  });

  it("002 / 003 Lyelth, Immaculate Idol — Fanfare, discard a Puppetry card: draw 2; evolved: a Lyelth's Marionette; super-evolved: +4/+4 to a Puppetry token in the EX area with 3 Puppetry cards", () => {
    const t = d({ me: { hand: ["BP21-002", "BP05-014"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP21-002").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1", "V3"], ["BP05-014"]]);
    expect(d({ me: { field: ["BP21-002"], evolveDeck: ["BP21-003"], playPoints: 1 } }).evolve("BP21-002").ex()).toEqual(["BP21-T01"]);
    const s = d({ me: { field: ["BP21-002"], evolveDeck: ["BP21-003"], cemetery: n(3, "BP05-014"), playPoints: 1, ...SUPER } });
    s.evolve("BP21-002", { sep: true }).flush().play("BP21-T01@ex");
    expect(s.stats("BP21-T01")).toEqual([5, 5]);
  });

  it("004 Titania, Queen of Fairies — Fanfare with 2 Pixie cards in the EX area: a 3-cost or less Pixie follower from the deck; act (1) with 5: destroy, its controller gets a Fairy", () => {
    const t = d({ me: { hand: ["BP21-004"], ex: [FAIRY, "BP01-023"], deck: ["V1", "BP01-011"], playPoints: 3 } }).play("BP21-004").pick("BP01-011").flush();
    expect(t.field()).toEqual(["BP21-004", "BP01-011"]);
    const act = d({ me: { field: ["BP21-004"], ex: n(5, FAIRY), playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP21-004");
    expect(act.field("opp")).toEqual([FAIRY]);
    expect(d({ me: { field: ["BP21-004"], ex: n(4, FAIRY), playPoints: 1 }, opp: { field: ["V5"] } }).canActivate("BP21-004")).toBe(false);
  });

  it("005 / 006 Cleaver Cat — Fanfare, discard: an Academic or Beast card from the top 3; evolved, return another Academic or Beast follower: 3 damage", () => {
    const t = d({ me: { hand: ["BP21-005", "V1"], deck: ["V3", "BP21-011", "V5"], playPoints: 2 } }).play("BP21-005").yes().pick("BP21-011").order();
    expect(t.hand()).toEqual(["BP21-011"]);
    const e = d({ me: { field: ["BP21-005", "BP21-011"], evolveDeck: ["BP21-006"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-005").yes();
    expect([e.stats("opp:V5"), e.hand()]).toEqual([[5, 2], ["BP21-011"]]);
  });

  it("007 Cynthia, Chivalrous Elf — Rush, Assail; Fanfare: +1/+1 to up to 2 Pixie token followers on your field or in the EX area, or 2 Fairies", () => {
    const t = d({ me: { hand: ["BP21-007"], field: [FAIRY], ex: [FAIRY], playPoints: 3 } }).play("BP21-007").choose("buff").pick(FAIRY, `${FAIRY}@ex`);
    expect([t.stats(FAIRY), t.keywords("BP21-007")]).toEqual([[2, 2], ["rush", "assail"]]);
    expect(d({ me: { hand: ["BP21-007"], playPoints: 3 } }).play("BP21-007").choose("fairies").field()).toEqual(["BP21-007", FAIRY, FAIRY]);
  });

  it("008 Dwarven Lumberjack — another Academic or Beast follower entering: 5 damage and 1 to its leader; Fanfare: may summon a 4-cost or less one from the hand", () => {
    const t = d({ me: { hand: ["BP21-008", "BP21-009"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP21-008").pick("BP21-009").flush();
    expect([t.field(), t.field("opp"), t.leader("opp")]).toEqual([["BP21-008", "BP21-009"], [], 19]);
  });

  it("009 / 010 Elven Farmhand — evolved: up to two 1-cost Academic or Beast followers from the top 5 onto the field", () => {
    const t = d({ me: { field: ["BP21-009"], evolveDeck: ["BP21-010"], deck: ["BP21-011", "V1", "BP21-013", "BP21-005"], playPoints: 1 } });
    t.evolve("BP21-009").pick("BP21-011", "BP21-013").order();
    expect(t.field()).toEqual(["BP21-009", "BP21-011", "BP21-013"]);
  });

  it("011 Fauna Handler — when it leaves the field: +1/+1 to an Academic or Beast follower of yours", () => {
    expect(d({ me: { field: ["BP21-011", "BP21-009"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("BP21-011").stats("BP21-009")).toEqual([3, 4]);
  });

  it("012 Fairy Funfact — a Fairy, Rush and Assail to your Pixie tokens; Combo (3): draw", () => {
    const t = d({ me: { hand: ["BP21-012"], field: [FAIRY], deck: ["V1"], playedThisTurn: 2, playPoints: 1 } }).play("BP21-012");
    expect([t.field(), t.keywords(FAIRY), t.hand()]).toEqual([[FAIRY, FAIRY], ["rush", "assail"], ["V1"]]);
    expect(d({ me: { hand: ["BP21-012"], deck: ["V1"], playPoints: 1 } }).play("BP21-012").hand()).toEqual([]);
  });

  it("013 Bladebunny — Evolve (0) after a card of yours returned to hand this turn; returned to hand: may summon a Bladebunny from the hand", () => {
    const t = d({ me: { hand: ["BP21-016", "BP21-013"], evolveDeck: ["BP21-014"], deck: ["V1"], playPoints: 3 } }).play("BP21-013").play("BP21-016").yes().pick("BP21-013").flush();
    expect([t.field(), t.canEvolve("BP21-013")]).toEqual([["BP21-016", "BP21-013"], true]);
    expect(d({ me: { field: ["BP21-013"], evolveDeck: ["BP21-014"], playPoints: 0 } }).canEvolve("BP21-013")).toBe(false);
  });

  it("015 Vanguard Tigress — Storm; Strike, banish 3 Beast cards from the cemetery: 4 damage", () => {
    const t = d({ me: { field: ["BP21-015"], cemetery: n(3, "BP21-013") }, opp: { field: ["V5"] } }).attack("BP21-015", "opp:leader").yes();
    expect([t.stats("opp:V5"), t.zone("me", "banished").length]).toEqual([[5, 1], 3]);
  });

  it("016 Flying Mistletoe Squirrel — Fanfare, return another Beast follower: Storm and draw", () => {
    const t = d({ me: { hand: ["BP21-016"], field: ["BP21-013"], deck: ["V1"], playPoints: 2 } }).play("BP21-016").yes();
    expect([t.keywords("BP21-016"), t.hand()]).toEqual([["storm"], ["BP21-013", "V1"]]);
  });

  it("017 Spiritelementalist — Fanfare: 5 to each enemy follower", () => {
    expect(d({ me: { hand: ["BP21-017"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP21-017").field("opp")).toEqual([]);
  });

  it("018 Wild Profusion — Fanfare: a Fairy; act, engage and bury this: damage for each Pixie token follower on your field and in the EX area", () => {
    expect(d({ me: { hand: ["BP21-018"], playPoints: 2 } }).play("BP21-018").field()).toEqual(["BP21-018", FAIRY]);
    expect(d({ me: { field: ["BP21-018", FAIRY], ex: [FAIRY, FAIRY] }, opp: { field: ["V5"] } }).activate("BP21-018").stats("opp:V5")).toEqual([5, 2]);
  });

  it("T01 Lyelth's Marionette — also named Puppet on the field; Storm, Bane, Ward", () => {
    const t = d({ me: { field: ["BP21-T01"] } });
    expect([t.keywords("BP21-T01"), t.game.reader().info(t.id("BP21-T01")).names]).toEqual([["storm", "bane", "ward"], ["Lyelth's Marionette", "Puppet"]]);
  });

  it("T02 Verdant Prayer — up to 3 Academic or Beast followers costing 5 or less in total from the top 7, then +1/+1 to each follower of yours", () => {
    const t = d({ me: { ex: ["BP21-T02"], field: ["V1"], deck: ["BP21-005", "V3", "BP21-009", "BP21-011"], playPoints: 5 } }).play("BP21-T02@ex");
    t.pick("BP21-005").pick("BP21-009").order();
    expect([t.field(), t.stats("V1"), t.stats("BP21-005")]).toEqual([["V1", "BP21-005", "BP21-009"], [3, 3], [3, 3]]);
  });
});
