import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Swordcraft (018–034). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; AMULET a 1-cost amulet; QUICK-SAC
// destroys a follower of yours (0). BP07-T03 Naterran Great Tree is a token amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";

describe("BP07 Swordcraft", () => {
  it("018 Bayleon — Ward; may put a Tree onto the field or into the EX area, or nowhere", () => {
    expect(d({ me: { hand: ["BP07-018"] } }).play("BP07-018").none().choose("field").field()).toEqual(["BP07-018", TREE]);
    expect(d({ me: { hand: ["BP07-018"] } }).play("BP07-018").none().choose("ex").ex()).toEqual([TREE]);
    const none = d({ me: { hand: ["BP07-018"], ex: ["V1", "V1", "V1", "V1", "V1"] } }).play("BP07-018").none();
    expect(none.decision?.type === "choose" ? none.decision.options.map((o) => o.id) : []).toEqual(["field", "none"]);
    none.choose("none");
    expect(none.field()).toEqual(["BP07-018"]);
  });

  it("019 Bayleon (Evolved) — up to 2 Natura cards from the top 4 into the EX area; banish 2 Trees: a Natura follower +2/+0", () => {
    const t = d({ me: { field: ["BP07-018"], evolveDeck: ["BP07-019"], deck: ["BP07-010", "V1", "BP07-013", "BP07-014"], playPoints: 1 } });
    t.evolve("BP07-018").pick("BP07-010", "BP07-013").order();
    expect([t.ex(), t.zone("me", "deck")]).toEqual([["BP07-010", "BP07-013"], ["V1", "BP07-014"]]);
    const act = d({ me: { field: [{ card: "BP07-018", evolvedInto: "BP07-019" }, TREE, TREE], deck: ["V1", "V1"] } }).activate("BP07-018").flush();
    expect([act.stats("BP07-018"), act.field()]).toEqual([[6, 4], ["BP07-018"]]);
  });

  it("020 Mistolina — Storm; plays a Princess's Strike from the cemetery for 0 (6 damage with her); engage 2 Trees: +3/+0 and leader +2", () => {
    const t = d({ me: { hand: ["BP07-020"], cemetery: ["BP07-028"], playPoints: 6 }, opp: { field: ["V5", "V1"] } });
    t.play("BP07-020").pick("opp:V5");
    expect([t.field("opp"), t.cemetery(), t.pp(), t.keywords("BP07-020")]).toEqual([["V1"], ["BP07-028"], 0, ["storm"]]);
    // Without an enemy follower the Strike is selected but can't be played (ruling).
    const none = d({ me: { hand: ["BP07-020"], cemetery: ["BP07-028"], playPoints: 6 } }).play("BP07-020");
    expect([none.cemetery(), none.decision?.type]).toEqual([["BP07-028"], "mainPhase"]);
    const act = d({ me: { field: ["BP07-020", TREE, TREE, TREE, TREE] } });
    act.activate("BP07-020").pick(TREE, TREE).activate("BP07-020"); // twice a turn (ruling)
    expect([act.stats("BP07-020"), act.leader()]).toEqual([[10, 6], 24]);
  });

  it("021 Tsubaki — destroys with 5 Swordcraft followers in the cemetery; Storm while there are 10", () => {
    const five = Array<string>(5).fill("BP07-029");
    expect(d({ me: { hand: ["BP07-021"], cemetery: five }, opp: { field: ["V5"] } }).play("BP07-021").field("opp")).toEqual([]);
    expect(d({ me: { hand: ["BP07-021"], cemetery: five.slice(1) }, opp: { field: ["V5"] } }).play("BP07-021").field("opp")).toEqual(["V5"]);
    expect(d({ me: { field: ["BP07-021"], cemetery: [...five, ...five] } }).keywords("BP07-021")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP07-021"], cemetery: [...five, ...five.slice(1)] } }).keywords("BP07-021")).toEqual([]);
  });

  it("022 / 023 Leod — Intimidate and Aura while reserved; 1 damage at your end phase; evolved: 2 damage", () => {
    expect(d({ me: { field: ["BP07-022"] } }).keywords("BP07-022")).toEqual(["intimidate", "aura"]);
    expect(d({ me: { field: [{ card: "BP07-022", engaged: true }] } }).keywords("BP07-022")).toEqual([]);
    expect(d({ me: { field: ["BP07-022"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 4]);
    const evo = d({ me: { field: ["BP07-022"], evolveDeck: ["BP07-023"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP07-022").pick("opp:leader");
    expect(evo.leader("opp")).toBe(18);
  });

  it("024 King's Might — engage 2 Trees: 2 less, 1 less with Bayleon (3 less together); 4 damage", () => {
    const t = d({ me: { hand: ["BP07-024"], field: ["BP07-018", TREE, TREE], playPoints: 0 }, opp: { field: ["V5"] } });
    t.play("BP07-024");
    expect([t.stats("opp:V5"), t.engaged(TREE), t.pp()]).toEqual([[5, 1], true, 0]);
    const plain = d({ me: { hand: ["BP07-024"], field: [TREE, TREE], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP07-024").choose("normal");
    expect([plain.pp(), plain.engaged(TREE)]).toEqual([0, false]);
  });

  it("025 / 026 Troya — Bane; evolved: 2 damage, or destroy with 2 Assassin followers in your cemetery", () => {
    expect(d({ me: { field: ["BP07-025"] } }).keywords("BP07-025")).toEqual(["bane"]);
    const two = d({ me: { field: ["BP07-025"], evolveDeck: ["BP07-026"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP07-025");
    expect(two.stats("opp:V5")).toEqual([5, 3]);
    const kill = d({ me: { field: ["BP07-025"], evolveDeck: ["BP07-026"], cemetery: ["BP07-022", "BP07-021"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(kill.evolve("BP07-025").field("opp")).toEqual([]);
  });

  it("027 Valse — 1 + engage: its attack as damage; 3 + engage: banish an enemy amulet", () => {
    const t = d({ me: { field: ["BP07-027"] }, opp: { field: ["V5"] } }).activate("BP07-027").pick("opp:V5");
    expect([t.stats("opp:V5"), t.pp()]).toEqual([[5, 3], 2]);
    const amulet = d({ me: { field: ["BP07-027"] }, opp: { field: ["AMULET"] } }).activate("BP07-027", 1);
    expect(amulet.zone("opp", "banished")).toEqual(["AMULET"]);
  });

  it("028 Princess's Strike — Quick; 2 damage, 6 with Mistolina", () => {
    expect(d({ me: { hand: ["BP07-028"] }, opp: { field: ["V5"] } }).play("BP07-028").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP07-028"], field: ["BP07-020"] }, opp: { field: ["V5"] } }).play("BP07-028").field("opp")).toEqual([]);
  });

  it("029 Swift Tigress — engage a Tree: Storm", () => {
    const t = d({ me: { hand: ["BP07-029"], field: [TREE] } }).play("BP07-029").yes();
    expect([t.keywords("BP07-029"), t.engaged(TREE)]).toEqual([["storm"], true]);
    expect(d({ me: { hand: ["BP07-029"] } }).play("BP07-029").keywords("BP07-029")).toEqual([]);
  });

  it("030 Lupine Axeman — may put a Tree; engage it and any number of Trees: that much damage", () => {
    const t = d({ me: { field: ["BP07-030", TREE, TREE, TREE] }, opp: { field: ["V5"] } }).activate("BP07-030").pick(TREE, TREE);
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP07-030"] } }).play("BP07-030").choose("ex").ex()).toEqual([TREE]);
  });

  it("031 / 032 Dauntless Commander — evolved Last Words: the unevolved card into the EX area; the evolved card goes faceup to the evolve deck", () => {
    const t = d({ me: { field: [{ card: "BP07-031", evolvedInto: "BP07-032" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    const faceUp = t.game.reader().faceUpEvolveDeck(0).map((id) => t.game.state.cards[id]!.def);
    expect([t.ex(), t.cemetery(), faceUp]).toEqual([["BP07-031"], ["QUICK-SAC"], ["BP07-032"]]);
  });

  it("033 Tempered Aether — a Tree onto the field and one into the EX area", () => {
    const t = d({ me: { hand: ["BP07-033"] } }).play("BP07-033");
    expect([t.field(), t.ex()]).toEqual([[TREE], [TREE]]);
  });

  it("034 Elegance in Action — engage an enemy follower and draw (an engaged one too); discarded: engage one", () => {
    const t = d({ me: { hand: ["BP07-034"], deck: ["V1"] }, opp: { field: [{ card: "V5", engaged: true }] } }).play("BP07-034");
    expect(t.hand()).toEqual(["V1"]);
    const discarded = d({ me: { hand: ["BP07-078", "BP07-034"], deck: ["V1"] }, opp: { field: ["V5"] } }).play("BP07-078").yes();
    expect(discarded.engaged("opp:V5")).toBe(true);
  });
});
