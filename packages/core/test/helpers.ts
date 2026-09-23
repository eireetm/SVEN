import { expect } from "vitest";
import {
  createEngine,
  script,
  type Answer,
  type CardId,
  type CardScript,
  type Engine,
  type GameSession,
  type GameState,
  type MainAction,
  type PlayerId,
  type ScriptRegistry,
} from "../src";
import { BP01_CARDS, BP01_SCRIPTS } from "../src/sets/bp01";
import {
  checkInvariants,
  testAmulet,
  testEvolved,
  testFollower,
  testLeader,
  testSpell,
  testToken,
} from "../src/testing";

const { defineCard, evolveAbility, fanfare, lastWords, onEvolve, strike } = script;

export function bp01Engine(): Engine {
  return createEngine({ cards: BP01_CARDS, scripts: BP01_SCRIPTS });
}

const enemyFollowers = {
  count: 1,
  candidates: (g: import("../src").GameReader, controller: PlayerId) => g.followers(g.opponent(controller)),
};
const ownFollower = {
  count: 1,
  candidates: (g: import("../src").GameReader, controller: PlayerId) => g.followers(controller),
};

/** Synthetic cards for rule tests (ids are also their names unless stated). */
export const TEST_CARDS = [
  testLeader("L-FOREST", "Forestcraft"),
  testLeader("L-SWORD", "Swordcraft"),
  testFollower("V1", 1, 2, 2),
  testFollower("V2", 2, 2, 3),
  testFollower("V3", 3, 3, 4),
  testFollower("V5", 5, 5, 5),
  testFollower("ZERO", 1, 0, 3),
  testFollower("SWORD1", 1, 1, 1, { class: "Swordcraft" }),
  testFollower("EVOLVER", 2, 2, 2, { name: "Evolver", text: "Evolve [2]" }),
  testEvolved("EVOLVER-E", "Evolver", 4, 4),
  testEvolved("EVOLVER-E2", "Evolver", 5, 3, { text: "On Evolve: draw a card." }),
  testFollower("WARD", 2, 1, 3, { text: "Ward" }),
  testFollower("RUSH", 2, 2, 1, { text: "Rush" }),
  testFollower("STORM", 2, 2, 1, { text: "Storm" }),
  testFollower("FAN-KILL2", 3, 1, 1, { text: "Fanfare: destroy 2 enemy followers." }),
  testSpell("KILL2", 1, { text: "Destroy 2 enemy followers." }),
  testSpell("PING-UPTO2", 0, { text: "Deal 1 damage to up to 2 enemy followers." }),
  testSpell("GIVE-STORM", 0, { text: "Give one of your followers Storm until the end of the turn." }),
  testSpell("GIVE-DRAIN", 0, { text: "Give one of your followers Drain (not implemented)." }),
  testFollower("INTIM", 1, 1, 1, { text: "Intimidate" }),
  testFollower("BANE", 1, 1, 1, { text: "Bane" }),
  testFollower("FAN-DMG", 2, 2, 2, { text: "Fanfare: deal 1 damage to an enemy follower." }),
  testFollower("FAN-DRAW", 1, 1, 1, { text: "Fanfare: draw a card." }),
  testFollower("LW-DRAW", 1, 1, 1, { text: "Last Words: draw a card." }),
  testFollower("STRIKE", 2, 2, 2, { text: "Strike: draw a card." }),
  testSpell("QUICK-KILL", 1, { text: "Quick. Destroy an enemy follower." }),
  testSpell("QUICK-SAC", 0, { text: "Quick. Destroy one of your followers." }),
  testSpell("KILL", 1, { text: "Destroy an enemy follower." }),
  testSpell("BUFF-SOME", 0, { text: "Select up to 2 of your followers; give them +1/+1 until end of turn." }),
  testSpell("BOTH-20", 0, { text: "Deal 20 damage to each leader." }),
  testAmulet("AMULET", 1),
  testToken("TOKEN", 1, 1, 1),
  // Has card text but no script: "not implemented".
  testFollower("UNIMPL", 1, 1, 1, { text: "Fanfare: something the engine does not know." }),
];

const s = <T extends CardScript>(x: T) => defineCard(x);

