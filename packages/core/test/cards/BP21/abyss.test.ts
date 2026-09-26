import { describe, expect, it } from "vitest";
import { drive, type DriveSpec, type Driver } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Abysscraft (073–090). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Academic (学院): BP21-083 Demon-Eyed Gangster (1c
// 2/2; act (0): roll a die once per turn; a 6: 2 to the enemy leader), BP21-076 (3c). Storm: BP21-063 (Dragoncraft). Dice come
// from the game's seeded random source (CR 5.20): `withRolls` finds a seed that gives the wanted rolls.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const rolls = (t: Driver) => t.events.flatMap((e) => (e.type === "dieRolled" ? [e.result] : []));
function withRolls(build: (seed: string) => Driver, ok: (rolled: number[]) => boolean): Driver {
  for (let i = 0; i < 300; i++) {
    const t = build(`r${i}`);
    if (ok(rolls(t))) return t;
  }
  throw new Error("no seed gives these rolls");
}

describe("BP21 Abysscraft", () => {
  it("073 / 074 Cornelius, the Corpse King — Fanfare: a 2-cost or less Academic follower from the cemetery, buried at your end phase; evolved: a 3-cost or less one; super-evolved: roll 3 dice", () => {
    const t = d({ me: { hand: ["BP21-073"], cemetery: ["BP21-083", "BP21-076"], playPoints: 4 }, opp: { deck: ["V1"] } }).play("BP21-073");
    expect(t.field()).toEqual(["BP21-073", "BP21-083"]);
    expect(t.end().field()).toEqual(["BP21-073"]);
    expect(t.cemetery()).toEqual(["BP21-076", "BP21-083"]);
    const e = d({ me: { field: ["BP21-073"], evolveDeck: ["BP21-074"], cemetery: ["BP21-083"], playPoints: 1 } }).evolve("BP21-073");
    expect(e.field()).toEqual(["BP21-073", "BP21-083"]);
    const s = d({ me: { field: ["BP21-073", "BP21-083"], evolveDeck: ["BP21-074"], playPoints: 1, ...SUPER } }).evolve("BP21-073", { sep: true }).flush();
    const r = rolls(s);
    expect([r.length, s.leader("opp")]).toEqual([3, 20 - 2 * r.filter((x) => x === 6).length]);
  });

  it("075 Galom, Empress Fist — each roll: damage equal to it to an enemy follower, and 4 to the enemy leader on a 6; Fanfare: roll", () => {
    const build = (seed: string) => d({ seed, me: { hand: ["BP21-075"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP21-075").flush();
    const six = withRolls(build, (r) => r[0] === 6);
    expect([six.field("opp"), six.leader("opp")]).toEqual([[], 16]);
    const two = withRolls(build, (r) => r[0] === 2);
    expect([two.stats("opp:V5"), two.leader("opp")]).toEqual([[5, 3], 20]);
  });

  it("076 Vulgus, Infernal Headmistress — Fanfare: an Academic card from the top 2, the next 2-cost or less Academic card costs 2 less; act after a roll, bury another card: 3 damage and draw", () => {
    const t = d({ me: { hand: ["BP21-076"], deck: ["BP21-083", "V1"], playPoints: 3 } }).play("BP21-076").pick("BP21-083");
    expect([t.hand(), t.pp(), t.canPlay("BP21-083")]).toEqual([["BP21-083"], 0, true]);
    const act = d({ me: { field: ["BP21-076", "BP21-083", "V1"], deck: ["V3"] }, opp: { field: ["V5"] } });
    expect(act.canActivate("BP21-076")).toBe(false);
    act.activate("BP21-083").flush().activate("BP21-076").pick("V1");
    expect([act.stats("opp:V5"), act.hand(), act.field()]).toEqual([[5, 2], ["V3"], ["BP21-076", "BP21-083"]]);
  });

  it("077 / 078 Arka, Sin Spinner — each roll: 1 damage to an enemy follower, 3 on a 6; evolved: roll 2 dice", () => {
    const t = d({ me: { field: ["BP21-077", "BP21-083"] }, opp: { field: ["V5"] } }).activate("BP21-083").flush();
    expect(t.stats("opp:V5")).toEqual([5, rolls(t)[0] === 6 ? 2 : 4]);
    const build = (seed: string) => d({ seed, me: { field: ["BP21-077"], evolveDeck: ["BP21-078"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-077").flush();
    const e = withRolls(build, (r) => r.length === 2 && !r.includes(6));
    expect(e.stats("opp:V5")).toEqual([5, 3]);
  });

  it("079 Exella, Nocturnal General — Storm; Strike: +X/+0 for each other follower of yours with Storm", () => {
    const t = d({ me: { field: ["BP21-079", "BP21-063", "BP21-063"] } }).attack("BP21-079", "opp:leader");
    expect([t.stats("BP21-079"), t.leader("opp")]).toEqual([[3, 3], 17]);
  });

  it("080 Bad-Girl Life — draw, roll 2 dice", () => {
    const t = d({ me: { hand: ["BP21-080"], deck: ["V1"], playPoints: 1 } }).play("BP21-080");
    expect([t.hand(), rolls(t).length, t.game.reader().diceRolledThisTurn(0).length]).toEqual([["V1"], 2, 2]);
  });

  it("081 / 082 Mach-Speed Maron — Fanfare: roll, evolve if a 6 was rolled this turn; evolved: Storm", () => {
    const build = (seed: string) => d({ seed, me: { hand: ["BP21-081"], evolveDeck: ["BP21-082"], playPoints: 1 } }).play("BP21-081");
    const six = withRolls(build, (r) => r[0] === 6).yes();
    expect([six.stats("BP21-081"), six.keywords("BP21-081")]).toEqual([[4, 2], ["storm"]]);
    expect(withRolls(build, (r) => r[0] === 3).stats("BP21-081")).toEqual([2, 2]);
  });

  it("083 Demon-Eyed Gangster — act (0) once per turn: roll; a 6: 2 to the enemy leader", () => {
    const t = withRolls((seed) => d({ seed, me: { field: ["BP21-083"] } }).activate("BP21-083").flush(), (r) => r[0] === 6);
    expect([t.leader("opp"), t.canActivate("BP21-083")]).toEqual([18, false]);
  });

  it("084 Noble Demoness — another 2-cost follower entering your field: 1 to the enemy leader", () => {
    expect(d({ me: { field: ["BP21-084"], hand: ["BP21-088"], playPoints: 2 } }).play("BP21-088").flush().leader("opp")).toBe(19);
    expect(d({ me: { field: ["BP21-084"], hand: ["V1"], playPoints: 1 } }).play("V1").leader("opp")).toBe(20);
  });

  it("085 / 086 Bonebreaker Bladesman — Assail; Follower Strike: its attack as damage to the enemy leader; evolved: 4 damage", () => {
    expect(d({ me: { field: ["BP21-085"] }, opp: { field: ["V5"] } }).attack("BP21-085", "opp:V5").leader("opp")).toBe(19);
    expect(d({ me: { field: ["BP21-085"], evolveDeck: ["BP21-086"], playPoints: 5 }, opp: { field: ["V5"] } }).evolve("BP21-085").stats("opp:V5")).toEqual([5, 1]);
  });

  it("087 Denan, Big Bad Boss — act (0) once per turn: roll; a 6: +1/+1 to a follower of yours", () => {
    const t = withRolls((seed) => d({ seed, me: { field: ["BP21-087"] } }).activate("BP21-087").flush(), (r) => r[0] === 6);
    expect(t.stats("BP21-087")).toEqual([3, 4]);
  });

  it("088 Malicious Blader — Fanfare with five 2-cost cards in the cemetery: recover 2 play points", () => {
    expect(d({ me: { hand: ["BP21-088"], cemetery: n(5, "BP21-084"), playPoints: 2, maxPlayPoints: 5 } }).play("BP21-088").pp()).toBe(2);
    expect(d({ me: { hand: ["BP21-088"], cemetery: n(4, "BP21-084"), playPoints: 2, maxPlayPoints: 5 } }).play("BP21-088").pp()).toBe(0);
  });

  it("089 Serenading Succubus — end phase: engage up to 2 enemy followers, they don't refresh; leader +3", () => {
    const t = d({ me: { field: ["BP21-089"] }, opp: { field: ["V5", "V3", "V1"], deck: ["V1"] } }).end().pick("opp:V5", "opp:V3");
    expect([t.engaged("opp:V5"), t.engaged("opp:V3"), t.engaged("opp:V1"), t.leader()]).toEqual([true, true, false, 23]);
  });

  it("090 Spirit Invasion — up to 2: banish an Abysscraft follower for 2x its attack, a non-Abysscraft one for its attack", () => {
    const t = d({ me: { hand: ["BP21-090"], cemetery: ["BP21-089", "V3"], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    t.play("BP21-090").choose("abyss", "other").pick("opp:V5").pick("opp:V3").yes().yes();
    expect([t.field("opp"), t.stats("opp:V3"), t.zone("me", "banished")]).toEqual([["V3"], [3, 1], ["BP21-089", "V3"]]);
  });
});
