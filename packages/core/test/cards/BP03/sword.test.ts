import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Swordcraft. 019, 026 and 031 are alternate printings and have no separate script.
// V1 is 1c 2/2, V2 2c 2/3, V5 5c 5/5, ZERO 1c 0/3, STORM 2c 2/1 with Storm.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP03 Swordcraft", () => {
  it("018 Cinderella — Storm; a Fable counter if another Fable follower is out; Strike mills a cheap follower", () => {
    const lonely = d({ me: { hand: ["BP03-018"], playPoints: 7 } }).play("BP03-018");
    expect([lonely.keywords("BP03-018"), lonely.counters("BP03-018", "fable")]).toEqual([["storm"], 0]);
    const withFable = d({ me: { hand: ["BP03-018"], field: ["BP03-033"], playPoints: 7 } }).play("BP03-018");
    expect(withFable.counters("BP03-018", "fable")).toBe(1);

    const strike = d({
      me: { field: [{ card: "BP03-018", counters: { fable: 1 } }], deck: ["V1", "V2"] },
    });
    strike.attack("BP03-018", "opp:leader").yes().pick("V1");
    expect([strike.leader("opp"), strike.field(), strike.cemetery(), strike.counters("BP03-018", "fable")]).toEqual([
      15,
      ["BP03-018", "V1"],
      ["V2"],
      0,
    ]);
    const decline = d({ me: { field: [{ card: "BP03-018", counters: { fable: 1 } }], deck: ["V1"] } });
    decline.attack("BP03-018", "opp:leader").no();
    expect([decline.leader("opp"), decline.counters("BP03-018", "fable"), decline.zone("me", "deck")]).toEqual([15, 1, ["V1"]]);
    const noCounter = d({ me: { field: ["BP03-018"], deck: ["V1"] } }).attack("BP03-018", "opp:leader");
    expect([noCounter.leader("opp"), noCounter.zone("me", "deck")]).toEqual([15, ["V1"]]);

    const full = d({
      me: { field: [{ card: "BP03-018", counters: { fable: 1 } }, "V1", "V2", "V3", "V5"], deck: ["V1"] },
    });
    full.attack("BP03-018", "opp:leader").yes().pick("V1");
    expect(full.field()).toHaveLength(5);
    expect(full.cemetery()).toEqual(["V1"]);
  });

  it("020 / 021 Valiant Fencer — search another Heroic card; evolve only with a small hand; evolve a Hero without paying", () => {
    const search = d({ me: { hand: ["BP03-020"], deck: ["BP03-020", "BP03-036"], playPoints: 3 } });
    search.play("BP03-020").pick("BP03-036");
    expect(search.hand()).toEqual(["BP03-036"]);
    expect(search.zone("me", "deck")).toEqual(["BP03-020"]);
    const skip = d({ me: { hand: ["BP03-020"], deck: ["BP03-036"], playPoints: 3 } }).play("BP03-020").none();
    expect(skip.hand()).toEqual([]);

    expect(d({ me: { field: ["BP03-020"], hand: ["V1", "V2", "V3"], evolveDeck: ["BP03-021"], playPoints: 1 } }).canEvolve("BP03-020")).toBe(false);
    expect(d({ me: { field: ["BP03-020"], hand: ["V1", "V2"], evolveDeck: ["BP03-021"], playPoints: 1 } }).canEvolve("BP03-020")).toBe(true);

    const chain = d({
      me: { field: ["BP03-020", "BP03-023"], evolveDeck: ["BP03-021", "BP03-024"], cemetery: ["BP03-036"], playPoints: 1 },
    });
    chain.evolve("BP03-020").yes();
    expect([chain.stats("BP03-020"), chain.stats("BP03-023"), chain.field(), chain.pp()]).toEqual([
      [5, 5],
      [3, 3],
      ["BP03-020", "BP03-023", "BP03-036"],
      0,
    ]);
    expect(chain.zone("me", "evolveDeck")).toEqual([]);
    const decline = d({
      me: { field: ["BP03-020", "BP03-023"], evolveDeck: ["BP03-021", "BP03-024"], playPoints: 1 },
    });
    decline.evolve("BP03-020").no();
    expect([decline.stats("BP03-023"), decline.zone("me", "evolveDeck")]).toEqual([[2, 2], ["BP03-024"]]);
    const alone = d({ me: { field: ["BP03-020"], evolveDeck: ["BP03-021"], playPoints: 1 } }).evolve("BP03-020");
    expect(alone.stats("BP03-020")).toEqual([5, 5]);
  });

  it("022 Maisy, Red Riding Hood — a Fable counter next to another Fable follower, then destroy", () => {
    const plain = d({ me: { hand: ["BP03-022"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP03-022");
    expect([plain.counters("BP03-022", "fable"), plain.canActivate("BP03-022")]).toEqual([0, false]);
    const t = d({ me: { hand: ["BP03-022"], field: ["BP03-033"], playPoints: 3 }, opp: { field: ["V5", "V3"] } });
    t.play("BP03-022");
    expect(t.counters("BP03-022", "fable")).toBe(1);
    t.activate("BP03-022").pick("opp:V5");
    expect([t.field("opp"), t.engaged("BP03-022"), t.pp(), t.counters("BP03-022", "fable")]).toEqual([["V3"], true, 0, 0]);
  });

  it("023 / 024 Amerro, Spear Knight — Strike grows beside a Hero; evolve plays a Heroic card for 0", () => {
    const noHero = d({ me: { field: [{ card: "BP03-023", evolvedInto: "BP03-024" }] }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    noHero.attack("BP03-023", "opp:ZERO");
    expect(noHero.stats("BP03-023")).toEqual([3, 3]);

    const spell = d({
      me: { field: ["BP03-023"], evolveDeck: ["BP03-024"], cemetery: ["BP03-037"], deck: ["BP03-036"], playPoints: 3 },
      opp: { field: [{ card: "ZERO", engaged: true }] },
    });
    spell.evolve("BP03-023").pick("BP03-036").attack("BP03-023", "opp:ZERO");
    expect([spell.stats("BP03-036"), spell.stats("BP03-023"), spell.pp()]).toEqual([[3, 3], [4, 4], 0]);

    const full = d({
      me: { field: ["BP03-023", "V1", "V1", "V1", "V1"], evolveDeck: ["BP03-024"], cemetery: ["BP03-036", "BP03-037"], deck: ["V2"], playPoints: 3 },
    });
    // Field full: the follower can still be selected and stays in the cemetery (ruling), so the
    // player is not forced into the Heroic spell.
    full.evolve("BP03-023").pick("BP03-036");
    expect(full.field()).toHaveLength(5);
    expect(full.cemetery()).toEqual(["BP03-036", "BP03-037"]);
    expect(full.zone("me", "deck")).toEqual(["V2"]);
    expect(full.decision?.type).toBe("mainPhase");
  });

  it("025 Castle in the Sky — search a follower that has Storm now; buff one; put Storm followers from hand", () => {
    const search = d({ me: { hand: ["BP03-025"], deck: ["STORM", "BP03-028"], playPoints: 2 } });
    search.play("BP03-025").pick("STORM");
    expect([search.hand(), search.zone("me", "deck")]).toEqual([["STORM"], ["BP03-028"]]);
    const notStorm = d({ me: { hand: ["BP03-025"], deck: ["BP03-028"], playPoints: 2 } }).play("BP03-025");
    expect(notStorm.hand()).toEqual([]);
    const skip = d({ me: { hand: ["BP03-025"], deck: ["STORM"], playPoints: 2 } }).play("BP03-025").none();
    expect(skip.hand()).toEqual([]);

    const buff = d({ me: { hand: ["GIVE-STORM"], field: ["BP03-025", "V1"] } });
    buff.play("GIVE-STORM").activate("BP03-025");
    expect([buff.stats("V1"), buff.field(), buff.cemetery()]).toEqual([[3, 2], ["V1"], ["GIVE-STORM", "BP03-025"]]);

    const put = d({ me: { field: ["BP03-025"], hand: ["STORM", "V1"], playPoints: 10 } });
    put.activate("BP03-025").pick("STORM");
    expect([put.stats("STORM"), put.hand(), put.cemetery(), put.pp()]).toEqual([[4, 3], ["V1"], ["BP03-025"], 0]);
    const none = d({ me: { field: ["BP03-025"], hand: ["STORM"], playPoints: 10 } });
    none.activate("BP03-025").none();
    expect([none.hand(), none.field(), none.cemetery()]).toEqual([["STORM"], [], ["BP03-025"]]);
  });

  it("027 Young Ogrehunter Momo — Assail; Rush beside a Fable follower; draw and discard on a small defender", () => {
    const rushed = d({ me: { hand: ["BP03-027"], field: ["BP03-033"], playPoints: 4 }, opp: { field: ["V1"] } });
    rushed.play("BP03-027");
    expect(rushed.keywords("BP03-027")).toEqual(["assail", "rush"]);
    expect(rushed.attackTargets("BP03-027")).toEqual(["V1"]);
    const late = d({ me: { hand: ["BP03-027"], playPoints: 4 }, opp: { field: ["V1"] } }).play("BP03-027");
    expect([late.keywords("BP03-027"), late.attackTargets("BP03-027")]).toEqual([["assail"], []]);

    const draw = d({ me: { field: ["BP03-027"], hand: ["V2"], deck: ["V1"] }, opp: { field: ["ZERO"] } });
    draw.attack("BP03-027", "opp:ZERO").pick("V2");
    expect([draw.hand(), draw.cemetery("opp"), draw.stats("BP03-027")]).toEqual([["V1"], ["ZERO"], [5, 5]]);
    const big = d({ me: { field: ["BP03-027"], hand: ["V2"], deck: ["V1"] }, opp: { field: ["BP03-001"] } });
    big.attack("BP03-027", "opp:BP03-001");
    expect([big.hand(), big.zone("me", "deck"), big.stats("opp:BP03-001")]).toEqual([["V2"], ["V1"], [5, 2]]);
    // With Wood of Brambles, both Follower Strikes are pending and the player picks the order
    // (CR 10.7.3.1; confirmed by a judge, docs/open-questions.md). Momo first: it draws and
    // discards, then the 2 damage destroys the defender.
    const brambles = { me: { field: ["BP03-027", "BP03-011"], hand: ["V2"], deck: ["V1"] }, opp: { field: [{ card: "V1", engaged: true }] } };
    const first = d(brambles).attack("BP03-027", "opp:V1").pending("BP03-027").pick("V2").flush();
    expect([first.field("opp"), first.hand(), first.cemetery()]).toEqual([[], ["V1"], ["V2"]]);
    // Brambles first: the defender is destroyed, so it is no longer "the enemy follower" and
    // Momo's condition is not met.
    const gone = d(brambles).attack("BP03-027", "opp:V1");
    const wood = gone.game.state.pending.find((p) => p.sourceDef === "grant:followerStrike2")!.id;
    gone.answer({ type: "selectPending", id: wood }).flush();
    expect([gone.field("opp"), gone.hand(), gone.zone("me", "deck")]).toEqual([[], ["V2"], ["V1"]]);
  });

  it("028 / 029 Mach Knight — Storm when played from outside hand; evolve deals 2, or 4 with 2 Heroes in the cemetery", () => {
    const fromHand = d({ me: { hand: ["BP03-028"], playPoints: 3 } }).play("BP03-028");
    expect(fromHand.keywords("BP03-028")).toEqual([]);
    const fromCem = d({
      me: { field: ["BP03-023"], evolveDeck: ["BP03-024"], cemetery: ["BP03-028"], playPoints: 3 },
    });
    fromCem.evolve("BP03-023");
    expect(fromCem.keywords("BP03-028")).toEqual(["storm"]);
    expect(fromCem.stats("BP03-028")).toEqual([3, 3]);

    const two = d({ me: { field: ["BP03-028"], evolveDeck: ["BP03-029"], cemetery: ["BP03-020", "BP03-036"], playPoints: 1 }, opp: { field: ["V5"] } });
    two.evolve("BP03-028");
    expect([two.stats("BP03-028"), two.stats("opp:V5")]).toEqual([[4, 4], [5, 1]]);
    const few = d({ me: { field: ["BP03-028"], evolveDeck: ["BP03-029"], cemetery: ["BP03-020"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    few.evolve("BP03-028").pick("opp:V3");
    expect([few.stats("BP03-028"), few.stats("opp:V3"), few.stats("opp:V5")]).toEqual([[4, 4], [3, 2], [5, 5]]);
  });

  it("030 Kiss of the Princess — costs 1 less beside a Princess; +1 attack or return Sword followers and draw", () => {
    expect(d({ me: { hand: ["BP03-030"], field: ["BP03-012"], playPoints: 0 } }).canPlay("BP03-030")).toBe(true);
    expect(d({ me: { hand: ["BP03-030"], playPoints: 0 } }).canPlay("BP03-030")).toBe(false);

    const buff = d({ me: { hand: ["BP03-030"], field: ["V1"], playPoints: 1 } });
    buff.play("BP03-030").choose("buff").yes();
    expect([buff.stats("V1"), buff.counters("V1", "fable"), buff.pp()]).toEqual([[3, 2], 1, 0]);
    const noCounter = d({ me: { hand: ["BP03-030"], field: ["V1", "V2"], playPoints: 1 } });
    noCounter.play("BP03-030").choose("buff").pick("V2").no();
    expect([noCounter.stats("V2"), noCounter.counters("V2", "fable")]).toEqual([[3, 3], 0]);

    const back = d({
      me: { hand: ["BP03-030"], cemetery: ["BP03-033", "BP03-036", "V1"], deck: ["V2"], playPoints: 1 },
    });
    back.play("BP03-030").pick("BP03-033", "BP03-036");
    expect(back.cemetery()).toEqual(["V1", "BP03-030"]);
    expect(back.hand()).toHaveLength(1);
    expect(back.zone("me", "deck")).toHaveLength(2);
    const empty = d({ me: { hand: ["BP03-030"], cemetery: ["V1"], deck: ["V2"], playPoints: 1 } });
    empty.play("BP03-030");
    expect(empty.hand()).toEqual(["V2"]);
    expect(empty.cemetery()).toEqual(["V1", "BP03-030"]);
  });

  it("032 Rabbit Ear Attendant — draw if another Fable follower is on your field", () => {
    const yes = d({ me: { hand: ["BP03-032"], field: ["BP03-033"], deck: ["V1"], playPoints: 3 } }).play("BP03-032");
    expect(yes.hand()).toEqual(["V1"]);
    const no = d({ me: { hand: ["BP03-032"], deck: ["V1"], playPoints: 3 } }).play("BP03-032");
    expect([no.hand(), no.zone("me", "deck")]).toEqual([[], ["V1"]]);
  });

  it("033 Old Man and Old Woman — Bane", () => {
    const t = d({ me: { field: ["BP03-033"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    expect(t.keywords("BP03-033")).toEqual(["bane"]);
    t.attack("BP03-033", "opp:V5");
    expect([t.field(), t.field("opp"), t.cemetery(), t.cemetery("opp")]).toEqual([[], [], ["BP03-033"], ["V5"]]);
  });

  it("034 / 035 Bladed Hedgehog — +1 attack when an enemy follower is destroyed on your turn; evolve deals 2", () => {
    const mine = d({ me: { field: ["BP03-034", "BP03-033"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    mine.attack("BP03-033", "opp:V1");
    expect(mine.stats("BP03-034")).toEqual([2, 3]);
    const theirs = d({ turn: 6, me: { field: ["BP03-034", { card: "BP03-033", engaged: true }] }, opp: { field: ["ZERO"] } });
    theirs.attack("opp:ZERO", "BP03-033");
    expect([theirs.stats("BP03-034"), theirs.field("opp")]).toEqual([[1, 3], []]);

    const kill = d({ me: { field: ["BP03-034"], evolveDeck: ["BP03-035"], playPoints: 2 }, opp: { field: ["V1"] } });
    kill.evolve("BP03-034");
    expect([kill.stats("BP03-034"), kill.field("opp")]).toEqual([[3, 4], []]);
    const chip = d({ me: { field: ["BP03-034"], evolveDeck: ["BP03-035"], playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    chip.evolve("BP03-034").pick("opp:V5");
    expect([chip.stats("BP03-034"), chip.stats("opp:V5")]).toEqual([[2, 4], [5, 3]]);
  });

  it("036 Ironwrought Defender — +1 defense and Ward when 2 Heroic cards are buried", () => {
    const yes = d({ me: { hand: ["BP03-036"], cemetery: ["BP03-020", "BP03-028"], playPoints: 1 } });
    yes.play("BP03-036");
    expect([yes.stats("BP03-036"), yes.keywords("BP03-036"), yes.engaged("BP03-036")]).toEqual([[2, 3], ["ward"], false]);
    const no = d({ me: { hand: ["BP03-036"], cemetery: ["BP03-020"], playPoints: 1 } }).play("BP03-036");
    expect([no.stats("BP03-036"), no.keywords("BP03-036")]).toEqual([[2, 2], []]);
  });

  it("037 Heroic Entry — a cheap Sword follower from the top 4; a Hero also gets +1/+1", () => {
    const hero = d({ me: { hand: ["BP03-037"], deck: ["BP03-036", "V1"], playPoints: 3 } });
    hero.play("BP03-037").pick("BP03-036");
    expect([hero.stats("BP03-036"), hero.zone("me", "deck"), hero.keywords("BP03-036")]).toEqual([[3, 3], ["V1"], []]);
    const plain = d({ me: { hand: ["BP03-037"], deck: ["BP03-033"], playPoints: 3 } }).play("BP03-037").pick("BP03-033");
    expect([plain.stats("BP03-033"), plain.zone("me", "deck")]).toEqual([[1, 2], []]);
    const skip = d({ me: { hand: ["BP03-037"], deck: ["V1", "V2"], playPoints: 3 } }).play("BP03-037").order();
    expect(skip.field()).toEqual([]);
    expect(skip.zone("me", "deck")).toHaveLength(2);
  });
});
