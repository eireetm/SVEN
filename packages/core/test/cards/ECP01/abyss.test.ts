import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Abysscraft (037–045), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Abysscraft", () => {
  it("037 Hishi Miracle — Fanfare: bury the top 2; the same base cost: draw", () => {
    const t = d({ me: { hand: ["ECP01-037"], deck: ["V1", "CP01-061", "V3"], playPoints: 2 } }).play("ECP01-037");
    expect([t.cemetery().sort(), t.hand()]).toEqual([["CP01-061", "V1"], ["V3"]]);
    expect(d({ me: { hand: ["ECP01-037"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("ECP01-037").hand()).toEqual([]);
  });

  it("038 Hishi Miracle (Evolved) — On Evolve, discard 2 Umamusume cards: draw 2; end phase with 9 faceup Carrots: the opponent buries 20", () => {
    const t = d({
      me: { field: ["ECP01-037"], evolveDeck: ["ECP01-038"], hand: ["CP01-061", "CP01-023"], deck: ["V1", "V3"], faceUpEvolveDeck: Array<string>(9).fill(CARROT), playPoints: 1 },
      opp: { deck: Array<string>(25).fill("V1") },
    });
    t.evolve("ECP01-037").yes();
    expect(t.hand()).toEqual(["V1", "V3"]);
    t.end();
    expect(t.cemetery("opp").length).toBe(20);
  });

  it("039 Daiichi Ruby — Fanfare: up to a 4-cost and a 2-cost Umamusume follower from the cemetery, engaged; another Umamusume follower dies: 1 damage, leader +1", () => {
    const t = d({ me: { hand: ["ECP01-039"], cemetery: ["CP01-022", "CP01-061"], playPoints: 6 } }).play("ECP01-039").pick("CP01-022").pick("CP01-061");
    expect([t.field(), t.engaged("CP01-022"), t.engaged("CP01-061")]).toEqual([["ECP01-039", "CP01-022", "CP01-061"], true, true]);
    const r = d({ me: { field: ["ECP01-039", "CP01-061"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("CP01-061");
    expect([r.leader("opp"), r.leader()]).toEqual([19, 21]);
    // Destroyed together with another Umamusume follower, it triggers for that one (ruling).
    const s = d({ me: { hand: ["FAN-KILL2"], playPoints: 3 }, opp: { field: ["ECP01-039", "CP01-061"] } }).play("FAN-KILL2");
    expect([s.field("opp"), s.leader(), s.leader("opp")]).toEqual([[], 19, 21]);
  });

  it("040 Duramente — Fanfare: destroy, 2 damage to its leader, leader +2, bury the top 2; On Race with 10 Umamusume cards in the cemetery: recover 3", () => {
    const t = d({ me: { hand: ["ECP01-040"], deck: ["V1", "V3"], playPoints: 5 }, opp: { field: ["V5"] } }).play("ECP01-040");
    expect([t.field("opp"), t.leader("opp"), t.leader(), t.cemetery().sort()]).toEqual([[], 18, 22, ["V1", "V3"]]);
    const r = d({ me: { field: ["ECP01-040"], evolveDeck: [CARROT], cemetery: Array<string>(10).fill("CP01-061"), playPoints: 1, maxPlayPoints: 5 } });
    expect([r.activate("ECP01-040").stats("ECP01-040"), r.pp()]).toEqual([[5, 5], 3]);
  });

  it("041 Machikanetannhauser — On Race: up to 1 Umamusume follower costing 3 or less from the cemetery, +1/+1; Fanfare: bury the top card", () => {
    const t = d({ me: { field: ["ECP01-041"], evolveDeck: [CARROT], cemetery: ["CP01-023", "CP01-022"], playPoints: 1 } }).activate("ECP01-041").pick("CP01-023");
    expect([t.field(), t.stats("ECP01-041")]).toEqual([["ECP01-041", "CP01-023"], [4, 4]]);
    expect(d({ me: { hand: ["ECP01-041"], deck: ["V1"], playPoints: 3 } }).play("ECP01-041").cemetery()).toEqual(["V1"]);
  });

  it("042 K.S. Miracle — Ward; destroyed at the start of your main phase; Last Words, discard an Umamusume card: draw", () => {
    const t = d({ me: { field: ["ECP01-042"], hand: ["QUICK-SAC", "CP01-061"], deck: ["V1"] } }).play("QUICK-SAC").yes();
    expect([t.hand(), t.cemetery().sort()]).toEqual([["V1"], ["CP01-061", "ECP01-042", "QUICK-SAC"]]);
    // (The Ward follower may be engaged at the end phase, CR 12.8.2.)
    const m = d({ me: { field: ["ECP01-042"], deck: ["V1", "V3"] }, opp: { deck: ["V1", "V1"] } }).end().none().end();
    expect(m.field()).toEqual([]);
  });

  it("043 Air Shakur — with 20 Umamusume cards in the cemetery: Storm and Strike: +3/+3; On Race: 3 damage to up to 1, +1/+1, bury 2", () => {
    const t = d({ me: { field: ["ECP01-043"], cemetery: Array<string>(20).fill("CP01-061") } });
    expect(t.keywords("ECP01-043")).toEqual(["storm"]);
    t.attack("ECP01-043", "opp:leader");
    expect([t.stats("ECP01-043"), t.leader("opp")]).toEqual([[6, 6], 14]);
    const n = d({ me: { field: ["ECP01-043"], cemetery: Array<string>(19).fill("CP01-061") } });
    expect(n.keywords("ECP01-043")).toEqual([]);
    n.attack("ECP01-043", "opp:leader");
    expect(n.stats("ECP01-043")).toEqual([3, 3]);
    const r = d({ me: { field: ["ECP01-043"], evolveDeck: [CARROT], deck: ["V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("ECP01-043").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("ECP01-043"), r.cemetery().sort()]).toEqual([[5, 2], [4, 4], ["V1", "V3"]]);
  });

  it("044 Manhattan Cafe — act, engage, bury this (10 Umamusume cards in the cemetery): a 2-cost Umamusume follower from the cemetery", () => {
    const t = d({ me: { field: ["ECP01-044"], cemetery: [...Array<string>(9).fill("CP01-061"), "CP01-023"] } }).activate("ECP01-044");
    expect([t.field(), t.cemetery().length]).toEqual([["CP01-023"], 10]);
    expect(d({ me: { field: ["ECP01-044"], cemetery: [...Array<string>(8).fill("CP01-061"), "CP01-023"] } }).canActivate("ECP01-044")).toBe(false);
  });

  it("045 TT Ignition! — bury the top 4: damage to each follower equal to the Umamusume cards buried", () => {
    const t = d({ me: { hand: ["ECP01-045"], field: ["V5"], deck: ["CP01-061", "V1", "CP01-023", "CP01-022"], playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("ECP01-045");
    expect([t.stats("V5"), t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 2], [5, 2], [3, 1]]);
  });
});
