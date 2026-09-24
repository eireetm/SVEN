import type { CardType } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { TriggerData } from "../model/state";
import type { CardMove, GameEvent } from "../events/types";
import type { EffectContext } from "../engine/effects/context";
import type { Proc } from "../engine/runtime/proc";
import type { GameReader } from "../engine/query";
import type {
  ActivatedAbility,
  AutomaticAbility,
  CardScript,
  CostSpec,
  CustomCost,
  EarthRiteSpec,
  Mode,
  TargetSpec,
  TriggerSubject,
} from "./types";

/** Identity helper that gives card scripts type checking. */
export function defineCard(script: CardScript): CardScript {
  return script;
}

/**
 * CR 12.2 — "Evolve [cost]: Evolve this follower." (a number = play points). `condition`:
 * "This ability can be activated if ..." (BP05-018).
 */
export function evolveAbility(
  cost: number | CostSpec,
  opts: { nameIncludes?: string; condition?: ActivatedAbility["condition"] } = {},
): ActivatedAbility {
  const ability: ActivatedAbility = {
    kind: "activated",
    evolve: true,
    cost: typeof cost === "number" ? { playPoints: cost } : cost,
  };
  if (opts.nameIncludes !== undefined) ability.evolveNameIncludes = opts.nameIncludes;
  if (opts.condition !== undefined) ability.condition = opts.condition;
  return ability;
}

/** Everything an automatic ability may specify besides its trigger. */
export interface TimingSpec {
  targets?: readonly TargetSpec[];
  cost?: CustomCost;
  earthRite?: EarthRiteSpec;
  modes?: readonly Mode[];
  modeCount?: AutomaticAbility["modeCount"];
  condition?: AutomaticAbility["condition"];
  oncePerTurn?: boolean;
  resolve?(fx: EffectContext): Proc<void>;
}

function automatic(
  timing: AutomaticAbility["timing"],
  trigger: AutomaticAbility["trigger"],
  spec: TimingSpec,
  extra: Partial<AutomaticAbility> = {},
): AutomaticAbility {
  return { kind: "automatic", timing, trigger, ...extra, ...spec };
}

function moves(e: GameEvent): readonly CardMove[] {
  return e.type === "cardsMoved" ? e.moves : [];
}

/** CR 12.4.3 — "When this card is put onto the field from a zone other than the field." */
export function isFanfareEvent(e: GameEvent, me: TriggerSubject): boolean {
  return !me.lookBack && moves(e).some((m) => m.newCard === me.card && m.to.zone === "field" && m.from?.zone !== "field");
}

/** CR 12.5.3 — "When this card is put into the cemetery from the field." */
export function isLastWordsEvent(e: GameEvent, me: TriggerSubject): boolean {
  return me.lookBack && moves(e).some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone === "cemetery");
}

export const fanfare = (spec: TimingSpec) => automatic("fanfare", isFanfareEvent, spec);
export const lastWords = (spec: TimingSpec) => automatic("lastWords", isLastWordsEvent, spec);

/** CR 12.6 — "When this card evolves." */
export const onEvolve = (spec: TimingSpec) =>
  automatic("onEvolve", (e, me) => !me.lookBack && e.type === "evolved" && e.card === me.card, spec);

/** CR 12.17 — "When this card super-evolves." */
export const onSuperEvolve = (spec: TimingSpec) =>
  automatic("onSuperEvolve", (e, me) => !me.lookBack && e.type === "evolved" && e.superEvolved && e.card === me.card, spec);

/** CR 12.7 — "When this attacks." */
export const strike = (spec: TimingSpec) =>
  automatic("strike", (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card, spec);

/**
 * CR 12.7.2.1 — "Follower Strike": Strike that applies if the attack target is a follower.
 * (Checked when the attack is declared; the target cannot change afterwards.)
 */
export const followerStrike = (spec: TimingSpec) =>
  automatic(
    "strike",
    (e, me, game) =>
      !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card && game.card(e.target)?.zone === "field",
    spec,
  );

/** "At the start of your end phase" (CR 7.4.1). */
export const atStartOfYourEndPhase = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller, spec);

