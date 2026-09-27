import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// DSD01b (Romaronia deck; most cards have only Japanese data). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). DSD01b-T01 is the
// Aftershock amulet token (Draconic Duelist). BP09-065 Dragonclad Blademaster (2c 3/2) is a Draconic Duelist follower. QUICK-SAC (0)
// destroys a follower of yours. Overflow: 7 or more max play points.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SHOCK = "DSD01b-T01";
const DUELIST = "BP09-065";
const OVERFLOW = { maxPlayPoints: 7 };

describe("DSD01b Dragoncraft", () => {
  it("001 / 002 気高き雷・ロマロニア — Bane; Last Words: an Aftershock, or a lightning counter on each; evolved: 3 damage with an amulet on your field", () => {
    const t = d({ me: { field: ["DSD01b-001"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([t.field(), t.keywords(SHOCK)]).toEqual([[SHOCK], []]);
    const c = d({ me: { field: ["DSD01b-001", SHOCK], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([c.field(), c.counters(SHOCK, "lightning")]).toEqual([[SHOCK], 1]);
    const e = d({ me: { field: ["DSD01b-001", "AMULET"], evolveDeck: ["DSD01b-002"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("DSD01b-001");
    expect([e.stats("opp:V5"), e.keywords("DSD01b-001")]).toEqual([[5, 2], ["assail", "bane"]]);
    expect(d({ me: { field: ["DSD01b-001"], evolveDeck: ["DSD01b-002"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("DSD01b-001").stats("opp:V5")).toEqual([5, 5]);
  });

  it("003 暴竜・伊達政宗 — Bane; Fanfare with 3 Draconic Duelist cards on your field (this and Aftershock too): +2/+2 and Storm", () => {
    const t = d({ me: { hand: ["DSD01b-003"], field: [SHOCK, DUELIST], playPoints: 2 } }).play("DSD01b-003").flush();
    expect([t.stats("DSD01b-003"), t.keywords("DSD01b-003")]).toEqual([[4, 4], ["bane", "storm"]]);
    expect(d({ me: { hand: ["DSD01b-003"], field: [SHOCK], playPoints: 2 } }).play("DSD01b-003").flush().stats("DSD01b-003")).toEqual([2, 2]);
  });

  it("006 Poseidon — Ward; Fanfare: up to 2 Draconic Duelist followers with different names costing 2 or less from the deck", () => {
    const t = d({ me: { hand: ["DSD01b-006"], deck: ["DSD01b-012", "DSD01b-012", DUELIST, "V1"], playPoints: 8 } }).play("DSD01b-006").none();
    t.pick("DSD01b-012").pick(DUELIST);
    expect(t.field()).toEqual(["DSD01b-006", "DSD01b-012", DUELIST]);
  });

  it("007 白亜の竜騎士 — Fanfare: a Draconic Duelist follower costing 4 or less from the deck; with Overflow leader +3", () => {
    const t = d({ me: { hand: ["DSD01b-007"], deck: ["DSD01b-006", DUELIST], playPoints: 5, ...OVERFLOW } }).play("DSD01b-007").pick(DUELIST);
    expect([t.field(), t.leader()]).toEqual([["DSD01b-007", DUELIST], 23]);
    expect(d({ me: { hand: ["DSD01b-007"], deck: [DUELIST], playPoints: 5 } }).play("DSD01b-007").pick(DUELIST).leader()).toBe(20);
  });

  it("010 / 011 片倉小十郎 — Fanfare: another Draconic Duelist follower, +1/+1 with Overflow; evolved: a Draconic Duelist follower from the top 4", () => {
    expect(d({ me: { hand: ["DSD01b-010"], field: [DUELIST], playPoints: 2, ...OVERFLOW } }).play("DSD01b-010").stats(DUELIST)).toEqual([4, 3]);
    expect(d({ me: { hand: ["DSD01b-010"], field: [DUELIST], playPoints: 2 } }).play("DSD01b-010").stats(DUELIST)).toEqual([3, 2]);
    const e = d({ me: { field: ["DSD01b-010"], evolveDeck: ["DSD01b-011"], deck: ["V1", DUELIST, "V3"], playPoints: 1 } }).evolve("DSD01b-010");
    expect(e.pick(DUELIST).order().hand()).toEqual([DUELIST]);
  });

  it("012 大鎌の竜騎 — Bane; Storm while there is another Draconic Duelist card on your field (Aftershock too)", () => {
    expect(d({ me: { field: ["DSD01b-012", SHOCK] } }).keywords("DSD01b-012")).toEqual(["bane", "storm"]);
    expect(d({ me: { field: ["DSD01b-012"] } }).keywords("DSD01b-012")).toEqual(["bane"]);
  });

  it("013 ガルグイユ — Rush, Ward; Fanfare with 3 Draconic Duelist cards on your field: draw 2", () => {
    const t = d({ me: { hand: ["DSD01b-013"], field: [SHOCK, DUELIST], deck: ["V1", "V3"], playPoints: 4 } }).play("DSD01b-013").none().flush();
    expect([t.hand(), t.keywords("DSD01b-013")]).toEqual([["V1", "V3"], ["rush", "ward"]]);
  });

  it("016 残影のドラゴニュート — Rush and Assail with another Draconic Duelist card; Fanfare (1) with Overflow: another from the deck", () => {
    expect(d({ me: { field: ["DSD01b-016", DUELIST] } }).keywords("DSD01b-016")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["DSD01b-016"] } }).keywords("DSD01b-016")).toEqual([]);
    const t = d({ me: { hand: ["DSD01b-016"], deck: ["V1", "DSD01b-016"], playPoints: 2, ...OVERFLOW } }).play("DSD01b-016").yes().pick("DSD01b-016");
    expect([t.field(), t.pp()]).toEqual([["DSD01b-016", "DSD01b-016"], 0]);
  });

  it("T01 Aftershock — a lightning counter when a Draconic Duelist follower enters; engage with 5: a Dragoncraft follower +2 attack; with 10: destroy and 3 to its leader", () => {
    const t = d({ me: { field: [{ card: SHOCK, counters: { lightning: 4 } }], hand: [DUELIST], playPoints: 2 } }).play(DUELIST).flush();
    expect(t.counters(SHOCK, "lightning")).toBe(5);
    expect(t.activate(SHOCK).stats(DUELIST)).toEqual([5, 2]);
    const k = d({ me: { field: [{ card: SHOCK, counters: { lightning: 10 } }] }, opp: { field: ["V5"] } }).activate(SHOCK);
    expect([k.field("opp"), k.leader("opp")]).toEqual([[], 17]);
    expect(d({ me: { field: [{ card: SHOCK, counters: { lightning: 9 } }] }, opp: { field: ["V5"] } }).canActivate(SHOCK)).toBe(false);
  });
});
