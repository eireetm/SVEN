import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Abysscraft (079–097, T01). BP04-083 and 091 are alternate printings. SERPENT is the
// 0/1 Bane token. Sanguine needs your leader to have lost defense this turn: BP03-089 deals 1 to it.
// V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SERPENT = "BP04-T01";
const fillers = (n: number) => Array.from({ length: n }, () => "V1");

describe("BP04 Abysscraft", () => {
  it("079 Venomfang Medusa — summon a Serpent once per turn; Quick: engage and bury 2 Serpents to destroy", () => {
    const t = d({ me: { field: ["BP04-079"] } });
    t.activate("BP04-079");
    expect([t.field(), t.canActivate("BP04-079")]).toEqual([["BP04-079", SERPENT], false]);
    const kill = d({ me: { field: ["BP04-079", SERPENT, SERPENT] }, opp: { field: ["V5"] } });
    kill.activate("BP04-079", 1);
    expect([kill.field(), kill.field("opp"), kill.engaged("BP04-079")]).toEqual([["BP04-079"], [], true]);
    const one = d({ me: { field: ["BP04-079", SERPENT] }, opp: { field: ["V5"] } });
    one.activate("BP04-079"); // only the summon is possible with a single Serpent
    expect(one.field()).toEqual(["BP04-079", SERPENT, SERPENT]);
  });

  it("080 / 081 Howling Demon — 4 damage, 8 with Sanguine; evolved: Storm, leader +5 with Sanguine", () => {
    const t = d({ me: { hand: ["BP04-080"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP04-080");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    const red = d({ me: { hand: ["BP03-089", "BP04-080"], playPoints: 6 }, opp: { field: ["V5"] } });
    red.play("BP03-089").play("BP04-080").flush();
    expect(red.field("opp")).toEqual([]);

    const evo = d({ me: { hand: ["BP03-089"], field: ["BP04-080"], evolveDeck: ["BP04-081"], playPoints: 4 } });
    evo.play("BP03-089").evolve("BP04-080");
    expect([evo.leader(), evo.keywords("BP04-080")]).toEqual([24, ["storm"]]);
    const calm = d({ me: { field: ["BP04-080"], evolveDeck: ["BP04-081"], playPoints: 3 } }).evolve("BP04-080");
    expect(calm.leader()).toBe(20);
  });

  it("082 Demonlord Eachtar — Necrocharge 10: 2 cheap Abysscraft followers back, others +1/+1 (+3/+3 at 20); Abysscraft Rush", () => {
    const cem = [...fillers(8), "BP04-094", "BP04-096"];
    const t = d({ me: { hand: ["BP04-082"], cemetery: cem, playPoints: 7 } });
    t.play("BP04-082").pick("BP04-094", "BP04-096");
    expect([t.field(), t.stats("BP04-094"), t.stats("BP04-096"), t.stats("BP04-082")]).toEqual([
      ["BP04-082", "BP04-094", "BP04-096"],
      [3, 3],
      [3, 3],
      [5, 6],
    ]);
    expect([t.keywords("BP04-082"), t.keywords("BP04-094")]).toEqual([["rush"], ["rush"]]);
    // Exactly 20: both apply even though 2 leave the cemetery (ruling).
    const twenty = d({ me: { hand: ["BP04-082"], cemetery: [...fillers(18), "BP04-094", "BP04-096"], playPoints: 7 } });
    twenty.play("BP04-082").pick("BP04-094", "BP04-096");
    expect(twenty.stats("BP04-094")).toEqual([5, 5]);
    const nine = d({ me: { hand: ["BP04-082"], field: ["V1"], cemetery: [...fillers(7), "BP04-094", "BP04-096"], playPoints: 7 } });
    nine.play("BP04-082");
    expect([nine.field(), nine.stats("V1"), nine.keywords("V1")]).toEqual([["V1", "BP04-082"], [2, 2], []]);
  });

  it("084 / 085 Stheno — a Serpent; whenever a Serpent enters your field, 2 damage to an enemy follower", () => {
    const t = d({ me: { hand: ["BP04-084"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP04-084");
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP04-084", SERPENT], [5, 3]]);
    const evo = d({ me: { field: ["BP04-084"], evolveDeck: ["BP04-085"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP04-084");
    expect([evo.field(), evo.stats("opp:V5")]).toEqual([["BP04-084", SERPENT], [5, 3]]);
  });

  it("086 Trial of the Gorgons — find Medusa, Stheno and Euryale and put them onto the field; any may be skipped", () => {
    const deck = ["BP04-079", "BP04-084", "BP04-089", "V1"];
    const t = d({ me: { hand: ["BP04-086"], deck, playPoints: 7 } });
    t.play("BP04-086").pick("BP04-079").pick("BP04-084").none().flush();
    expect(t.field()).toEqual(["BP04-079", "BP04-084", SERPENT]);
    expect(t.zone("me", "deck").sort()).toEqual(["BP04-089", "V1"]);
    // Room for two: the player picks which ones enter (ruling).
    const room = d({ me: { hand: ["BP04-086"], field: ["V1", "V1", "V1"], deck, playPoints: 7 } });
    room.play("BP04-086").pick("BP04-079").pick("BP04-084").pick("BP04-089").pick("BP04-079", "BP04-089").flush();
    expect(room.field()).toEqual(["V1", "V1", "V1", "BP04-079", "BP04-089"]);
  });

  it("087 / 088 Fenrir — on your turn, whenever it takes damage, 3 damage to an enemy follower (even if it dies)", () => {
    const t = d({ me: { field: ["BP04-087"] }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } });
    t.attack("BP04-087", "opp:V1");
    expect([t.field("opp"), t.stats("opp:V5")]).toEqual([["V5"], [5, 2]]);
    const dies = d({ me: { field: ["BP04-087"] }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } });
    dies.attack("BP04-087", "opp:V5").pick("opp:V3");
    expect([dies.field(), dies.stats("opp:V3")]).toEqual([[], [3, 1]]);
    const evo = d({ me: { field: ["BP04-087"], evolveDeck: ["BP04-088"], playPoints: 1 }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } });
    evo.evolve("BP04-087").attack("BP04-087", "opp:V1");
    expect(evo.stats("opp:V5")).toEqual([5, 2]);
  });

  it("089 Euryale — a Serpent into EX; your Medusa and Stheno have Aura", () => {
    const t = d({ me: { hand: ["BP04-089"], field: ["BP04-079", "BP04-084", "V1"], playPoints: 2 } }).play("BP04-089");
    expect([t.ex(), t.keywords("BP04-079"), t.keywords("BP04-084"), t.keywords("V1")]).toEqual([[SERPENT], ["aura"], ["aura"], []]);
  });

  it("090 Grave Desecration — mill 2; pay 2, engage and bury it to return a Departed follower", () => {
    const t = d({ me: { hand: ["BP04-090"], deck: ["V1", "BP04-093", "V3"], playPoints: 3 } }).play("BP04-090");
    expect(t.cemetery()).toEqual(["V1", "BP04-093"]);
    t.activate("BP04-090");
    expect([t.hand(), t.cemetery()]).toEqual([["BP04-093"], ["V1", "BP04-090"]]);
  });

  it("092 Demonic Drummer — Ward; pay 2 to put another Drummer from the deck; Last Words leader +1", () => {
    const t = d({ me: { hand: ["BP04-092", "QUICK-SAC"], deck: ["V1", "BP04-092"], playPoints: 3 } });
    t.play("BP04-092").none().yes().pick("BP04-092").none(); // the second one cannot pay 2 more
    expect([t.field(), t.pp(), t.keywords("BP04-092")]).toEqual([["BP04-092", "BP04-092"], 0, ["ward"]]);
    t.play("QUICK-SAC").pick("BP04-092");
    expect(t.leader()).toBe(21);
  });

  it("093 Castor — Last Words: pay 2 to put it back onto the field", () => {
    const t = d({ me: { field: ["BP04-093"], hand: ["QUICK-SAC"], playPoints: 2 } }).play("QUICK-SAC").yes();
    expect([t.field(), t.pp()]).toEqual([["BP04-093"], 0]);
    const no = d({ me: { field: ["BP04-093"], hand: ["QUICK-SAC"], playPoints: 2 } }).play("QUICK-SAC").no();
    expect(no.cemetery()).toEqual(["BP04-093", "QUICK-SAC"]);
  });

  it("094 / 095 Frogbat — evolve by banishing 2 cemetery cards; end phase: +0/+1 and leader +1", () => {
    const t = d({ me: { field: ["BP04-094"], evolveDeck: ["BP04-095"], cemetery: ["V1", "V3", "V5"], deck: ["V1"] }, opp: { deck: ["V1"] } });
    t.evolve("BP04-094").pick("V1", "V5");
    expect([t.zone("me", "banished"), t.cemetery(), t.pp(), t.stats("BP04-094")]).toEqual([["V1", "V5"], ["V3"], 3, [3, 3]]); // no play points spent
    t.end();
    expect([t.stats("BP04-094"), t.leader()]).toEqual([[3, 4], 21]);
    expect(d({ me: { field: ["BP04-094"], evolveDeck: ["BP04-095"], cemetery: ["V1"] } }).canEvolve("BP04-094")).toBe(false);
  });

  it("096 Scorpius — Bane; Strike deals 1 to each leader", () => {
    const t = d({ me: { field: ["BP04-096"] } }).attack("BP04-096", "opp:leader");
    expect([t.leader(), t.leader("opp"), t.keywords("BP04-096")]).toEqual([19, 17, ["bane"]]);
  });

  it("097 Venomous Bite — a Serpent, with Rush and Assail if a Gorgon follower is on your field", () => {
    const t = d({ me: { hand: ["BP04-097"], field: ["BP04-089"], playPoints: 1 } }).play("BP04-097");
    expect(t.keywords(SERPENT)).toEqual(["bane", "rush", "assail"]);
    const plain = d({ me: { hand: ["BP04-097"], playPoints: 1 } }).play("BP04-097");
    expect(plain.keywords(SERPENT)).toEqual(["bane"]);
  });

  it("T01 Serpent — Bane destroys what it fights even with 0 attack", () => {
    const t = d({ me: { field: [SERPENT] }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.attack(SERPENT, "opp:V5");
    expect([t.field(), t.field("opp")]).toEqual([[], []]);
  });
});
