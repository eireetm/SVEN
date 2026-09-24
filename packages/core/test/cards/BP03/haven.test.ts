import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Havencraft (090–106). FALCON is Holy Falcon, 2/2 Storm.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FALCON = "BP01-T16";

describe("BP03 Havencraft", () => {
  it("090 Princess Snow White — Ward; a Fable counter from hand, otherwise +1/+1; Last Words to EX if it had one", () => {
    const hand = d({ me: { hand: ["BP03-090", "QUICK-SAC"], playPoints: 2 } });
    hand.play("BP03-090").none();
    expect([hand.keywords("BP03-090"), hand.counters("BP03-090", "fable"), hand.stats("BP03-090")]).toEqual([["ward"], 1, [2, 2]]);
    hand.play("QUICK-SAC");
    expect([hand.ex(), hand.counters("BP03-090", "fable")]).toEqual([["BP03-090"], 0]);

    const deck = d({ me: { hand: ["BP03-100"], deck: ["BP03-090"], playPoints: 4 } });
    deck.play("BP03-100").pick("BP03-090").none();
    expect([deck.stats("BP03-090"), deck.counters("BP03-090", "fable")]).toEqual([[3, 3], 0]);
  });

  it("091 / 092 Diamond Master — Storm or Ward; opponents who can select it must; evolve a printed Storm or Ward follower", () => {
    const storm = d({ me: { hand: ["BP03-091"], playPoints: 4 }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    storm.play("BP03-091").choose("storm");
    expect(storm.keywords("BP03-091")).toEqual(["storm"]);
    expect(storm.attackTargets("BP03-091")).toContain("opp:leader");
    const ward = d({ me: { hand: ["BP03-091"], playPoints: 4 } }).play("BP03-091").choose("ward");
    expect(ward.keywords("BP03-091")).toEqual(["ward"]);

    const forced = d({ turn: 6, me: { field: ["BP03-091", "V1"] }, opp: { hand: ["BP01-179"], playPoints: 1 } });
    forced.play("opp:BP01-179");
    expect(() => forced.pick("V1")).toThrow();
    forced.pick("BP03-091");
    expect(forced.stats("BP03-091")).toEqual([2, 3]);

    const evo = d({
      me: { field: ["BP03-091"], evolveDeck: ["BP03-092"], cemetery: ["STORM", "V1"], playPoints: 3 },
    });
    evo.evolve("BP03-091");
    expect([evo.stats("BP03-091"), evo.field(), evo.cemetery()]).toEqual([[4, 7], ["BP03-091", "STORM"], ["V1"]]);
    const granted = d({
      me: { field: ["BP03-091", "V1"], hand: ["GIVE-STORM", "QUICK-SAC"], evolveDeck: ["BP03-092"], playPoints: 3 },
    });
    granted.play("GIVE-STORM").pick("V1").play("QUICK-SAC").pick("V1").evolve("BP03-091");
    expect(granted.field()).toEqual(["BP03-091"]);
    expect(granted.cemetery()).toContain("V1");
  });

  it("093 Odette, White Swan — +2 leader defense and +2 defense to your other followers, again as Last Words", () => {
    const t = d({ me: { hand: ["BP03-093", "QUICK-SAC"], field: ["V1"], playPoints: 5 } });
    t.play("BP03-093");
    expect([t.leader(), t.stats("V1")]).toEqual([22, [2, 4]]);
    t.play("QUICK-SAC").pick("BP03-093");
    expect([t.leader(), t.stats("V1")]).toEqual([24, [2, 6]]);
  });

  it("094 / 095 Wingy, Chirpy Gemstone — Ward; evolve and search a follower with 2 attack or less", () => {
    const t = d({ me: { hand: ["BP03-094"], evolveDeck: ["BP03-095"], deck: ["V5", "V1"], playPoints: 3 } });
    t.play("BP03-094").none();
    expect(t.keywords("BP03-094")).toEqual(["ward"]);
    t.evolve("BP03-094").pick("V1");
    expect([t.stats("BP03-094"), t.keywords("BP03-094"), t.hand(), t.zone("me", "deck")]).toEqual([[2, 2], ["ward"], ["V1"], ["V5"]]);
  });

  it("096 Alice's Adventure — search a Fable card; bury to give a Fable follower Rush and Assail", () => {
    const t = d({ me: { hand: ["BP03-096"], field: ["BP03-090"], deck: ["BP03-093", "V1"], playPoints: 3 } });
    t.play("BP03-096").pick("BP03-093");
    expect(t.hand()).toEqual(["BP03-093"]);
    t.activate("BP03-096");
    expect(t.keywords("BP03-090")).toEqual(["ward", "rush", "assail"]);
    expect(t.cemetery()).toEqual(["BP03-096"]);
  });

  it("097 White Knight — costs 5 less at 5 defense or less; Rush and Ward", () => {
    expect(d({ me: { hand: ["BP03-097"], leaderDefense: 5, playPoints: 1 } }).canPlay("BP03-097")).toBe(true);
    expect(d({ me: { hand: ["BP03-097"], leaderDefense: 6, playPoints: 1 } }).canPlay("BP03-097")).toBe(false);
    const t = d({ me: { hand: ["BP03-097"], leaderDefense: 5, playPoints: 1 }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    t.play("BP03-097").none();
    expect(t.keywords("BP03-097")).toEqual(["rush", "ward"]);
    expect(t.attackTargets("BP03-097")).toEqual(["ZERO"]);
  });

  it("098 / 099 Ruby Falcon — Ward; pay 2 for Storm; another Storm or Ward attacker pings; evolve deals 2", () => {
    const t = d({
      me: { field: ["BP03-098", "STORM"], playPoints: 2 },
      opp: { deck: ["V1"] },
    });
    t.activate("BP03-098");
    expect(t.keywords("BP03-098")).toContain("storm");
    t.attack("STORM", "opp:leader");
    expect(t.leader("opp")).toBe(17);
    t.attack("BP03-098", "opp:leader");
    expect(t.leader("opp")).toBe(14);
    const evo = d({
      me: { field: ["BP03-098", "WARD"], evolveDeck: ["BP03-099"], playPoints: 1 },
      opp: { field: ["V5", { card: "V3", engaged: true }] },
    });
    evo.evolve("BP03-098").pick("opp:V5");
    expect([evo.stats("BP03-098"), evo.stats("opp:V5")]).toEqual([[4, 4], [5, 3]]);
    evo.attack("WARD", "opp:V3");
    expect(evo.leader("opp")).toBe(19);
  });

  it("100 March Hare's Teatime — a cheap Fable follower from the top 5, and one from the cemetery", () => {
    const t = d({
      me: { hand: ["BP03-100"], deck: ["BP03-101", "V1"], cemetery: ["BP03-090"], playPoints: 6 },
    });
    t.play("BP03-100").pick("BP03-101");
    expect([t.field(), t.counters("BP03-101", "fable"), t.zone("me", "deck")]).toEqual([["BP03-100", "BP03-101"], 1, ["V1"]]);
    t.activate("BP03-100").none();
    expect([t.field(), t.stats("BP03-090"), t.cemetery()]).toEqual([["BP03-101", "BP03-090"], [3, 3], ["BP03-100"]]);
  });

  it("101 Tin Soldier — a Fable counter when it did not come from hand; spend it to deal 2", () => {
    const hand = d({ me: { hand: ["BP03-101"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP03-101");
    expect([hand.counters("BP03-101", "fable"), hand.canActivate("BP03-101")]).toEqual([0, false]);
    const out = d({ me: { field: [{ card: "BP03-101", counters: { fable: 1 } }] }, opp: { field: ["V5"] } });
    out.activate("BP03-101").pick("opp:leader");
    expect([out.leader("opp"), out.counters("BP03-101", "fable"), out.stats("opp:V5")]).toEqual([18, 0, [5, 5]]);
  });

  it("102 / 103 Pinion Prince — a buried Fable card to EX, and you may mark it; evolved has Assail", () => {
    const yes = d({ me: { hand: ["BP03-102"], cemetery: ["BP03-090", "BP03-101"], playPoints: 5 } });
    yes.play("BP03-102").pick("BP03-090").yes();
    expect([yes.ex(), yes.counters("BP03-090", "fable")]).toEqual([["BP03-090"], 1]);
    const no = d({ me: { hand: ["BP03-102"], cemetery: ["BP03-090"], playPoints: 5 } });
    no.play("BP03-102").no();
    expect([no.ex(), no.counters("BP03-090", "fable")]).toEqual([["BP03-090"], 0]);
    const evo = d({ me: { field: ["BP03-102"], evolveDeck: ["BP03-103"], playPoints: 1 }, opp: { field: ["V1"] } });
    evo.evolve("BP03-102");
    expect([evo.stats("BP03-102"), evo.keywords("BP03-102"), evo.attackTargets("BP03-102")]).toEqual([
      [5, 6],
      ["assail"],
      ["V1", "opp:leader"],
    ]);
  });

  it("104 Birdkeeping Disciple — may engage an amulet to summon a Holy Falcon; Ward", () => {
    const t = d({ me: { hand: ["BP03-104"], field: ["AMULET"], playPoints: 4 } });
    t.play("BP03-104").none().yes();
    expect([t.field(), t.engaged("AMULET"), t.keywords(FALCON)]).toEqual([["AMULET", "BP03-104", FALCON], true, ["storm"]]);
    const decline = d({ me: { hand: ["BP03-104"], field: ["AMULET"], playPoints: 4 } });
    decline.play("BP03-104").none().no();
    expect([decline.field(), decline.engaged("AMULET")]).toEqual([["AMULET", "BP03-104"], false]);
    const none = d({ me: { hand: ["BP03-104"], playPoints: 4 } }).play("BP03-104").none();
    expect(none.field()).toEqual(["BP03-104"]);
  });

  it("105 Amethyst Lion — Storm, and +1 attack to another Storm or Ward follower", () => {
    const t = d({ me: { hand: ["BP03-105"], field: ["WARD"], playPoints: 2 } }).play("BP03-105");
    expect([t.keywords("BP03-105"), t.stats("WARD")]).toEqual([["storm"], [2, 3]]);
    const alone = d({ me: { hand: ["BP03-105"], playPoints: 2 } }).play("BP03-105");
    expect(alone.field()).toEqual(["BP03-105"]);
  });

  it("106 Bejeweled Shrine — pay 1 and engage to give +1/+1 to a Ward or Storm follower", () => {
    const t = d({ me: { field: ["BP03-106", "WARD", "V1"], playPoints: 1 } });
    t.activate("BP03-106");
    expect([t.stats("WARD"), t.stats("V1"), t.engaged("BP03-106"), t.pp()]).toEqual([[2, 4], [2, 2], true, 0]);
  });
});
