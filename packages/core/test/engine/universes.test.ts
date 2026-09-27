import { describe, expect, it } from "vitest";
import { deckUniverse } from "../../src/engine/deck";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Universes (CR 6.1.1.5, 14) and Umamusume racing (CR 14.2), with CP01 cards. CP01-007 Eishin Flash (3c 3/3; serve
// {[feed]} (1): race; On Race: +1/+1, return up to 1 enemy follower), CP01-042 Oguri Cap (serve 1, 2 or 3 times; On Race
// +2/+1), CP01-085 Carrot, CP01-LD01 an Umamusume leader. V1 is 1c 2/2, V5 5c 5/5; QUICK-SAC destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CR 6.1.1.5 — the deck's universe", () => {
  it("is the universe the leader and every card share; otherwise the deck is based on a class", () => {
    const deck = { leader: "CP01-LD01", main: ["CP01-007", "CP01-001"], evolve: [CARROT, "CP01-002"] };
    expect(deckUniverse(E.db, deck)).toBe("umamusume");
    expect(deckUniverse(E.db, { ...deck, main: [...deck.main, "BP01-001"] })).toBeNull();
    expect(deckUniverse(E.db, { main: deck.main, evolve: deck.evolve })).toBeNull();
    expect(deckUniverse(E.db, { ...deck, leader: "BP01-LD01" })).toBeNull();
  });

  it("is recorded in the player's state and public in the player view", () => {
    const deck = { leader: "CP01-LD01", main: Array<string>(40).fill("CP01-007"), evolve: [CARROT] };
    const other = { main: Array<string>(40).fill("BP01-001"), evolve: [] };
    const game = E.newGame({ seed: 1, players: [deck, other], config: { deckRestrictions: false } });
    expect([game.state.players[0].universe, game.state.players[1].universe]).toEqual(["umamusume", null]);
    expect(game.view(1).players[0].universe).toBe("umamusume");
  });

  it("with deck restrictions, a universe deck may mix classes; a class deck may not (CR 6.1.1.5.1 / 6.1.1.5.2)", () => {
    const mixed = { leader: "CP01-LD01", main: [...Array<string>(20).fill("CP01-007"), ...Array<string>(20).fill("CP01-014")], evolve: [CARROT] };
    const classProblems = (deck: typeof mixed) => E.validateDeck(deck).filter((p) => p.includes("6.1.1.5.1") || p.includes("copies"));
    expect(classProblems(mixed).filter((p) => p.includes("6.1.1.5.1"))).toEqual([]);
    const withBp = { ...mixed, main: [...mixed.main.slice(1), "BP01-020"] };
    expect(classProblems(withBp).some((p) => p.includes("6.1.1.5.1"))).toBe(true);
  });
});

describe("CR 14.2 — serving and racing (Umamusume)", () => {
  it("14.2.1 / 14.2.3 — serving links a facedown Carrot in the race zone; the racing follower has Rush and races once", () => {
    const t = d({ me: { field: ["CP01-007"], evolveDeck: [CARROT, CARROT], playPoints: 1 }, opp: { field: ["V5"] } });
    t.activate("CP01-007").pick("opp:V5");
    const g = t.game.reader();
    const race = t.game.state.players[0].zones.raceZone;
    expect([race.length, t.game.state.cards[race[0]!]!.linkedTo, g.isRacing(t.id("CP01-007")), g.racedTimes(t.id("CP01-007"))]).toEqual([
      1,
      t.id("CP01-007"),
      true,
      1,
    ]);
    expect([t.stats("CP01-007"), t.keywords("CP01-007"), t.hand("opp"), t.pp()]).toEqual([[4, 4], ["rush"], ["V5"], 0]);
    // 14.2.1.2.1 / ruling: a follower that raced can't be served again.
    expect(g.canServe(t.id("CP01-007"), 1)).toBe(false);
  });

  it("14.2.2.4 / 14.2.2.5 — a serve ability may use an evolution point for 1 play point and counts as the turn's evolve ability", () => {
    const t = d({ me: { field: ["CP01-007", "CP01-001"], evolveDeck: [CARROT, "CP01-002"], playPoints: 0, evolutionPoints: 1 } });
    t.activate("CP01-007", 0, { ep: true });
    expect([t.game.state.players[0].evolutionPoints, t.game.reader().isRacing(t.id("CP01-007")), t.canEvolve("CP01-001")]).toEqual([0, true, false]);
  });

  it("serving N times needs N facedown Carrots and triggers On Race N times (CP01-042 rulings)", () => {
    const t = d({ me: { field: ["CP01-042"], evolveDeck: [CARROT, CARROT], playPoints: 3 } });
    expect(t.canActivate("CP01-042")).toBe(true);
    t.activate("CP01-042", 1).flush();
    expect([t.stats("CP01-042"), t.game.reader().racedTimes(t.id("CP01-042")), t.zone("me", "raceZone").length]).toEqual([[8, 6], 2, 2]);
    const three = d({ me: { field: ["CP01-042"], evolveDeck: [CARROT, CARROT], playPoints: 3 } });
    const legal = (three.decision?.type === "mainPhase" ? three.decision.actions : []).filter((a) => a.type === "activate");
    expect(legal.length).toBe(2); // race 1 time or 2 times; 3 needs a third Carrot
  });

  it("11.8.1 — when the racing follower leaves the field, its Carrot goes faceup to the evolve deck area and can't be served", () => {
    const t = d({ me: { field: [{ card: "CP01-007", racing: 1 }, "V1"], hand: ["QUICK-SAC"], evolveDeck: [] } });
    t.play("QUICK-SAC").pick("CP01-007");
    const deck = t.game.state.players[0].zones.evolveDeck;
    expect([t.zone("me", "raceZone"), deck.length, t.game.state.cards[deck[0]!]!.faceUp, t.game.reader().carrotsToServe(0)]).toEqual([[], 1, true, []]);
  });
});

