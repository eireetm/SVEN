import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Neutral (103–117) and tokens. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral);
// QUICK-SAC destroys one of your followers. BP08-012 Junk and BP08-008 Michelle also cost 1.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const LLOYD = "BP08-T01";
const VICTORIA = "BP08-T02";

describe("BP08 Neutral", () => {
  it("103 Alterplane Arbiter — declare a number, bury the top 5; X damage to each enemy follower, X = buried cards of that cost", () => {
    const t = d({ me: { hand: ["BP08-103"], deck: ["V1", "V1", "V2", "V3", "V1", "V5"], playPoints: 5 }, opp: { field: ["V3", "V5"] } });
    t.play("BP08-103").choose("1");
    expect([t.cemetery().length, t.stats("opp:V3"), t.stats("opp:V5")]).toEqual([5, [3, 1], [5, 2]]);
    const miss = d({ me: { hand: ["BP08-103"], deck: ["V1", "V1", "V2", "V3", "V1"], playPoints: 5 }, opp: { field: ["V3"] } });
    miss.play("BP08-103").choose("other");
    expect(miss.stats("opp:V3")).toEqual([3, 4]);
  });

  it("104 Alterplane Arbiter (Evolved) — 3 differently named cemetery cards go to the hand if their costs match; not playable with fewer names", () => {
    const t = d({ me: { field: ["BP08-103"], evolveDeck: ["BP08-104"], cemetery: ["V1", "BP08-012", "BP08-008", "V2"], playPoints: 2 } });
    t.evolve("BP08-103").pick("V1").pick("BP08-012").pick("BP08-008");
    expect([t.hand().sort(), t.cemetery()]).toEqual([["BP08-008", "BP08-012", "V1"], ["V2"]]);
    const mixed = d({ me: { field: ["BP08-103"], evolveDeck: ["BP08-104"], cemetery: ["V1", "V2", "BP08-012"], playPoints: 2 } });
    mixed.evolve("BP08-103").pick("V1").pick("V2");
    expect([mixed.hand(), mixed.cemetery().length]).toEqual([[], 3]);
    const few = d({ me: { field: ["BP08-103"], evolveDeck: ["BP08-104"], cemetery: ["V1", "V1", "V2"], playPoints: 2 } }).evolve("BP08-103");
    expect([few.decision?.type, few.hand()]).toEqual(["mainPhase", []]);
  });

  it("105 Sylvia — Fanfare destroys an enemy follower and deals 5 to its leader; hand act (2, discard it): destroy one that costs 5 or more", () => {
    const t = d({ me: { hand: ["BP08-105"], playPoints: 7 }, opp: { field: ["V3"] } }).play("BP08-105");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 15]);
    const act = d({ me: { hand: ["BP08-105"], playPoints: 2 }, opp: { field: ["V3", "V5"] } }).activate("BP08-105");
    expect([act.field("opp"), act.cemetery(), act.pp()]).toEqual([["V3"], ["BP08-105"], 0]);
  });

  it("106 / 107 Sahaquiel — may summon a Neutral follower from your hand that returns to your hand at your end phase; evolved: Rush and Assail for all", () => {
    const t = d({ me: { hand: ["BP08-106", "V1"], deck: ["V3"], playPoints: 6 }, opp: { deck: ["V3"] } }).play("BP08-106").pick("V1");
    expect(t.field()).toEqual(["BP08-106", "V1"]);
    t.end();
    expect([t.field(), t.hand()]).toEqual([["BP08-106"], ["V1"]]);
    const decline = d({ me: { hand: ["BP08-106", "V1"], playPoints: 6 } }).play("BP08-106").none();
    expect(decline.field()).toEqual(["BP08-106"]);
    const evo = d({ me: { field: ["BP08-106", "V1"], evolveDeck: ["BP08-107"], playPoints: 2 } }).evolve("BP08-106");
    expect([evo.keywords("V1"), evo.keywords("BP08-106")]).toEqual([["rush", "assail"], ["rush", "assail"]]);
  });

  it("108 Tart Man — Fanfare searches any card; one must be found", () => {
    const t = d({ me: { hand: ["BP08-108"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP08-108");
    expect(t.decision).toMatchObject({ type: "selectCards", reason: "search", min: 1, max: 1 });
    t.pick("V3");
    expect(t.hand()).toEqual(["V3"]);
  });

  it("109 Slash of the One — destroys an enemy card that costs 4 or less (an evolved follower's base cost); 2 to its leader with 2 cards or fewer in hand", () => {
    const t = d({ me: { hand: ["BP08-109", "V1", "V1"], playPoints: 3 }, opp: { field: ["V3", "V5"] } }).play("BP08-109");
    expect([t.field("opp"), t.leader("opp")]).toEqual([["V5"], 18]);
    const full = d({ me: { hand: ["BP08-109", "V1", "V1", "V1"], playPoints: 3 }, opp: { field: [{ card: "BP08-042", evolvedInto: "BP08-043" }] } });
    full.play("BP08-109");
    expect([full.field("opp"), full.leader("opp")]).toEqual([[], 20]);
  });

  it("110 / 111 Reina — damage equal to faceup evolved followers in your evolve deck (not an evolved amulet); evolved turns one facedown and searches a follower", () => {
    const t = d({ me: { hand: ["BP08-110"], faceUpEvolveDeck: ["BP08-020", "BP08-026", "BP08-090"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP08-110");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const evo = d({ me: { field: ["BP08-110"], evolveDeck: ["BP08-111"], faceUpEvolveDeck: ["BP08-020"], deck: ["V1", "BP08-024"], playPoints: 2 } });
    evo.evolve("BP08-110").pick("V1");
    expect([evo.hand(), evo.game.reader().faceUpEvolveDeck(0).length]).toEqual([["V1"], 0]);
    // Without a faceup evolved follower, nothing happens (ruling).
    const none = d({ me: { field: ["BP08-110"], evolveDeck: ["BP08-111"], faceUpEvolveDeck: ["BP08-090"], deck: ["V1"], playPoints: 2 } });
    none.evolve("BP08-110");
    expect([none.decision?.type, none.hand()]).toEqual(["mainPhase", []]);
  });

  it("112 Ephemera — Rush; +1 attack and Assail with 3 cards on the opponent's field", () => {
    const t = d({ me: { hand: ["BP08-112"], playPoints: 1 }, opp: { field: ["V1", "V1", "BP08-024"] } }).play("BP08-112");
    expect([t.stats("BP08-112"), t.keywords("BP08-112")]).toEqual([[3, 1], ["rush", "assail"]]);
    const two = d({ me: { hand: ["BP08-112"], playPoints: 1 }, opp: { field: ["V1", "V1"] } }).play("BP08-112");
    expect([two.stats("BP08-112"), two.keywords("BP08-112")]).toEqual([[2, 1], ["rush"]]);
  });

  it("113 Treasure Map — up to one follower and up to one amulet from the top 7", () => {
    const t = d({ me: { hand: ["BP08-113"], deck: ["V1", "BP08-024", "V3", "BP08-011"], playPoints: 3 } });
    t.play("BP08-113").pick("V3").pick("BP08-024").order();
    expect([t.hand(), t.zone("me", "deck").sort()]).toEqual([["V3", "BP08-024"], ["BP08-011", "V1"]]);
  });

  it("114 Steelclad Minotaur — Rush, Ward; takes 2 less combat damage", () => {
    const t = d({ me: { field: ["BP08-114"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP08-114", "opp:V5");
    expect([t.stats("BP08-114"), t.field("opp"), t.keywords("BP08-114")]).toEqual([[7, 3], [], ["rush", "ward"]]);
  });

  it("115 / 116 High Enchantress — each player puts their top card into their EX area, twice; evolved deals damage equal to your EX area", () => {
    const t = d({ me: { hand: ["BP08-115"], deck: ["V1", "V2", "V3"], playPoints: 4 }, opp: { deck: ["V3", "V5", "V1"] } }).play("BP08-115");
    expect([t.ex(), t.ex("opp")]).toEqual([["V1", "V2"], ["V3", "V5"]]);
    const evo = d({ me: { field: ["BP08-115"], evolveDeck: ["BP08-116"], ex: ["V1", "V1", "V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP08-115");
    expect(evo.stats("opp:V5")).toEqual([5, 2]);
  });

  it("117 Happy Pig — Fanfare and Last Words: leader +1", () => {
    const t = d({ me: { hand: ["BP08-117", "QUICK-SAC"], playPoints: 2 } }).play("BP08-117");
    expect(t.leader()).toBe(21);
    t.play("QUICK-SAC");
    expect(t.leader()).toBe(22);
  });

  it("T01 / T02 / T03 Lloyd, Victoria, Otohime's Vanguard — also named Puppet on the field only; Fanfares", () => {
    const t = d({ me: { ex: [LLOYD, VICTORIA], deck: ["V1"] } });
    expect(t.game.reader().info(t.id(LLOYD)).names).toEqual(["Lloyd"]);
    t.play(LLOYD).none();
    expect([t.leader(), t.game.reader().info(t.id(LLOYD)).names, t.keywords(LLOYD)]).toEqual([22, ["Lloyd", "Puppet"], ["ward"]]);
    t.play(VICTORIA);
    expect([t.hand(), t.keywords(VICTORIA)]).toEqual([["V1"], ["rush", "assail"]]);
    expect(d({ me: { field: ["BP08-T03"] } }).keywords("BP08-T03")).toEqual(["rush"]);
  });

  it("U07 Ms. Tart Man — a different card with Tart Man's text", () => {
    const t = d({ me: { hand: ["BP08-U07"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP08-U07").pick("V1");
    expect([t.hand(), E.db.get("BP08-U07").name]).toEqual([["V1"], "Ms. Tart Man"]);
  });
});
