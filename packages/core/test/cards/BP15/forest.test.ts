import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Forestcraft (001–019, PR09). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL destroys an enemy follower;
// QUICK-SAC destroys one of your followers. BP05-001 is Izudia, Omen of Unkilling. Hunter: BP15-014 (2).
// Tokens: BP05-T03 Puppet, BP01-T02 Fairy Wisp, BP01-T03 Fairy, BP15-PR09 Annihilating Onslaught.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const PUPPET = "BP05-T03";
const WISP = "BP01-T02";
const ONSLAUGHT = "BP15-PR09";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Forestcraft", () => {
  it("001 Izudia, Unkilling Annihilation — Fanfare: banish an Izudia, Omen of Unkilling to change an enemy follower's defense to 1; act, engage: 1 damage, an Annihilating Onslaught when it dies this turn", () => {
    expect(d({ me: { hand: ["BP15-001"], cemetery: ["BP05-001"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP15-001").yes().stats("opp:V5")).toEqual([5, 1]);
    const t = d({ me: { field: ["BP15-001"], hand: ["KILL"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).activate("BP15-001").pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 4]);
    t.play("KILL").pick("opp:V5");
    expect(t.ex()).toEqual([ONSLAUGHT]);
    const other = d({ me: { field: ["BP15-001"], hand: ["KILL"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).activate("BP15-001").pick("opp:V5").play("KILL").pick("opp:V3");
    expect(other.ex()).toEqual([]);
  });

  it("002 / 003 Amataz — Ward; evolved: destroy with 3 EX cards, 2 to its leader with 3 Pixie cards there", () => {
    const spec = (ex: string[]): DriveSpec => ({ me: { field: ["BP15-002"], evolveDeck: ["BP15-003"], ex, playPoints: 1 }, opp: { field: ["V5"] } });
    const t = d(spec([WISP, WISP, "BP01-T03"])).evolve("BP15-002");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    const plain = d(spec(["V1", "V1", WISP])).evolve("BP15-002");
    expect([plain.field("opp"), plain.leader("opp")]).toEqual([[], 20]);
    expect(d(spec(["V1", WISP])).evolve("BP15-002").field("opp")).toEqual(["V5"]);
  });

  it("004 / 005 Piercye — Fanfare: evolves with 3 faceup evolved followers; each follower of yours evolving: 1 to the enemy leader, 2 to each enemy follower, leader +1; evolved: a follower (2 or less) from the deck", () => {
    const t = d({
      me: { hand: ["BP15-004"], evolveDeck: ["BP15-005"], faceUpEvolveDeck: ["BP15-003", "BP15-007", "BP15-011"], deck: ["V1", "V5"], playPoints: 4 },
      opp: { field: ["V3"] },
    });
    t.play("BP15-004").yes().flush().pick("V1");
    expect([t.hand(), t.stats("opp:V3"), t.leader("opp"), t.leader()]).toEqual([["V1"], [3, 2], 19, 21]);
    const other = d({ me: { field: ["BP15-004", "BP15-002"], evolveDeck: ["BP15-003"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-002").flush();
    expect([other.stats("opp:V5"), other.leader("opp"), other.leader()]).toEqual([[5, 3], 19, 21]);
    expect(d({ me: { hand: ["BP15-004"], evolveDeck: ["BP15-005"], faceUpEvolveDeck: ["BP15-003", "BP15-007"], playPoints: 4 } }).play("BP15-004").decision?.type).toBe("mainPhase");
  });

  it("006 / 007 Inauspicious Puppeteer — Fanfare: a Puppet into the EX area; your token follower to the cemetery on your turn: -1/-1 to an enemy follower; evolved: a Puppet on the field and one in the EX area", () => {
    expect(d({ me: { hand: ["BP15-006"], playPoints: 2 } }).play("BP15-006").ex()).toEqual([PUPPET]);
    const t = d({ me: { field: ["BP15-006", PUPPET], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").pick(PUPPET);
    expect(t.stats("opp:V5")).toEqual([4, 4]);
    const evo = d({ me: { field: ["BP15-006"], evolveDeck: ["BP15-007"], playPoints: 1 } }).evolve("BP15-006");
    expect([evo.field(), evo.ex()]).toEqual([["BP15-006", PUPPET], [PUPPET]]);
  });

  it("008 Erosive Annihilation — Quick; 1 less with an Izudia follower; 1 damage, draw when it dies this turn", () => {
    const t = d({ me: { hand: ["BP15-008", "KILL"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-008").play("KILL");
    expect([t.hand(), t.keywords("BP15-008")]).toEqual([["V1"], ["quick"]]);
    expect(d({ me: { hand: ["BP15-008"], field: ["BP15-001"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP15-008")).toBe(true);
    expect(d({ me: { hand: ["BP15-008"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP15-008")).toBe(false);
  });

  it("009 Rejuvenating Resurrection — summon an Amataz follower from the cemetery", () => {
    expect(d({ me: { hand: ["BP15-009"], cemetery: ["BP15-002", "V1"], playPoints: 2 } }).play("BP15-009").none().field()).toEqual(["BP15-002"]);
  });

  it("010 / 011 Cryptid Keeper — evolved: 4 damage, back to the hand, recover 3", () => {
    const t = d({ me: { field: ["BP15-010"], evolveDeck: ["BP15-011"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-010");
    expect([t.stats("opp:V5"), t.hand(), t.pp(), t.field()]).toEqual([[5, 1], ["BP15-010"], 3, []]);
  });

  it("012 Adherent of Annihilation — Fanfare: 2 damage with 3 Hunter cards in the cemetery; leader +2 when it dies this turn", () => {
    const t = d({ me: { hand: ["BP15-012", "KILL"], cemetery: n(3, "BP15-014"), playPoints: 3 }, opp: { field: ["V5"] } }).play("BP15-012");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    expect(t.play("KILL").leader()).toBe(22);
    const few = d({ me: { hand: ["BP15-012", "KILL"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP15-012");
    expect(few.stats("opp:V5")).toEqual([5, 5]);
    expect(few.play("KILL").leader()).toBe(22);
  });

  it("013 Fairy Healer — Fanfare: a token follower into the EX area for leader +2 (not with a full EX area)", () => {
    const t = d({ me: { hand: ["BP15-013"], field: [PUPPET], playPoints: 2 } }).play("BP15-013").yes();
    expect([t.ex(), t.field(), t.leader()]).toEqual([[PUPPET], ["BP15-013"], 22]);
    expect(d({ me: { hand: ["BP15-013"], field: [PUPPET], ex: n(5), playPoints: 2 } }).play("BP15-013").leader()).toBe(20);
  });

  it("014 / 015 Hermit of Unkilling — Fanfare: defense 1 with 3 Hunter cards in the cemetery; evolved: an Izudia follower from the deck", () => {
    expect(d({ me: { hand: ["BP15-014"], cemetery: n(3, "BP15-014"), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-014").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP15-014"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-014").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP15-014"], evolveDeck: ["BP15-015"], deck: ["V1", "BP15-001"], playPoints: 1 } }).evolve("BP15-014").pick("BP15-001");
    expect(evo.hand()).toEqual(["BP15-001"]);
  });

  it("016 Horned Beastie — Ward; Last Words: a spell (1 or less) from the cemetery to the hand", () => {
    // QUICK-SAC (0) is in the cemetery by then too.
    const t = d({ me: { field: ["BP15-016"], hand: ["QUICK-SAC"], cemetery: ["BP15-008", "V1"] } }).play("QUICK-SAC").pick("BP15-008");
    expect([t.hand(), t.keywords("BP15-016")]).toEqual([["BP15-008"], ["ward"]]);
  });

  it("017 Bouquet Fairy — Fanfare: a Fairy Wisp into the EX area; act, engage and banish an EX card: an enemy follower back to the hand", () => {
    expect(d({ me: { hand: ["BP15-017"], playPoints: 3 } }).play("BP15-017").ex()).toEqual([WISP]);
    const t = d({ me: { field: ["BP15-017"], ex: ["V1"] }, opp: { field: ["V5"] } }).activate("BP15-017");
    expect([t.hand("opp"), t.zone("me", "banished"), t.engaged("BP15-017")]).toEqual([["V5"], ["V1"], true]);
    expect(d({ me: { field: ["BP15-017"], ex: ["V1"] } }).canActivate("BP15-017")).toBe(false);
  });

  it("018 Emerald Wildfox — Fanfare: draw", () => {
    expect(d({ me: { hand: ["BP15-018"], deck: ["V1"], playPoints: 4 } }).play("BP15-018").hand()).toEqual(["V1"]);
  });

  it("019 Wind Fairy — Storm; Fanfare: 2 Fairy Wisps; from the hand, (1) and discard it: a card on your field back to the hand, a Fairy Wisp", () => {
    const t = d({ me: { hand: ["BP15-019"], playPoints: 6 } }).play("BP15-019");
    expect([t.ex(), t.keywords("BP15-019")]).toEqual([[WISP, WISP], ["storm"]]);
    const act = d({ me: { hand: ["BP15-019"], field: ["V3"], playPoints: 1 } }).activate("BP15-019");
    expect([act.hand(), act.ex(), act.cemetery()]).toEqual([["V3"], [WISP], ["BP15-019"]]);
  });

  it("PR09 Annihilating Onslaught — 6 to the enemy leader with 6 Hunter cards in the cemetery", () => {
    expect(d({ me: { ex: [ONSLAUGHT], cemetery: n(6, "BP15-014"), playPoints: 3 } }).play(`${ONSLAUGHT}@ex`).leader("opp")).toBe(14);
    expect(d({ me: { ex: [ONSLAUGHT], cemetery: n(5, "BP15-014"), playPoints: 3 } }).play(`${ONSLAUGHT}@ex`).leader("opp")).toBe(20);
  });
});