export const TEST_SCRIPTS: ScriptRegistry = {
  EVOLVER: s({ abilities: [evolveAbility(2)] }),
  "EVOLVER-E2": s({
    abilities: [onEvolve({ *resolve(fx) { yield* fx.draw(1); } })],
  }),
  WARD: s({ keywords: ["ward"] }),
  RUSH: s({ keywords: ["rush"] }),
  STORM: s({ keywords: ["storm"] }),
  "FAN-KILL2": s({
    abilities: [
      fanfare({
        targets: [{ ...enemyFollowers, count: 2 }],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      }),
    ],
  }),
  KILL2: s({
    abilities: [
      { kind: "spell", targets: [{ ...enemyFollowers, count: 2 }], *resolve(fx) { yield* fx.destroy(fx.targets[0]!); } },
    ],
  }),
  "PING-UPTO2": s({
    abilities: [
      {
        kind: "spell",
        targets: [{ ...enemyFollowers, count: 2, upTo: true }],
        *resolve(fx) {
          for (const t of fx.targets[0]!) yield* fx.dealDamage(t, 1);
        },
      },
    ],
  }),
  "GIVE-STORM": s({
    abilities: [
      {
        kind: "spell",
        targets: [ownFollower],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "storm", "endOfTurn");
        },
      },
    ],
  }),
  "GIVE-DRAIN": s({
    abilities: [
      {
        kind: "spell",
        targets: [ownFollower],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "drain");
        },
      },
    ],
  }),
  INTIM: s({ keywords: ["intimidate"] }),
  BANE: s({ keywords: ["bane"] }),
  "FAN-DMG": s({
    abilities: [
      fanfare({
        targets: [enemyFollowers],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      }),
    ],
  }),
  "FAN-DRAW": s({ abilities: [fanfare({ *resolve(fx) { yield* fx.draw(1); } })] }),
  "LW-DRAW": s({ abilities: [lastWords({ *resolve(fx) { yield* fx.draw(1); } })] }),
  STRIKE: s({ abilities: [strike({ *resolve(fx) { yield* fx.draw(1); } })] }),
  "QUICK-KILL": s({
    keywords: ["quick"],
    abilities: [{ kind: "spell", targets: [enemyFollowers], *resolve(fx) { yield* fx.destroy(fx.targets[0]!); } }],
  }),
  KILL: s({
    abilities: [{ kind: "spell", targets: [enemyFollowers], *resolve(fx) { yield* fx.destroy(fx.targets[0]!); } }],
  }),
  "QUICK-SAC": s({
    keywords: ["quick"],
    abilities: [
      {
        kind: "spell",
        targets: [ownFollower],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ],
  }),
  "BUFF-SOME": s({
    abilities: [
      {
        kind: "spell",
        *resolve(fx) {
          const mine = fx.game.followers(fx.controller);
          const chosen = yield* fx.selectCards(mine, 0, Math.min(2, mine.length));
          for (const id of chosen) yield* fx.giveStats(id, 1, 1, "endOfTurn");
        },
      },
    ],
  }),
  "BOTH-20": s({
    abilities: [
      {
        kind: "spell",
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(0), 20);
          yield* fx.dealDamage(fx.game.leader(1), 20);
        },
      },
    ],
  }),
};

export function testEngine(): Engine {
  return createEngine({ cards: TEST_CARDS, scripts: TEST_SCRIPTS });
}

/** BP01 cards plus the synthetic test cards (for card tests that need simple helpers). */
export function cardEngine(): Engine {
  return createEngine({ cards: [...BP01_CARDS, ...TEST_CARDS], scripts: { ...BP01_SCRIPTS, ...TEST_SCRIPTS } });
}

/** Apply an answer and assert the game invariants afterwards. */
export function act(game: GameSession, answer: Answer) {
  const events = game.act(answer);
  expect(invariantErrors(game)).toEqual([]);
  return events;
}

export function invariantErrors(game: GameSession): string[] {
  return checkInvariants(game.state as GameState, game.reader().db, game.decision);
}

export function mainActions(game: GameSession): MainAction[] {
  const d = game.decision;
  if (!d || d.type !== "mainPhase") throw new Error(`expected a main phase decision, got ${d?.type}`);
  return d.actions;
}

export function doMain(game: GameSession, action: MainAction) {
  return act(game, { type: "mainPhase", action });
}

export function endMain(game: GameSession) {
  return doMain(game, { type: "endMainPhase" });
}

/** Ids of a player's cards in a zone whose definition is `def`. */
export function cardsOf(game: GameSession, p: PlayerId, zone: "hand" | "field" | "deck" | "ex" | "cemetery" | "evolveDeck" | "evolveZone", def: string): CardId[] {
  return game.state.players[p].zones[zone].filter((id) => game.state.cards[id]!.def === def);
}

export function only<T>(xs: readonly T[]): T {
  expect(xs).toHaveLength(1);
  return xs[0]!;
}

export function leaderId(game: GameSession, p: PlayerId): CardId {
  return game.state.players[p].zones.leader[0]!;
}

export function stats(game: GameSession, id: CardId) {
  const i = game.reader().info(id);
  return { attack: i.attack, defense: i.defense };
}
