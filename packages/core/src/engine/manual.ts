// Manual operations (model/manual.ts): testing by hand, outside the rules. The session accepts them only in games with
// GameConfig.manualActions, as answers to a main phase decision (checked here first); the main phase loop carries them out
// with the engine's own procedures and then goes on with Confirmation Timing (CR 7.3.4), so abilities trigger as usual.
import type { CardId, PlayerId } from "../model/ids";
import { IMPLEMENTED_KEYWORDS } from "../model/keyword";
import type { ManualOp } from "../model/manual";
import { correspondingEvolveCards, evolveCard, type EvolveOption } from "./abilities/evolve";
import { canPlayActivatedFree, playActivatedAbility } from "./abilities/play-ability";
import { addCounters, removeCounters } from "./actions/counters";
import { createTokens, drawCards, millCards, setEngaged, shuffleDeck } from "./actions/cards";
import { dealDamage } from "./actions/damage";
import { setLeaderDefense } from "./actions/leader";
import { setMaxPlayPoints, setPlayPoints } from "./actions/points";
import { makeEffectContext } from "./effects/context";
import { EngineError } from "./errors";
import { performAttack } from "./flow/attack";
import { canPlayCard, playCard } from "./flow/play-card";
import type { G } from "./runtime/context";
import type { Proc } from "./runtime/proc";
import { characteristics, isFollowerOnField } from "./state/characteristics";
import { moveCards } from "./state/zones";

/** Zones a card may be moved, destroyed or played from by hand (not a deck, whose cards stay unknown, nor linked zones). */
const MOVABLE_FROM = new Set(["hand", "field", "ex", "cemetery", "banished"]);

const isPlayer = (p: unknown): p is PlayerId => p === 0 || p === 1;
const isInt = (n: unknown, lo: number, hi: number): n is number => Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;

