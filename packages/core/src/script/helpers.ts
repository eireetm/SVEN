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

/** CR 12.2 — "Evolve [cost]: Evolve this follower." (a number = play points) */
export function evolveAbility(cost: number | CostSpec): ActivatedAbility {
  return { kind: "activated", evolve: true, cost: typeof cost === "number" ? { playPoints: cost } : cost };
}

/** Everything an automatic ability may specify besides its trigger. */
export interface TimingSpec {
  targets?: readonly TargetSpec[];
  cost?: CustomCost;
  earthRite?: EarthRiteSpec;
  modes?: readonly Mode[];
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

/** "At the start of each player's main phase" (CR 7.3.1). Trigger data: that player. */
export const atStartOfEachMainPhase = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => (!me.lookBack && e.type === "phaseStarted" && e.phase === "main" ? [{ player: e.player }] : false),
    spec,
  );

/**
 * "Whenever [another] follower [matching] is put onto your field" — once per follower
 * (CR 10.7.2.1). Evolving is not being put onto the field (BP01-021 ruling). Data: the card.
 */
export function whenFollowerEntersYourField(
  spec: TimingSpec,
  opts: { another?: boolean; filter?: (game: GameReader, card: CardId) => boolean } = {},
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
                game.info(m.newCard).type === "follower" &&
                !(opts.another && m.newCard === me.card) &&
                (opts.filter?.(game, m.newCard) ?? true),
            )
            .map((m) => ({ card: m.newCard! })),
    spec,
  );
}

/** "When this card leaves the field" (look-back, CR 10.7.4.1.2). */
export const whenThisLeavesField = (spec: TimingSpec) =>
  automatic("other", (e, me) => me.lookBack && moves(e).some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone !== "field"), spec);

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

/** "Whenever one of your [matching] followers attacks". Data: the attacker. */
export function whenYourFollowerAttacks(spec: TimingSpec, filter: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack && e.type === "attackDeclared" && e.player === me.controller && filter(game, e.attacker)
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
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
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

/** An activated ability. */
export function activated(cost: CostSpec, spec: Omit<ActivatedAbility, "kind" | "cost"> = {}): ActivatedAbility {
  return { kind: "activated", cost, ...spec };
}

/** A spell's text (CR 10.1.1.4). */
export function spell(spec: Omit<import("./types").SpellAbility, "kind">): import("./types").SpellAbility {
  return { kind: "spell", ...spec };
}

export type { PlayerId };
