import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// DSD01a (Anne & Grea deck; most cards have only Japanese data). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Academic cards:
// BP21-045 (1c follower), BP09-038 (2c follower), BP17-054 (1c spell). BP21-PR10 is Grea's Ember (グレアの炎熱, also DSD01a-009).
// DSD01a-T01 is the マナリアの魔弾 token spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ACADEMIC = "BP21-045";
const BULLET = "DSD01a-T01";
const SORCERY = "DSD01a-008";

describe("DSD01a Runecraft", () => {
  it("001 Anne, Mysterian Prodigy — Fanfare: Anne's Sorcery into the EX area (the next costs 5 less), or Grea from the deck; both with 10 Academic cards", () => {
    const t = d({ me: { hand: ["DSD01a-001"], deck: ["V1", SORCERY], playPoints: 6 } }).play("DSD01a-001").choose("1").pick(SORCERY);
    expect([t.ex(), t.pp(), t.canPlay(SORCERY)]).toEqual([[SORCERY], 0, true]);
    const both = d({ me: { hand: ["DSD01a-001"], deck: ["DSD01a-002", SORCERY], cemetery: n(10, ACADEMIC), playPoints: 6 } });
    both.play("DSD01a-001").choose("1", "2").pick(SORCERY).pick("DSD01a-002");
    expect([both.field(), both.ex()]).toEqual([["DSD01a-001", "DSD01a-002"], [SORCERY]]);
  });

  it("002 / 003 Grea, Mysterian Dragoness — Fanfare with 10 Academic cards: 4 damage and 1 to its leader; evolved: Academic spells deal 1 more, Grea's Ember from the deck", () => {
    const t = d({ me: { hand: ["DSD01a-002"], cemetery: n(10, ACADEMIC), playPoints: 3 }, opp: { field: ["V5"] } }).play("DSD01a-002");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 19]);
    expect(d({ me: { hand: ["DSD01a-002"], playPoints: 3 }, opp: { field: ["V5"] } }).play("DSD01a-002").stats("opp:V5")).toEqual([5, 5]);
    const boosted = d({ me: { field: [{ card: "DSD01a-002", evolvedInto: "DSD01a-003" }], ex: [BULLET], playPoints: 2 }, opp: { field: ["V5"] } }).play(BULLET);
    expect(boosted.stats("opp:V5")).toEqual([5, 1]);
    const e = d({ me: { field: ["DSD01a-002"], evolveDeck: ["DSD01a-003"], deck: ["BP21-PR10"], playPoints: 1 }, opp: { field: ["V5"] } });
    e.evolve("DSD01a-002").pick("BP21-PR10");
    expect([e.ex(), e.pp(), e.canPlay("BP21-PR10")]).toEqual([["BP21-PR10"], 0, true]);
  });

  it("006 マナリアナイト・オーウェン — Rush; Strike: a マナリアの魔弾 into the EX area; Fanfare with 5 Academic cards: +1/+1 and Assail", () => {
    const t = d({ me: { hand: ["DSD01a-006"], cemetery: n(5, ACADEMIC), playPoints: 2 } }).play("DSD01a-006");
    expect([t.stats("DSD01a-006"), t.keywords("DSD01a-006")]).toEqual([[4, 3], ["rush", "assail"]]);
    expect(d({ me: { field: ["DSD01a-006"] } }).attack("DSD01a-006", "opp:leader").ex()).toEqual([BULLET]);
  });

  it("008 Anne's Sorcery — 4 damage and draw; or (3): with 10 Academic cards 8 damage and draw 2", () => {
    const t = d({ me: { hand: [SORCERY], deck: ["V1"], playPoints: 5 } }).play(SORCERY).choose("1");
    expect([t.leader("opp"), t.hand()]).toEqual([16, ["V1"]]);
    const s = d({ me: { hand: [SORCERY], deck: ["V1", "V3"], cemetery: n(10, ACADEMIC), playPoints: 8 } }).play(SORCERY).choose("2").yes();
    expect([s.leader("opp"), s.hand(), s.pp()]).toEqual([12, ["V1", "V3"], 0]);
    const u = d({ me: { hand: [SORCERY], deck: ["V1", "V3"], playPoints: 8 } }).play(SORCERY).choose("2").yes();
    expect([u.leader("opp"), u.hand()]).toEqual([20, []]);
  });

  it("010 / 011 マナリアの召喚士・ベリル — evolved: up to 2 Academic cards costing 2 or less from the top 5 into the EX area, 2 less", () => {
    const e = d({ me: { field: ["DSD01a-010"], evolveDeck: ["DSD01a-011"], deck: [ACADEMIC, "V1", "BP09-038", "V3"], playPoints: 1 } });
    e.evolve("DSD01a-010").pick(ACADEMIC, "BP09-038").order();
    expect([e.ex(), e.canPlay("BP09-038"), e.canPlay(ACADEMIC)]).toEqual([[ACADEMIC, "BP09-038"], true, true]);
  });

  it("014 マナリアの知識 — additional cost: reveal 2 Academic cards; draw and a マナリアの魔弾", () => {
    const t = d({ me: { hand: ["DSD01a-014", ACADEMIC, "BP09-038"], deck: ["V1"], playPoints: 1 } }).play("DSD01a-014");
    expect([t.hand(), t.ex()]).toEqual([[ACADEMIC, "BP09-038", "V1"], [BULLET]]);
    expect(d({ me: { hand: ["DSD01a-014", ACADEMIC], playPoints: 1 } }).canPlay("DSD01a-014")).toBe(false);
  });

  it("015 術式の教師・ジル — Fanfare: a マナリアの魔弾, or an Academic spell from the cemetery with 5 Academic cards", () => {
    // Without an Academic spell to select, (2) can't be chosen (ruling): (1) is the only option.
    expect(d({ me: { hand: ["DSD01a-015"], playPoints: 1 } }).play("DSD01a-015").ex()).toEqual([BULLET]);
    const t = d({ me: { hand: ["DSD01a-015"], cemetery: ["BP17-054", ...n(4, ACADEMIC)], playPoints: 1 } }).play("DSD01a-015").choose("2");
    expect(t.hand()).toEqual(["BP17-054"]);
    const u = d({ me: { hand: ["DSD01a-015"], cemetery: ["BP17-054", ...n(3, ACADEMIC)], playPoints: 1 } }).play("DSD01a-015").choose("2");
    expect(u.hand()).toEqual([]);
  });

  it("T01 マナリアの魔弾 — 3 damage; with 10 Academic cards 2 to its leader", () => {
    const t = d({ me: { ex: [BULLET], cemetery: n(10, ACADEMIC), playPoints: 2 }, opp: { field: ["V5"] } }).play(BULLET);
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 18]);
  });
});