/** Why `op` can't be carried out now (null: it can). The session checks this before the operation goes into the game. */
export function manualOpError(g: G, op: ManualOp): string | null {
  const card = (id: unknown) => (typeof id === "string" ? g.state.cards[id] : undefined);
  const onField = (id: CardId) => card(id)?.zone === "field";
  switch (op.kind) {
    case "draw":
    case "mill":
      return isPlayer(op.player) && isInt(op.count, 1, 60) ? null : "a player and 1 to 60 cards";
    case "shuffle":
      return isPlayer(op.player) ? null : "a player";
    case "search":
      if (!isPlayer(op.player)) return "a player";
      return g.state.players[op.player].zones.deck.some((id) => g.state.cards[id]!.def === op.def) ? null : `no ${String(op.def)} in the deck`;
    case "points": {
      if (!isPlayer(op.player)) return "a player";
      const values = [op.playPoints, op.maxPlayPoints, op.evolutionPoints, op.superEvolutionPoints];
      if (values.every((v) => v === undefined)) return "no points given";
      return values.every((v) => v === undefined || isInt(v, 0, 99)) ? null : "points are 0 to 99";
    }
    case "leaderDefense":
      return isPlayer(op.player) && isInt(op.value, -99, 999) ? null : "a player and a defense of -99 to 999";
    case "token": {
      if (!isPlayer(op.player) || (op.to !== "field" && op.to !== "ex")) return "a player, and the field or the EX area";
      return g.db.has(op.token) && g.db.get(op.token).token ? null : `${String(op.token)} is not a token`;
    }
    case "move": {
      const c = card(op.card);
      if (!c || !MOVABLE_FROM.has(c.zone)) return "a card in a hand, a field, an EX area, a cemetery or a banished zone";
      const type = characteristics(g, op.card).type;
      if (type === "leader" || type === "crest") return "leaders and crests stay where they are";
      if (op.to === "field" && type !== "follower" && type !== "amulet") return "only followers and amulets go onto the field";
      if (op.to === c.zone) return "the card is there already";
      return ["hand", "field", "ex", "cemetery", "banished", "deckTop", "deckBottom"].includes(op.to) ? null : "no such place";
    }
    case "destroy":
    case "engage":
      return onField(op.card) ? null : "a card on the field";
    case "damage":
    case "heal":
      return isFollowerOnField(g, op.card) && isInt(op.amount, 1, 99) ? null : "a follower on the field and 1 to 99";
    case "stats":
      if (!onField(op.card)) return "a card on the field";
      return isInt(op.attack, -99, 99) && isInt(op.defense, -99, 99) && (op.attack !== 0 || op.defense !== 0) ? null : "attack and defense -99 to 99";
    case "keyword":
      if (!onField(op.card)) return "a card on the field";
      return IMPLEMENTED_KEYWORDS.includes(op.keyword) ? null : `no keyword ${String(op.keyword)}`;
    case "counters": {
      const c = card(op.card);
      if (!c || (c.zone !== "field" && c.zone !== "ex")) return "a card on the field or in an EX area";
      const named = typeof op.counter === "string" && op.counter.length > 0 && op.counter.length <= 40;
      return named && isInt(op.amount, -99, 99) && op.amount !== 0 ? null : "a counter and -99 to 99 of it";
    }
    case "evolve": {
      if (!isFollowerOnField(g, op.card) || characteristics(g, op.card).evolved) return "an unevolved follower on the field";
      const corresponds = correspondingEvolveCards(g, op.card).some((o) => o.card === op.evolveCard && o.backFace === (op.backFace === true));
      return corresponds ? null : "an evolve deck card that corresponds to it (CR 5.16.1.1)";
    }
    case "attack": {
      const attacker = card(op.attacker);
      const target = card(op.target);
      if (!attacker || !isFollowerOnField(g, op.attacker) || attacker.controller !== g.state.activePlayer) return "a follower of the active player";
      if (!target || target.controller === attacker.controller) return "an enemy follower or leader";
      return target.zone === "leader" || isFollowerOnField(g, op.target) ? null : "an enemy follower on the field or the enemy leader";
    }
    case "play": {
      const c = card(op.card);
      if (!c || c.zone === "field" || !MOVABLE_FROM.has(c.zone)) return "a card in a hand, an EX area, a cemetery or a banished zone";
      // CR 10.6.2: its targets, and room on the field for a follower or an amulet (10.6.2.6).
      return canPlayCard(g, c.controller, op.card, "effect", { setCost: 0, byEffect: true }) ? null : "it can't be played now (no targets, or no room)";
    }
    case "activate":
      return canPlayActivatedFree(g, op.card, op.ability) ? null : "no such activated ability that can be played here (zone, targets, its condition or a cost of cards or counters)";
  }
}

/** What can be done by hand now that depends on the rules' own checks: for a GUI's menus. */
export interface ManualOptions {
  /** Cards that can be played for free now (manual "play"). */
  playable: CardId[];
  /** For each unevolved follower on a field, the evolve deck cards it can evolve with (manual "evolve"). */
  evolveWith: Record<CardId, EvolveOption[]>;
  /** Activated abilities that can be played for free now (manual "activate"), as "card:index". */
  activatable: string[];
}

export function manualOptions(g: G): ManualOptions {
  const playable: CardId[] = [];
  const evolveWith: Record<CardId, EvolveOption[]> = {};
  const activatable: string[] = [];
  for (const p of [0, 1] as PlayerId[]) {
    const zones = g.state.players[p].zones;
    for (const card of [...zones.hand, ...zones.ex, ...zones.cemetery, ...zones.banished]) {
      if (manualOpError(g, { kind: "play", card }) === null) playable.push(card);
    }
    for (const card of zones.field) {
      if (!isFollowerOnField(g, card) || characteristics(g, card).evolved) continue;
      const options = correspondingEvolveCards(g, card);
      if (options.length > 0) evolveWith[card] = options;
    }
    for (const card of [...zones.field, ...zones.hand, ...zones.ex, ...zones.cemetery]) {
      characteristics(g, card).abilities.forEach(({ ability }, index) => {
        if (ability.kind === "activated" && !ability.evolve && canPlayActivatedFree(g, card, index)) activatable.push(`${card}:${index}`);
      });
    }
  }
  return { playable, evolveWith, activatable };
}

