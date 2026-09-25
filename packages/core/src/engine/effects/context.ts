import type { DefId } from "../../model/card";
import { opponentOf, type CardId, type PlayerId } from "../../model/ids";
import { IMPLEMENTED_KEYWORDS, type Keyword } from "../../model/keyword";
import type { CardType } from "../../model/card";
import type { EffectChange, EffectDuration, GrantedAbilityId, PlayerRestriction, TriggerData } from "../../model/state";
import type { GameEvent } from "../../events/types";
import type { CustomCost } from "../../script/types";
import {
  banishCards,
  buryCards,
  createTokens,
  destroyCards,
  discardCards,
  discardRandomCards,
  drawCards,
  millCards,
  putIntoEx,
  putOntoField,
  returnToHand,
  revealCards,
  setEngaged,
  shuffleDeck,
  shuffleToBottom,
  stealCard,
  transformCards,
} from "../actions/cards";
import { addCounters, removeCounters } from "../actions/counters";
import { dealDamage } from "../actions/damage";
import { changeLeaderDefense, setLeaderDefense } from "../actions/leader";
import { gainEvolutionPoints, payPlayPoints, recoverPlayPoints, setMaxPlayPoints } from "../actions/points";
import { selectableBy } from "../abilities/targets";
import { randomInt } from "../../rng/rng";
import { effectEvolve } from "../abilities/evolve";
import { EngineError } from "../errors";
import { cannotLose, endGame } from "../flow/end-game";
import { playCard } from "../flow/play-card";
import type { G } from "../runtime/context";
import { cardRefs, chooseOptions, confirm, orderCards, selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { getCard, nextSeq } from "../state/access";
import { exAreaLimit } from "../state/limits";
import { moveCards } from "../state/zones";
import { makeReader, type GameReader } from "../query";

type Until = EffectDuration;

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
  /**
   * Put cards into their owners' EX areas, or into `player`'s (BP05-019 "into your EX area";
   * the owner does not change). Limit CR 4.8.3.2.
   */
  putIntoEx(cards: readonly CardId[], player?: PlayerId): Proc<CardId[]>;
  /** CR 5.5 put cards onto a field (default: the controller's), reserved or engaged (BP06-058). */
  putOntoField(cards: readonly CardId[], player?: PlayerId, opts?: { engaged?: boolean }): Proc<CardId[]>;
  /** CR 5.4 */
  engage(cards: readonly CardId[]): Proc<void>;
  /** CR 5.4 refresh: turn cards to the reserved state. */
  refresh(cards: readonly CardId[]): Proc<void>;
  /** CR 5.12 the player selects `min`..`max` cards from their hand and discards them. */
  discard(player: PlayerId, min: number, max: number): Proc<CardId[]>;
  discardCards(cards: readonly CardId[]): Proc<CardId[]>;
  /** CR 5.19 "discards a random card": `count` cards chosen at random from the player's hand. */
  discardRandom(count: number, player?: PlayerId): Proc<CardId[]>;
  /** "Discard your hand". */
  discardHand(player?: PlayerId): Proc<CardId[]>;
  /** Put the top cards of a deck into its owner's cemetery. */
  mill(count: number, player?: PlayerId): Proc<CardId[]>;
  /**
   * CR 5.8 search the player's deck for up to `max` cards matching `filter`, reveal them
   * (5.8.1.2), put them into the hand (or onto the field / into the EX area), then shuffle
   * (5.8.2). Searches without a condition besides the number ("up to 2 cards") are not revealed
   * (`reveal: false`).
   */
  search(
    filter: (card: CardId) => boolean,
    opts?: {
      max?: number;
      /** Where the found cards go: hand (default), field, EX area, or banished (BP04-059). */
      to?: SearchDestination;
      /** Cards put onto the field enter engaged (BP06-082). */
      engaged?: boolean;
      /**
       * Decide the destination per found card after it is revealed, e.g. BP03-002 "add it to your
       * hand; if it costs 2 or less, you may put it onto your field instead". Overrides `to`.
       */
      destination?: (card: CardId) => Proc<SearchDestination>;
      player?: PlayerId;
      reveal?: boolean;
    },
  ): Proc<CardId[]>;
  /**
   * CR 5.8 "Search your deck for an A, a B and a C" (BP04-086): up to one card for each filter,
   * in order (a card found for one filter is not offered again), revealed, moved together, and
   * the deck shuffled once.
   */
  searchEach(filters: readonly ((card: CardId) => boolean)[], opts?: { to?: SearchDestination }): Proc<CardId[]>;
  /** CR 5.11 — the player looks at these cards (e.g. BP04-056 "look at the top card"); nothing moves. */
  lookAt(cards: readonly CardId[], player?: PlayerId): Proc<void>;
  /** CR 5.11 the top cards of a deck (the player looks at them). */
  topCards(count: number, player?: PlayerId): CardId[];
  /** Put cards on the bottom of their owner's deck in an order the player chooses. */
  bottomInAnyOrder(cards: readonly CardId[], player?: PlayerId): Proc<void>;
  /** Put cards on top of (or at the bottom of) their owner's deck in the given order. */
  putOnDeck(cards: readonly CardId[], position: "top" | "bottom"): Proc<void>;
  /**
   * "Put this card into your deck Nth from the top" (BP07-093); with fewer cards in the deck it
   * goes to the bottom (CR 4.1.3.1).
   */
  putIntoDeckAt(card: CardId, nthFromTop: number): Proc<void>;
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
  changePlayCost(target: CardId, amount: number, until?: Until): Proc<void>;
  /** "It costs N to play [this turn]" (CR 10.4.4.1, 10.10.2.4), e.g. BP02-091, BP07-071. */
  setPlayCost(target: CardId, value: number, until?: Until): Proc<void>;
  /**
   * "It doesn't take (combat / ability) damage" (CR 5.14.2 replacement, 5.14.3.2). The target
   * may be a leader card (BP04-103).
   */
  preventDamage(target: CardId, damage: "all" | "combat" | "ability", until: Until): Proc<void>;
  /** "Its Fanfare abilities can't be performed" (BP04-038/039). */
  blockFanfare(card: CardId): Proc<void>;
  /** CR 5.23.1 — this ability's controller wins the game: the opponent loses (BP04-003). */
  winGame(): Proc<void>;
  /** Give a trait (CR 2.4), e.g. BP02-T07 "the Armed trait". */
  giveTrait(target: CardId, trait: string, until?: Until): Proc<void>;
  /** CR 5.27 give a leader +X / -X defense. */
  giveLeaderDefense(player: PlayerId, delta: number): Proc<void>;
  /** CR 5.27.2 change a leader's defense to a value (e.g. BP02-075). */
  setLeaderDefense(player: PlayerId, value: number): Proc<void>;
  /** CR 3.2.5 gain evolution points (e.g. BP02-106). */
  gainEvolutionPoints(amount: number, player?: PlayerId): Proc<void>;
  /**
   * CR 10.4.4 pay play points (for costs of automatic abilities, e.g. "{[fanfare]} {[cost03]}"),
   * or another player pays (BP06-121 "its controller may pay {[cost02]}").
   */
  payPlayPoints(amount: number, player?: PlayerId): Proc<void>;
  /** CR 4.2.3 / 4.6.3 turn cards facedown (e.g. BP02-111, faceup cards in the evolve deck). */
  turnFacedown(cards: readonly CardId[]): Proc<void>;
  /** CR 5.15 */
  recoverPlayPoints(amount: number, player?: PlayerId): Proc<void>;
  /** Change maximum play points by `amount` (negative: BP06-058 "decrease your max play points by 1"). */
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
  delay(index: number, until?: "endOfTurn"): Proc<void>;
  /**
   * A slot a cost's `pay` can fill for the effect that follows it. Shared by the pay and the
   * resolve of one ability. Not stored in GameState — a replay re-runs the ability.
   */
  readonly memory: Record<string, string | number | boolean | null>;
  /**
   * The "when playing this card" option (CR 10.4.7.3) it was played with, e.g. BP04-066 "for 5
   * more play points"; null when played normally or for abilities.
   */
  readonly playOption: string | null;
  /** CR 5.22 — move an opponent's field card onto your field. Null when the field is full. */
  steal(card: CardId): Proc<CardId | null>;
  /**
   * CR 5.16.1.1 — evolve a follower by this effect. The controller may decline. A follower of
   * another player can't be evolved (BP07-104 ruling, CR 4.6.2).
   */
  evolve(card: CardId): Proc<boolean>;
  /** "It can't attack enemies" (CR 8.4.3.2.1). */
  cannotAttack(card: CardId, until: Until): Proc<void>;
  /** "This card's activated abilities can't be activated" (BP03-039/040). */
  cantActivate(card: CardId, exceptEvolve: boolean, until?: Until): Proc<void>;
  /** Give a card an ability defined in engine/abilities/grants.ts (BP03-062, 083, 112). */
  grant(card: CardId, id: GrantedAbilityId, until?: Until | null): Proc<void>;
  /**
   * "The next [matching] card you play this turn costs `amount` less" (BP03-038). Which cards
   * match is `CardScript.nextPlay[key]` of this ability's definition.
   */
  nextPlayCostsLess(key: string, amount: number): Proc<void>;
  /**
   * Deal `total` ability damage divided as the controller chooses among the targets, at least 1
   * to each (rulings BP08-028 / EBD02-015; select at most `total` targets, see TargetSpec.max).
   */
  dealDividedDamage(targets: readonly CardId[], total: number): Proc<void>;
  /** Shuffle these cards onto the bottom of their owner's deck (CR 5.9). */
  shuffleToBottom(cards: readonly CardId[]): Proc<void>;
  /**
   * CR 5.25 "Change it into [card type]" (BP05-001), for as long as it stays on the field
   * (10.9.2; still after it evolves — its ruling).
   */
  changeType(card: CardId, type: CardType): Proc<void>;
  /** "It loses all abilities" (BP05-061). */
  loseAbilities(card: CardId, until: Until): Proc<void>;
  /** "Change this card's Evolve cost to N" (BP05-048/052). */
  setEvolveCost(card: CardId, value: number, until: Until): Proc<void>;
  /** "This card's Evolve costs N less this turn" (BP07-086; negative = cheaper, adds up, never below 0). */
  changeEvolveCost(card: CardId, amount: number, until: Until): Proc<void>;
  /** "The next time [it] would take damage, it doesn't take damage" (BP05-017; a leader card too). */
  preventNextDamage(target: CardId, until: Until): Proc<void>;
  /** "If [it] would take more than N damage, it takes N instead" (BP05-101; a leader card too). */
  capDamage(target: CardId, max: number, until: Until): Proc<void>;
  /** A restriction on `player`'s next turn (BP05-006, see PlayerRestriction). */
  restrictPlayer(player: PlayerId, kind: PlayerRestriction["kind"]): Proc<void>;
  /** CR 5.26.2 "Skip [player's] next turn" (BP05-086 as a cost). */
  skipNextTurn(player?: PlayerId): Proc<void>;
  /**
   * CR 10.4.7.5 "[process]: [effect]" in the text being resolved (e.g. BP06-017 "{[engage]} 2
   * Hunter followers on your field: ..."): if the controller can execute the process, ask
   * whether to; execute it and return true, or return false (the effect is then not applied).
   */
  optionalCost(cost: CustomCost): Proc<boolean>;
  /** "It doesn't refresh during its controller's next start phase" (BP06-056). */
  skipNextRefresh(card: CardId): Proc<void>;
  /** CR 5.20 roll a six-sided die (the game's seeded random source); returns 1–6. */
  rollDie(player?: PlayerId): Proc<number>;
}

