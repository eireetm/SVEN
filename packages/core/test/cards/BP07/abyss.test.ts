import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Abysscraft (069–085). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; EVOLVER 2c 2/2 with Evolve [2]
// (EVOLVER-E 4/4); QUICK-SAC destroys a follower of yours (0). Machina (機械): BP07-081 Bone Drone
// 2c, BP07-T01 Assembly Droid. Vampire (吸血鬼): BP06-087 Rookie Succubus 2c, BP06-083 Unleash the
// Nightmare 4c, BP01-T15 Forest Bat. BP01-T14 Ghost.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const machina = (n: number) => Array<string>(n).fill("BP07-081");

describe("BP07 Abysscraft", () => {
  it("069 Mono — evolves only with 5 Machina followers on your field; once per turn, banish 2 Machina cards from the cemetery: an Assembly Droid", () => {
    expect(d({ me: { field: ["BP07-069", DROID, DROID, DROID, DROID], evolveDeck: ["BP07-070"], playPoints: 1 } }).canEvolve("BP07-069")).toBe(true);
    expect(d({ me: { field: ["BP07-069", DROID, DROID, DROID, "V1"], evolveDeck: ["BP07-070"], playPoints: 1 } }).canEvolve("BP07-069")).toBe(false);
    const t = d({ me: { field: ["BP07-069"], cemetery: machina(3) } }).activate("BP07-069").pick("BP07-081", "BP07-081");
    expect([t.field(), t.zone("me", "banished"), t.canActivate("BP07-069")]).toEqual([["BP07-069", DROID], ["BP07-081", "BP07-081"], false]);
  });

  it("070 Mono (Evolved) — Storm; once per turn, pay 2 and banish an Alpha Drive: Machina followers +2/+2 and Rush", () => {
    const t = d({ me: { field: [{ card: "BP07-069", evolvedInto: "BP07-070" }, "BP07-081", "V1"], cemetery: ["BP07-075"], playPoints: 2 } });
    t.activate("BP07-069");
    expect([t.stats("BP07-069"), t.keywords("BP07-069"), t.stats("BP07-081"), t.keywords("BP07-081"), t.stats("V1")]).toEqual([
      [7, 6],
      ["storm", "rush"],
      [4, 4],
      ["rush"],
      [2, 2],
    ]);
    expect(t.zone("me", "banished")).toEqual(["BP07-075"]);
  });

  it("071 Kudlak — up to 2 Vampire cards costing 6 in total from the cemetery into the EX area, free this turn; engage: damage per Vampire card on your field", () => {
    const t = d({ me: { hand: ["BP07-071"], cemetery: ["BP06-087", "BP06-083", "BP02-078"], playPoints: 7 } });
    t.play("BP07-071").pick("BP06-083").pick("BP06-087");
    expect([t.ex(), t.pp(), t.canPlay("BP06-083")]).toEqual([["BP06-083", "BP06-087"], 0, true]);
    t.play("BP06-087"); // a Forest Bat too
    expect(t.field()).toEqual(["BP07-071", "BP06-087", "BP01-T15"]);
    const act = d({ me: { field: ["BP07-071", "BP06-087", "V1"] }, opp: { field: ["V3"] } }).activate("BP07-071");
    expect(act.stats("opp:V3")).toEqual([3, 2]);
  });

  it("072 Aenea — summons a Machina follower costing 3 or less from the deck; Last Words: leader +2", () => {
    const t = d({ me: { hand: ["BP07-072", "QUICK-SAC"], deck: ["V1", "BP07-081", "BP07-080"], playPoints: 4 } }).play("BP07-072").pick("BP07-081");
    expect(t.field()).toEqual(["BP07-072", "BP07-081"]);
    t.play("QUICK-SAC").pick("BP07-072");
    expect(t.leader()).toBe(22);
  });

  it("073 / 074 Doublame — bury the top card; evolved: 2 damage, 4 with Necrocharge (10)", () => {
    expect(d({ me: { hand: ["BP07-073"], deck: ["V1", "V3"] } }).play("BP07-073").cemetery()).toEqual(["V1"]);
    const two = d({ me: { field: ["BP07-073"], evolveDeck: ["BP07-074"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP07-073");
    expect(two.stats("opp:V5")).toEqual([5, 3]);
    const ten = d({ me: { field: ["BP07-073"], evolveDeck: ["BP07-074"], cemetery: Array<string>(10).fill("V1"), playPoints: 1 }, opp: { field: ["V5"] } });
    expect(ten.evolve("BP07-073").stats("opp:V5")).toEqual([5, 1]);
  });

  it("075 Alpha Drive — a Machina follower from the cemetery to the hand (Mono too), or summon a Mono; needs one to select", () => {
    expect(d({ me: { hand: ["BP07-075"], cemetery: ["BP07-069", "V1"] } }).play("BP07-075").choose("hand").hand()).toEqual(["BP07-069"]);
    expect(d({ me: { hand: ["BP07-075"], cemetery: ["BP07-069", "V1"] } }).play("BP07-075").choose("summon").field()).toEqual(["BP07-069"]);
    expect(d({ me: { hand: ["BP07-075"], cemetery: ["V1"] } }).canPlay("BP07-075")).toBe(false);
  });

  it("076 / 077 Nicola — bury the top 2; evolved: a Machina card costing 2 or less from the cemetery into the EX area, 2 less this turn", () => {
    expect(d({ me: { hand: ["BP07-076"], deck: ["V1", "V3", "V5"] } }).play("BP07-076").cemetery()).toEqual(["V1", "V3"]);
    const evo = d({ me: { field: ["BP07-076"], evolveDeck: ["BP07-077"], cemetery: ["BP07-081", "BP07-080"], playPoints: 1 } }).evolve("BP07-076");
    expect([evo.ex(), evo.pp(), evo.canPlay("BP07-081")]).toEqual([["BP07-081"], 0, true]);
  });

  it("078 Hellblaze Demon — discard a card: the top card into the EX area, +1/+1 if a follower (kept when played)", () => {
    const t = d({ me: { hand: ["BP07-078", "V1"], deck: ["V3"], playPoints: 5 } }).play("BP07-078").yes();
    expect([t.ex(), t.cemetery()]).toEqual([["V3"], ["V1"]]);
    t.play("V3");
    expect(t.stats("V3")).toEqual([4, 5]);
    expect(d({ me: { hand: ["BP07-078"], deck: ["V3"] } }).play("BP07-078").ex()).toEqual([]); // nothing to discard
  });

  it("079 Forbidden Art — 4 damage, 6 with Nicola", () => {
    expect(d({ me: { hand: ["BP07-079"] }, opp: { field: ["V5"] } }).play("BP07-079").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP07-079"], field: ["BP07-076"] }, opp: { field: ["V5"] } }).play("BP07-079").field("opp")).toEqual([]);
  });

  it("080 Robozombie — Assail, Bane; Rush while there's another Machina follower on your field", () => {
    expect(d({ me: { field: ["BP07-080", "BP07-081"] } }).keywords("BP07-080")).toEqual(["assail", "bane", "rush"]);
    expect(d({ me: { field: ["BP07-080", "V1"] } }).keywords("BP07-080")).toEqual(["assail", "bane"]);
  });

  it("081 Bone Drone — Last Words: an Assembly Droid", () => {
    expect(d({ me: { field: ["BP07-081"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([DROID]);
  });

  it("082 / 083 Berserk Demon — 3 damage to your leader; evolved: destroy up to 2 enemy followers", () => {
    expect(d({ me: { hand: ["BP07-082"], playPoints: 4 } }).play("BP07-082").leader()).toBe(17);
    const evo = d({ me: { field: ["BP07-082"], evolveDeck: ["BP07-083"] }, opp: { field: ["V5", "V3", "V1"] } }).evolve("BP07-082").pick("opp:V5", "opp:V1");
    expect(evo.field("opp")).toEqual(["V3"]);
  });

  it("084 Ghostwriter — 2 Ghosts when a follower of yours evolves; engage: a Ghost gets Bane", () => {
    const t = d({ me: { field: ["BP07-084", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER");
    expect(t.field()).toEqual(["BP07-084", "EVOLVER", "BP01-T14", "BP01-T14"]);
    t.activate("BP07-084").pick("BP01-T14");
    expect(t.keywords("BP01-T14")).toEqual(["storm", "bane"]);
  });

  it("085 Sanguine Core — a Machina card from the top 2; engage and bury it with 5 Machina cards in the cemetery: an Assembly Droid into the EX area", () => {
    expect(d({ me: { hand: ["BP07-085"], deck: ["V1", "BP07-081"] } }).play("BP07-085").pick("BP07-081").hand()).toEqual(["BP07-081"]);
    expect(d({ me: { field: ["BP07-085"], cemetery: machina(4) } }).canActivate("BP07-085")).toBe(false);
    const act = d({ me: { field: ["BP07-085"], cemetery: machina(5) } }).activate("BP07-085");
    expect([act.ex(), act.field()]).toEqual([[DROID], []]);
  });
});