describe("CR 14.3 — Magical Items and Lesson (THE IDOLM@STER CINDERELLA GIRLS)", () => {
  const ITEM = "CP02-T01";
  // CP02-003 Miku Maekawa: act (1), Lesson (1): Storm. CP02-LD01 is a THE IDOLM@STER CINDERELLA GIRLS leader.
  const cinderella = { leader: "CP02-LD01", main: Array<string>(40).fill("CP02-003"), evolve: [] };
  const vanilla = { main: Array<string>(40).fill("BP01-001"), evolve: [] };

  it("14.3.1.2 — a deck based on the universe has five Magical Items in its EX area before the first player is decided", () => {
    const game = E.newGame({ seed: 1, players: [vanilla, cinderella], config: { deckRestrictions: false } });
    const ex = (p: 0 | 1) => game.state.players[p].zones.ex.map((id) => game.state.cards[id]!.def);
    expect([game.decision?.type, ex(0), ex(1)]).toEqual(["chooseTurnOrder", [], Array<string>(5).fill(ITEM)]);
  });

  it("14.3.1.1 — every Magical Item printing is the card named Magical Item", () => {
    expect(["CP02-T01", "CP02-T05", "CSD02a-T01"].map((p) => [E.db.ofPrinting(p).id, E.db.ofPrinting(p).name])).toEqual(
      Array.from({ length: 3 }, () => [ITEM, "Magical Item"]),
    );
  });

  it("14.3.2.1 — Lesson (X) banishes X Magical Items from the EX area as a cost; the turn records it", () => {
    const t = d({ me: { field: ["CP02-003"], ex: [ITEM, ITEM], playPoints: 1 } }).activate("CP02-003");
    expect([t.ex(), t.keywords("CP02-003"), t.game.reader().magicalItemsBanishedThisTurn(0)]).toEqual([[ITEM], ["storm"], 1]);
    expect(d({ me: { field: ["CP02-003"], ex: ["V1"], playPoints: 1 } }).canActivate("CP02-003")).toBe(false);
  });

  it("identical Magical Items are banished without a question; the player chooses when one differs", () => {
    const t = d({ me: { field: ["CP02-003"], ex: [ITEM, { card: ITEM, counters: { spell: 1 } }], playPoints: 1 } }).activate("CP02-003");
    expect(t.decision).toMatchObject({ type: "selectCards", candidateDefs: [ITEM, ITEM], min: 1, max: 1 });
  });
});