/** "At the start of your main phase" (CR 7.3.1). */
export const atStartOfYourMainPhase = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "main" && e.player === me.controller, spec);

/** "At the start of each opponent's main phase" (CR 7.3.1). */
export const atStartOfOpponentsMainPhase = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "main" && e.player !== me.controller, spec);

/** "At the start of each player's main phase" (CR 7.3.1). Trigger data: that player. */
export const atStartOfEachMainPhase = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => (!me.lookBack && e.type === "phaseStarted" && e.phase === "main" ? [{ player: e.player }] : false),
    spec,
  );

/**
 * "Whenever [another] [follower / amulet / card] [matching] is put onto your field" — once per
 * card (CR 10.7.2.1). Evolving is not being put onto the field (BP01-021 ruling). A card that
 * moves from one player's field to the other's is not "put onto" it (10.7.4.3). Data: the card.
 */
export function whenCardEntersYourField(
  spec: TimingSpec,
  opts: { type?: CardType; another?: boolean; filter?: (game: GameReader, card: CardId) => boolean } = {},
): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] =>
      me.lookBack
        ? []
        : moves(e)
            .filter(
              (m) =>
                m.to.zone === "field" &&
                m.from?.zone !== "field" &&
                m.to.player === me.controller &&
                m.newCard !== null &&
                game.card(m.newCard)?.zone === "field" &&
                (opts.type === undefined || game.info(m.newCard).type === opts.type) &&
                !(opts.another && m.newCard === me.card) &&
                (opts.filter?.(game, m.newCard) ?? true),
            )
            .map((m) => ({ card: m.newCard! })),
    spec,
  );
}

/** "Whenever [another] follower [matching] is put onto your field" (see whenCardEntersYourField). */
export function whenFollowerEntersYourField(
  spec: TimingSpec,
  opts: { another?: boolean; filter?: (game: GameReader, card: CardId) => boolean } = {},
): AutomaticAbility {
  return whenCardEntersYourField(spec, { ...opts, type: "follower" });
}

/**
 * "Whenever one of your followers evolves" / "Whenever a follower on your field evolves"
 * (CR 5.16.1.3; super-evolving is evolving, 12.2.4). Data: the evolved follower.
 */
export function whenYourFollowerEvolves(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack && e.type === "evolved" && game.card(e.card)?.controller === me.controller ? [{ card: e.card }] : false,
    spec,
  );
}

/** "When your leader gains defense" (CR 5.27: its defense is increased). */
export const whenYourLeaderGainsDefense = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "leaderDefenseChanged" && e.player === me.controller && e.delta > 0, spec);

/**
 * "[During your turn,] whenever this follower deals combat damage" (CR 5.14.3.2: damage it deals
 * to, or receives from, the follower it fights; not attack damage to a leader).
 */
export const whenThisDealsCombatDamage = (spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "damageDealt" &&
      e.source === me.card &&
      e.combat &&
      (!opts.onlyYourTurn || game.activePlayer === me.controller),
    spec,
  );

/** "When this card leaves the field" (look-back, CR 10.7.4.1.2). */
export const whenThisLeavesField = (spec: TimingSpec) =>
  automatic("other", (e, me) => me.lookBack && moves(e).some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone !== "field"), spec);

/**
 * "Whenever this follower takes [ability] damage" (CR 5.14). Damage of 0 or less is not dealt, so
 * it does not trigger (BP04-077 ruling); damage that destroys it does (BP04-087, BP05-053
 * rulings). Ability damage is any damage but attack and combat damage (BP05-052 ruling, CR 5.14.3).
 */