/** Where a search puts the cards it finds. */
export type SearchDestination = "hand" | "field" | "ex" | "banish";

export interface EffectInit {
  controller: PlayerId;
  self: CardId;
  sourceDef: DefId;
  targets: CardId[][];
  event: GameEvent | null;
  data?: TriggerData | null;
  mode?: string | null;
  earthRitePaid?: boolean;
  /** See EffectContext.memory. Created on first use and then shared. */
  memory?: Record<string, string | number | boolean | null>;
  /** See EffectContext.playOption. */
  playOption?: string | null;
}

export function makeEffectContext(g: G, init: EffectInit): EffectContext {
  const ctrl = init.controller;
  init.memory ??= {};
  const memory = init.memory;
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
    g.state.effects.push({ id: `e${seq}`, seq, target, source: selfIfPresent(), controller: ctrl, until, createdTurn: g.state.turn, change });
  };

  /** Move searched cards to their destinations (the field / EX area limits may ask which). */
  function* moveFound(groups: Record<SearchDestination, CardId[]>, player: PlayerId, engaged = false): Proc<CardId[]> {
    const moved: CardId[] = [];
    if (groups.hand.length > 0) moved.push(...moveCards(g, groups.hand.map((card) => ({ card, to: "hand" as const, player })), "effect"));
    if (groups.field.length > 0) moved.push(...(yield* putOntoField(g, groups.field, player, "effect", { chooser: ctrl, engaged })));
    if (groups.ex.length > 0) moved.push(...(yield* putIntoEx(g, groups.ex, ctrl)));
    if (groups.banish.length > 0) moved.push(...banishCards(g, groups.banish));
    return moved;
  }

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
      yield* dealDamage(g, [{ source: selfIfPresent(), controller: ctrl, target, amount, kind: "ability" }]);
    },
    *dealDamageEach(targets, amount) {
      yield* dealDamage(g, targets.map((target) => ({ source: selfIfPresent(), controller: ctrl, target, amount, kind: "ability" as const })));
    },
    *dealDamages(instances) {
      yield* dealDamage(
        g,
        instances.map((i) => ({ source: selfIfPresent(), controller: ctrl, target: i.target, amount: i.amount, kind: "ability" as const })),
      );
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
    *putIntoEx(cards, player) {
      return yield* putIntoEx(g, cards, ctrl, player);
    },
    *putOntoField(cards, player = ctrl, opts = {}) {
      return yield* putOntoField(g, cards, player, "effect", { chooser: ctrl, engaged: opts.engaged ?? false });
    },
    *engage(cards) {
      setEngaged(g, cards, true);
    },
    *refresh(cards) {
      setEngaged(g, cards, false);
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
    *discardRandom(count, player = ctrl) {
      return discardRandomCards(g, player, count);
    },
    *discardHand(player = ctrl) {
      return discardCards(g, [...g.state.players[player].zones.hand]);
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
      if (opts.reveal ?? true) revealCards(g, player, chosen);
      const groups: Record<SearchDestination, CardId[]> = { hand: [], field: [], ex: [], banish: [] };
      for (const card of chosen) groups[opts.destination ? yield* opts.destination(card) : (opts.to ?? "hand")].push(card);
      const moved = yield* moveFound(groups, player, opts.engaged ?? false);
      shuffleDeck(g, player); // CR 5.8.2
      return moved;
    },
    *searchEach(filters, opts = {}) {
      const deck = [...g.state.players[ctrl].zones.deck];
      const chosen: CardId[] = [];
      for (const filter of filters) {
        const matching = deck.filter((id) => !chosen.includes(id) && filter(id));
        // CR 4.1.2.2 — a card in the deck need not be found (BP04-086 ruling).
        const [card] = yield* selectCards(g, ctrl, "search", matching, 0, Math.min(1, matching.length), selfIfPresent(), deck);
        if (card !== undefined) chosen.push(card);
      }
      revealCards(g, ctrl, chosen); // CR 5.8.1.2
      const groups: Record<SearchDestination, CardId[]> = { hand: [], field: [], ex: [], banish: [] };
      groups[opts.to ?? "hand"].push(...chosen);
      const moved = yield* moveFound(groups, ctrl);
      shuffleDeck(g, ctrl); // CR 5.8.2
      return moved;
    },
    *lookAt(cards, player = ctrl) {
      const present = cards.filter((id) => g.state.cards[id] !== undefined);
      if (present.length > 0) g.emit({ type: "cardsLookedAt", player, cards: cardRefs(g, present) });
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
    *putIntoDeckAt(card, nthFromTop) {
      if (g.state.cards[card]) moveCards(g, [{ card, to: "deck", position: Math.max(0, nthFromTop - 1) }], "effect");
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
    *changePlayCost(target, amount, until = null) {
      addEffect(target, until, { kind: "playCost", amount });
    },
    *setPlayCost(target, value, until = null) {
      addEffect(target, until, { kind: "playCostSet", value });
    },
    *preventDamage(target, damage, until) {
      addEffect(target, until, { kind: "preventDamage", damage });
    },
    *blockFanfare(card) {
      addEffect(card, null, { kind: "noFanfare" });
    },
    *winGame() {
      // BP05-092 "opponents can't win" prohibits it (CR 1.3.3, its ruling).
      if (cannotLose(g, opponentOf(ctrl))) return;
      endGame(g, [{ player: opponentOf(ctrl), reason: "effect" }]);
    },
    *giveTrait(target, trait, until = null) {
      addEffect(target, until, { kind: "trait", trait });
    },
    *giveLeaderDefense(player, delta) {
      changeLeaderDefense(g, player, delta);
    },
    *setLeaderDefense(player, value) {
      setLeaderDefense(g, player, value);
    },
    *gainEvolutionPoints(amount, player = ctrl) {
      gainEvolutionPoints(g, player, amount);
    },
    *payPlayPoints(amount, player = ctrl) {
      payPlayPoints(g, player, amount);
    },
    *turnFacedown(cards) {
      for (const id of cards) {
        const c = g.state.cards[id];
        if (c) c.faceUp = false;
      }
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
      // "pick", not "effect": paying a cost is not the ability selecting a card (CR 12.15, BP03-091).
      return yield* selectCards(g, player, "pick", present, Math.min(min, hi), hi, selfIfPresent());
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
    *delay(index, until) {
      const seq = nextSeq(g.state);
      g.state.delayed.push({
        id: `d${seq}`,
        seq,
        controller: ctrl,
        source: selfIfPresent(),
        sourceDef: init.sourceDef,
        ability: index,
        createdTurn: g.state.turn,
        until: until ?? null,
      });
    },
    memory,
    playOption: init.playOption ?? null,
    *steal(card) {
      return stealCard(g, card, ctrl);
    },
    *evolve(card) {
      return yield* effectEvolve(g, card, ctrl);
    },
    *cannotAttack(card, until) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "cannotAttack" });
    },
    *cantActivate(card, exceptEvolve, until = "endOfTurn") {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "cantActivate", exceptEvolve });
    },
    *grant(card, id, until = null) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "grantedAbility", grant: id });
    },
    *nextPlayCostsLess(key, amount) {
      if (!g.scripts[init.sourceDef]?.nextPlay?.[key]) throw new EngineError(`${init.sourceDef} has no nextPlay "${key}"`);
      const seq = nextSeq(g.state);
      g.state.nextPlay.push({
        id: `n${seq}`,
        seq,
        player: ctrl,
        sourceDef: init.sourceDef,
        key,
        costDelta: -amount,
        createdTurn: g.state.turn,
      });
    },
    *dealDividedDamage(targets, total) {
      const present = targets.filter((id) => {
        const c = g.state.cards[id];
        return c !== undefined && (c.zone === "field" || c.zone === "leader");
      });
      if (present.length === 0 || total <= 0) return;
      // Each selected card gets at least 1 (rulings BP08-028 / EBD02-015). Selections are capped
      // at the damage when made (TargetSpec.max), so this only fails for a wrong script.
      if (total < present.length) throw new EngineError(`cannot divide ${total} damage among ${present.length} cards`);
      const amounts: number[] = [];
      let left = total;
      for (let i = 0; i < present.length - 1; i++) {
        const most = left - (present.length - 1 - i); // leave at least 1 for each later card
        const options = Array.from({ length: most }, (_, k) => ({ id: String(k + 1), label: String(k + 1) }));
        const [pick] = yield* chooseOptions(g, ctrl, "divideDamage", options, 1, 1, selfIfPresent(), present[i]);
        const n = Number(pick);
        amounts.push(n);
        left -= n;
      }
      amounts.push(left);
      yield* dealDamage(
        g,
        present.map((target, i) => ({
          source: selfIfPresent(),
          controller: ctrl,
          target,
          amount: amounts[i]!,
          kind: "ability" as const,
        })),
      );
    },
    *shuffleToBottom(cards) {
      shuffleToBottom(g, cards);
    },
    *changeType(card, type) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, null, { kind: "changeType", type });
    },
    *loseAbilities(card, until) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "loseAbilities" });
    },
    *setEvolveCost(card, value, until) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "evolveCostSet", value });
    },
    *changeEvolveCost(card, amount, until) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, until, { kind: "evolveCost", amount });
    },
    *preventNextDamage(target, until) {
      addEffect(target, until, { kind: "preventNextDamage" });
    },
    *capDamage(target, max, until) {
      addEffect(target, until, { kind: "damageCap", max });
    },
    *restrictPlayer(player, kind) {
      const seq = nextSeq(g.state);
      g.state.restrictions.push({ id: `r${seq}`, seq, player, kind, createdTurn: g.state.turn });
    },
    *skipNextTurn(player = ctrl) {
      g.state.players[player].skipNextTurn = true; // 5.26.2.1: more instructions still skip it once
    },
    *skipNextRefresh(card) {
      if (g.state.cards[card]?.zone === "field") addEffect(card, null, { kind: "skipNextRefresh" });
    },
    *rollDie(player = ctrl) {
      const result = randomInt(g.state.rng, 6) + 1;
      g.emit({ type: "dieRolled", player, result });
      return result;
    },
    *optionalCost(cost) {
      if (!cost.canPay(fx.game, ctrl, init.self)) return false;
      if (!(yield* confirm(g, ctrl, "optionalCost", selfIfPresent()))) return false;
      yield* cost.pay(fx);
      return true;
    },
  };
  return fx;
}
