import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Havencraft (046–054), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Havencraft", () => {
  it("046 / 047 Satono Crown — Fanfare: leader +2 if it has less defense than the enemy leader; evolved: up to 2 Umamusume cards from the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["ECP01-046"], leaderDefense: 15, playPoints: 3 } }).play("ECP01-046").leader()).toBe(17);
    expect(d({ me: { hand: ["ECP01-046"], playPoints: 3 } }).play("ECP01-046").leader()).toBe(20);
    const e = d({ me: { field: ["ECP01-046"], evolveDeck: ["ECP01-047"], deck: ["CP01-061", "V1", "CP01-023", "V3"], playPoints: 1 } });
    e.evolve("ECP01-046").pick("CP01-061", "CP01-023").order();
    expect(e.ex()).toEqual(["CP01-061", "CP01-023"]);
  });

  it("048 Mejiro Ramonu — Fanfare: choose up to X, X = Mejiro Family cards on your field (banish, Storm, leader +2 and draw)", () => {
    const t = d({ me: { hand: ["ECP01-048"], field: ["ECP01-053", "ECP01-053"], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("ECP01-048").choose("banish", "storm", "leader");
    expect([t.field("opp"), t.keywords("ECP01-048"), t.leader(), t.hand()]).toEqual([[], ["storm"], 22, ["V1"]]);
    const one = d({ me: { hand: ["ECP01-048"], playPoints: 5 }, opp: { field: ["V5"] } }).play("ECP01-048");
    expect(one.game.decision?.type === "choose" && one.game.decision.max).toBe(1);
  });

  it("049 Jungle Pocket — Fanfare, discard an Umamusume card: draw (2 if it cost 7+); act: 2 damage with 3 Umamusume cards, 2 to its leader with 5", () => {
    expect(d({ me: { hand: ["ECP01-049", "ECP01-031"], deck: ["V1", "V3"], playPoints: 2 } }).play("ECP01-049").yes().hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { hand: ["ECP01-049", "CP01-061"], deck: ["V1", "V3"], playPoints: 2 } }).play("ECP01-049").yes().hand()).toEqual(["V1"]);
    const a = d({ me: { field: ["ECP01-049", "CP01-061", "CP01-061", "CP01-023", "CP01-022"] }, opp: { field: ["V5"] } }).activate("ECP01-049");
    expect([a.stats("opp:V5"), a.leader("opp")]).toEqual([[5, 3], 18]);
    const b = d({ me: { field: ["ECP01-049", "CP01-061"] }, opp: { field: ["V5"] } }).activate("ECP01-049");
    expect([b.stats("opp:V5"), b.leader("opp")]).toEqual([[5, 5], 20]);
  });

  it("050 Wonder Acute — On Race: +1/+1, may summon an Umamusume follower or amulet costing 2 or less from the hand; Fanfare: draw", () => {
    const t = d({ me: { field: ["ECP01-050"], evolveDeck: [CARROT], hand: ["CP01-023", "CP01-022"], playPoints: 1 } }).activate("ECP01-050").pick("CP01-023");
    expect([t.field(), t.stats("ECP01-050")]).toEqual([["ECP01-050", "CP01-023"], [4, 4]]);
  });

  it("051 Mejiro Ardan — On Race: +1/+1, up to 2 Mejiro Family followers or amulets costing a total of 6 or less from the deck", () => {
    const t = d({ me: { field: ["ECP01-051"], evolveDeck: [CARROT], deck: ["ECP01-054", "ECP01-048", "ECP01-053", "V1"], playPoints: 1 } });
    t.activate("ECP01-051").pick("ECP01-054").pick("ECP01-053");
    expect([t.field(), t.stats("ECP01-051")]).toEqual([["ECP01-051", "ECP01-054", "ECP01-053"], [4, 4]]);
  });

  it("052 Matikanefukukitaru — Fanfare: the cemetery into the deck, any Fate's Forecasts from the top 7; each one entering: leader +7; Last Words: into the deck", () => {
    const t = d({ me: { hand: ["ECP01-052"], cemetery: ["CP01-073", "CP01-073"], playPoints: 7 } }).play("ECP01-052").pick("CP01-073", "CP01-073").flush();
    expect([t.field(), t.leader()]).toEqual([["ECP01-052", "CP01-073", "CP01-073"], 34]);
    const l = d({ me: { field: ["ECP01-052"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([l.zone("me", "deck").sort(), l.cemetery()]).toEqual([["ECP01-052", "V1"], ["QUICK-SAC"]]);
  });

  it("053 Mejiro Palmer — Storm; doesn't refresh in your start phase; start of your main phase, (1): refresh", () => {
    const t = d({ me: { field: [{ card: "ECP01-053", engaged: true }], deck: ["V1", "V1"], maxPlayPoints: 3 }, opp: { deck: ["V1", "V1"] } }).end().end();
    expect(t.engaged("ECP01-053")).toBe(true);
    t.yes();
    expect([t.engaged("ECP01-053"), t.pp()]).toEqual([false, 3]);
  });

  it("054 Bring 'Em Home, Please! — Fanfare: 2 damage per Mejiro Family card on your field; a Mejiro McQueen enters: 3 damage", () => {
    expect(d({ me: { hand: ["ECP01-054"], field: ["ECP01-053"], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP01-054").stats("opp:V5")).toEqual([5, 1]);
    const m = d({ me: { field: ["ECP01-054"], hand: ["CP01-066"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP01-066").none();
    m.pending("ECP01-054").no();
    expect(m.stats("opp:V5")).toEqual([5, 2]);
  });

  it("054 Bring 'Em Home, Please! — Last Words: evolve an unevolved Mejiro McQueen on your field (no Evolve cost; may decline)", () => {
    const t = d({ me: { field: ["ECP01-054"], hand: ["CP01-066"], evolveDeck: ["CP01-067"], playPoints: 4 } }).play("CP01-066").none();
    t.pending("CP01-066").yes().flush().yes();
    expect([t.stats("CP01-066"), t.pp(), t.leader("opp")]).toEqual([[5, 5], 0, 17]);
  });
});