export const whenThisTakesDamage = (spec: TimingSpec, opts: { onlyYourTurn?: boolean; ability?: boolean } = {}) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "damageDealt" &&
      e.target === me.card &&
      e.amount > 0 &&
      (!opts.ability || e.kind === "ability") &&
      (!opts.onlyYourTurn || game.activePlayer === me.controller),
    spec,
  );

/**
 * "Whenever you draw a card [outside of your start phase]" — once per card drawn (BP05-094
 * ruling). Adding a card to the hand otherwise is not drawing (its ruling). Data: the card.
 */
export function whenYouDraw(spec: TimingSpec, opts: { exceptYourStartPhase?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (me.lookBack) return [];
      if (opts.exceptYourStartPhase && game.state.phase === "start" && game.activePlayer === me.controller) return [];
      return moves(e)
        .filter((m) => m.reason === "draw" && m.to.zone === "hand" && m.to.player === me.controller && m.newCard !== null)
        .map((m) => ({ card: m.newCard! }));
    },
    spec,
  );
}

/** "Whenever an opponent discards a card" — once per card (BP05-082 ruling). Data: the card and that player. */
export function whenOpponentDiscards(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me): readonly TriggerData[] =>
      me.lookBack
        ? []
        : moves(e)
            .filter((m) => m.reason === "discard" && m.from?.zone === "hand" && m.from.player !== me.controller)
            .map((m) => ({ card: m.newCard ?? m.card!, player: m.from!.player })),
    spec,
  );
}

/**
 * "[During your turn,] whenever a card is put from an opponent's deck into the cemetery" — once
 * per card (BP05-029 ruling). Data: the card.
 */
export function whenOpponentDeckCardToCemetery(spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (me.lookBack || (opts.onlyYourTurn && game.activePlayer !== me.controller)) return [];
      return moves(e)
        .filter((m) => m.from?.zone === "deck" && m.from.player !== me.controller && m.to.zone === "cemetery")
        .map((m) => ({ card: m.newCard ?? m.card! }));
    },
    spec,
  );
}

/**
 * "[During your turn,] whenever a follower is put from your field into the cemetery" — once per
 * follower, tokens too, and a follower put there as a cost (BP05-076 rulings). Not this card
 * itself (it is no longer on the field to be given anything). Data: the card.
 */
export function whenYourFollowerToCemetery(spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (me.lookBack || (opts.onlyYourTurn && game.activePlayer !== me.controller)) return [];
      return moves(e)
        .filter(
          (m) =>
            m.from?.zone === "field" &&
            m.to.zone === "cemetery" &&
            m.before !== null &&
            m.before.controller === me.controller &&
            game.db.get(m.before.abilityDef).type === "follower",
        )
        .map((m) => ({ card: m.newCard ?? m.card! }));
    },
    spec,
  );
}

/**
 * "When your leader's defense becomes 0 or less" (BP05-092): it goes from more than 0 to 0 or
 * less, by damage or by "-X defense".
 */
export const whenYourLeaderDefenseDropsToZero = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) =>
      !me.lookBack &&
      e.type === "leaderDefenseChanged" &&
      e.player === me.controller &&
      e.defense <= 0 &&
      e.defense - e.delta > 0,
    spec,
  );

/** "When this card is returned to hand from your field". */
export const whenReturnedToHand = (spec: TimingSpec) =>
  automatic("other", (e, me) => me.lookBack && moves(e).some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone === "hand"), spec);

/** "When this card is discarded" — valid in the hand (CR 10.3.4). */
export const whenDiscarded = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => me.lookBack && moves(e).some((m) => m.card === me.card && m.reason === "discard" && m.from?.zone === "hand"),
    spec,
    { validIn: ["hand"] },
  );

/**
 * "Once on each of your turns, when this follower is selected for an ability" (BP03-071).
 * Only a "select" of a card in a public zone counts — not damage that was not targeted,
 * and not a cost. The ability resolves after the effect that selected it.
 */
