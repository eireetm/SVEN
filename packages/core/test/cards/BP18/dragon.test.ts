import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Dragoncraft (058–076, T05, T06). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers; PING-UPTO2 (0) deals 1 damage to up to 2 enemy followers; LW-DRAW has "Last Words: draw a card". Draconic
// Duelists: BP18-058 El (3/3), BP18-060 Tenka (3/2), BP18-071 Loafer (4/1). Togh Keyoh followers: BP18-005, 032, 020.
// Marine: BP17-065. Tokens: BP01-T11 Dragon, BP02-T06 Hellflame Dragon, BP18-T05 Youthful Strike, BP18-T06 Adelle.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const STRIKE = "BP18-T05";
const ADELLE = "BP18-T06";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP18 Dragoncraft", () => {
  it("058 / 059 El, Destructive Dragon — evolved: a Draconic Duelist card from the top 3 into the EX area, 3 less; super-evolved: a Youthful Strike", () => {
    const t = d({ me: { field: ["BP18-058"], evolveDeck: ["BP18-059"], deck: ["V1", "BP18-060", "V3"], playPoints: 1, ...SUPER } });
    t.evolve("BP18-058", { sep: true }).flush().pick("BP18-060").order().flush();
    expect([t.ex(), t.pp(), t.canPlay("BP18-060@ex")]).toEqual([["BP18-060", STRIKE], 0, true]);
  });

  it("060 Tenka, Hot-Blooded Vice-Prez — a big Draconic Duelist attacking: 1 damage to a follower and its leader; Fanfare: a Draconic Duelist card from the top 2", () => {
    const t = d({ me: { field: ["BP18-060", "BP18-071"] }, opp: { field: ["V5"] } }).attack("BP18-071", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 4], 15]);
    expect(d({ me: { hand: ["BP18-060"], deck: ["V1", "BP18-058"], playPoints: 2 } }).play("BP18-060").pick("BP18-058").hand()).toEqual(["BP18-058"]);
  });

  it("061 Fafnir, Cunning Wyrm — Ward; enemy followers going to the cemetery are banished; Fanfare: 8 to each enemy follower, 4 to the leader", () => {
    const t = d({ me: { hand: ["BP18-061"], playPoints: 8 }, opp: { field: ["V5", "LW-DRAW"], deck: ["V1"] } }).play("BP18-061").none();
    expect([t.field("opp"), t.zone("opp", "banished"), t.hand("opp"), t.leader("opp")]).toEqual([[], ["V5", "LW-DRAW"], [], 16]);
  });

  it("062 / 063 Dragon-Eyed Secretary — a big Draconic Duelist attacking: leader +1; evolved: 2 damage, 3 with a big Draconic Duelist", () => {
    expect(d({ me: { field: ["BP18-062", "BP18-071"] } }).attack("BP18-071", "opp:leader").leader()).toBe(21);
    const e = d({ me: { field: ["BP18-062", "BP18-071"], evolveDeck: ["BP18-063"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-062");
    expect(e.stats("opp:V5")).toEqual([5, 2]);
  });

  it("064 Prophetic Dragon — Ward; Fanfare: up to 2 from the cemetery; end phase: 5 damage and leader +1; act in the hand, (2) and discard it: draw", () => {
    const t = d({ me: { hand: ["BP18-064"], cemetery: ["BP18-064", "BP18-064"], playPoints: 9 } }).play("BP18-064").none().pick("BP18-064", "BP18-064").none().flush();
    expect(t.field()).toEqual(["BP18-064", "BP18-064", "BP18-064"]);
    const end = d({ me: { field: ["BP18-064"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().flush();
    expect([end.field("opp"), end.leader()]).toEqual([[], 21]);
    const act = d({ me: { hand: ["BP18-064"], deck: ["V1"], playPoints: 2 } }).activate("BP18-064@hand");
    expect([act.hand(), act.cemetery()]).toEqual([["V1"], ["BP18-064"]]);
  });

  it("065 After-School Break — up to 3 differently named Togh Keyoh followers (3 or less) onto the field, leader +2", () => {
    const t = d({ me: { hand: ["BP18-065"], deck: ["BP18-005", "BP18-032", "BP18-005", "BP18-020", "V1"], playPoints: 7 } });
    t.play("BP18-065").pick("BP18-005").pick("BP18-032").pick("BP18-020").flush();
    expect([t.field(), t.leader()]).toEqual([["BP18-005", "BP18-032", "BP18-020"], 24]);
  });

  it("066 / 067 Neon-Tailed Prefect — Fanfare: another Draconic Duelist +1 attack; a big Draconic Duelist attacking gets +1 attack; evolved: a Draconic Duelist card from the top 2", () => {
    expect(d({ me: { hand: ["BP18-066"], field: ["BP18-060"], playPoints: 2 } }).play("BP18-066").stats("BP18-060")).toEqual([4, 2]);
    expect(d({ me: { field: ["BP18-066", "BP18-071"] } }).attack("BP18-071", "opp:leader").leader("opp")).toBe(15);
    const e = d({ me: { field: ["BP18-066"], evolveDeck: ["BP18-067"], deck: ["V1", "BP18-058"], playPoints: 1 } }).evolve("BP18-066").pick("BP18-058");
    expect(e.hand()).toEqual(["BP18-058"]);
  });

  it("068 / 069 Ian, Dragon Buster — Ward; Fanfare: 5 damage; evolved: an Adelle, Jealous Dragon", () => {
    expect(d({ me: { hand: ["BP18-068"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP18-068").none().field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP18-068"], evolveDeck: ["BP18-069"], playPoints: 1 } }).evolve("BP18-068").field()).toEqual(["BP18-068", ADELLE]);
  });

  it("070 Red-Winged Admissions Gift — Fanfare: a Draconic Duelist card from the top 2; act, engage and bury it, with a big Draconic Duelist: leader +1", () => {
    expect(d({ me: { hand: ["BP18-070"], deck: ["V1", "BP18-058"], playPoints: 1 } }).play("BP18-070").pick("BP18-058").hand()).toEqual(["BP18-058"]);
    expect(d({ me: { field: ["BP18-070", "BP18-071"] } }).activate("BP18-070").leader()).toBe(21);
    expect(d({ me: { field: ["BP18-070", "BP18-060"] } }).canActivate("BP18-070")).toBe(false);
  });

  it("071 / 072 Lightning-Clawed Loafer — Rush and Assail with another Draconic Duelist; back to the hand at the end phase; evolved: Assail", () => {
    expect(d({ me: { field: ["BP18-071", "BP18-060"] } }).keywords("BP18-071")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["BP18-071"] } }).keywords("BP18-071")).toEqual([]);
    expect(d({ me: { field: ["BP18-071"] }, opp: { deck: ["V1"] } }).end().hand()).toEqual(["BP18-071"]);
    expect(d({ me: { field: [{ card: "BP18-071", evolvedInto: "BP18-072" }, "BP18-060"] } }).keywords("BP18-071")).toEqual(["assail"]);
  });

  it("073 Serpent Drake — Rush; Fanfare: +2/+2 with Overflow; taking damage while on your field: another Serpent Drake from the deck", () => {
    expect(d({ me: { hand: ["BP18-073"], maxPlayPoints: 7, playPoints: 4 } }).play("BP18-073").stats("BP18-073")).toEqual([6, 5]);
    const t = d({ me: { field: ["BP18-073"], deck: ["BP18-073", "V1"] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("BP18-073", "opp:V1").pick("BP18-073");
    expect(t.field()).toEqual(["BP18-073", "BP18-073"]);
    const lethal = d({ me: { field: ["BP18-073"], deck: ["BP18-073"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP18-073", "opp:V5");
    expect([lethal.field(), lethal.zone("me", "deck")]).toEqual([[], ["BP18-073"]]);
  });

  it("074 Draconic Mercenary — Ward; Fanfare and act (2), engage: a Hellflame Dragon or a Dragon", () => {
    expect(d({ me: { hand: ["BP18-074"], playPoints: 6 } }).play("BP18-074").none().choose("Dragon").field()).toEqual(["BP18-074", "BP01-T11"]);
    const act = d({ me: { field: ["BP18-074"], playPoints: 2 } }).activate("BP18-074").choose("Hellflame Dragon");
    expect([act.field(), act.engaged("BP18-074")]).toEqual([["BP18-074", "BP02-T06"], true]);
  });

  it("075 Estrella Beast — doesn't take ability damage", () => {
    expect(d({ me: { hand: ["PING-UPTO2"] }, opp: { field: ["BP18-075"] } }).play("PING-UPTO2").pick("opp:BP18-075").stats("opp:BP18-075")).toEqual([3, 4]);
    expect(d({ me: { field: ["V5"] }, opp: { field: [{ card: "BP18-075", engaged: true }] } }).attack("V5", "opp:BP18-075").field("opp")).toEqual([]);
  });

  it("076 Orca Run — Quick; 2 damage, 4 with 5 Marine cards in the cemetery", () => {
    expect(d({ me: { hand: ["BP18-076"], cemetery: n(5, "BP17-065"), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-076").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP18-076"], cemetery: n(4, "BP17-065"), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-076").stats("opp:V5")).toEqual([5, 3]);
  });

  it("T05 Youthful Strike — destroy an enemy follower, Storm to a Togh Keyoh follower of yours", () => {
    const t = d({ me: { ex: [STRIKE], field: ["BP18-005"], playPoints: 2 }, opp: { field: ["V5"] } }).play(`${STRIKE}@ex`);
    expect([t.field("opp"), t.keywords("BP18-005")]).toEqual([[], ["storm"]]);
    expect(d({ me: { ex: [STRIKE], field: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay(`${STRIKE}@ex`)).toBe(false);
  });

  it("T06 Adelle, Jealous Dragon — an Ian put from your field into the cemetery: 5 to the enemy leader", () => {
    const t = d({ me: { field: [ADELLE, "BP18-068"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("BP18-068");
    expect(t.leader("opp")).toBe(15);
  });
});
