import { describe, expect, it } from "vitest";
import { drive, type DriveSpec, type Driver } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Neutral (079–085), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses.
// CP01-006 (1c 2/1) and CP01-023 (2c 3/2) are Umamusume followers, CP01-008 an Umamusume amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";
const rolls = (t: Driver) => t.events.flatMap((e) => (e.type === "dieRolled" ? [e.result] : []));
function withRolls(build: (seed: string) => Driver, ok: (rolled: number[]) => boolean): Driver {
  for (let i = 0; i < 300; i++) {
    const t = build(`r${i}`);
    if (ok(rolls(t))) return t;
  }
  throw new Error("no seed gives these rolls");
}

describe("CP01 Neutral", () => {
  it("079 Riko Kashimoto [Planned Perfection] — Rush; Strike alone: destroy an enemy follower and 3 to its leader", () => {
    const t = d({ me: { field: ["CP01-079"] }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } }).attack("CP01-079", "opp:V1").pick("opp:V5");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
    const t2 = d({ me: { field: ["CP01-079", "V1"] }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } }).attack("CP01-079", "opp:V1");
    expect(t2.field("opp")).toEqual(["V5"]);
  });

  it("080 Close-Knit Ambitions — reveal the top 6 of the shuffled deck: any Umamusume followers and amulets onto the field, the rest to hand", () => {
    const t = d({ me: { hand: ["CP01-080"], deck: ["CP01-006", "V1", "CP01-008", "V3", "CP01-023", "V5"], playPoints: 10 } }).play("CP01-080");
    t.pick("CP01-006", "CP01-008").flush();
    expect([t.field().sort(), t.hand().sort()]).toEqual([["CP01-006", "CP01-008"], ["CP01-023", "V1", "V3", "V5"]]);
  });

  it("081 Take a Jab! — your main phase: roll; 1: 5 to your leader, 2–5: draw, 6: leader +3 and destroy this", () => {
    const build = (seed: string) => d({ seed, me: { field: ["CP01-081"], deck: ["V1", "V3", "V5"] }, opp: { deck: ["V1"] } }).end().end();
    const six = withRolls(build, (r) => r[0] === 6);
    expect([six.leader(), six.field()]).toEqual([23, []]);
    const one = withRolls(build, (r) => r[0] === 1);
    expect([one.leader(), one.field()]).toEqual([15, ["CP01-081"]]);
    const three = withRolls(build, (r) => r[0] === 3);
    expect(three.hand().length).toBe(2);
  });

  it("082 Aoi Kiryuin [Trainers' Teamwork] — Ward; Fanfare: turn a faceup Carrot facedown and draw; a follower of yours races: +1/+1", () => {
    const t = d({ me: { hand: ["CP01-082"], faceUpEvolveDeck: [CARROT], deck: ["V1"], playPoints: 2 } }).play("CP01-082").none();
    expect([t.game.reader().carrotsToServe(0).length, t.hand()]).toEqual([1, ["V1"]]);
    expect(d({ me: { hand: ["CP01-082"], deck: ["V1"], playPoints: 2 } }).play("CP01-082").none().hand()).toEqual([]);
    const r = d({ me: { field: ["CP01-082", "CP01-075"], evolveDeck: [CARROT], playPoints: 1 } }).activate("CP01-075").flush();
    expect(r.stats("CP01-075")).toEqual([4, 4]);
  });

  it("083 Sasami Anshinzawa — Fanfare: reveal the top card; odd cost: 2 to the enemy leader, even: 2 to your leader", () => {
    expect(d({ me: { hand: ["CP01-083"], deck: ["V3"], playPoints: 2 } }).play("CP01-083").leader("opp")).toBe(18);
    expect(d({ me: { hand: ["CP01-083"], deck: ["CP01-023"], playPoints: 2 } }).play("CP01-083").leader()).toBe(18);
  });

  it("084 Tazuna Hayakawa — Ward; Fanfare: +1/+2 to an Umamusume follower", () => {
    expect(d({ me: { hand: ["CP01-084"], field: ["CP01-023"], playPoints: 4 } }).play("CP01-084").none().stats("CP01-023")).toEqual([4, 4]);
  });

  it("085 Carrot — up to 10 in the evolve deck (CR 6.1.2)", () => {
    const deck = (carrots: number) => ({ leader: "CP01-LD01", main: Array<string>(40).fill("CP01-023"), evolve: Array<string>(carrots).fill(CARROT) });
    const copies = (carrots: number) => E.validateDeck(deck(carrots)).filter((p) => p.includes("Carrot"));
    expect([copies(10), copies(11).length]).toEqual([[], 1]);
  });
});