describe("CR 14.4 — Cardfight!! Vanguard: Triggers, drive checks, Ride and Drive, Starting Amulets", () => {
  // CP03-086 Blaster Dark (3c 3/3, Single Drive), CP03-106 CEO Amaterasu (4c 4/4, Twin Drive), CP03-114 White Hare of
  // Inaba (1c 1/1; Ride (1); On Drive: +1/+1, leader +1), CP03-127 Drive Point. Triggers: CP03-015 Critical, CP03-016 Draw,
  // CP03-017 Stand, CP03-018 Heal. Starting Amulets: CP03-103 Fullbau, CP03-082 Lizard Soldier, Conroe.
  const VG = { universe: "vanguard" as const };
  const DRIVE_POINT = "CP03-127";

  it("14.4.1 — a card's Trigger icon is read from its reminder text", () => {
    expect(["CP03-015", "CP03-016", "CP03-017", "CP03-018", "CP03-001"].map((id) => E.db.get(id).trigger)).toEqual([
      "critical",
      "draw",
      "stand",
      "heal",
      undefined,
    ]);
  });

  it("14.4.6.2 / 14.4.5 — Single Drive: a drive check when it attacks; a resolved Heal Trigger goes to the cemetery", () => {
    const t = d({ me: { ...VG, field: ["CP03-086"], deck: ["CP03-018", "V1"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader");
    expect(t.decision).toMatchObject({ type: "confirm", reason: "driveTrigger" });
    t.yes();
    expect([t.leader(), t.cemetery(), t.zone("me", "deck"), t.zone("me", "triggerZone"), t.leader("opp")]).toEqual([13, ["CP03-018"], ["V1"], [], 17]);
  });

  it("14.4.5.1.5 — a card without a Trigger, or one not resolved, goes to the bottom of the deck", () => {
    expect(d({ me: { ...VG, field: ["CP03-086"], deck: ["V1", "V3"] } }).attack("CP03-086", "opp:leader").zone("me", "deck")).toEqual(["V3", "V1"]);
    const no = d({ me: { ...VG, field: ["CP03-086"], deck: ["CP03-018", "V1"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader").no();
    expect([no.leader(), no.zone("me", "deck")]).toEqual([10, ["V1", "CP03-018"]]);
  });

  it("14.4.5.1.2 — with a deck not based on the universe the card goes to the bottom, no Trigger", () => {
    const t = d({ me: { field: ["CP03-086"], deck: ["CP03-018", "V1"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader");
    expect([t.leader(), t.zone("me", "deck")]).toEqual([10, ["V1", "CP03-018"]]);
  });

  it("14.4.5.1.3 — Critical: a follower +2 attack; Stand: a follower refreshed that can't attack enemy leaders this turn", () => {
    const c = d({ me: { ...VG, field: ["CP03-086", "V1"], deck: ["CP03-015"] } }).attack("CP03-086", "opp:leader").yes().pick("V1");
    expect([c.stats("V1"), c.cemetery()]).toEqual([[4, 2], ["CP03-015"]]);
    const s = d({ me: { ...VG, field: ["CP03-086", { card: "V1", engaged: true }], deck: ["CP03-017"] } }).attack("CP03-086", "opp:leader").yes().pick("V1");
    expect([s.engaged("V1"), s.attackTargets("V1")]).toEqual([false, []]);
  });

  it("14.4.6.3 — Twin Drive: two drive checks, the first one's Trigger resolved before the second (rulings)", () => {
    const t = d({ me: { ...VG, field: ["CP03-106"], deck: ["CP03-016", "V1", "CP03-018"] } }).attack("CP03-106", "opp:leader");
    t.yes().yes();
    expect([t.hand(), t.cemetery(), t.leader()]).toEqual([["V1"], ["CP03-016", "CP03-018"], 23]);
  });

  it("14.4.9 — Ride: a Drive Point linked in the drive zone, Drive (Drive, Single Drive, Rush) and On Drive; once per card per game", () => {
    const t = d({ me: { ...VG, field: ["CP03-114"], evolveDeck: [DRIVE_POINT, DRIVE_POINT], playPoints: 1 } }).activate("CP03-114");
    const drive = t.game.state.players[0].zones.driveZone;
    expect([t.keywords("CP03-114"), t.stats("CP03-114"), t.leader(), drive.length, t.game.state.cards[drive[0]!]!.linkedTo]).toEqual([
      ["drive", "singleDrive", "rush"],
      [2, 2],
      21,
      1,
      t.id("CP03-114"),
    ]);
    expect(t.game.reader().givenDrive(t.id("CP03-114"))).toBe(true);
    // A follower that rode can't ride again, even in a later turn.
    const later = d({ me: { ...VG, field: [{ card: "CP03-114", rode: true }], evolveDeck: [DRIVE_POINT], playPoints: 1 } });
    expect(later.canActivate("CP03-114")).toBe(false);
  });

  it("14.4.9.2 / 14.4.9.5 — a Ride may use an evolution point for 1 play point and counts as the turn's evolve ability", () => {
    const t = d({ me: { ...VG, field: ["CP03-114", "CP03-086"], evolveDeck: [DRIVE_POINT, "CP03-087"], playPoints: 0, evolutionPoints: 1 } });
    t.activate("CP03-114", 0, { ep: true });
    expect([t.game.state.players[0].evolutionPoints, t.keywords("CP03-114"), t.canEvolve("CP03-086")]).toEqual([0, ["drive", "singleDrive", "rush"], false]);
    expect(d({ me: { ...VG, field: ["CP03-114"], evolveDeck: [], playPoints: 1 } }).canActivate("CP03-114")).toBe(false);
  });

  it("11.10.1 — when the follower leaves the field its Drive Point goes faceup to the evolve deck area", () => {
    const t = d({ me: { ...VG, field: [{ card: "CP03-114", rode: true }, "V1"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("CP03-114");
    const deck = t.game.state.players[0].zones.evolveDeck;
    expect([t.zone("me", "driveZone"), deck.length, t.game.state.cards[deck[0]!]!.faceUp]).toEqual([[], 1, true]);
  });

  it("14.4.3 — a Starting Amulet starts on the field facedown (hidden from the opponent) and is turned faceup after the redraws", () => {
    const vg = { leader: "CP03-LD05", main: [...Array<string>(39).fill("CP03-093"), "CP03-103"], evolve: [] };
    const other = { main: Array<string>(40).fill("BP01-001"), evolve: [] };
    const game = E.newGame({ seed: 2, players: [vg, other], config: { deckRestrictions: false, firstPlayer: 0 } });
    const [amulet] = game.state.players[0].zones.field;
    expect([game.decision?.type, game.state.cards[amulet!]!.def, game.state.cards[amulet!]!.faceUp]).toEqual(["mulligan", "CP03-103", false]);
    expect([game.view(1).players[0].field[0]!.hidden, game.view(0).players[0].field[0]!.hidden]).toEqual([true, false]);
    game.act({ type: "mulligan", redraw: false });
    game.act({ type: "mulligan", redraw: false });
    expect(game.state.cards[amulet!]!.faceUp).toBe(true);
  });

  it("14.4.2 / 14.4.4 — deck construction: a Starting Amulet, one name for them all, Triggers of the leader's class", () => {
    const deck = (main: string[]) => ({ leader: "CP03-LD05", main, evolve: [] });
    const problems = (main: string[]) => E.validateDeck(deck(main)).filter((p) => p.includes("14.4"));
    const base = [...Array<string>(3).fill("CP03-093"), ...Array<string>(3).fill("CP03-086"), "CP03-103"];
    expect(problems(base)).toEqual([]);
    expect(problems(base.slice(0, 6)).some((p) => p.includes("14.4.2.1.1"))).toBe(true);
    expect(problems([...base, "CP03-082"]).some((p) => p.includes("14.4.4.1.1"))).toBe(true);
    // All of them are Vanguard cards, so the deck is based on the universe: a Forestcraft Trigger breaks 14.4.2.1.2.
    expect(problems([...base, "CP03-015"]).some((p) => p.includes("14.4.2.1.2"))).toBe(true);
    expect(problems([...base, "CP03-097"])).toEqual([]);
  });
});

describe("CR 14.5 — Princess Connect! Re: Dive: Union Burst and equipment", () => {
  // CP04-001 Kokkoro (1c 1/1; UB Fanfare: leader +1; Fanfare (2): equip an Ameth Amulet), CP04-097 Clear (2c 3/2; UB Fanfare: 1
  // damage to the enemy leader; whenever another follower's UB ability executes: 1 damage to the enemy leader), CP04-107 Kurumi
  // (1c; UB Fanfare: engage an enemy follower), CP04-101 Misato (1c, Ward; UB Fanfare, bury an amulet: leader +2), CP04-015 Aoi (1c;
  // UB Activate engage: -1/-1), CP04-003 Eris (4c; UB Activate engage: another PriConne follower +1/+1, and Storm after 3 other UB
  // executions this turn), CP04-088 Io (5c; UB Activate (1), once per turn: each opponent buries a follower), CP04-113 / 114 Ameth,
  // CP04-095 / 096 Yui, CP04-019 Pecorine (3c 3/3 Ward; Fanfare (2): equip a Princess Sword), CP04-055 Sheffy (2c 2/2; UB Fanfare:
  // an enemy follower skips its refresh; Fanfare with Overflow: equip an Eisdrache), CP04-058 Muimi (2c 2/3), CP04-053 Chellerific
  // Carnival (2c Quick: 3 damage), CP04-T02 Princess Sword, CP04-T08 Eisdrache, CP04-T09 Precious Memento. BP05-060 / 061 Cursed
  // Stone: its On Evolve makes an enemy follower lose all abilities.
  const PC = { universe: "princessConnect" as const };
  const ubs = (t: ReturnType<typeof d>) => t.game.reader().unionBurstsThisTurn(0);
  /** Two more Union Burst abilities executed this turn. */
  const twoBefore = (t: ReturnType<typeof d>) => {
    const ps = t.game.state.players[0];
    const now = ps.thisTurn.turn === t.game.state.turn ? ps.thisTurn.unionBursts : 0;
    ps.thisTurn = { ...ps.thisTurn, turn: t.game.state.turn, unionBursts: now + 2 };
    return t;
  };

  it("14.5.1.2 — Union Burst abilities are valid only in a deck based on the universe", () => {
    expect(d({ me: { hand: ["CP04-001"], playPoints: 1 } }).play("CP04-001").flush().leader()).toBe(20);
    expect(d({ me: { ...PC, hand: ["CP04-001"], playPoints: 1 } }).play("CP04-001").flush().leader()).toBe(21);
    expect(d({ me: { field: ["CP04-015"] }, opp: { field: ["V5"] } }).canActivate("CP04-015")).toBe(false);
    expect(d({ me: { ...PC, field: ["CP04-015"] }, opp: { field: ["V5"] } }).canActivate("CP04-015")).toBe(true);
  });

  it("14.5.1.3 — executed once played and resolved: counted for the turn, and other followers' abilities see it", () => {
    const t = d({ me: { ...PC, field: ["CP04-097"], hand: ["CP04-001"], playPoints: 1 } }).play("CP04-001").flush();
    expect([ubs(t), t.leader(), t.leader("opp")]).toEqual([1, 21, 19]);
    // Without a target it can't be played; not paying its cost it isn't played: neither is executed (rulings).
    const k = d({ me: { ...PC, field: ["CP04-097"], hand: ["CP04-107"], playPoints: 1 } }).play("CP04-107");
    expect([ubs(k), k.leader("opp")]).toEqual([0, 20]);
    const m = d({ me: { ...PC, field: ["CP04-097", "AMULET"], hand: ["CP04-101"], playPoints: 1 } }).play("CP04-101").none().no();
    expect([ubs(m), m.leader(), m.field()]).toEqual([0, 20, ["CP04-097", "AMULET", "CP04-101"]]);
  });

  it("14.5.1.4 — executing another follower's Union Burst ability without paying its cost; both count (CP04-114 rulings)", () => {
    const t = twoBefore(d({ me: { ...PC, field: ["CP04-113", "CP04-097", "CP04-001"], evolveDeck: ["CP04-114"], playPoints: 1 }, opp: { field: ["V5"] } }));
    t.evolve("CP04-113").choose("2").pick("CP04-001").flush();
    // Ameth's own execution and Kokkoro's: 4 in all; Clear triggered twice; Kokkoro's Fanfare gave +1.
    expect([ubs(t), t.leader(), t.leader("opp")]).toEqual([4, 21, 18]);
    // With fewer than 2 other executions, nothing is executed (Ameth's own counts).
    const few = d({ me: { ...PC, field: ["CP04-113", "CP04-001"], evolveDeck: ["CP04-114"], playPoints: 1 } });
    few.evolve("CP04-113").choose("2").flush();
    expect([ubs(few), few.leader()]).toEqual([1, 20]);
  });

  it("14.5.1.4 — costs are not paid, a used 'once per turn' doesn't matter, and the condition sees the outer execution", () => {
    const t = twoBefore(d({ me: { ...PC, field: ["CP04-113", { card: "CP04-003", engaged: true }, "CP04-001"], evolveDeck: ["CP04-114"], playPoints: 1 } }));
    t.evolve("CP04-113").choose("2").pick("CP04-003").pick("CP04-001");
    // Eris is engaged (its cost not paid) and sees 3 other executions (the 2 before and Ameth's) — ruling Q14.
    expect([t.stats("CP04-001"), t.keywords("CP04-001"), t.engaged("CP04-003")]).toEqual([[2, 2], ["storm"], true]);
    const io = d({ me: { ...PC, field: ["CP04-113", "CP04-088"], evolveDeck: ["CP04-114"], playPoints: 2 }, opp: { field: ["V5", "V1"] } });
    io.activate("CP04-088").pick("opp:V1");
    expect(io.canActivate("CP04-088")).toBe(false);
    twoBefore(io).evolve("CP04-113").choose("2");
    expect([io.field("opp"), ubs(io)]).toEqual([[], 5]);
  });

  it("14.5.1.5 — X is 0: Yui (Evolved) executed this way can't select a 1-cost follower (CP04-114 ruling Q10)", () => {
    const yui = { card: "CP04-095", evolvedInto: "CP04-096" };
    const t = twoBefore(d({ me: { ...PC, field: ["CP04-113", yui], cemetery: ["CP04-001"], evolveDeck: ["CP04-114"], playPoints: 5 } }));
    t.evolve("CP04-113").choose("2").flush();
    expect([t.cemetery(), t.pp(), ubs(t)]).toEqual([["CP04-001"], 4, 3]);
  });

  it("14.5.2.2 — equipping creates the token in the equipment zone, linked; 'when a follower equips this' triggers", () => {
    const t = d({ me: { ...PC, hand: ["CP04-019"], playPoints: 5 } }).play("CP04-019").none().yes();
    const [token] = t.game.state.players[0].zones.equipmentZone;
    expect([t.zone("me", "equipmentZone"), t.game.state.cards[token!]!.linkedTo, t.pp()]).toEqual([["CP04-T02"], t.id("CP04-019"), 0]);
    const s = d({ me: { ...PC, hand: ["CP04-055"], playPoints: 2, maxPlayPoints: 7 }, opp: { field: ["V5", "V1"] } }).play("CP04-055");
    s.flush().pick("opp:V1").pick("opp:V5");
    expect([s.zone("me", "equipmentZone"), s.stats("CP04-055"), s.engaged("opp:V5")]).toEqual([["CP04-T08"], [4, 4], true]);
  });

  it("14.5.2 — Princess Sword: the equipped follower deals 2 more and takes 2 less (rulings: combat damage too)", () => {
    const t = d({ me: { field: [{ card: "CP04-019", equipped: ["CP04-T02"] }] }, opp: { field: [{ card: "V3", engaged: true }] } });
    t.attack("CP04-019", "opp:V3");
    expect([t.field("opp"), t.stats("CP04-019")]).toEqual([[], [3, 2]]);
  });

  it("11.11.1 — when the equipped follower leaves the field, its equipment is eliminated", () => {
    const t = d({ me: { field: [{ card: "CP04-019", equipped: ["CP04-T02", "CP04-T09"] }, "V1"], hand: ["QUICK-SAC"] } });
    t.play("QUICK-SAC").pick("CP04-019");
    expect([t.zone("me", "equipmentZone"), Object.values(t.game.state.cards).some((c) => c.zone === "equipmentZone")]).toEqual([[], false]);
  });

  it("14.5.2 — what a token gives the follower is the follower's (lost with its abilities); the token's own abilities stay", () => {
    const t = d({
      me: { field: ["BP05-060"], evolveDeck: ["BP05-061"], hand: ["CP04-053"], playPoints: 3 },
      opp: { field: [{ card: "CP04-058", equipped: ["CP04-T09", "CP04-T02"] }] },
    });
    expect(t.keywords("opp:CP04-058")).toEqual(["storm"]);
    t.evolve("BP05-060");
    expect(t.keywords("opp:CP04-058")).toEqual([]);
    // Princess Sword still takes 2 off: Chellerific Carnival's 3 damage leaves Muimi at 2 defense.
    t.play("CP04-053");
    expect(t.stats("opp:CP04-058")).toEqual([2, 2]);
  });
});
