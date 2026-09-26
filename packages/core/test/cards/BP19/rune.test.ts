import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Runecraft (038–055, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell; QUICK-SAC (0) destroys
// one of your followers. Condemned followers: BP19-001; Machina: BP19-041 (6), BP19-044 (2); Mage: BP19-045 (a follower),
// BP19-055 (a spell). BP03-054 Witch's Cauldron; BP01-T10 Magic Sediment (Stack). Tokens: BP19-T02 Multi-Headed Test
// Subject, BP01-T08 Strikeform Golem, BP01-T09 Guardform Golem (Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUBJECT = "BP19-T02";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP19 Runecraft", () => {
  it("038 Sephie, Depraved Convict — act in the hand, Fuse a non-token follower: a fusion counter, draw for a Condemned one; Fanfare, remove a fusion counter: a Multi-Headed Test Subject", () => {
    const t = d({ me: { hand: ["BP19-038", "BP19-001"], deck: ["V1"], playPoints: 4 } }).activate("BP19-038@hand");
    expect([t.ex(), t.counters("BP19-038", "fusion"), t.cemetery(), t.hand()]).toEqual([["BP19-038"], 1, ["BP19-001"], ["V1"]]);
    t.play("BP19-038@ex").yes();
    expect([t.field(), t.counters("BP19-038", "fusion")]).toEqual([["BP19-038", SUBJECT], 0]);
    expect(d({ me: { hand: ["BP19-038", "V1"], deck: ["V3"] } }).activate("BP19-038@hand").hand()).toEqual([]);
  });

  it("039 Sephie (Evolved) — 5 damage or a Multi-Headed Test Subject, both with 10 Condemned followers; super-evolved: up to 2 Test Subjects get Storm", () => {
    expect(d({ me: { field: ["BP19-038"], evolveDeck: ["BP19-039"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).evolve("BP19-038").choose("damage").pick("opp:V5").field("opp")).toEqual(["V1"]);
    const both = d({ me: { field: ["BP19-038"], evolveDeck: ["BP19-039"], cemetery: n(10, "BP19-001"), playPoints: 1 }, opp: { field: ["V5"] } });
    both.evolve("BP19-038").choose("damage", "summon").flush();
    expect([both.field("opp"), both.field()]).toEqual([[], ["BP19-038", SUBJECT]]);
    const s = d({ me: { field: ["BP19-038", "BP19-048", SUBJECT], evolveDeck: ["BP19-039"], playPoints: 1, ...SUPER } });
    s.evolve("BP19-038", { sep: true }).flush().pick("BP19-048", SUBJECT).flush();
    expect([s.keywords("BP19-048"), s.keywords(SUBJECT)]).toEqual([["storm"], ["storm"]]);
  });

  it("040 Simael, Cleansing Enforcer — Storm, Bane, Ward; 1 less per pair of a Mage follower and a Mage spell in the cemetery", () => {
    const pairs = ["BP19-045", "BP19-055", "BP19-045", "BP19-055", "BP19-045"];
    expect(d({ me: { hand: ["BP19-040"], cemetery: pairs, playPoints: 8 } }).canPlay("BP19-040")).toBe(true);
    expect(d({ me: { hand: ["BP19-040"], cemetery: pairs, playPoints: 7 } }).canPlay("BP19-040")).toBe(false);
  });

  it("041 Kyrzael, Killshot Enforcer — Storm; Strike: other Machina followers +1/+1; Fanfare: a Warden of the Trigger from the deck", () => {
    expect(d({ me: { hand: ["BP19-041"], deck: ["V1", "BP19-044"], playPoints: 6 } }).play("BP19-041").pick("BP19-044").flush().field()).toEqual(["BP19-041", "BP19-044"]);
    expect(d({ me: { field: ["BP19-041", "BP19-044"] } }).attack("BP19-041", "opp:leader").stats("BP19-044")).toEqual([4, 3]);
  });

  it("042 / 043 Obsessive Scholar — Fuse: a fusion counter; evolved: 3 damage; act, engage: Drain to a Test Subject", () => {
    const t = d({ me: { hand: ["BP19-042", "V1"] } }).activate("BP19-042@hand");
    expect([t.ex(), t.counters("BP19-042", "fusion")]).toEqual([["BP19-042"], 1]);
    const e = d({ me: { field: ["BP19-042", SUBJECT], evolveDeck: ["BP19-043"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-042");
    expect([e.stats("opp:V5"), e.activate("BP19-042").keywords(SUBJECT)]).toEqual([[5, 2], ["drain"]]);
  });

  it("044 Warden of the Trigger — Fanfare: a Machina card on top may go into the EX area; act, engage, with a 6-cost Machina follower: destroy", () => {
    expect(d({ me: { hand: ["BP19-044"], deck: ["BP19-041"], playPoints: 2 } }).play("BP19-044").pick("BP19-041").ex()).toEqual(["BP19-041"]);
    expect(d({ me: { hand: ["BP19-044"], deck: ["BP19-041", "V1"], playPoints: 2 } }).play("BP19-044").none().zone("me", "deck")).toEqual(["BP19-041", "V1"]);
    expect(d({ me: { field: ["BP19-044", "BP19-041"] }, opp: { field: ["V5"] } }).activate("BP19-044").field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP19-044", "BP19-044"] }, opp: { field: ["V5"] } }).canActivate("BP19-044")).toBe(false);
  });

  it("045 Warden of the Arcane — Fanfare: 2 to each enemy follower, a Mage card from the top 3, bury the rest, the next small Mage card 3 less", () => {
    const t = d({ me: { hand: ["BP19-045"], deck: ["BP19-055", "V1", "V3"], playPoints: 5 }, opp: { field: ["V1", "V3"] } }).play("BP19-045").pick("BP19-055");
    expect([t.field("opp"), t.hand(), t.cemetery(), t.canPlay("BP19-055")]).toEqual([["V3"], ["BP19-055"], ["V1", "V3"], true]);
  });

  it("046 / 047 Devoted Researcher — Fuse: a fusion counter; evolved: a Volunteer Test Subject into the EX area; act, engage and bury a Test Subject: damage equal to its attack", () => {
    expect(d({ me: { hand: ["BP19-046", "V1"] } }).activate("BP19-046@hand").counters("BP19-046", "fusion")).toBe(1);
    expect(d({ me: { field: ["BP19-046"], evolveDeck: ["BP19-047"], deck: ["V1", "BP19-048"], playPoints: 1 } }).evolve("BP19-046").pick("BP19-048").ex()).toEqual(["BP19-048"]);
    const act = d({ me: { field: [{ card: "BP19-046", evolvedInto: "BP19-047" }, "BP19-048"] }, opp: { field: ["V5"] } }).activate("BP19-046");
    expect([act.stats("opp:V5"), act.cemetery()]).toEqual([[5, 3], ["BP19-048"]]);
  });

  it("048 Volunteer Test Subject — fused by a Condemned follower: draw, discard; Fanfare: +2/+2 and Rush with 5 Condemned followers, Assail and Bane with 10; Last Words: draw", () => {
    const f = d({ me: { hand: ["BP19-042", "BP19-048"], deck: ["V1"] } }).activate("BP19-042@hand").flush();
    expect([f.cemetery(), f.hand()]).toEqual([["BP19-048", "V1"], []]);
    const t = d({ me: { hand: ["BP19-048"], cemetery: n(10, "BP19-001"), playPoints: 2 } }).play("BP19-048");
    expect([t.stats("BP19-048"), t.keywords("BP19-048")]).toEqual([[4, 4], ["rush", "assail", "bane"]]);
    expect(d({ me: { field: ["BP19-048"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").hand()).toEqual(["V1"]);
  });

  it("049 Astral Dancer — Ward; Fanfare: a follower of yours +0/+X for the revealed top card's cost; draw it", () => {
    const t = d({ me: { hand: ["BP19-049"], field: ["V1"], deck: ["V5", "V3"], playPoints: 5 } }).play("BP19-049").none().pick("V1");
    expect([t.stats("V1"), t.hand()]).toEqual([[2, 7], ["V5"]]);
  });

  it("050 / 051 Electrokitty — evolved: 2 damage to an enemy leader or follower", () => {
    expect(d({ me: { field: ["BP19-050"], evolveDeck: ["BP19-051"], playPoints: 1 } }).evolve("BP19-050").leader("opp")).toBe(18);
  });

  it("052 Outdoorsmage — Fanfare: a Magic Sediment; act (5), Earth Rite: 3 Guardform or Strikeform Golems", () => {
    expect(d({ me: { hand: ["BP19-052"], playPoints: 2 } }).play("BP19-052").field()).toEqual(["BP19-052", "BP01-T10"]);
    const t = d({ me: { field: ["BP19-052", "BP01-T10"], playPoints: 5 } }).activate("BP19-052");
    t.choose("Strikeform Golem").choose("Strikeform Golem").choose("Guardform Golem").none();
    expect(t.field().filter((id) => id !== "BP19-052" && id !== "BP01-T10")).toEqual(["BP01-T08", "BP01-T08", "BP01-T09"]);
  });

  it("053 Ultramarine Witch — Storm; Fanfare: 4 damage; act in the hand, (1) and discard it: a Witch's Cauldron from the deck", () => {
    expect(d({ me: { hand: ["BP19-053"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP19-053").stats("opp:V5")).toEqual([5, 1]);
    const t = d({ me: { hand: ["BP19-053"], deck: ["BP03-054", "V1"], playPoints: 1 } }).activate("BP19-053@hand").pick("BP03-054").flush();
    expect([t.field(), t.cemetery()]).toEqual([["BP03-054"], ["BP19-053"]]);
  });

  it("054 Feline Magic — an Electrokitty into the EX area; Spellchain (7): 1 less this turn", () => {
    const t = d({ me: { hand: ["BP19-054"], deck: ["V1", "BP19-050"], cemetery: n(7, "KILL"), playPoints: 2 } }).play("BP19-054").pick("BP19-050");
    expect([t.ex(), t.canPlay("BP19-050@ex")]).toEqual([["BP19-050"], true]);
    expect(d({ me: { hand: ["BP19-054"], deck: ["BP19-050"], cemetery: n(6, "KILL"), playPoints: 2 } }).play("BP19-054").pick("BP19-050").canPlay("BP19-050@ex")).toBe(false);
  });

  it("055 Meandering Bolt — draw, then damage equal to the cards in hand", () => {
    const t = d({ me: { hand: ["BP19-055", "V1", "V3"], deck: ["V5"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP19-055");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
  });

  it("T02 Multi-Headed Test Subject — Fanfare: +2/+2 and Rush with 5 Condemned followers; Last Words: draw", () => {
    const t = d({ me: { ex: [SUBJECT], cemetery: n(5, "BP19-001"), playPoints: 2 } }).play(`${SUBJECT}@ex`);
    expect([t.stats(SUBJECT), t.keywords(SUBJECT)]).toEqual([[4, 4], ["rush"]]);
    expect(d({ me: { field: [SUBJECT], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").hand()).toEqual(["V1"]);
  });
});
