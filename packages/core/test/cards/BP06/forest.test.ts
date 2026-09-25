import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Forestcraft (001–017). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral). Hunter
// (狩人) cards: BP06-005, 008, 012, 013; BP01-T02 Fairy Wisp and BP01-T03 Fairy are Pixie tokens.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";

describe("BP06 Forestcraft", () => {
  it("001 / 002 Lymaga — Storm, Bane; summon a Hunter follower costing 4 or less from the top 4", () => {
    const t = d({ me: { hand: ["BP06-001"], deck: ["V1", "BP06-008", "BP06-012", "V5", "V2"], playPoints: 6 } });
    t.play("BP06-001").pick("BP06-008").order();
    // Woodland Cleaver was put there by an ability: it gets Storm.
    expect([t.field(), t.keywords("BP06-001"), t.keywords("BP06-008")]).toEqual([["BP06-001", "BP06-008"], ["storm", "bane"], ["storm"]]);
    const evo = d({ me: { field: ["BP06-001"], evolveDeck: ["BP06-002"], deck: ["BP06-013", "V1"], playPoints: 2 } });
    evo.evolve("BP06-001").pick("BP06-013");
    expect(evo.field()).toEqual(["BP06-001", "BP06-013"]);
  });

  it("003 Amataz — a Fairy into the EX area and +1/+1 to Pixie followers there; engage: Storm to cheap Pixies", () => {
    const t = d({ me: { hand: ["BP06-003"], ex: [FAIRY], field: [FAIRY] } }).play("BP06-003");
    expect([t.ex(), t.stats(`${FAIRY}@ex`), t.stats(`${FAIRY}@field`)]).toEqual([[FAIRY, FAIRY], [2, 2], [1, 1]]);
    t.activate("BP06-003").pick(FAIRY);
    expect(t.keywords(`${FAIRY}@field`)).toEqual(["storm"]);
    t.play(`${FAIRY}@ex`); // the +1/+1 stays when it is played (ruling)
    expect(t.game.state.players[0].zones.field.map((id) => t.game.reader().info(id).attack)).toEqual([1, 2, 2]);
  });

  it("004 Greenbrier Elf — banish a Pixie token from the EX area for a Forestcraft card from the top 4", () => {
    const t = d({ me: { hand: ["BP06-004"], ex: [FAIRY], deck: ["V1", "BP06-011", "V2", "V3", "V5"] } });
    t.play("BP06-004").yes().pick("BP06-011").order();
    expect([t.ex(), t.hand(), t.zone("me", "deck")]).toEqual([[], ["BP06-011"], ["V5", "V1", "V2", "V3"]]);
  });

  it("005 / 006 Wildwood Matriarch — evolves when put onto the field by an ability; evolved revives 2 cheap Hunters", () => {
    const deck = ["BP06-005", "V1", "V2", "V3"];
    const t = d({ me: { hand: ["BP06-001"], deck, evolveDeck: ["BP06-006"], cemetery: ["BP06-013", "BP06-013"], playPoints: 6 } });
    t.play("BP06-001").pick("BP06-005").order().yes().pick("BP06-013", "BP06-013");
    expect([t.field(), t.stats("BP06-005")]).toEqual([["BP06-001", "BP06-005", "BP06-013", "BP06-013"], [4, 4]]);
    const played = d({ me: { hand: ["BP06-005"], evolveDeck: ["BP06-006"], playPoints: 4 } }).play("BP06-005");
    expect(played.stats("BP06-005")).toEqual([3, 3]);
  });

  it("007 Fairy Dragon — Ward; +1/+0 per Pixie token on the field and in the EX area; Last Words: Fairy Wisp and Fairy", () => {
    const t = d({ me: { hand: ["BP06-007"], field: [FAIRY], ex: ["BP01-T02", FAIRY] } }).play("BP06-007").none();
    expect(t.stats("BP06-007")).toEqual([3, 4]);
    const lw = d({ me: { field: ["BP06-007"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(lw.ex()).toEqual(["BP01-T02", FAIRY]);
  });

  it("008 / 009 Woodland Cleaver — no Storm when played; evolved: 2 damage", () => {
    expect(d({ me: { hand: ["BP06-008"] } }).play("BP06-008").keywords("BP06-008")).toEqual([]);
    const evo = d({ me: { field: ["BP06-008"], evolveDeck: ["BP06-009"], playPoints: 1 }, opp: { field: ["V3"] } }).evolve("BP06-008");
    expect(evo.stats("opp:V3")).toEqual([3, 2]);
  });

  it("010 Assault Jaguar — Rush; Last Words: a Hunter card from the top 2, bury the rest", () => {
    const t = d({ me: { field: ["BP06-010"], hand: ["QUICK-SAC"], deck: ["BP06-012", "V1", "V2"] } }).play("QUICK-SAC").pick("BP06-012");
    expect([t.hand(), t.cemetery(), t.zone("me", "deck")]).toEqual([["BP06-012"], ["BP06-010", "QUICK-SAC", "V1"], ["V2"]]);
  });

  it("011 Spiritshine — +2/+2 to a Pixie token on the field or in the EX area, or 2 Fairies into the EX area", () => {
    const t = d({ me: { hand: ["BP06-011"], ex: [FAIRY] } }).play("BP06-011").choose("buff");
    expect(t.stats(FAIRY)).toEqual([3, 3]);
    expect(d({ me: { hand: ["BP06-011"] } }).play("BP06-011").ex()).toEqual([FAIRY, FAIRY]);
  });

  it("012 Greenwood Guardian — Ward; bury the top card, then +0/+1 with 3 Hunter cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP06-012"], deck: ["BP06-013", "V1"], cemetery: ["BP06-013", "BP06-013"] } }).play("BP06-012").none();
    expect([t.stats("BP06-012"), t.cemetery().length]).toEqual([[3, 3], 3]);
    const few = d({ me: { hand: ["BP06-012"], deck: ["V1"] } }).play("BP06-012").none();
    expect(few.stats("BP06-012")).toEqual([3, 2]);
  });

  it("013 Crossbow Sniper — discard a Hunter card: 1 damage to an enemy and draw", () => {
    const t = d({ me: { hand: ["BP06-013", "BP06-012"], deck: ["V1"] } }).play("BP06-013").yes();
    expect([t.leader("opp"), t.hand(), t.cemetery()]).toEqual([19, ["V1"], ["BP06-012"]]);
  });

  it("014 / 015 Mallet Monkey — Storm; pay 2 to summon another Mallet Monkey from the deck", () => {
    const t = d({ me: { hand: ["BP06-014"], deck: ["V1", "BP06-014", "BP06-014"], playPoints: 5 } }).play("BP06-014").yes().pick("BP06-014");
    expect([t.field(), t.pp(), t.keywords("BP06-014")]).toEqual([["BP06-014", "BP06-014"], 0, ["storm"]]);
  });

  it("016 Elven Sentry — Rush, Assail; 1 less for each Fairy on your field", () => {
    const t = d({ me: { hand: ["BP06-016"], field: [FAIRY, FAIRY], playPoints: 3 } }).play("BP06-016");
    expect([t.pp(), t.keywords("BP06-016")]).toEqual([0, ["rush", "assail"]]);
  });

  it("017 Synchronized Slash — engage 2 Hunter followers: 4 damage", () => {
    const t = d({ me: { hand: ["BP06-017"], field: ["BP06-012", "BP06-013"] }, opp: { field: ["V5"] } }).play("BP06-017").yes();
    expect([t.stats("opp:V5"), t.engaged("BP06-012"), t.engaged("BP06-013")]).toEqual([[5, 1], true, true]);
  });
});
