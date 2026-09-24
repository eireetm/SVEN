import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Abysscraft (073–089, T06). GHOST is the Ghost token. GIANT is Gargantuan Ghost.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GHOST = "BP01-T14";
const GIANT = "BP03-T06";
const TEN = Array.from({ length: 10 }, () => "V1");

describe("BP03 Abysscraft", () => {
  it("073 Dark Alice — Rush; Strike discards; Last Words may banish 10 to return, then discard", () => {
    const rush = d({ me: { hand: ["BP03-073"], playPoints: 6 }, opp: { field: [{ card: "ZERO", engaged: true }], hand: ["V1", "V2"] } });
    rush.play("BP03-073").attack("BP03-073", "opp:ZERO").pick("opp:V2");
    expect([rush.keywords("BP03-073"), rush.field("opp"), rush.hand("opp")]).toEqual([["rush"], [], ["V1"]]);

    const back = d({
      me: { field: ["BP03-073"], hand: ["V2"], deck: TEN },
      opp: { field: [{ card: "BP03-055", engaged: true }], hand: ["V1"] },
    });
    back.attack("BP03-073", "opp:BP03-055").yes();
    expect(back.field()).toEqual(["BP03-073"]);
    expect(back.zone("me", "banished")).toHaveLength(10);
    expect(back.hand()).toEqual([]);
    const emptyHand = d({
      me: { field: ["BP03-073"], deck: TEN },
      opp: { field: [{ card: "BP03-055", engaged: true }] },
    });
    emptyHand.attack("BP03-073", "opp:BP03-055").yes();
    expect(emptyHand.field()).toEqual(["BP03-073"]);
    const decline = d({
      me: { field: ["BP03-073"], hand: ["V2"], deck: TEN },
      opp: { field: [{ card: "BP03-055", engaged: true }] },
    });
    decline.attack("BP03-073", "opp:BP03-055").no();
    expect([decline.field(), decline.hand(), decline.cemetery(), decline.zone("me", "deck")]).toEqual([[], ["V2"], ["BP03-073"], TEN]);
    const short = d({
      me: { field: ["BP03-073"], deck: TEN.slice(0, 9) },
      opp: { field: [{ card: "BP03-055", engaged: true }] },
    });
    short.attack("BP03-073", "opp:BP03-055");
    expect([short.cemetery(), short.zone("me", "deck")]).toEqual([["BP03-073"], TEN.slice(0, 9)]);
  });

  it("074 / 075 Masquerade Ghost — a Ghost gets +1 attack; a Ghost leaving summons a Gargantuan Ghost; Last Words to EX", () => {
    const buff = d({ me: { field: ["BP03-074"], hand: ["BP03-078"], playPoints: 1 } }).play("BP03-078").flush();
    expect(buff.stats("BP03-078")).toEqual([2, 1]);
    const giant = d({ me: { field: ["BP03-074", GIANT] } });
    expect(giant.stats(GIANT)).toEqual([3, 3]);

    const leave = d({
      me: { field: [{ card: "BP03-074", evolvedInto: "BP03-075" }, "BP03-078"], hand: ["QUICK-SAC"] },
    });
    leave.play("QUICK-SAC").pick("BP03-078").none();
    expect([leave.field(), leave.cemetery(), leave.stats(GIANT)]).toEqual([["BP03-074", GIANT], ["BP03-078", "QUICK-SAC"], [3, 3]]);
    const self = d({ me: { field: [{ card: "BP03-074", evolvedInto: "BP03-075" }], hand: ["QUICK-SAC"] } });
    self.play("QUICK-SAC");
    expect([self.ex(), self.field(), self.zone("me", "evolveDeck")]).toEqual([["BP03-074"], [], ["BP03-075"]]);
  });

  it("076 Odile, Black Swan — 2 damage to the enemy leader and followers; Storm at Necrocharge 20; Strike repeats it", () => {
    const buried = Array.from({ length: 20 }, () => "V1");
    const storm = d({ me: { hand: ["BP03-076"], cemetery: buried, playPoints: 5 }, opp: { field: ["V5"] } });
    storm.play("BP03-076");
    expect([storm.keywords("BP03-076"), storm.leader("opp"), storm.stats("opp:V5")]).toEqual([["storm"], 18, [5, 3]]);
    const strike = d({ me: { field: ["BP03-076"] }, opp: { field: [{ card: "ZERO", engaged: true }, "V5"] } });
    strike.attack("BP03-076", "opp:ZERO");
    expect([strike.leader("opp"), strike.stats("opp:V5"), strike.field("opp")]).toEqual([18, [5, 3], ["V5"]]);
  });

  it("077 Demonium, Punk Devil — pay 2 defense for Bane once per turn; Last Words gives 2 back", () => {
    const t = d({ me: { field: ["BP03-077"], hand: ["QUICK-SAC"] } });
    t.activate("BP03-077");
    expect([t.leader(), t.keywords("BP03-077"), t.canActivate("BP03-077")]).toEqual([18, ["ward", "bane"], false]);
    t.play("QUICK-SAC");
    expect([t.leader(), t.cemetery()]).toEqual([20, ["BP03-077", "QUICK-SAC"]]);
  });

  it("078 / 079 Baccherus, Peppy Ghostie — name is also Ghost on the field; draw beside a Gargantuan Ghost; evolved goes to EX", () => {
    const names = d({ me: { field: ["BP03-078"] } });
    const id = names.game.state.players[0].zones.field[0]!;
    expect(names.game.reader().info(id).names).toEqual(["Baccherus, Peppy Ghostie", "Ghost"]);
    const draw = d({ me: { hand: ["BP03-078"], field: [GIANT], deck: ["V1"], playPoints: 1 } }).play("BP03-078");
    expect(draw.hand()).toEqual(["V1"]);
    const quiet = d({ me: { hand: ["BP03-078"], deck: ["V1"], playPoints: 1 } }).play("BP03-078");
    expect(quiet.hand()).toEqual([]);

    const evo = d({
      me: { field: ["BP03-078"], evolveDeck: ["BP03-079"], hand: ["QUICK-SAC"], playPoints: 1 },
    });
    evo.evolve("BP03-078").play("QUICK-SAC");
    expect([evo.ex(), evo.zone("me", "evolveDeck"), evo.field()]).toEqual([["BP03-078"], ["BP03-079"], []]);
  });

  it("080 Demon Maestro — pay 2 defense to draw, once per turn", () => {
    const t = d({ me: { field: ["BP03-080"], deck: ["V1", "V2"] } });
    t.activate("BP03-080");
    expect([t.leader(), t.hand(), t.canActivate("BP03-080")]).toEqual([18, ["V1"], false]);
  });

  it("081 / 082 Trombone Devil — Sanguine end phase deals 3; evolve deals 1 to each leader", () => {
    const quiet = d({ me: { field: ["BP03-081"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(quiet.leader("opp")).toBe(20);
    const ping = d({ me: { field: ["BP03-081"], hand: ["BP03-089"], playPoints: 1, deck: ["V1"] }, opp: { deck: ["V1"] } });
    ping.play("BP03-089").end();
    expect([ping.leader(), ping.leader("opp")]).toEqual([19, 17]);
    const evo = d({
      me: { field: ["BP03-081"], evolveDeck: ["BP03-082"], playPoints: 1, deck: ["V1"] },
      opp: { field: ["V5"], deck: ["V1"] },
    });
    evo.evolve("BP03-081");
    expect([evo.leader(), evo.leader("opp"), evo.stats("BP03-081")]).toEqual([19, 19, [5, 5]]);
    evo.end().pick("opp:leader");
    expect(evo.leader("opp")).toBe(16);
  });

  it("083 Furtive Fangs — the follower's Strike deals its attack; two copies are two Strikes", () => {
    const one = d({ me: { field: ["V1"], hand: ["BP03-083"], playPoints: 1 }, opp: { field: [{ card: "BP03-055", engaged: true }] } });
    one.play("BP03-083").attack("V1", "opp:BP03-055");
    expect(one.stats("opp:BP03-055")).toEqual([7, 3]);
    const two = d({ me: { field: ["V1"], hand: ["BP03-083", "BP03-083"], playPoints: 2 }, opp: { field: [{ card: "BP03-055", engaged: true }] } });
    two.play("BP03-083").play("BP03-083").attack("V1", "opp:BP03-055").flush();
    expect(two.stats("opp:BP03-055")).toEqual([7, 1]);
  });

  it("084 Pumpkin Necromancer — a Gargantuan Ghost into your EX area", () => {
    const t = d({ me: { hand: ["BP03-084"], playPoints: 3 } }).play("BP03-084");
    expect([t.ex(), t.keywords(GIANT + "@ex")]).toEqual([[GIANT], ["ward"]]);
  });

  it("085 Parade Raven — the cemetery follower is chosen before the buried one, and only costs 5 or less", () => {
    const t = d({
      me: { hand: ["BP03-085"], field: ["V3"], cemetery: ["V1", "V5"], playPoints: 7 },
    });
    t.play("BP03-085").yes().pick("V1");
    expect([t.field(), t.cemetery()]).toEqual([["BP03-085", "V1"], ["V5", "V3"]]);
    const no = d({ me: { hand: ["BP03-085"], field: ["V3"], cemetery: ["V1"], playPoints: 7 } });
    no.play("BP03-085").no();
    expect([no.field(), no.cemetery()]).toEqual([["V3", "BP03-085"], ["V1"]]);
  });

  it("086 / 087 Mischievous Zombie — discard to summon a Ghost, draw if it was Departed; evolve gives that Ghost Bane", () => {
    const departed = d({ me: { hand: ["BP03-086", "BP03-078", "V1"], deck: ["V2"], playPoints: 2 } });
    departed.play("BP03-086").yes().pick("BP03-078");
    expect([departed.field(), departed.hand(), departed.cemetery()]).toEqual([["BP03-086", GHOST], ["V1", "V2"], ["BP03-078"]]);
    const plain = d({ me: { hand: ["BP03-086", "V1"], deck: ["V2"], playPoints: 2 } });
    plain.play("BP03-086").yes();
    expect([plain.field(), plain.hand(), plain.zone("me", "deck")]).toEqual([["BP03-086", GHOST], [], ["V2"]]);
    const evo = d({ me: { field: ["BP03-086", GHOST], evolveDeck: ["BP03-087"], playPoints: 2 } });
    evo.evolve("BP03-086");
    expect([evo.stats("BP03-086"), evo.keywords(GHOST)]).toEqual([[3, 3], ["storm", "bane"]]);
  });

  it("088 Devilish Flautist — Rush; discard a random card for +1 attack and Drain", () => {
    const t = d({ me: { hand: ["BP03-088", "V1"], playPoints: 3 }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    t.play("BP03-088").yes().attack("BP03-088", "opp:ZERO");
    expect([t.stats("BP03-088"), t.keywords("BP03-088"), t.leader(), t.hand()]).toEqual([[4, 3], ["rush", "drain"], 24, []]);
    const no = d({ me: { hand: ["BP03-088"], playPoints: 3 }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    no.play("BP03-088").attack("BP03-088", "opp:ZERO");
    expect([no.stats("BP03-088"), no.keywords("BP03-088"), no.leader()]).toEqual([[3, 3], ["rush"], 20]);
  });

  it("089 Infernal Orchestration — 1 to your leader; the next follower you play gets +1/+1, not one an ability puts", () => {
    const stacked = d({ me: { hand: ["BP03-089", "BP03-089", "V1", "V1"], playPoints: 5 } });
    stacked.play("BP03-089").play("BP03-089").play("V1").play("V1");
    const attacks = stacked.game.state.players[0].zones.field.map((id) => stacked.game.reader().info(id).attack);
    expect([stacked.leader(), attacks]).toEqual([18, [4, 2]]);
    const summoned = d({ me: { hand: ["BP03-089", "BP03-086", "V1"], playPoints: 4 } });
    summoned.play("BP03-089").play("BP03-086").yes();
    expect([summoned.stats("BP03-086"), summoned.stats(GHOST)]).toEqual([[3, 3], [1, 1]]);
  });

  it("T06 Gargantuan Ghost — Ward, and banish it at the start of your main phase", () => {
    const t = d({ me: { field: [GIANT], deck: ["V1"] }, opp: { deck: ["V1"] } });
    expect(t.keywords(GIANT)).toEqual(["ward"]);
    t.end().none().end();
    expect([t.field(), t.zone("me", "banished"), t.cemetery()]).toEqual([[], [], []]);
  });
});