export const whenThisIsSelected = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack && e.type === "cardsSelected" && game.activePlayer === me.controller && e.cards.includes(me.card),
    spec,
  );

/** "Whenever one of your [matching] followers attacks" ("another": not this card). Data: the attacker. */
export function whenYourFollowerAttacks(
  spec: TimingSpec,
  filter: (game: GameReader, card: CardId) => boolean,
  opts: { another?: boolean } = {},
): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "attackDeclared" &&
      e.player === me.controller &&
      !(opts.another && e.attacker === me.card) &&
      filter(game, e.attacker)
        ? [{ card: e.attacker }]
        : false,
    spec,
  );
}

/** "Whenever you play a [matching] card" (CR 10.6.2.7). Data: the played card. */
export function whenYouPlay(spec: TimingSpec, filter: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => (!me.lookBack && e.type === "cardPlayed" && e.player === me.controller && filter(game, e.card) ? [{ card: e.card }] : false),
    spec,
  );
}

/**
 * "Whenever an enemy follower is destroyed" — once per destroyed follower; also when this
 * card is destroyed at the same time (look-back, CR 10.7.4.2; BP01-106 ruling).
 * Data: the destroyed card (now in the cemetery) and its former controller.
 */
export function whenEnemyFollowerDestroyed(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => {
      if (me.zone !== "field") return false;
      return moves(e)
        .filter(
          (m) =>
            m.reason === "destroy" &&
            m.from?.zone === "field" &&
            m.from.player !== me.controller &&
            m.before !== null &&
            game.db.get(m.before.abilityDef).type === "follower",
        )
        .map((m) => ({ card: m.newCard ?? m.card!, player: m.from!.player }));
    },
    spec,
  );
}

/** "When another amulet you control leaves the field". */
export function whenAnotherAmuletLeaves(spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}): AutomaticAbility {
  // Also when this card leaves at the same time (CR 10.7.4.2); `me.controller` is then the
  // controller it had on the field.
  return automatic(
    "other",
    (e, me, game) =>
      (!opts.onlyYourTurn || game.activePlayer === me.controller) &&
      moves(e).some(
        (m) =>
          m.card !== me.card &&
          m.from?.zone === "field" &&
          m.to.zone !== "field" &&
          m.before?.controller === me.controller &&
          game.db.get(m.before.abilityDef).type === "amulet",
      ),
    spec,
  );
}

/** A delayed trigger "at the start of your next end phase" (register it with fx.delay). */
export const delayedAtStartOfYourEndPhase = (spec: TimingSpec) =>
  automatic("other", (e, me) => e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller, spec, { delayed: true });

/**
 * "Look at the top N cards of your deck. You may [reveal a matching card from among them and add
 * it to your hand / put a matching card from among them onto your field]. Put the remaining
 * cards on the bottom of your deck in any order." (CR 5.11, 5.21, 5.5). Returns the moved card.
 */
export function* lookAtTopCards(
  fx: EffectContext,
  count: number,
  opts: { filter: (game: GameReader, card: CardId) => boolean; to: "hand" | "field" },
): Proc<CardId[]> {
  const top = fx.topCards(count);
  const chosen = yield* fx.selectCards(top.filter((id) => opts.filter(fx.game, id)), 0, 1, fx.controller, top);
  let moved: CardId[];
  if (opts.to === "hand") {
    yield* fx.reveal(chosen);
    moved = yield* fx.returnToHand(chosen);
  } else {
    moved = yield* fx.putOntoField(chosen);
  }
  yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
  return moved;
}

/** An activated ability. */
export function activated(cost: CostSpec, spec: Omit<ActivatedAbility, "kind" | "cost"> = {}): ActivatedAbility {
  return { kind: "activated", cost, ...spec };
}

/** A spell's text (CR 10.1.1.4). */
export function spell(spec: Omit<import("./types").SpellAbility, "kind">): import("./types").SpellAbility {
  return { kind: "spell", ...spec };
}

export type { PlayerId };
