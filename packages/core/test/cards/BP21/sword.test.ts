import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Swordcraft (019–036). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Academic (学院) followers: BP21-023 (1c 2/2),
// BP21-027 (1c 1/2), BP21-033 (1c 2/1), BP21-029 (2c 3/2), BP21-030 (2c 2/3); Officer (兵士): 023, 027, 029, 033, 034. Levin
// (レヴィオン): BP21-022, BP21-034. BP20-070 (act 0: 1 damage to a follower of yours). BP16-019 Amelia, Silver Captain (2c);
// BP01-T05 Knight. BP21-019 (Fanfare: a 1-cost follower from the deck) puts followers onto the field by an ability.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const KNIGHT = "BP01-T05";

describe("BP21 Swordcraft", () => {
  it("019 Lecia & Nano, Twilight Trainees — Bane with another Academic follower; Fanfare: a 1-cost follower from the deck", () => {
    expect(d({ me: { field: ["BP21-019", "BP21-030"] } }).keywords("BP21-019")).toEqual(["bane"]);
    expect(d({ me: { field: ["BP21-019", "V1"] } }).keywords("BP21-019")).toEqual([]);
    expect(d({ me: { hand: ["BP21-019"], deck: ["V3", "V1"], playPoints: 3 } }).play("BP21-019").pick("V1").field()).toEqual(["BP21-019", "V1"]);
  });

  it("020 / 021 Galdr, Heroic Headmaster — Fanfare (2): a 2-cost or less Academic follower; evolved: a 3-cost or less one; super-evolved: your Academic followers take 2 less damage", () => {
    const t = d({ me: { hand: ["BP21-020"], deck: ["BP21-030", "V1"], playPoints: 6 } }).play("BP21-020").yes().pick("BP21-030");
    expect([t.field(), t.pp()]).toEqual([["BP21-020", "BP21-030"], 0]);
    const e = d({ me: { field: ["BP21-020"], evolveDeck: ["BP21-021"], deck: ["BP21-019"], playPoints: 1 } }).evolve("BP21-020").pick("BP21-019");
    expect(e.field()).toEqual(["BP21-020", "BP21-019"]);
    const s = d({ me: { field: ["BP21-020", "BP21-030", "BP20-070"], evolveDeck: ["BP21-021"], playPoints: 1, ...SUPER } });
    s.evolve("BP21-020", { sep: true }).flush().activate("BP20-070").pick("BP21-030");
    expect(s.stats("BP21-030")).toEqual([2, 3]);
  });

  it("022 Yurius, Levin Authority — Fanfare, reveal 2 Levin cards: choose 1, or up to 3 with 5 Levin cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP21-022", "BP21-034", "BP21-034"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP21-022").choose("destroy").yes();
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 20]);
    const all = d({ me: { hand: ["BP21-022", "BP21-034", "BP21-034"], cemetery: n(5, "BP21-034"), deck: ["V1", "V3"], playPoints: 3 }, opp: { field: ["V5"] } });
    all.play("BP21-022").choose("destroy", "leader", "draw").yes().pick("V1");
    expect([all.field("opp"), all.leader("opp"), all.hand()]).toEqual([[], 17, ["BP21-034", "BP21-034", "V3"]]);
  });

  it("023 / 024 Agile Twinblader — Storm and Evolve only when put onto the field by an ability; evolved: Strike (2), refresh with another Academic follower, once per turn", () => {
    const hand = d({ me: { hand: ["BP21-023"], evolveDeck: ["BP21-024"], playPoints: 3 } }).play("BP21-023");
    expect([hand.keywords("BP21-023"), hand.canEvolve("BP21-023")]).toEqual([[], false]);
    const t = d({ me: { hand: ["BP21-019"], deck: ["BP21-023"], evolveDeck: ["BP21-024"], playPoints: 4 } }).play("BP21-019").pick("BP21-023");
    expect([t.keywords("BP21-023"), t.canEvolve("BP21-023")]).toEqual([["storm"], true]);
    const s = d({ me: { field: [{ card: "BP21-023", evolvedInto: "BP21-024" }, "BP21-030"], playPoints: 4 } }).attack("BP21-023", "opp:leader").yes();
    expect([s.engaged("BP21-023"), s.pp()]).toEqual([false, 2]);
    s.attack("BP21-023", "opp:leader");
    expect([s.engaged("BP21-023"), s.pp(), s.leader("opp")]).toEqual([true, 2, 14]);
  });

  it("025 Weiss, Discerning Professor — Fanfare: up to 2 Academic followers costing 4 or less in total from the top 5; end phase: damage for each other Academic follower", () => {
    const t = d({ me: { hand: ["BP21-025"], deck: ["BP21-029", "V1", "BP21-030", "BP21-033", "V3"], playPoints: 5 } }).play("BP21-025");
    t.pick("BP21-029").pick("BP21-030").none().order().flush();
    expect(t.field()).toEqual(["BP21-025", "BP21-029", "BP21-030"]);
    const e = d({ me: { field: ["BP21-025", "BP21-030", "BP21-023"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().pick("opp:leader");
    expect(e.leader("opp")).toBe(18);
  });

  it("026 Twilight and Silver — choose an Amelia or a Lecia follower from the deck; both for 2 more play points", () => {
    const t = d({ me: { hand: ["BP21-026"], deck: ["BP16-019", "BP21-019"], playPoints: 4 } }).play("BP21-026").choose("lecia").pick("BP21-019");
    expect(t.field()).toEqual(["BP21-019"]);
    const both = d({ me: { hand: ["BP21-026"], deck: ["BP16-019", "BP21-019", "V1"], playPoints: 6 } }).play("BP21-026").choose("plus2");
    both.choose("amelia", "lecia").pick("BP16-019").pick("BP21-019").pick("V1");
    expect([both.field(), both.pp()]).toEqual([["BP16-019", "BP21-019", "V1"], 0]);
  });

  it("027 / 028 Tony, Plucky Polliwog — Fanfare: evolves when put onto the field by an ability; evolved: draw", () => {
    const t = d({ me: { hand: ["BP21-019"], deck: ["BP21-027", "V1"], evolveDeck: ["BP21-028"], playPoints: 3 } }).play("BP21-019").pick("BP21-027").yes();
    expect([t.stats("BP21-027"), t.hand()]).toEqual([[2, 3], ["V1"]]);
    expect(d({ me: { hand: ["BP21-027"], evolveDeck: ["BP21-028"], playPoints: 1 } }).play("BP21-027").stats("BP21-027")).toEqual([1, 2]);
  });

  it("029 Deadeye Trainee — Ward; Fanfare by an ability: destroy an enemy follower and 1 damage to its leader", () => {
    const t = d({ me: { hand: ["BP21-020"], deck: ["BP21-029"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP21-020").yes().pick("BP21-029").none();
    expect([t.field("opp"), t.leader("opp"), t.keywords("BP21-029")]).toEqual([[], 19, ["ward"]]);
    const hand = d({ me: { hand: ["BP21-029"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP21-029").none();
    expect([hand.field("opp"), hand.leader("opp")]).toEqual([["V5"], 20]);
  });

  it("030 Sharp Strategist — act (X), engage: an Academic follower costing X or less from the cemetery, not a Sharp Strategist", () => {
    const t = d({ me: { field: ["BP21-030"], cemetery: ["BP21-029", "BP21-030", "BP21-023"], playPoints: 3 } }).activate("BP21-030").choose("2").pick("BP21-029");
    expect([t.field(), t.pp(), t.engaged("BP21-030")]).toEqual([["BP21-030", "BP21-029"], 1, true]);
    expect(d({ me: { field: ["BP21-030"], cemetery: ["BP21-030", "BP21-029"], playPoints: 1 } }).canActivate("BP21-030")).toBe(false);
  });

  it("031 / 032 Kitty Sergeant — leader +1 whenever another follower enters your field; evolved: a 4-cost or less follower from the top 4", () => {
    expect(d({ me: { field: ["BP21-031"], hand: ["V1"], playPoints: 1 } }).play("V1").leader()).toBe(21);
    const e = d({ me: { field: ["BP21-031"], evolveDeck: ["BP21-032"], deck: ["V5", "V3", "V1", "V1"], playPoints: 1 } }).evolve("BP21-031").pick("V3").order();
    expect([e.field(), e.leader()]).toEqual([["BP21-031", "V3"], 21]);
  });

  it("033 Fervent Fist-Fighter — Rush; Fanfare by an ability: +2/+0 and Assail", () => {
    const t = d({ me: { hand: ["BP21-019"], deck: ["BP21-033"], playPoints: 3 } }).play("BP21-019").pick("BP21-033");
    expect([t.stats("BP21-033"), t.keywords("BP21-033")]).toEqual([[4, 1], ["rush", "assail"]]);
    expect(d({ me: { hand: ["BP21-033"], playPoints: 1 } }).play("BP21-033").stats("BP21-033")).toEqual([2, 1]);
  });

  it("034 Levin Archer — Fanfare: a Levin card from the top 2, bury the rest; act, engage: 3 damage with 5 Levin cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP21-034"], deck: ["BP21-022", "V1", "V3"], playPoints: 2 } }).play("BP21-034").pick("BP21-022");
    expect([t.hand(), t.cemetery()]).toEqual([["BP21-022"], ["V1"]]);
    expect(d({ me: { field: ["BP21-034"], cemetery: n(5, "BP21-022") }, opp: { field: ["V5"] } }).activate("BP21-034").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { field: ["BP21-034"], cemetery: n(4, "BP21-022") }, opp: { field: ["V5"] } }).activate("BP21-034").stats("opp:V5")).toEqual([5, 5]);
  });

  it("035 Aggressive Advance — engage an Officer follower: 1 less; 4 damage and a Knight; needs a target", () => {
    const t = d({ me: { hand: ["BP21-035"], field: ["BP21-029"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP21-035");
    expect([t.stats("opp:V5"), t.field(), t.engaged("BP21-029")]).toEqual([[5, 1], ["BP21-029", KNIGHT], true]);
    expect(d({ me: { hand: ["BP21-035"], playPoints: 2 } }).canPlay("BP21-035")).toBe(false);
  });

  it("036 Lieutenant's Report — up to 2 Officer followers from the cemetery to hand", () => {
    const t = d({ me: { hand: ["BP21-036"], cemetery: ["BP21-029", "BP21-030", "BP21-033"], playPoints: 2 } }).play("BP21-036").pick("BP21-029", "BP21-033");
    expect([t.hand(), t.cemetery()]).toEqual([["BP21-029", "BP21-033"], ["BP21-030", "BP21-036"]]);
  });
});
