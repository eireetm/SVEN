import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Swordcraft (018–035, T01–T03). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys one
// of your followers. Festive: BP14-008 (2), BP14-012 (2), Glittering Gold. BP14-032 Violent Soldier is a
// Swordcraft follower; BP14-022 Jiemon a Commander. Tokens: BP14-T01 Sootspawn, BP14-T02 Glittering Gold,
// BP14-T03 Flame General's Regalia, BP01-T07 Steelclad Knight.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SOOT = "BP14-T01";
const GOLD = "BP14-T02";
const REGALIA = "BP14-T03";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Swordcraft", () => {
  it("018 Taketsumi, Aconite Paladin — Fanfare: draw, discard, a Glittering Gold; {adv} (4), banish it: Taketsumi, Creator of Paradise from the evolve deck with 5 Festive / 10 Swordcraft cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP14-018", "V1"], deck: ["V3"], playPoints: 2 } }).play("BP14-018").pick("V1");
    expect([t.hand(), t.cemetery(), t.ex()]).toEqual([["V3"], ["V1"], [GOLD]]);
    const spec = (cemetery: string[], extra: DriveSpec["me"] = {}): DriveSpec => ({
      me: { field: ["BP14-018", "BP14-020"], evolveDeck: ["BP14-019", "BP14-021"], cemetery, playPoints: 4, ...extra },
    });
    const adv = d(spec(n(5, "BP14-008"))).activate("BP14-018").pick("BP14-019").none();
    expect([adv.field(), adv.zone("me", "banished"), adv.pp(), adv.canEvolve("BP14-020")]).toEqual([["BP14-020", "BP14-019", SOOT, SOOT], ["BP14-018"], 0, false]);
    const ep = d(spec(n(10, "BP14-032"), { playPoints: 3, evolutionPoints: 1 })).activate("BP14-018", 0, { ep: true }).pick("BP14-019").none();
    expect([ep.pp(), ep.game.state.players[0].evolutionPoints]).toEqual([0, 0]);
    expect(d(spec(n(4, "BP14-008"))).canActivate("BP14-018")).toBe(false);
  });

  it("019 Taketsumi, Creator of Paradise — act, engage: 5 to an enemy follower and 3 to its leader", () => {
    const t = d({ me: { field: ["BP14-019"] }, opp: { field: ["V5"] } }).activate("BP14-019");
    expect([t.field("opp"), t.leader("opp"), t.engaged("BP14-019")]).toEqual([[], 17, true]);
  });

  it("020 / 021 Mars — Bane; evolved: 2 damage; Last Words: a Flame General's Regalia", () => {
    const t = d({ me: { field: ["BP14-020"], evolveDeck: ["BP14-021"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP14-020")).toEqual(["bane"]);
    expect(t.evolve("BP14-020").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: [{ card: "BP14-020", evolvedInto: "BP14-021" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([REGALIA]);
  });

  it("T03 Flame General's Regalia — 2 damage when a follower of yours evolves; act (1), engage and bury it: a Commander follower gets \"Strike: 2 to each enemy leader\"", () => {
    const t = d({ me: { field: [REGALIA, "BP14-020"], evolveDeck: ["BP14-021"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-020").flush();
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    const act = d({ me: { field: [REGALIA, "BP14-022"], playPoints: 1 }, opp: { deck: n(1) } }).activate(REGALIA);
    expect(act.field()).toEqual(["BP14-022"]);
    expect(act.attack("BP14-022", "opp:leader").leader("opp")).toBe(15);
  });

  it("022 / 023 Jiemon — other Festive followers of yours have Storm; Fanfare: a Glittering Gold; evolved: banish 2 Glittering Gold to put a Festive card (3 or less) from the top 5 into the EX area, 3 less; act (1): play that On Evolve", () => {
    const t = d({ me: { hand: ["BP14-022"], field: ["BP14-008"], playPoints: 4 } }).play("BP14-022");
    expect([t.keywords("BP14-008"), t.keywords("BP14-022"), t.ex()]).toEqual([["storm"], [], [GOLD]]);
    const deck = ["V1", "BP14-008", "V3", "V5", "V1"];
    const evo = d({ me: { field: ["BP14-022"], evolveDeck: ["BP14-023"], ex: [GOLD, GOLD, "V1"], deck, playPoints: 1 } });
    evo.evolve("BP14-022").yes().pick("BP14-008").order();
    // The banished tokens cease to exist (CR 9.1.4).
    expect([evo.ex(), evo.zone("me", "banished"), evo.canPlay("BP14-008@ex")]).toEqual([["V1", "BP14-008"], [], true]);
    const act = d({ me: { field: [{ card: "BP14-022", evolvedInto: "BP14-023" }], ex: [GOLD, GOLD], deck, playPoints: 1 } });
    act.activate("BP14-022").yes().pick("BP14-008").order();
    expect([act.ex(), act.pp()]).toEqual([["BP14-008"], 0]);
  });

  it("024 Bumpkin Recruit — Fanfare: +1 attack and Rush with 5 Swordcraft followers in the cemetery; Last Words: draw", () => {
    const t = d({ me: { hand: ["BP14-024", "QUICK-SAC"], cemetery: n(5, "BP14-032"), deck: ["V1"], playPoints: 1 } }).play("BP14-024");
    expect([t.stats("BP14-024"), t.keywords("BP14-024")]).toEqual([[2, 1], ["rush"]]);
    expect(t.play("QUICK-SAC").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP14-024"], cemetery: n(4, "BP14-032"), playPoints: 1 } }).play("BP14-024").stats("BP14-024")).toEqual([1, 1]);
  });

  it("025 Hero of the Hunt — 5 damage, a Glittering Gold, and a Taketsumi, Aconite Paladin from the deck with 5 Festive cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP14-025"], cemetery: n(5, "BP14-008"), deck: ["BP14-018", "V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("BP14-025").pick("BP14-018");
    // Taketsumi's own Fanfare draws, discards and adds a second Glittering Gold.
    expect([t.field("opp"), t.field(), t.ex()]).toEqual([[], ["BP14-018"], [GOLD, GOLD]]);
    const few = d({ me: { hand: ["BP14-025"], cemetery: n(4, "BP14-008"), deck: ["BP14-018"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-025");
    expect([few.field(), few.zone("me", "deck")]).toEqual([[], ["BP14-018"]]);
  });

  it("026 / 027 Masterful Musician — Fanfare: a Glittering Gold, leader +3 with Jiemon; evolved: each Glittering Gold into your EX area deals 3 to an enemy follower and 1 to its leader", () => {
    expect(d({ me: { hand: ["BP14-026"], field: ["BP14-022"], playPoints: 3 } }).play("BP14-026").leader()).toBe(23);
    expect(d({ me: { hand: ["BP14-026"], playPoints: 3 } }).play("BP14-026").leader()).toBe(20);
    const evo = d({ me: { field: ["BP14-026"], evolveDeck: ["BP14-027"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-026");
    expect([evo.ex(), evo.stats("opp:V5"), evo.leader("opp")]).toEqual([[GOLD], [5, 2], 19]);
  });

  it("028 War Hero — Fanfare: 4 damage and draw", () => {
    const t = d({ me: { hand: ["BP14-028"], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP14-028");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 1], ["V1"]]);
  });

  it("029 Noble Shieldmaiden — Ward; Fanfare: may summon a follower (6 or less) from the top 5; from the hand, (1) and discard it: a Steelclad Knight", () => {
    const t = d({ me: { hand: ["BP14-029"], deck: ["V1", "BP14-032", "V5", "V3", "V1"], playPoints: 7 } }).play("BP14-029").none().pick("V5").order();
    expect([t.field(), t.keywords("BP14-029")]).toEqual([["BP14-029", "V5"], ["ward"]]);
    const act = d({ me: { hand: ["BP14-029"], playPoints: 1 } }).activate("BP14-029");
    expect([act.field(), act.cemetery()]).toEqual([["BP01-T07"], ["BP14-029"]]);
  });

  it("030 / 031 Front Desk Frog — Fanfare: a Glittering Gold, evolves with Jiemon (not the turn's evolve); evolved: 2 damage, draw with 3 Festive cards in the EX area", () => {
    const t = d({
      me: { hand: ["BP14-030"], field: ["BP14-022"], evolveDeck: ["BP14-031", "BP14-023"], ex: ["BP14-008", "BP14-012"], deck: ["V1"], playPoints: 3 },
      opp: { field: ["V5"] },
    }).play("BP14-030").yes();
    expect([t.stats("opp:V5"), t.hand(), t.canEvolve("BP14-022")]).toEqual([[5, 3], ["V1"], true]);
    const two = d({ me: { hand: ["BP14-030"], field: ["BP14-022"], evolveDeck: ["BP14-031"], ex: ["BP14-008"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    expect(two.play("BP14-030").yes().hand()).toEqual([]);
  });

  it("032 / 033 Violent Soldier, Hasty Axeman — Storm; Fanfare: engage an enemy follower", () => {
    expect(d({ me: { field: ["BP14-032"] } }).keywords("BP14-032")).toEqual(["storm"]);
    expect(d({ me: { hand: ["BP14-033"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP14-033").engaged("opp:V5")).toBe(true);
  });

  it("034 Night on the Town — (1) 2 damage and a Glittering Gold, or (2) 4 damage with 3 Festive cards in the EX area", () => {
    const t = d({ me: { hand: ["BP14-034"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP14-034").choose("gold");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 3], [GOLD]]);
    const four = d({ me: { hand: ["BP14-034"], ex: [GOLD, GOLD, "BP14-008"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP14-034").choose("damage");
    expect(four.stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP14-034"], ex: [GOLD], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP14-034").choose("damage").stats("opp:V5")).toEqual([5, 5]);
  });

  it("035 Haggler's Gambit — 1 less with 3 Glittering Gold in the EX area; draw and a Glittering Gold", () => {
    const t = d({ me: { hand: ["BP14-035"], ex: [GOLD, GOLD, GOLD], deck: ["V1"], playPoints: 0 } });
    expect(t.canPlay("BP14-035")).toBe(true);
    expect(t.play("BP14-035").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP14-035"], ex: [GOLD, GOLD], playPoints: 0 } }).canPlay("BP14-035")).toBe(false);
  });

  it("T01 Sootspawn — Ward; Last Words: 2 damage", () => {
    const t = d({ me: { field: [SOOT], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } });
    expect(t.keywords(SOOT)).toEqual(["ward"]);
    expect(t.play("QUICK-SAC").stats("opp:V5")).toEqual([5, 3]);
  });

  it("T02 Glittering Gold — act (1) in the EX area, banish it and 2 more: leader +1, draw; played as a spell it does nothing (ruling)", () => {
    const t = d({ me: { ex: [GOLD, GOLD, GOLD, "V1"], deck: ["V3"], playPoints: 1 } }).activate(`${GOLD}@ex`);
    expect([t.ex(), t.leader(), t.hand(), t.pp()]).toEqual([["V1"], 21, ["V3"], 0]);
    expect(d({ me: { ex: [GOLD, GOLD], playPoints: 1 } }).canActivate(`${GOLD}@ex`)).toBe(false);
    const spell = d({ me: { ex: [GOLD] } }).play(`${GOLD}@ex`);
    expect([spell.ex(), spell.leader()]).toEqual([[], 20]);
  });
});