/** Carry out a manual operation (checked by manualOpError). */
export function* performManualOp(g: G, op: ManualOp): Proc<void> {
  g.emit({ type: "manualOp", op });
  switch (op.kind) {
    case "draw":
      drawCards(g, op.player, op.count, true);
      return;
    case "mill":
      millCards(g, op.player, op.count);
      return;
    case "shuffle":
      shuffleDeck(g, op.player);
      return;
    case "search": {
      const found = g.state.players[op.player].zones.deck.find((id) => g.state.cards[id]!.def === op.def)!;
      moveCards(g, [{ card: found, to: "hand" }], "effect");
      return;
    }
    case "points": {
      if (op.maxPlayPoints !== undefined) setMaxPlayPoints(g, op.player, op.maxPlayPoints);
      if (op.playPoints !== undefined) setPlayPoints(g, op.player, op.playPoints);
      if (op.evolutionPoints !== undefined || op.superEvolutionPoints !== undefined) {
        const ps = g.state.players[op.player];
        ps.evolutionPoints = op.evolutionPoints ?? ps.evolutionPoints;
        ps.superEvolutionPoints = op.superEvolutionPoints ?? ps.superEvolutionPoints;
        g.emit({ type: "evolutionPointsChanged", player: op.player, evolutionPoints: ps.evolutionPoints, superEvolutionPoints: ps.superEvolutionPoints });
      }
      return;
    }
    case "leaderDefense":
      setLeaderDefense(g, op.player, op.value);
      return;
    case "token":
      yield* createTokens(g, op.player, op.player, [op.token], op.to);
      return;
    case "move": {
      const c = g.state.cards[op.card]!;
      // Onto the controller's field; elsewhere the owner's zone (CR 4.1.6). An over-full field or EX area is rules
      // handling's (CR 11.4.1, 11.5.1).
      if (op.to === "field") moveCards(g, [{ card: op.card, to: "field", player: c.controller }], "effect");
      else if (op.to === "deckTop" || op.to === "deckBottom") moveCards(g, [{ card: op.card, to: "deck", position: op.to === "deckTop" ? "top" : "bottom" }], "effect");
      else moveCards(g, [{ card: op.card, to: op.to }], op.to === "banished" ? "banish" : "effect");
      return;
    }
    case "destroy":
      moveCards(g, [{ card: op.card, to: "cemetery" }], "destroy");
      return;
    case "engage":
      setEngaged(g, [op.card], op.engaged);
      return;
    case "damage":
      yield* dealDamage(g, [{ source: null, controller: null, target: op.card, amount: op.amount, kind: "ability" }]);
      return;
    case "heal": {
      const c = g.state.cards[op.card]!;
      c.damage = Math.max(0, c.damage - op.amount);
      return;
    }
    case "stats":
      yield* context(g, op.card).giveStats(op.card, op.attack, op.defense);
      return;
    case "keyword":
      yield* context(g, op.card).giveKeyword(op.card, op.keyword);
      return;
    case "counters":
      if (op.amount > 0) addCounters(g, op.card, op.counter, op.amount);
      else removeCounters(g, op.card, op.counter, -op.amount);
      return;
    case "evolve":
      evolveCard(g, op.card, op.evolveCard, op.superEvolve, op.backFace === true);
      return;
    case "attack":
      yield* performAttack(g, op.attacker, op.target);
      return;
    case "play":
      yield* playCard(g, g.state.cards[op.card]!.controller, op.card, { setCost: 0, byEffect: true });
      return;
    case "activate":
      yield* playActivatedAbility(g, g.state.cards[op.card]!.controller, op.card, op.ability, false, true);
      return;
    default:
      throw new EngineError(`unknown manual operation ${JSON.stringify(op)}`);
  }
}

/** An effect context of the card itself, for the persistent effects an operation gives it (its own, as if its ability). */
function context(g: G, card: CardId) {
  const c = g.state.cards[card]!;
  return makeEffectContext(g, { controller: c.controller, self: card, sourceDef: c.def, targets: [], event: null });
}
