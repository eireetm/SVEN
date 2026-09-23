import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Dragoncraft (076–100) and token T11 Dragon (4, 5/5). Overflow = maximum PP >= 7.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DRAGON = "BP01-T11";
const OVERFLOW = { playPoints: 7, maxPlayPoints: 7 };

describe("BP01 Dragoncraft", () => {
  it("076 / 077 Dark Dragoon Forte — Storm; evolved also Aura (enemy spells cannot select it)", () => {
    const t = d({ me: { hand: ["BP01-076"], playPoints: 4 } }).play("BP01-076");
    expect(t.attackTargets("BP01-076")).toEqual(["opp:leader"]);
    const aura = d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: [{ card: "BP01-076", evolvedInto: "BP01-077" }] } });
    expect(aura.canPlay("KILL")).toBe(false); // CR 12.15.2
  });

  it("078 Zirnitra — Dragon token to EX; act puts it onto the field with Rush, Overflow recovers 2", () => {
    const t = d({ me: { hand: ["BP01-078"], ...OVERFLOW } }).play("BP01-078");
    expect(t.ex()).toEqual([DRAGON]);
    t.activate("BP01-078");
    expect(t.field()).toEqual(["BP01-078", DRAGON]);
    expect(t.keywords(DRAGON)).toEqual(["rush"]);
    expect(t.pp()).toBe(4); // 7 - 3 - 2 + 2
  });

  it("079 Aiela — Assail; Last Words +1 maximum play points", () => {
    const t = d({ me: { field: [{ card: "BP01-079", damage: 2 }], hand: ["V1"], playPoints: 1, maxPlayPoints: 5 } }).play("V1");
    expect(t.game.state.players[0].maxPlayPoints).toBe(6);
  });

  it("081 / 082 Shapeshifting Mage — Overflow +3/+3; evolved Assail and Bane", () => {
    const t = d({ me: { hand: ["BP01-081"], ...OVERFLOW } }).play("BP01-081");
    expect(t.stats("BP01-081")).toEqual([5, 5]);
    const evo = d({ me: { field: [{ card: "BP01-081", evolvedInto: "BP01-082" }] }, opp: { field: ["V5"] } });
    evo.attack("BP01-081", "opp:V5"); // Assail reaches the reserved V5; Bane destroys it
    expect(evo.field("opp")).toEqual([]);
  });

  it("083 Phoenix Roost — at each main phase that player may put a follower from the top onto the field", () => {
    const t = d({ me: { field: ["BP01-083"] }, opp: { deck: ["V5", "V1"] } });
    t.end().yes(); // the opponent draws V5, then looks at V1 and puts it onto their field
    expect(t.field("opp")).toEqual(["V1"]);
    expect(t.hand("opp")).toEqual(["V5"]);
  });

  it("084 Wyvern Cavalier — top card into EX, it costs 2 less to play", () => {
    const t = d({ me: { hand: ["BP01-084"], deck: ["V3"], playPoints: 6 } }).play("BP01-084");
    expect(t.ex()).toEqual(["V3"]);
    t.play("V3");
    expect(t.pp()).toBe(0);
  });

  it("085 Dragonewt Scholar — Intimidate; Strike: draw, then discard", () => {
    const t = d({ me: { field: ["BP01-085"], hand: ["V2"], deck: ["V1"] } });
    t.attack("BP01-085", "opp:leader").pick("V2");
    expect(t.hand()).toEqual(["V1"]);
    expect(t.cemetery()).toEqual(["V2"]);
  });

  it("086 / 087 Shenlong — draw 2, discard 1; evolved: leader +5", () => {
    const t = d({ me: { hand: ["BP01-086"], deck: ["V1", "V2"], playPoints: 5 } }).play("BP01-086").none().pick("V2");
    expect(t.hand()).toEqual(["V1"]);
    const evo = d({ me: { field: ["BP01-086"], evolveDeck: ["BP01-087"], playPoints: 2 } }).evolve("BP01-086");
    expect(evo.leader()).toBe(25);
  });

  it("088 Imprisoned Dragon — cannot attack at all", () => {
    const t = d({ me: { field: ["BP01-088"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect(t.attackTargets("BP01-088")).toEqual([]);
  });

  it("089 Conflagration / 099 Dragon Wings — damage to every follower on both sides", () => {
    const t = d({ me: { hand: ["BP01-089"], field: ["V5"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("BP01-089");
    expect([t.field(), t.field("opp")]).toEqual([[], []]);
    const wings = d({ me: { hand: ["BP01-099"], field: ["V3"], ...OVERFLOW }, opp: { field: ["V3"] } }).play("BP01-099");
    expect([wings.stats("V3"), wings.stats("opp:V3")]).toEqual([
      [3, 1],
      [3, 1],
    ]);
  });

  it("090 Serpent Wrath / 098 Blazing Breath — damage; Overflow adds a draw / raises to 4", () => {
    const t = d({ me: { hand: ["BP01-090", "BP01-098"], deck: ["V1"], ...OVERFLOW }, opp: { field: ["V5", "V5"] } });
    t.play("BP01-090").pick("opp:V5");
    expect(t.hand()).toEqual(["BP01-098", "V1"]);
    t.play("BP01-098");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
  });

  it("091 Wyrm Spire — your Dragon tokens have Rush; act destroys a follower, its controller gets a Dragon", () => {
    const t = d({ me: { field: ["BP01-091"] }, opp: { field: ["V5"] } });
    t.activate("BP01-091");
    expect(t.field("opp")).toEqual([DRAGON]);
    expect(t.keywords(`opp:${DRAGON}`)).toEqual([]); // not their Spire
    const own = d({ me: { field: ["BP01-091", "V1"] } }).activate("BP01-091");
    expect(own.keywords(DRAGON)).toEqual(["rush"]);
  });

  it("093 Ivory Dragon (Evolved) — Overflow: draw on evolve", () => {
    const t = d({ me: { field: ["BP01-092"], evolveDeck: ["BP01-093"], deck: ["V1"], ...OVERFLOW } }).evolve("BP01-092");
    expect(t.hand()).toEqual(["V1"]);
  });

  it("094 Fire Lizard / 097 Dread Dragon — 1 to an enemy leader or follower / 7 to a follower", () => {
    const t = d({ me: { hand: ["BP01-094", "BP01-097"], playPoints: 9 }, opp: { field: ["V5"] } });
    t.play("BP01-094").pick("opp:leader").play("BP01-097");
    expect([t.leader("opp"), t.field("opp")]).toEqual([19, []]);
  });

  it("095 Ace Dragoon — Rush; +X attack from another follower (either side)", () => {
    const t = d({ me: { hand: ["BP01-095"], field: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP01-095").pick("opp:V5");
    expect(t.stats("BP01-095")).toEqual([5, 2]);
  });

  it("100 Dragon Emissary — a Dragoncraft card costing 5+ from the top 5", () => {
    const t = d({ me: { hand: ["BP01-100"], deck: ["BP01-094", "BP01-097", "V1"], playPoints: 1 } });
    t.play("BP01-100").pick("BP01-097").order();
    expect(t.hand()).toEqual(["BP01-097"]);
    expect(t.zone("me", "deck")).toEqual(["BP01-094", "V1"]);
  });
});
