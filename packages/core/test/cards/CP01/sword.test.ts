import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Swordcraft (014–026), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses.
// QUICK-SAC (0) destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CP01 Swordcraft", () => {
  it("014 / 015 Tokai Teio — Fanfare: 2 damage per follower on your field, this one included; evolved: Storm", () => {
    expect(d({ me: { hand: ["CP01-014"], field: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP01-014").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: ["CP01-014"], evolveDeck: ["CP01-015"], playPoints: 2 } }).evolve("CP01-014").keywords("CP01-014")).toEqual(["storm"]);
  });

  it("016 Narita Brian — Bane, Ward, Aura; act, engage: 5 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["CP01-016"] }, opp: { field: ["V5"] } }).activate("CP01-016").pick("opp:leader");
    expect([t.leader("opp"), t.keywords("CP01-016")]).toEqual([15, ["bane", "ward", "aura"]]);
  });

  it("017 Winning Ticket — Storm; Fanfare with Trial Initiation and Narita Taishin in the cemetery: +3/+1", () => {
    expect(d({ me: { hand: ["CP01-017"], cemetery: ["CP01-021", "CP01-023"], playPoints: 3 } }).play("CP01-017").stats("CP01-017")).toEqual([5, 3]);
    expect(d({ me: { hand: ["CP01-017"], cemetery: ["CP01-021"], playPoints: 3 } }).play("CP01-017").stats("CP01-017")).toEqual([2, 2]);
  });

  it("018 Outrunning the Encroaching Heat — Storm, and +1/+1 to an Umamusume follower", () => {
    const t = d({ me: { hand: ["CP01-018"], field: ["CP01-022"], playPoints: 2 } }).play("CP01-018");
    expect([t.stats("CP01-022"), t.keywords("CP01-022")]).toEqual([[5, 5], ["bane", "storm"]]);
  });

  it("019 Air Groove — On Race: +1/+1; refresh up to 1 other follower, which can't attack this turn", () => {
    const t = d({ me: { field: ["CP01-019", { card: "V1", engaged: true }], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } });
    t.activate("CP01-019").pick("V1");
    expect([t.stats("CP01-019"), t.engaged("V1"), t.attackTargets("V1")]).toEqual([[3, 3], false, []]);
  });

  it("020 Hishi Amazon — Rush; Fanfare (3): a 3-cost Umamusume follower from the deck onto the field", () => {
    const t = d({ me: { hand: ["CP01-020"], deck: ["CP01-007", "V3"], playPoints: 6 } }).play("CP01-020").yes().pick("CP01-007");
    expect([t.field(), t.pp()]).toEqual([["CP01-020", "CP01-007"], 0]);
  });

  it("021 Trial Initiation — an Umamusume card from the top 2, or a BNW follower from the cemetery", () => {
    expect(d({ me: { hand: ["CP01-021"], cemetery: ["CP01-023"], playPoints: 1 } }).play("CP01-021").choose("bnw").hand()).toEqual(["CP01-023"]);
    const t = d({ me: { hand: ["CP01-021"], deck: ["V1", "CP01-022"], playPoints: 1 } }).play("CP01-021").pick("CP01-022"); // (2) has no target
    expect(t.hand()).toEqual(["CP01-022"]);
  });

  it("022 Sirius Symboli / 023 Narita Taishin — Bane / Rush", () => {
    expect(d({ me: { field: ["CP01-022", "CP01-023"] } }).keywords("CP01-023")).toEqual(["rush"]);
  });

  it("024 Symboli Rudolf — Last Words: a Tokai Teio from the deck", () => {
    expect(d({ me: { field: ["CP01-024"], hand: ["QUICK-SAC"], deck: ["V1", "CP01-014"] } }).play("QUICK-SAC").pick("CP01-014").hand()).toEqual(["CP01-014"]);
  });

  it("025 Biko Pegasus — On Race: engage an enemy follower", () => {
    expect(d({ me: { field: ["CP01-025"], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP01-025").engaged("opp:V5")).toBe(true);
  });

  it("026 Fuji Kiseki — act (3), engage: 3 damage", () => {
    expect(d({ me: { field: ["CP01-026"], playPoints: 3 }, opp: { field: ["V5"] } }).activate("CP01-026").stats("opp:V5")).toEqual([5, 2]);
  });
});
