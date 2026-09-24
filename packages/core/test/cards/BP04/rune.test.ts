import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Runecraft (038–056). BP04-045 and 050 are alternate printings. V1 is 1c 2/2, V2 2c 2/3,
// V3 3c 3/4, V5 5c 5/5, ZERO 1c 0/3. KILL is a 1-cost spell. SEDIMENT is a Stack amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const spells = (n: number) => Array.from({ length: n }, () => "KILL");

describe("BP04 Runecraft", () => {
  it("038 / 039 Wordwielder Ginger — followers from hand enter without Fanfare and can't attack enemies this turn", () => {
    const one = d({ me: { hand: ["BP04-038", "FAN-DRAW"], deck: ["V1"], playPoints: 7 } });
    one.play("BP04-038").pick("FAN-DRAW");
    expect([one.field(), one.hand(), one.zone("me", "deck")]).toEqual([["BP04-038", "FAN-DRAW"], [], ["V1"]]);
    const storm = d({ me: { hand: ["BP04-038", "STORM"], playPoints: 7 }, opp: { field: [{ card: "V1", engaged: true }] } });
    storm.play("BP04-038").pick("STORM");
    expect(storm.attackTargets("STORM")).toEqual([]);
    const skip = d({ me: { hand: ["BP04-038", "V1"], playPoints: 7 } }).play("BP04-038").none();
    expect(skip.hand()).toEqual(["V1"]);

    const evo = d({ me: { field: ["BP04-038"], evolveDeck: ["BP04-039"], hand: ["FAN-DRAW", "STORM", "V1"], deck: ["V2"], playPoints: 2 } });
    evo.evolve("BP04-038").pick("FAN-DRAW", "STORM");
    expect([evo.field(), evo.hand(), evo.zone("me", "deck"), evo.attackTargets("STORM")]).toEqual([
      ["BP04-038", "FAN-DRAW", "STORM"],
      ["V1"],
      ["V2"],
      [],
    ]);
  });

  it("040 Giant Chimera — Spellchain 10 / 20 / 30: 5 / 10 / 30 damage to the enemy leader and each enemy follower", () => {
    const ten = d({ me: { hand: ["BP04-040"], cemetery: spells(10), playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP04-040");
    expect([ten.leader("opp"), ten.field("opp")]).toEqual([15, []]);
    const twenty = d({ me: { hand: ["BP04-040"], cemetery: spells(20), playPoints: 7 } }).play("BP04-040");
    expect(twenty.leader("opp")).toBe(10);
    const thirty = d({ me: { hand: ["BP04-040"], cemetery: spells(30), playPoints: 7 } }).play("BP04-040");
    expect(thirty.game.state.result?.winner).toBe(0);
    const nine = d({ me: { hand: ["BP04-040"], cemetery: spells(9), playPoints: 7 } }).play("BP04-040");
    expect(nine.leader("opp")).toBe(20);
  });

  it("041 Star Reader Stella — top 4: one to hand, cemetery, top and bottom; Strike may bury the top card", () => {
    const t = d({ me: { hand: ["BP04-041"], deck: ["V1", "V2", "V3", "V5", "ZERO"], playPoints: 3 } });
    t.play("BP04-041").pick("V2").pick("V1").pick("V5");
    expect([t.hand(), t.cemetery(), t.zone("me", "deck")]).toEqual([["V2"], ["V1"], ["V5", "ZERO", "V3"]]);
    expect(t.events.some((e) => e.type === "cardsLookedAt" && e.cards.length === 4)).toBe(true);
    // Three cards: hand, cemetery, top; nothing goes to the bottom (ruling).
    const short = d({ me: { hand: ["BP04-041"], deck: ["V1", "V2", "V3"], playPoints: 3 } });
    short.play("BP04-041").pick("V1").pick("V2");
    expect([short.hand(), short.cemetery(), short.zone("me", "deck")]).toEqual([["V1"], ["V2"], ["V3"]]);

    const strike = d({ me: { field: ["BP04-041"], deck: ["V1", "V2"] } });
    strike.attack("BP04-041", "opp:leader").yes();
    expect([strike.cemetery(), strike.zone("me", "deck")]).toEqual([["V1"], ["V2"]]);
    const keep = d({ me: { field: ["BP04-041"], deck: ["V1", "V2"] } }).attack("BP04-041", "opp:leader").no();
    expect(keep.zone("me", "deck")).toEqual(["V1", "V2"]);
  });

  it("042 / 043 Europa — a faceup Europa in the evolve deck is turned facedown for +1/+1; evolved has Storm, Bane, Ward", () => {
    const t = d({ me: { field: [{ card: "BP04-042", evolvedInto: "BP04-043" }], hand: ["QUICK-SAC", "BP04-042"], playPoints: 2 } });
    expect(t.keywords("BP04-042")).toEqual(["storm", "bane", "ward"]);
    t.play("QUICK-SAC"); // the evolved Europa returns faceup (CR 11.6.1)
    const europa = () => t.game.state.cards[t.id("BP04-043@evolveDeck")]!;
    expect(europa().faceUp).toBe(true);
    t.play("BP04-042");
    expect([europa().faceUp, t.stats("BP04-042@field")]).toEqual([false, [2, 4]]);
    // None faceup: the fanfare cannot be played, no +1/+1 (ruling).
    const none = d({ me: { hand: ["BP04-042"], evolveDeck: ["BP04-043"], playPoints: 2 } }).play("BP04-042");
    expect(none.stats("BP04-042")).toEqual([1, 3]);
  });

  it("044 Chain of Calling — Quick; a Runecraft follower from the top 5; Spellchain (10) recovers 1 play point", () => {
    const t = d({ me: { hand: ["BP04-044"], deck: ["V1", "BP04-046", "V2"], cemetery: spells(10), playPoints: 2 } });
    t.play("BP04-044").pick("BP04-046").order();
    expect([t.hand(), t.zone("me", "deck"), t.pp()]).toEqual([["BP04-046"], ["V1", "V2"], 1]);
    const nine = d({ me: { hand: ["BP04-044"], cemetery: spells(9), playPoints: 2 } }).play("BP04-044");
    expect(nine.pp()).toBe(0); // this spell does not count (ruling); an empty deck is fine
  });

  it("046 Freshman Lou — search a 1-cost spell", () => {
    const t = d({ me: { hand: ["BP04-046"], deck: ["V1", "KILL", "BP04-049"], playPoints: 2 } });
    t.play("BP04-046").pick("KILL");
    expect(t.hand()).toEqual(["KILL"]);
  });

  it("047 / 048 Magic Illusionist — Last Words with Earth Rite put it back; evolved: the base card comes back", () => {
    const t = d({ me: { field: ["BP04-047", SEDIMENT], hand: ["QUICK-SAC"] } });
    t.play("QUICK-SAC").yes(); // the only follower is sacrificed automatically
    expect([t.field(), t.cemetery()]).toEqual([["BP04-047"], ["QUICK-SAC"]]); // the Sediment token used its last counter
    const no = d({ me: { field: ["BP04-047", SEDIMENT], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").no();
    expect(no.field()).toEqual([SEDIMENT]);
    const evo = d({ me: { field: [{ card: "BP04-047", evolvedInto: "BP04-048" }, SEDIMENT], hand: ["QUICK-SAC"] } });
    evo.play("QUICK-SAC").yes();
    expect([evo.field(), evo.stats("BP04-047"), evo.zone("me", "evolveDeck")]).toEqual([["BP04-047"], [2, 2], ["BP04-048"]]);
  });

  it("049 Concentration — leader +3 and a draw; Earth Rite draws 2", () => {
    const t = d({ me: { hand: ["BP04-049"], field: [SEDIMENT], deck: ["V1", "V2"], playPoints: 3 } }).play("BP04-049").yes();
    expect([t.leader(), t.hand(), t.field()]).toEqual([23, ["V1", "V2"], []]);
    const plain = d({ me: { hand: ["BP04-049"], deck: ["V1", "V2"], playPoints: 3 } }).play("BP04-049");
    expect([plain.leader(), plain.hand()]).toEqual([23, ["V1"]]);
  });

  it("051 / 052 Dazzling Healer — leader +2 with a spell in your cemetery; evolved: +2 at Spellchain 5", () => {
    expect(d({ me: { hand: ["BP04-051"], cemetery: ["KILL"], playPoints: 2 } }).play("BP04-051").leader()).toBe(22);
    expect(d({ me: { hand: ["BP04-051"], cemetery: ["V1"], playPoints: 2 } }).play("BP04-051").leader()).toBe(20);
    const evo = d({ me: { field: ["BP04-051"], evolveDeck: ["BP04-052"], cemetery: spells(5), playPoints: 1 } }).evolve("BP04-051");
    expect(evo.leader()).toBe(22);
    const low = d({ me: { field: ["BP04-051"], evolveDeck: ["BP04-052"], cemetery: spells(4), playPoints: 1 } }).evolve("BP04-051");
    expect(low.leader()).toBe(20);
  });

  it("053 Mage of Nightfall — Intimidate; Earth Rite: +2/+1", () => {
    const t = d({ me: { hand: ["BP04-053"], field: [SEDIMENT], playPoints: 3 } }).play("BP04-053").yes();
    expect([t.stats("BP04-053"), t.keywords("BP04-053")]).toEqual([[5, 4], ["intimidate"]]);
    expect(d({ me: { hand: ["BP04-053"], playPoints: 3 } }).play("BP04-053").stats("BP04-053")).toEqual([3, 3]);
  });

  it("054 Astrologist of the Mist — Ward; Earth Rite: +1/+1 to each of your followers, itself included", () => {
    const t = d({ me: { hand: ["BP04-054"], field: [SEDIMENT, "V1"], playPoints: 5 } }).play("BP04-054").none().yes();
    expect([t.stats("BP04-054"), t.stats("V1"), t.keywords("BP04-054")]).toEqual([[6, 6], [3, 3], ["ward"]]);
  });

  it("055 Magic Owl — Rush; discard a spell to draw, on entering and on leaving", () => {
    const t = d({ me: { hand: ["BP04-055", "KILL", "KILL", "V1"], deck: ["V2", "V3"], playPoints: 1 } });
    t.play("BP04-055").yes().pick("KILL");
    expect([t.hand(), t.keywords("BP04-055")]).toEqual([["KILL", "V1", "V2"], ["rush"]]);
    const lw = d({ me: { field: ["BP04-055"], hand: ["QUICK-SAC", "KILL"], deck: ["V2"] } }).play("QUICK-SAC").yes();
    expect([lw.hand(), lw.cemetery()]).toEqual([["V2"], ["BP04-055", "QUICK-SAC", "KILL"]]);
    const none = d({ me: { hand: ["BP04-055", "V1"], deck: ["V2"], playPoints: 1 } }).play("BP04-055");
    expect(none.hand()).toEqual(["V1"]);
  });

  it("056 Starseer's Telescope — Stack; look at the top card", () => {
    const t = d({ me: { hand: ["BP04-056"], deck: ["V5", "V1"], playPoints: 0 } }).play("BP04-056");
    const looked = t.events.find((e) => e.type === "cardsLookedAt");
    expect(looked).toMatchObject({ player: 0, cards: [{ def: "V5" }] });
    expect([t.zone("me", "deck"), t.counters("BP04-056", "stack")]).toEqual([["V5", "V1"], 1]);
  });
});
