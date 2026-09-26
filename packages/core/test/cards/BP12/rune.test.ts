import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Runecraft (035–051, T03, T04). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a
// 1-cost spell; QUICK-SAC destroys one of your followers. BP12-042 Chaos Wielder is a Mage follower,
// BP12-083 Mechasaw Deathbringer a 3-cost Machina follower without Fanfare, BP11-045 Rapid Fire a
// 1-cost Runecraft spell, BP07-047 a Golem. Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair Mode,
// BP01-T10 Magic Sediment, BP01-T08 / T09 Strikeform / Guardform Golem, BP12-T03 / T04 Armored /
// Assault Tentacle. COSTS are twelve cards with different base costs (0–11).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const SEDIMENT = "BP01-T10";
const ARMORED = "BP12-T03";
const ASSAULT = "BP12-T04";
const COSTS = ["BP04-056", "V1", "V2", "V3", "BP01-021", "V5", "BP01-091", "BP01-007", "BP01-001", "BP01-061", "BP01-154", "BP12-001"];
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP12 Runecraft", () => {
  it("035 Belphomet — Fanfare an Armored Tentacle; from the hand (3), banish 2 Machina tokens and put it into the EX area: a Tentacle of your choice", () => {
    expect(d({ me: { hand: ["BP12-035"], playPoints: 6 } }).play("BP12-035").none().field()).toEqual(["BP12-035", ARMORED]);
    // A full EX area: the tokens are banished first (ruling).
    const t = d({ me: { hand: ["BP12-035"], ex: n(5, REPAIR), playPoints: 3 } }).activate("BP12-035").pick(REPAIR, REPAIR).choose("assault");
    expect([t.field(), t.ex(), t.pp()]).toEqual([[ASSAULT], [REPAIR, REPAIR, REPAIR, "BP12-035"], 0]);
    expect(d({ me: { hand: ["BP12-035"], ex: [REPAIR], playPoints: 3 } }).canActivate("BP12-035")).toBe(false);
  });

  it("036 Belphomet (Evolved) — On Evolve discard a Machina card: an Assault Tentacle; (2), banish a Machina token from the EX area: another", () => {
    const evo = d({ me: { field: ["BP12-035"], evolveDeck: ["BP12-036"], hand: ["BP12-083"], playPoints: 1 } }).evolve("BP12-035").yes();
    expect([evo.field(), evo.cemetery()]).toEqual([["BP12-035", ASSAULT], ["BP12-083"]]);
    const act = d({ me: { field: [{ card: "BP12-035", evolvedInto: "BP12-036" }], ex: [REPAIR], playPoints: 2 } }).activate("BP12-035");
    expect([act.field(), act.ex()]).toEqual([["BP12-035", ASSAULT], []]);
  });

  it("037 Daria — up to a Mage follower and a Mage spell from the top 3; engage with 5 Mage followers in the cemetery: a Runecraft spell into the EX area at 3 less", () => {
    const t = d({ me: { hand: ["BP12-037"], deck: ["BP12-042", "V1", "BP12-051"], playPoints: 3 } }).play("BP12-037").pick("BP12-042").pick("BP12-051");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP12-042", "BP12-051"], ["V1"]]);
    const act = d({ me: { field: ["BP12-037"], hand: ["BP12-051", "V1"], cemetery: n(5, "BP12-042"), playPoints: 0 }, opp: { field: ["V5"] } });
    act.activate("BP12-037").pick("BP12-051");
    expect([act.ex(), act.canPlay("BP12-051@ex")]).toEqual([["BP12-051"], true]);
    expect(d({ me: { field: ["BP12-037"], hand: ["BP12-051"], cemetery: n(4, "BP12-042") } }).canActivate("BP12-037")).toBe(false);
  });

  it("038 / 039 Regalore — X less for different base costs in the cemetery; Ward; evolved: return an enemy follower and a Droid +X/+X", () => {
    expect(d({ me: { hand: ["BP12-038"], cemetery: COSTS, playPoints: 2 } }).canPlay("BP12-038")).toBe(true);
    expect(d({ me: { hand: ["BP12-038"], cemetery: COSTS, playPoints: 1 } }).canPlay("BP12-038")).toBe(false);
    const evo = d({ me: { field: ["BP12-038"], evolveDeck: ["BP12-039"], playPoints: 1 }, opp: { field: ["V3"] } }).evolve("BP12-038");
    expect([evo.hand("opp"), evo.field(), evo.stats(DROID), evo.keywords("BP12-038")]).toEqual([["V3"], ["BP12-038", DROID], [4, 4], ["ward"]]);
  });

  it("040 Melvie — Rush; +4 attack with 5 Mage followers in the cemetery, +4 defense with Spellchain (5)", () => {
    const both = d({ me: { hand: ["BP12-040"], cemetery: [...n(5, "BP12-042"), ...n(5, "KILL")], playPoints: 1 } }).play("BP12-040").flush();
    expect([both.stats("BP12-040"), both.keywords("BP12-040")]).toEqual([[5, 5], ["rush"]]);
    expect(d({ me: { hand: ["BP12-040"], cemetery: n(5, "BP12-042"), playPoints: 1 } }).play("BP12-040").flush().stats("BP12-040")).toEqual([5, 1]);
  });

  it("041 Sorcery in Solidarity — with 5 Machina cards in the cemetery: summon a Machina follower that costs 3 or less and a 1-cost Runecraft spell into the EX area", () => {
    const t = d({ me: { hand: ["BP12-041"], cemetery: n(5, "BP12-083"), deck: ["V1", "BP12-083", "BP11-045"], playPoints: 3 } });
    t.play("BP12-041").pick("BP12-083").pick("BP11-045");
    expect([t.field(), t.ex(), t.zone("me", "deck")]).toEqual([["BP12-083"], ["BP11-045"], ["V1"]]);
    const few = d({ me: { hand: ["BP12-041"], cemetery: n(4, "BP12-083"), deck: ["BP12-083", "BP11-045"], playPoints: 3 } }).play("BP12-041");
    expect([few.field(), few.ex()]).toEqual([[], []]);
  });

  it("042 / 043 Chaos Wielder — Spellchain (5) recovers 2; evolved: 2 damage and a draw with 5 Mage followers in the cemetery", () => {
    expect(d({ me: { hand: ["BP12-042"], cemetery: n(5, "KILL"), playPoints: 2, maxPlayPoints: 5 } }).play("BP12-042").pp()).toBe(2);
    const evo = d({ me: { field: ["BP12-042"], evolveDeck: ["BP12-043"], cemetery: n(5, "BP12-042"), deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP12-042");
    expect([evo.stats("opp:V5"), evo.hand()]).toEqual([[5, 3], ["V1"]]);
  });

  it("044 Rebel Against Fate — banished; each player shuffles hand and cemetery into the deck and draws 5; your next card costs 7 less", () => {
    const t = d({
      me: { hand: ["BP12-044", "V5"], cemetery: ["V1", "V3"], deck: ["V2", "V2", "V2"], playPoints: 7 },
      opp: { hand: ["V1"], cemetery: ["V3"], deck: ["V2", "V2", "V2", "V2"] },
    }).play("BP12-044");
    expect([t.hand().length, t.zone("me", "deck").length, t.cemetery(), t.zone("me", "banished")]).toEqual([5, 1, [], ["BP12-044"]]);
    expect([t.hand("opp").length, t.zone("opp", "deck").length, t.cemetery("opp")]).toEqual([5, 1, []]);
    expect([t.pp(), t.canPlay("V5")]).toEqual([0, true]);
  });

  it("045 Arcane Item Shop — recover 6 with no followers in the cemetery; playing a Runecraft spell deals 2 to an enemy leader or follower", () => {
    expect(d({ me: { hand: ["BP12-045"], cemetery: ["KILL"], playPoints: 7 } }).play("BP12-045").pp()).toBe(6);
    expect(d({ me: { hand: ["BP12-045"], cemetery: ["V1"], playPoints: 7 } }).play("BP12-045").pp()).toBe(0);
    const t = d({ me: { field: ["BP12-045"], hand: ["BP12-051"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-051").pick("opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 18]);
  });

  it("046 / 047 Gigahand Golem — a Magic Sediment; Earth Rite once a turn: another Golem +1/+1; evolved: Guardform and Strikeform Golems, +2/+2", () => {
    expect(d({ me: { hand: ["BP12-046"], playPoints: 2 } }).play("BP12-046").field()).toEqual(["BP12-046", SEDIMENT]);
    const act = d({ me: { field: ["BP12-046", "BP07-047", SEDIMENT] } }).activate("BP12-046");
    expect([act.stats("BP07-047"), act.field(), act.canActivate("BP12-046")]).toEqual([[3, 2], ["BP12-046", "BP07-047"], false]);
    const evo = d({ me: { field: ["BP12-046"], evolveDeck: ["BP12-047"], playPoints: 5 } }).evolve("BP12-046").none();
    expect(evo.field()).toEqual(["BP12-046", "BP01-T09", "BP01-T08"]);
    const big = d({ me: { field: [{ card: "BP12-046", evolvedInto: "BP12-047" }, "BP07-047", SEDIMENT] } }).activate("BP12-046");
    expect(big.stats("BP07-047")).toEqual([4, 3]);
  });

  it("048 Device Diviner — an Assembly Droid or Repair Mode into the EX area; once a turn playing a Machina card gives leader +1", () => {
    expect(d({ me: { hand: ["BP12-048"], playPoints: 2 } }).play("BP12-048").choose("repair").ex()).toEqual([REPAIR]);
    const t = d({ me: { field: ["BP12-048"], hand: ["BP12-083", "BP12-083"], playPoints: 6 } }).play("BP12-083");
    expect(t.leader()).toBe(21);
    expect(t.play("BP12-083").leader()).toBe(21);
  });

  it("049 Mechabook Sorcerer — discard a Machina card: draw, a Droid and a Repair Mode into the EX area, recover 1 with 5 Machina cards there", () => {
    const t = d({ me: { hand: ["BP12-049", "BP12-083"], ex: n(3, REPAIR), deck: ["V1"], playPoints: 2, maxPlayPoints: 5 } }).play("BP12-049").yes();
    expect([t.hand(), t.ex(), t.pp()]).toEqual([["V1"], [REPAIR, REPAIR, REPAIR, DROID, REPAIR], 1]);
    const four = d({ me: { hand: ["BP12-049", "BP12-083"], ex: n(2, REPAIR), deck: ["V1"], playPoints: 2, maxPlayPoints: 5 } }).play("BP12-049").yes();
    expect(four.pp()).toBe(0);
  });

  it("050 Chain Lightning — 4 to the enemy leader; into the EX area with 2 Mage followers; buried from there at your end phase", () => {
    const t = d({ me: { hand: ["BP12-050"], field: ["BP12-042", "BP12-037"], playPoints: 3 }, opp: { deck: ["V1"] } }).play("BP12-050");
    expect([t.leader("opp"), t.ex()]).toEqual([16, ["BP12-050"]]);
    t.end();
    expect([t.ex(), t.cemetery()]).toEqual([[], ["BP12-050"]]);
    expect(d({ me: { hand: ["BP12-050"], field: ["BP12-042"], playPoints: 3 } }).play("BP12-050").cemetery()).toEqual(["BP12-050"]);
  });

  it("051 Mystic Absorption — 4 damage and leader +2 with 2 Mage followers", () => {
    const t = d({ me: { hand: ["BP12-051"], field: ["BP12-042", "BP12-037"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-051");
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 22]);
  });

  it("T03 / T04 Tentacles — Armored: Ward, Last Words leader +4; Assault: Storm, Last Words 4 damage", () => {
    expect(d({ me: { field: [ARMORED], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader()).toBe(24);
    const t = d({ me: { field: [ASSAULT], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } });
    expect(t.keywords(ASSAULT)).toEqual(["storm"]);
    expect(t.play("QUICK-SAC").stats("opp:V5")).toEqual([5, 1]);
  });
});
