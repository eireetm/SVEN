import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import { IMPLEMENTED_KEYWORDS, type Keyword } from "../../model/keyword";
import type { EffectChange, TriggerData } from "../../model/state";
import type { GameEvent } from "../../events/types";
import {
  banishCards,
  buryCards,
  createTokens,
  destroyCards,
  discardCards,
  drawCards,
  millCards,
  putIntoEx,
  putOntoField,
  returnToHand,
  revealCards,
  setEngaged,
  shuffleDeck,
  transformCards,
} from "../actions/cards";
import { addCounters, removeCounters } from "../actions/counters";
import { dealDamage } from "../actions/damage";
import { changeLeaderDefense } from "../actions/leader";
import { recoverPlayPoints, setMaxPlayPoints } from "../actions/points";
import { selectableBy } from "../abilities/targets";
import { EngineError } from "../errors";
import { playCard } from "../flow/play-card";
import type { G } from "../runtime/context";
import { chooseOptions, confirm, orderCards, selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { getCard, nextSeq } from "../state/access";
import { exAreaLimit } from "../state/limits";
import { moveCards } from "../state/zones";
import { makeReader, type GameReader } from "../query";

type Until = "endOfTurn" | null;

/**
 * What a card script can do while its ability resolves (CR 10.6.2.8). Every operation is a
 * Proc so that scripts use `yield*` uniformly, whether or not the operation needs a
 * decision. Operations follow the key notations of CR 5; "impossible" parts are skipped
 * (CR 1.3.2).
 */
export interface EffectContext {
  readonly game: GameReader;
  /** CR 3.1.2.4 — the controller of the effect. */
  readonly controller: PlayerId;
  /** The card with the ability (its current object, CR 4.1.4.1). */
  readonly self: CardId;
  /** Definition providing the resolving ability. */
  readonly sourceDef: DefId;
  /** Targets chosen while playing the ability, one array per TargetSpec (CR 10.6.2.3). */
  readonly targets: readonly (readonly CardId[])[];
  /** Triggering event and trigger data for automatic abilities. */
  readonly event: GameEvent | null;
  readonly data: TriggerData | null;
  /** CR 5.18 — the chosen option of a "choose" ability. */
  readonly mode: string | null;
  /** CR 13.3.3.2 — whether Earth Rite was paid. */
  readonly earthRitePaid: boolean;

  /** CR 5.10 */
  draw(count: number, player?: PlayerId): Proc<CardId[]>;
  /** CR 5.14 ability damage from `self`. */
  dealDamage(target: CardId, amount: number): Proc<void>;
  /** CR 5.14 the same ability damage to several targets at once. */
  dealDamageEach(targets: readonly CardId[], amount: number): Proc<void>;
  /** CR 5.14 different amounts of ability damage dealt at the same time. */
  dealDamages(instances: readonly { target: CardId; amount: number }[]): Proc<void>;
  /** CR 5.6 */
  destroy(cards: readonly CardId[]): Proc<CardId[]>;
  /** CR 5.34 put into the owners' cemeteries (not destroying). */
  bury(cards: readonly CardId[]): Proc<CardId[]>;
  /** CR 5.7 */
  banish(cards: readonly CardId[]): Proc<CardId[]>;
  returnToHand(cards: readonly CardId[]): Proc<CardId[]>;
  /** Put cards into their owners' EX areas (limit CR 4.8.3.2). */
  putIntoEx(cards: readonly CardId[]): Proc<CardId[]>;
  /** CR 5.5 put cards onto a field (default: the controller's). */
  putOntoField(cards: readonly CardId[], player?: PlayerId): Proc<CardId[]>;
  /** CR 5.4 */
  engage(cards: readonly CardId[]): Proc<void>;
  /** CR 5.12 the player selects `min`..`max` cards from their hand and discards them. */
  discard(player: PlayerId, min: number, max: number): Proc<CardId[]>;
  discardCards(cards: readonly CardId[]): Proc<CardId[]>;
  /** Put the top cards of a deck into its owner's cemetery. */
  mill(count: number, player?: PlayerId): Proc<CardId[]>;
  /**
   * CR 5.8 search the player's deck for up to `max` cards matching `filter`, reveal them
   * (5.8.1.2), put them into the hand (or onto the field), then shuffle (5.8.2).
   */
  search(filter: (card: CardId) => boolean, opts?: { max?: number; to?: "hand" | "field"; player?: PlayerId }): Proc<CardId[]>;
  /** CR 5.11 the top cards of a deck (the player looks at them). */
  topCards(count: number, player?: PlayerId): CardId[];
  /** Put cards on the bottom of their owner's deck in an order the player chooses. */
  bottomInAnyOrder(cards: readonly CardId[], player?: PlayerId): Proc<void>;
  /** Put cards on top of (or at the bottom of) their owner's deck in the given order. */
  putOnDeck(cards: readonly CardId[], position: "top" | "bottom"): Proc<void>;
  /** Move the top card of the deck into the EX area `count` times (while it has room). */
  topToEx(count: number, player?: PlayerId): Proc<CardId[]>;
  /** CR 5.21 */
  reveal(cards: readonly CardId[]): Proc<void>;
  /** CR 5.17 */
  transform(cards: readonly CardId[], tokenName: string): Proc<CardId[]>;
  /** CR 5.5.2.1 summon tokens by name; with `overflowToEx`, those that do not fit go to the EX area. */
  summon(tokenNames: readonly string[], opts?: { player?: PlayerId; overflowToEx?: boolean }): Proc<CardId[]>;
  /** CR 5.5.2 put tokens into an EX area. */
  tokensToEx(tokenNames: readonly string[], player?: PlayerId): Proc<CardId[]>;
  shuffleDeck(player?: PlayerId): Proc<void>;

  /** CR 5.27 give +X/+Y (a persistent effect, CR 10.9.1.4). */
  giveStats(target: CardId, attack: number, defense: number, until?: Until): Proc<void>;
  /** Give a keyword ability, e.g. "give this follower Storm" (persistent effect, CR 10.9.1.2). */
  giveKeyword(target: CardId, keyword: Keyword, until?: Until): Proc<void>;
  /** "It cannot deal damage" (e.g. BP01-024). */
  cannotDealDamage(target: CardId, until?: Until): Proc<void>;
  /** "It costs N less to play" (CR 10.4.4.1): changes only the cost of playing it. */
  changePlayCost(target: CardId, amount: number): Proc<void>;
  /** CR 5.27 give a leader +X / -X defense. */
  giveLeaderDefense(player: PlayerId, delta: number): Proc<void>;
  /** CR 5.15 */
  recoverPlayPoints(amount: number, player?: PlayerId): Proc<void>;
  increaseMaxPlayPoints(amount: number, player?: PlayerId): Proc<void>;
  /** CR 5.28 */
  extraTurn(player?: PlayerId): Proc<void>;
  /** CR 15.1 */
  addCounters(card: CardId, counter: string, amount: number): Proc<void>;
  removeCounters(card: CardId, counter: string, amount: number): Proc<number>;
  /** CR 13.3.2.4 "Add X to a Stack on your field" (BP01-069 ruling: no Stack card -> a Magic Sediment). */
  addToStack(amount: number): Proc<void>;

  /** A selection made during resolution (Aura-protected enemy cards are removed, CR 12.15). */
  selectCards(candidates: readonly CardId[], min: number, max: number, player?: PlayerId, peek?: readonly CardId[]): Proc<CardId[]>;
  /**
   * A choice among cards that is not the ability "selecting" them (no Aura filtering), e.g. a
   * player deciding which of their own cards go on top of the deck, or paying a cost.
   */
  chooseCards(candidates: readonly CardId[], min: number, max: number, player?: PlayerId): Proc<CardId[]>;
  /** Put cards on top of / at the bottom of their owner's deck in an order `player` chooses. */
  putOnDeckInAnyOrder(cards: readonly CardId[], position: "top" | "bottom", player?: PlayerId): Proc<void>;
  choose(options: readonly { id: string; label: string }[], min?: number, max?: number, player?: PlayerId): Proc<string[]>;
  /** "You may ..." */
  confirm(player?: PlayerId, subject?: CardId): Proc<boolean>;
  /** Play a card from anywhere as part of this effect, optionally for a set cost (e.g. "for 0"). */
  playCard(card: CardId, opts?: { cost?: number }): Proc<void>;
  /** CR 10.7.5 register a delayed trigger: ability `index` of this ability's definition. */
  delay(index: number): Proc<void>;
}

export interface EffectInit {
  controller: PlayerId;
  self: CardId;
  sourceDef: DefId;
  targets: CardId[][];
  event: GameEvent | null;
  data?: TriggerData | null;
  mode?: string | null;
  earthRitePaid?: boolean;
}

export function makeEffectContext(g: G, init: EffectInit): EffectContext {
  const ctrl = init.controller;
  const selfIfPresent = () => (g.state.cards[init.self] ? init.self : null);
  const token = (name: string): DefId => {
    const d = g.db.tokenNamed(name);
    if (!d) throw new EngineError(`no token named "${name}" (CR 9.1.2.3)`);
    return d.id;
  };
  /** A persistent effect on one card object; ends if the card changes zones (CR 10.9.2). */
  const addEffect = (target: CardId, until: Until, change: EffectChange) => {
    if (!g.state.cards[target]) return; // CR 1.3.2 — impossible actions are not performed
    const seq = nextSeq(g.state);
    g.state.effects.push({ id: `e${seq}`, seq, target, source: selfIfPresent(), controller: ctrl, until, change });
  };

  const fx: EffectContext = {
    game: makeReader(g),
    controller: ctrl,
    self: init.self,
    sourceDef: init.sourceDef,
    targets: init.targets,
    event: init.event,
    data: init.data ?? null,
    mode: init.mode ?? null,
    earthRitePaid: init.earthRitePaid ?? false,

    *draw(count, player = ctrl) {
      return drawCards(g, player, count);
    },
    *dealDamage(target, amount) {
      dealDamage(g, [{ source: selfIfPresent(), target, amount, kind: "ability" }]);
    },
    *dealDamageEach(targets, amount) {
      dealDamage(g, targets.map((target) => ({ source: selfIfPresent(), target, amount, kind: "ability" as const })));
    },
    *dealDamages(instances) {
      dealDamage(g, instances.map((i) => ({ source: selfIfPresent(), target: i.target, amount: i.amount, kind: "ability" as const })));
    },
    *destroy(cards) {
      return destroyCards(g, cards);
    },
    *bury(cards) {
      return buryCards(g, cards);
    },
    *banish(cards) {
      return banishCards(g, cards);
    },
    *returnToHand(cards) {
      return returnToHand(g, cards);
    },
    *putIntoEx(cards) {
      return yield* putIntoEx(g, cards, ctrl);
    },
    *putOntoField(cards, player = ctrl) {
      return yield* putOntoField(g, cards, player, "effect", { chooser: ctrl });
    },
    *engage(cards) {
      setEngaged(g, cards, true);
    },
    *discard(player, min, max) {
      const hand = g.state.players[player].zones.hand;
      const n = Math.min(max, hand.length);
      const chosen = yield* selectCards(g, player, "discard", hand, Math.min(min, n), n, selfIfPresent());
      return discardCards(g, chosen);
    },
    *discardCards(cards) {
      return discardCards(g, cards);
    },
    *mill(count, player = ctrl) {
      return millCards(g, player, count);
    },
    *search(filter, opts = {}) {
      const player = opts.player ?? ctrl;
      const deck = [...g.state.players[player].zones.deck];
      const matching = deck.filter(filter);
      const max = Math.min(opts.max ?? 1, matching.length);
      // A card in a non-public zone need not be found (CR 4.1.2.2), so the minimum is 0.
      const chosen = yield* selectCards(g, player, "search", matching, 0, max, selfIfPresent(), deck);
      revealCards(g, player, chosen);
      let moved: CardId[];
      if (opts.to === "field") moved = yield* putOntoField(g, chosen, player, "effect", { chooser: ctrl });
      else moved = moveCards(g, chosen.map((card) => ({ card, to: "hand" as const, player })), "effect");
      shuffleDeck(g, player); // CR 5.8.2
      return moved;
    },
    topCards(count, player = ctrl) {
      return g.state.players[player].zones.deck.slice(0, Math.max(0, count));
    },
    *bottomInAnyOrder(cards, player = ctrl) {
      const present = cards.filter((id) => g.state.cards[id] !== undefined);
      const order = yield* orderCards(g, player, "deckBottom", present, selfIfPresent());
      moveCards(g, order.map((card) => ({ card, to: "deck" as const, position: "bottom" as const })), "effect");
    },
    *putOnDeck(cards, position) {
      const present = cards.filter((id) => g.state.cards[id] !== undefined);
      // "top" in the given order means the first card ends up on top.
      const specs = (position === "top" ? [...present].reverse() : present).map((card) => ({
        card,
        to: "deck" as const,
        position,
      }));
      moveCards(g, specs, "effect");
    },
    *topToEx(count, player = ctrl) {
      const moved: CardId[] = [];
      for (let i = 0; i < count; i++) {
        const top = g.state.players[player].zones.deck[0];
        if (top === undefined || g.state.players[player].zones.ex.length >= exAreaLimit(g, player)) break;
        moved.push(...moveCards(g, [{ card: top, to: "ex", player }], "effect"));
      }
      return moved;
    },
    *reveal(cards) {
      revealCards(g, ctrl, cards);
    },
    *transform(cards, tokenName) {
      return yield* transformCards(g, cards, token(tokenName), ctrl);
    },
    *summon(tokenNames, opts = {}) {
      const player = opts.player ?? ctrl;
      const defs = tokenNames.map(token);
      const onField = yield* createTokens(g, ctrl, player, defs, "field", selfIfPresent());
      if (!opts.overflowToEx || onField.length === defs.length) return onField;
      // Which ones went to the field only matters when names differ; keep the remaining ones.
      const left = [...defs];
      for (const id of onField) left.splice(left.indexOf(getCard(g.state, id).def), 1);
      return [...onField, ...(yield* createTokens(g, ctrl, player, left, "ex", selfIfPresent()))];
    },
    *tokensToEx(tokenNames, player = ctrl) {
      return yield* createTokens(g, ctrl, player, tokenNames.map(token), "ex", selfIfPresent());
    },
    *shuffleDeck(player = ctrl) {
      shuffleDeck(g, player);
    },

    *giveStats(target, attack, defense, until = null) {
      addEffect(target, until, { kind: "stats", attack, defense });
    },
    *giveKeyword(target, keyword, until = null) {
      if (!IMPLEMENTED_KEYWORDS.includes(keyword)) {
        throw new EngineError(`keyword "${keyword}" is not implemented by the engine yet`);
      }
      addEffect(target, until, { kind: "keyword", keyword });
    },
    *cannotDealDamage(target, until = null) {
      addEffect(target, until, { kind: "cannotDealDamage" });
    },
    *changePlayCost(target, amount) {
      addEffect(target, null, { kind: "playCost", amount });
    },
    *giveLeaderDefense(player, delta) {
      changeLeaderDefense(g, player, delta);
    },
    *recoverPlayPoints(amount, player = ctrl) {
      recoverPlayPoints(g, player, amount);
    },
    *increaseMaxPlayPoints(amount, player = ctrl) {
      setMaxPlayPoints(g, player, g.state.players[player].maxPlayPoints + amount);
    },
    *extraTurn(player = ctrl) {
      g.state.extraTurns.push(player);
      g.emit({ type: "extraTurnGranted", player });
    },
    *addCounters(card, counter, amount) {
      addCounters(g, card, counter, amount);
    },
    *removeCounters(card, counter, amount) {
      return removeCounters(g, card, counter, amount);
    },
    *addToStack(amount) {
      const stacks = fx.game.stackCards(ctrl);
      if (stacks.length > 0) {
        const [chosen] = yield* selectCards(g, ctrl, "effect", stacks, 1, 1, selfIfPresent());
        addCounters(g, chosen!, "stack", amount);
        return;
      }
      const [sediment] = yield* createTokens(g, ctrl, ctrl, [token("Magic Sediment")], "field", selfIfPresent());
      if (sediment !== undefined) addCounters(g, sediment, "stack", amount - (getCard(g.state, sediment).counters.stack ?? 0));
    },

    *selectCards(candidates, min, max, player = ctrl, peek) {
      const legal = candidates.filter((id) => selectableBy(g, id, ctrl));
      const hi = Math.min(max, legal.length);
      return yield* selectCards(g, player, "effect", legal, Math.min(min, hi), hi, selfIfPresent(), peek);
    },
    *chooseCards(candidates, min, max, player = ctrl) {
      const present = candidates.filter((id) => g.state.cards[id] !== undefined);
      const hi = Math.min(max, present.length);
      return yield* selectCards(g, player, "effect", present, Math.min(min, hi), hi, selfIfPresent());
    },
    *putOnDeckInAnyOrder(cards, position, player = ctrl) {
      const present = cards.filter((id) => g.state.cards[id] !== undefined);
      const order = yield* orderCards(g, player, position === "top" ? "deckTop" : "deckBottom", present, selfIfPresent());
      yield* fx.putOnDeck(order, position);
    },
    *choose(options, min = 1, max = 1, player = ctrl) {
      return yield* chooseOptions(g, player, "effect", options, min, max, selfIfPresent());
    },
    *confirm(player = ctrl, subject) {
      return yield* confirm(g, player, "effect", selfIfPresent(), subject);
    },
    *playCard(card, opts = {}) {
      yield* playCard(g, ctrl, card, { setCost: opts.cost, byEffect: true });
    },
    *delay(index) {
      const seq = nextSeq(g.state);
      g.state.delayed.push({
        id: `d${seq}`,
        seq,
        controller: ctrl,
        source: selfIfPresent(),
        sourceDef: init.sourceDef,
        ability: index,
        createdTurn: g.state.turn,
      });
    },
  };
  return fx;
}
