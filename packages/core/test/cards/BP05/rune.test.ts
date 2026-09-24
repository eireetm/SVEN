import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Runecraft (035–051) and the Lishenna tokens. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5. Mage
// (魔法使い) followers: BP05-038, 042, 046; Idolatry (アイドル) cards: BP05-047, 048, T01, T02.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP05 Runecraft", () => {
  it("035 / 036 Raio — discard a Mage card for 9 damage; evolved: up to 3 cheap cards from the top 9 into the EX area, 3 less", () => {
    const t = d({ me: { hand: ["BP05-035", "BP05-038"], playPoints: 7 }, opp: { field: ["V5", "V1"] } });
    t.play("BP05-035").yes().pick("opp:V5");
    expect([t.field("opp"), t.cemetery()]).toEqual([["V1"], ["BP05-038"]]);
    const deck = ["BP05-038", "V5", "BP05-051", "V3", "V1", "V1", "V1", "V1", "V1", "V2"];
    const evo = d({ me: { field: ["BP05-035"], evolveDeck: ["BP05-036"], deck, playPoints: 2 } });
    evo.evolve("BP05-035").pick("BP05-038", "BP05-051", "V3").order();
    expect([evo.ex(), evo.zone("me", "deck")[0], evo.canPlay("V3")]).toEqual([["BP05-038", "BP05-051", "V3"], "V2", true]);
  });

  it("037 / T01 / T02 Lishenna — Destruction in White and Black into the EX area; they heal 2 / hit for 2 each main phase", () => {
    expect(d({ me: { hand: ["BP05-037"], playPoints: 4 } }).play("BP05-037").ex()).toEqual(["BP05-T01", "BP05-T02"]);
    const t = d({ me: { field: ["BP05-T01", "BP05-T02"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().end().flush();
    expect([t.leader(), t.leader("opp")]).toEqual([22, 18]);
  });

  it("038 / 039 Apostle of Truth — +2/+2 and Ward with 3 Mage followers; evolved: twice the Mage followers in damage", () => {
    const t = d({ me: { hand: ["BP05-038"], field: ["BP05-042", "BP05-042"] } }).play("BP05-038");
    expect([t.stats("BP05-038"), t.keywords("BP05-038")]).toEqual([[5, 5], ["ward"]]);
    expect(d({ me: { hand: ["BP05-038"], field: ["BP05-042"] } }).play("BP05-038").stats("BP05-038")).toEqual([3, 3]);
    const evo = d({ me: { field: ["BP05-038", "BP05-046"], evolveDeck: ["BP05-039"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(evo.evolve("BP05-038").stats("opp:V5")).toEqual([5, 1]);
  });

  it("040 Safira — Rush; +X/+0 for Runecraft followers in the cemetery; pay 5 for Storm", () => {
    const t = d({ me: { hand: ["BP05-040"], cemetery: ["BP05-038", "BP05-042", "BP05-051"], playPoints: 9 } }).play("BP05-040");
    expect([t.stats("BP05-040"), t.attackTargets("BP05-040")]).toEqual([[4, 6], []]);
    t.activate("BP05-040");
    expect([t.keywords("BP05-040"), t.attackTargets("BP05-040")]).toEqual([["rush", "storm"], ["opp:leader"]]);
  });

  it("041 Destructive Refrain — search Lishenna, or pay 2 more for damage equal to your Idolatry cards", () => {
    const t = d({ me: { hand: ["BP05-041"], deck: ["V1", "BP05-037"] } }).play("BP05-041").choose("search").pick("BP05-037");
    expect(t.hand()).toEqual(["BP05-037"]);
    const hit = d({ me: { hand: ["BP05-041"], field: ["BP05-047", "BP05-T01"] }, opp: { field: ["V1", "V3"] } });
    hit.play("BP05-041").choose("damage").yes();
    expect([hit.field("opp"), hit.stats("opp:V3"), hit.pp()]).toEqual([["V3"], [3, 2], 0]);
  });

  it("042 / 043 Iron Staff Mechanic — a card costing 1 into the EX area, 1 less this turn; the same on evolve", () => {
    const t = d({ me: { hand: ["BP05-042"], deck: ["V3", "V1"], playPoints: 5 } }).play("BP05-042").pick("V1");
    expect([t.ex(), t.canPlay("V1")]).toEqual([["V1"], true]);
    const evo = d({ me: { field: ["BP05-042"], evolveDeck: ["BP05-043"], deck: ["FAN-DRAW"], playPoints: 1 } }).evolve("BP05-042");
    evo.pick("FAN-DRAW");
    expect([evo.ex(), evo.canPlay("FAN-DRAW")]).toEqual([["FAN-DRAW"], true]);
  });

  it("044 Truth's Adjudication — one option, or up to two with 2 Mage followers", () => {
    const t = d({ me: { hand: ["BP05-044"] }, opp: { field: ["V5"] } }).play("BP05-044").choose("leader");
    expect(t.leader("opp")).toBe(17);
    const two = d({ me: { hand: ["BP05-044"], field: ["BP05-046", "BP05-042"], deck: ["V1", "V1"] }, opp: { field: ["V5"] } });
    two.play("BP05-044").choose("draw", "follower");
    expect([two.hand(), two.stats("opp:V5")]).toEqual([["V1", "V1"], [5, 2]]);
  });

  it("045 Monochromatic Destruction — Quick; 2 damage; with 2 Idolatry cards also 2 to its leader and your leader +2", () => {
    const t = d({ me: { hand: ["BP05-045"], field: ["BP05-047", "BP05-T01"] }, opp: { field: ["V5"] } }).play("BP05-045");
    expect([t.stats("opp:V5"), t.leader("opp"), t.leader()]).toEqual([[5, 3], 18, 22]);
    const one = d({ me: { hand: ["BP05-045"], field: ["BP05-047"] }, opp: { field: ["V5"] } }).play("BP05-045");
    expect([one.leader("opp"), one.leader()]).toEqual([20, 20]);
  });

  it("046 Disciple of Truth — leader +1 when you play a Mage card", () => {
    // Playing BP05-038 also triggers its own Fanfare: two pending abilities.
    const t = d({ me: { field: ["BP05-046"], hand: ["BP05-038", "V1"], playPoints: 4 } }).play("BP05-038").flush().play("V1");
    expect(t.leader()).toBe(21);
  });

  it("047 Disciple of Destruction — Ward; draw 2 with 3 Idolatry cards", () => {
    const t = d({ me: { hand: ["BP05-047"], field: ["BP05-048", "BP05-T01"], deck: ["V1", "V1"] } }).play("BP05-047").none();
    expect(t.hand()).toEqual(["V1", "V1"]);
  });

  it("048 / 049 Servant of Destruction — with 3 Idolatry cards it evolves for 0 this turn; evolved: 2 to a follower and its leader", () => {
    const t = d({
      me: { hand: ["BP05-048"], field: ["BP05-047", "BP05-T01"], evolveDeck: ["BP05-049"], playPoints: 2 },
      opp: { field: ["V5"] },
    });
    t.play("BP05-048").evolve("BP05-048");
    expect([t.pp(), t.stats("opp:V5"), t.leader("opp")]).toEqual([0, [5, 3], 18]);
  });

  it("050 Honest Cohort — Quick; 3 damage, or 6 and 3 to its leader with Raio on your field", () => {
    const t = d({ me: { hand: ["BP05-050"] }, opp: { field: ["V5"] } }).play("BP05-050");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 20]);
    const raio = d({ me: { hand: ["BP05-050"], field: ["BP05-035"] }, opp: { field: ["V5"] } }).play("BP05-050");
    expect([raio.field("opp"), raio.leader("opp")]).toEqual([[], 17]);
  });

  it("051 Metaproduction — Quick; a spell from the top 2", () => {
    const t = d({ me: { hand: ["BP05-051"], deck: ["V1", "KILL", "V2"] } }).play("BP05-051").pick("KILL");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["KILL"], ["V2", "V1"]]);
  });
});
