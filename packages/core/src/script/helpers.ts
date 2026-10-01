import type { CardType } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { TriggerData } from "../model/state";
import type { CardMove, DamageSource, GameEvent, MoveCause } from "../events/types";
import type { EffectContext } from "../engine/effects/context";
import type { Proc } from "../engine/runtime/proc";
import type { GameReader } from "../engine/query";
import { playPointsCost, rideCost, serveCost } from "./costs";
import { costAtMost, isCrest } from "./targets";
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
 * "This ability can be activated if ..." (BP05-018). `into`: "Evolve this follower into a X or
 * Y" — the evolved cards' names, e.g. the faces of a double-faced card (BP09-004, CR 4.6.4).
 */
export function evolveAbility(
  cost: number | CostSpec,
  opts: { nameIncludes?: string; into?: readonly string[]; condition?: ActivatedAbility["condition"] } = {},
): ActivatedAbility {
  const ability: ActivatedAbility = {
    kind: "activated",
    evolve: true,
    cost: typeof cost === "number" ? { playPoints: cost } : cost,
  };
  if (opts.nameIncludes !== undefined) ability.evolveNameIncludes = opts.nameIncludes;
  if (opts.into !== undefined) ability.evolveInto = opts.into;
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
  triggerIf?: AutomaticAbility["triggerIf"];
  oncePerTurn?: boolean;
  timesPerTurn?: number;
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

/** "At the start of each opponent's end phase" (CR 7.4.1), e.g. BP14-091 in the EX area. */
export const atStartOfOpponentsEndPhase = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "end" && e.player !== me.controller, spec);

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
 * "Whenever one of your [matching] followers evolves" / "Whenever a [matching] follower on your field evolves"
 * (CR 5.16.1.3; super-evolving is evolving, 12.2.4). Data: the evolved follower.
 */
export function whenYourFollowerEvolves(spec: TimingSpec, filter?: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack && e.type === "evolved" && game.card(e.card)?.controller === me.controller && (filter?.(game, e.card) ?? true)
        ? // `count`: which evolution on this field this turn it was (BP18-003 "If it's the 1st time ...").
          [{ card: e.card, count: game.evolutionsThisTurn(me.controller) }]
        : false,
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
 * Data: `count`, the damage taken (CP02-052 "if that damage is 5 or more").
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
      (!opts.onlyYourTurn || game.activePlayer === me.controller)
        ? [{ count: e.amount }]
        : false,
    spec,
  );

/**
 * "[During your turn,] whenever this deals damage to an enemy leader" (BP16-082): attack damage or
 * ability damage it deals; 0 or less is no damage, so an attack with 0 attack doesn't trigger it
 * (ruling, CR 1.3.2.2).
 */
export const whenThisDealsDamageToEnemyLeader = (spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "damageDealt" &&
      e.source === me.card &&
      e.amount > 0 &&
      e.target === game.leader(game.opponent(me.controller)) &&
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

/**
 * "When you discard a [matching] card" (CR 5.12) — once per card, e.g. BP09-006 "when you discard
 * a Forestcraft spell". The card is checked as it is now (in the cemetery). Data: the card.
 */
export function whenYouDiscard(spec: TimingSpec, filter: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] =>
      me.lookBack
        ? []
        : moves(e)
            .filter(
              (m) =>
                m.reason === "discard" &&
                m.from?.zone === "hand" &&
                m.from.player === me.controller &&
                m.newCard !== null &&
                game.card(m.newCard) !== undefined &&
                filter(game, m.newCard),
            )
            .map((m) => ({ card: m.newCard! })),
    spec,
  );
}

/**
 * "Whenever this card becomes engaged" (これがアクトしたとき, CR 5.4): by attacking (8.4.4), by Ward
 * (12.8.2 i, 7.4.3), or by an effect or cost (BP09-108 / 109 rulings). A card put onto the field
 * engaged does not become engaged.
 */
export const whenThisBecomesEngaged = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "placementChanged" && e.engaged && e.cards.includes(me.card), spec);

/**
 * "[During your turn,] whenever an enemy follower is put from the field into the cemetery" (BP09-026)
 * — once per follower, however it got there (destroyed, buried, as a cost), tokens too (its
 * rulings). Also when this card leaves at the same time (look-back, CR 10.7.4.2). Data: the card,
 * and its attack on the field as `count` (CR 10.7.4.1.2; BP22-025 "equal to its attack").
 */
export function whenEnemyFollowerToCemetery(spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => {
      if (me.zone !== "field" || (opts.onlyYourTurn && game.activePlayer !== me.controller)) return false;
      return moves(e)
        .filter(
          (m) =>
            m.from?.zone === "field" &&
            m.to.zone === "cemetery" &&
            m.before !== null &&
            m.before.controller !== me.controller &&
            game.db.get(m.before.abilityDef).type === "follower",
        )
        .map((m) => ({ card: m.newCard ?? m.card!, ...(m.before?.attack !== undefined ? { count: m.before.attack } : {}) }));
    },
    spec,
  );
}

/**
 * "Whenever a follower is put from the field into the cemetery" — anyone's (BP18-095): once per
 * follower, destroyed or buried or as a cost (rulings), during either player's turn. Also when this
 * card leaves at the same time (look-back, CR 10.7.4.2). Data: the card.
 */
export function whenFollowerToCemetery(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => {
      if (me.zone !== "field") return false;
      return moves(e)
        .filter((m) => m.from?.zone === "field" && m.to.zone === "cemetery" && m.before !== null && game.db.get(m.before.abilityDef).type === "follower")
        .map((m) => ({ card: m.newCard ?? m.card! }));
    },
    spec,
  );
}

/**
 * "Whenever you play or fuse a [trait] card" (BP20-019, 029, 033, T02 "a Loot card"): once per card played (CR
 * 10.6.2.7), and once per card with the trait fused by one of your Fuse abilities (the cards discarded or buried for
 * it are "fused", CR 12.18.4.1; a fused token no longer exists, so its printed traits are used). Data: the card.
 */
export function whenYouPlayOrFuse(spec: TimingSpec, trait: string): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => {
      if (me.lookBack) return false;
      if (e.type === "cardPlayed") return e.player === me.controller && game.info(e.card).traits.includes(trait) ? [{ card: e.card }] : false;
      if (e.type === "cardsFused" && e.player === me.controller) {
        return e.fused
          .filter((id, i) => (game.card(id) ? game.info(id).traits : game.db.get(e.fusedDefs[i]!).traits).includes(trait))
          .map((card) => ({ card }));
      }
      return false;
    },
    spec,
  );
}

/**
 * "When this card is fused by your [matching] card's ability" (CR 12.18.4.1, BP19-048): valid in the
 * cemetery, where a fused card is put. Data: the card that underwent fusion (in the EX area).
 */
export function whenThisIsFused(spec: TimingSpec, by: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) =>
      !me.lookBack && e.type === "cardsFused" && e.player === me.controller && e.fused.includes(me.card) && by(game, e.card)
        ? [{ card: e.card }]
        : false,
    spec,
    { validIn: ["cemetery"] },
  );
}

/**
 * "Whenever a [matching] card is put into your EX area" (BP10-094; BP11-008 "a Mount card") — once
 * per card, from any zone, created tokens too, during either player's turn (BP10-094 ruling).
 * Data: the card.
 */
export function whenCardPutIntoYourEx(spec: TimingSpec, filter?: (game: GameReader, card: CardId) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] =>
      me.lookBack
        ? []
        : moves(e)
            .filter(
              (m) =>
                m.to.zone === "ex" &&
                m.to.player === me.controller &&
                m.from?.zone !== "ex" &&
                m.newCard !== null &&
                (filter === undefined || (game.card(m.newCard) !== undefined && filter(game, m.newCard))),
            )
            .map((m) => ({ card: m.newCard! })),
    spec,
  );
}

/**
 * "When 1 or more of your cards leave the EX area" (BP22-017): once for the cards that leave your EX area together, however
 * they leave — played (CR 10.6.2.1), put onto the field, banished, transformed (BP22-017 rulings). `fx.data.count`: how many
 * left.
 */
export function whenYourCardsLeaveEx(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me) => {
      if (me.lookBack) return false;
      const n = moves(e).filter((m) => m.from?.zone === "ex" && m.from.player === me.controller && m.to.zone !== "ex").length;
      return n > 0 ? [{ count: n }] : false;
    },
    spec,
  );
}

/**
 * "[During your turn,] when a card is put into your banished zone" (BP22-037): once per card (two at once trigger twice), from
 * any zone, a token too (it is removed right after, CR 9.1.4), a card banished as a cost — and this card itself banished from
 * the field (look-back, CR 10.7.4.2; BP22-037 rulings). Data: the card.
 */
export function whenCardPutIntoYourBanishedZone(spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (opts.onlyYourTurn && game.activePlayer !== me.controller) return [];
      return moves(e)
        .filter((m) => m.to.zone === "banished" && m.to.player === me.controller && m.from?.zone !== "banished")
        .map((m) => ({ card: m.newCard ?? m.card! }));
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
 * "[During your turn,] whenever a [matching] follower you control leaves the field [into the
 * cemetery]" — once per follower (BP06-074 ruling), tokens too, and a follower put there as a
 * cost (BP05-076 rulings). Moving to the other field is not leaving it (CR 10.7.4.3).
 * `includeSelf`: this card leaving counts too (look-back, CR 10.7.4.2; BP06-090 ruling); the
 * information is what the card had on the field (`m.before`, 10.7.4.1.2). `another`: other followers only, also when they
 * leave together with this card (look-back; ECP01-039 rulings). Data: the card.
 */
export function whenYourFollowerLeaves(
  spec: TimingSpec,
  opts: {
    to?: "cemetery";
    onlyYourTurn?: boolean;
    includeSelf?: boolean;
    another?: boolean;
    filter?: (m: CardMove, game: GameReader) => boolean;
  } = {},
): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (me.zone !== "field" || (me.lookBack && !opts.includeSelf && !opts.another)) return [];
      if (opts.onlyYourTurn && game.activePlayer !== me.controller) return [];
      return moves(e)
        .filter(
          (m) =>
            m.from?.zone === "field" &&
            m.to.zone !== "field" &&
            (opts.to === undefined || m.to.zone === opts.to) &&
            m.before !== null &&
            m.before.controller === me.controller &&
            game.db.get(m.before.abilityDef).type === "follower" &&
            !(opts.another && m.card === me.card) &&
            (opts.filter?.(m, game) ?? true),
        )
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
  return whenYourFollowerLeaves(spec, { ...opts, to: "cemetery" });
}

/** "When your leader loses defense" (damage or "-X defense", CR 5.27.1), e.g. BP06-089. */
export const whenYourLeaderLosesDefense = (spec: TimingSpec, opts: { onlyYourTurn?: boolean } = {}) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "leaderDefenseChanged" &&
      e.player === me.controller &&
      e.delta < 0 &&
      (!opts.onlyYourTurn || game.activePlayer === me.controller),
    spec,
  );

/** "Whenever an enemy follower on the field attacks" (CR 8.4.5). Data: the attacker and its player. */
export function whenEnemyFollowerAttacks(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me) => (!me.lookBack && e.type === "attackDeclared" && e.player !== me.controller ? [{ card: e.attacker, player: e.player }] : false),
    spec,
  );
}

/**
 * "If this card was put onto the field by an ability" (BP06-005 / 008), asked by its Fanfare:
 * it entered the field other than as the resolution of playing it (CR 10.6.2.8.1). A card
 * played by another card's effect was played, not put there by an ability (BP06-008 ruling).
 */
export function enteredByAbility(fx: EffectContext): boolean {
  const e = fx.event;
  if (e?.type !== "cardsMoved") return false;
  const m = e.moves.find((x) => x.newCard === fx.self && x.to.zone === "field");
  return m !== undefined && m.reason !== "resolve";
}

/**
 * "If this card was put onto the field by a [matching] card's ability" (ECP01-006): the card whose ability put it there, as it
 * was then (CardInstance.enteredBy), matches — a spell's too (ECP01-006 ruling: Teio-Oo-Oo!!!). Also readable when the
 * ability is played, e.g. for its number of options.
 */
export function enteredByCardThat(g: GameReader, self: CardId, match: (by: MoveCause) => boolean): boolean {
  const by = g.card(self)?.enteredBy;
  return by !== undefined && match(by);
}

/**
 * "When an enemy follower that took damage this turn from a [matching] card you control is put from the field into the
 * cemetery" (ECP01-020): once per such follower, however it gets there (destroyed afterwards by another card's ability —
 * ruling). `from` sees the card that dealt the damage as it was then (DamageSource). Data: the card.
 */
export function whenDamagedEnemyFollowerToCemetery(spec: TimingSpec, from: (by: DamageSource) => boolean): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game) => {
      if (me.zone !== "field") return false;
      return moves(e)
        .filter(
          (m) =>
            m.from?.zone === "field" &&
            m.to.zone === "cemetery" &&
            m.card !== null &&
            m.before !== null &&
            m.before.controller !== me.controller &&
            game.db.get(m.before.abilityDef).type === "follower" &&
            game.damageSourcesThisTurn(m.card).some((by) => by.controller === me.controller && from(by)),
        )
        .map((m) => ({ card: m.newCard ?? m.card! }));
    },
    spec,
  );
}

/**
 * "Whenever a [matching] card you control deals damage to 1 or more enemy followers on the field" (ECP02-057): once for the
 * damage dealt at the same time (ruling Q4), per such card; combat damage too (Q3). `match` sees the card as it was when it dealt
 * the damage (DamageSource), e.g. whether it did so from the field (`onField`). A follower with 0 or less attack deals none (Q2).
 */
export const whenYourCardDamagesEnemyFollowers = (spec: TimingSpec, match: (by: DamageSource) => boolean) =>
  automatic(
    "other",
    (e, me, game) => {
      if (me.lookBack || e.type !== "damageDealt" || e.batch === undefined) return false;
      const sources = new Set<CardId>();
      for (const d of e.batch) {
        const t = game.card(d.target);
        if (d.by === undefined || d.by.controller !== me.controller || !match(d.by)) continue;
        if (t?.zone === "field" && t.controller !== me.controller) sources.add(d.by.card);
      }
      return [...sources].map((card) => ({ card }));
    },
    spec,
  );

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

/**
 * "Whenever this follower gains attack or defense" (BP11-082): an effect giving it +X, or the
 * +1/+1 of a super-evolution (CR 12.2.4.1; BP11-114 ruling).
 */
export const whenThisGainsStats = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "statsGained" && e.card === me.card, spec);

/**
 * "Whenever this gains {[defense]}" / "{[attack]}" (BP21-100, 101, 103, T08): an effect's +X, or a super-evolution's +1/+1
 * (CR 12.2.4.1; BP21-101 ruling) — not the stats of the evolved card itself (BP21-100 ruling). On either player's turn.
 */
export const whenThisGainsDefense = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "statsGained" && e.card === me.card && e.defense > 0, spec);
export const whenThisGainsAttack = (spec: TimingSpec) =>
  automatic("other", (e, me) => !me.lookBack && e.type === "statsGained" && e.card === me.card && e.attack > 0, spec);

/**
 * "When your leader takes [ability] damage" (BP21-109): more than 0 damage (CR 5.14); ability damage is any but attack and
 * combat damage (CR 5.14.3, ruling). On either player's turn.
 */
export const whenYourLeaderTakesDamage = (spec: TimingSpec, opts: { ability?: boolean } = {}) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "damageDealt" &&
      e.amount > 0 &&
      e.target === game.leader(me.controller) &&
      (!opts.ability || e.kind === "ability"),
    spec,
  );

/**
 * "Whenever you discard 1 or more cards" (BP12-052): once for cards discarded together, e.g. at
 * the hand limit (rulings); once more for a later discard.
 */
export function whenYouDiscardAny(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me) => !me.lookBack && moves(e).some((m) => m.reason === "discard" && m.from?.zone === "hand" && m.from.player === me.controller),
    spec,
  );
}

/** "Whenever a player discards a card" (BP11-070) — once per card, either player. Data: the card and its player. */
export function whenAnyPlayerDiscards(spec: TimingSpec): AutomaticAbility {
  return automatic(
    "other",
    (e, me): readonly TriggerData[] =>
      me.lookBack
        ? []
        : moves(e)
            .filter((m) => m.reason === "discard" && m.from?.zone === "hand" && m.newCard !== null)
            .map((m) => ({ card: m.newCard!, player: m.from!.player })),
    spec,
  );
}

/**
 * "Whenever a [matching] card you control leaves the field" — once per card (BP11-002 "a Mount
 * card", BP12-088 "an amulet"). `filter` sees the look-back information (`m.before`, with the
 * card's type and traits there). It also triggers when this card leaves at the same time (CR
 * 10.7.4.2); `includeSelf` also counts this card's own leaving. Data: the card after the move.
 */
export function whenYourCardLeaves(
  spec: TimingSpec,
  opts: { onlyYourTurn?: boolean; includeSelf?: boolean; filter?: (m: CardMove, game: GameReader) => boolean } = {},
): AutomaticAbility {
  return automatic(
    "other",
    (e, me, game): readonly TriggerData[] => {
      if (me.zone !== "field" || (opts.onlyYourTurn && game.activePlayer !== me.controller)) return [];
      return moves(e)
        .filter(
          (m) =>
            m.from?.zone === "field" &&
            m.to.zone !== "field" &&
            m.before !== null &&
            m.before.controller === me.controller &&
            (opts.includeSelf || m.card !== me.card) &&
            (opts.filter?.(m, game) ?? true),
        )
        .map((m) => ({ card: m.newCard ?? m.card! }));
    },
    spec,
  );
}

/** "When this card is discarded" — valid in the hand (CR 10.3.4). */
export const whenDiscarded = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => me.lookBack && moves(e).some((m) => m.card === me.card && m.reason === "discard" && m.from?.zone === "hand"),
    spec,
    { validIn: ["hand"] },
  );

/**
 * "Whenever you roll a 6-sided die" (BP21-075, 077, 083, 087): once per roll (BP21-078 ruling), and each triggered
 * ability refers to the result of the roll that triggered it (CR 5.20). Data: `count` is the result.
 */
export const whenYouRollADie = (spec: TimingSpec) =>
  automatic("other", (e, me) => (!me.lookBack && e.type === "dieRolled" && e.player === me.controller ? [{ count: e.result }] : false), spec);

/**
 * "When this is discarded by the ability of a [matching] card you control" (BP21-043): valid in the
 * hand (CR 10.3.4); the discard (CR 5.12) is done by an ability — its effect or its cost — of a card
 * its controller controls, matching as that card was then (CardMove.cause).
 */
export const whenDiscardedByYourCard = (spec: TimingSpec, by: (cause: MoveCause) => boolean) =>
  automatic(
    "other",
    (e, me) =>
      me.lookBack &&
      moves(e).some(
        (m) =>
          m.card === me.card &&
          m.reason === "discard" &&
          m.from?.zone === "hand" &&
          m.cause !== undefined &&
          m.cause.controller === me.controller &&
          by(m.cause),
      ),
    spec,
    { validIn: ["hand"] },
  );

/**
 * "When this is discarded or banished from your hand" (BP14-074, 081): valid in the hand, it
 * triggers as the card leaves it (look-back, CR 10.7.4). `fx.self` is then the card in the
 * cemetery or the banished zone. A discard to the hand limit counts too (BP14-074 ruling).
 */
export const whenDiscardedOrBanishedFromHand = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) =>
      me.lookBack &&
      moves(e).some((m) => m.card === me.card && m.from?.zone === "hand" && (m.reason === "discard" || m.to.zone === "banished")),
    spec,
    { validIn: ["hand"] },
  );

/**
 * A delayed trigger (CR 10.7.5) "When it's put from the field into the cemetery this turn, [effect]"
 * (BP15-001, 008, 012). The ability goes in `abilities`; the effect that selects the card registers it
 * with `fx.delay(index, "endOfTurn", { card })`. It triggers even if the card that created it has left
 * the field, and each registration triggers on its own (rulings).
 */
export function delayedWhenPutIntoCemetery(resolve: (fx: EffectContext) => Proc<void>): AutomaticAbility {
  return {
    kind: "automatic",
    timing: "other",
    delayed: true,
    trigger: (e, me) => {
      const watched = me.delayedData?.card;
      return watched !== undefined && moves(e).some((m) => m.card === watched && m.from?.zone === "field" && m.to.zone === "cemetery");
    },
    resolve,
  };
}

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
 * it to your hand / put a matching card from among them onto your field / into your EX area].
 * Put the remaining cards on the bottom of your deck in any order." (CR 5.11, 5.21, 5.5).
 * `max`: "up to 2 ..." (default 1). `rest: "cemetery"`: "Bury the rest" (BP07-052). Returns the
 * moved cards.
 */
export function* lookAtTopCards(
  fx: EffectContext,
  count: number,
  opts: {
    filter: (game: GameReader, card: CardId) => boolean;
    to: "hand" | "field" | "ex";
    max?: number;
    rest?: "bottom" | "cemetery";
  },
): Proc<CardId[]> {
  const top = fx.topCards(count);
  const chosen = yield* fx.selectCards(top.filter((id) => opts.filter(fx.game, id)), 0, opts.max ?? 1, fx.controller, top);
  let moved: CardId[];
  if (opts.to === "hand") {
    yield* fx.reveal(chosen);
    moved = yield* fx.returnToHand(chosen);
  } else if (opts.to === "ex") {
    moved = yield* fx.putIntoEx(chosen);
  } else {
    moved = yield* fx.putOntoField(chosen);
  }
  const left = top.filter((id) => fx.game.card(id)?.zone === "deck");
  if (opts.rest === "cemetery") yield* fx.bury(left);
  else yield* fx.bottomInAnyOrder(left);
  return moved;
}

/**
 * "Change its attack / defense to N" (BP14-041, 076, BP15-001, 014). Damage reduces defense (CR
 * 5.14.1), so the card gains or loses the difference from its current values; after it evolves the
 * same amount is still gained or lost (CR 5.16.2.1, BP15-014 and BP14-076 rulings).
 */
export function* changeStatsTo(fx: EffectContext, card: CardId, to: { attack?: number; defense?: number }): Proc<void> {
  if (fx.game.card(card)?.zone !== "field") return;
  const now = fx.game.info(card);
  const attack = to.attack === undefined || now.attack === null ? 0 : to.attack - now.attack;
  const defense = to.defense === undefined || now.defense === null ? 0 : to.defense - now.defense;
  if (attack !== 0 || defense !== 0) yield* fx.giveStats(card, attack, defense);
}

/**
 * "You may play a [matching] card from your evolve deck" (BP13-036 Rending Blast, an advanced spell).
 * Only the facedown cards there are the evolve deck (CR 4.6.3), so a used card can't be played
 * again. It is played as usual (CR 10.6.2): its cost is paid (BP13-036 ruling), and when it leaves
 * the resolution zone it goes back to the evolve deck faceup (9.2.2).
 */
export function* playFromEvolveDeck(fx: EffectContext, filter: (game: GameReader, card: CardId) => boolean): Proc<void> {
  const playable = fx.game.faceDownEvolveDeck(fx.controller).filter((id) => filter(fx.game, id) && fx.game.canPlay(id, fx.controller));
  // Copies of the same card are one choice.
  const defOf = (id: CardId) => fx.game.card(id)?.def;
  const choices = playable.filter((id, i) => playable.findIndex((other) => defOf(other) === defOf(id)) === i);
  const [card] = yield* fx.chooseCards(choices, 0, 1);
  if (card !== undefined) yield* fx.playCard(card);
}

/**
 * Select cards among `candidates`, up to `max`, whose original costs (元のコスト, printed) total
 * at most `budget` (BP07-037, 071, BP09-037). Picked one at a time, each time only from those that still fit
 * (the BP06-024 pattern: only completable choices are offered).
 */
export function* selectWithinTotalCost(
  fx: EffectContext,
  candidates: readonly CardId[],
  budget: number,
  max: number,
  peek?: readonly CardId[],
): Proc<CardId[]> {
  const chosen: CardId[] = [];
  let left = budget;
  while (chosen.length < max) {
    const fits = candidates.filter((id) => !chosen.includes(id) && costAtMost(left)(fx.game, id));
    const [pick] = yield* fx.selectCards(fits, 0, 1, fx.controller, peek);
    if (pick === undefined) break;
    chosen.push(pick);
    left -= fx.game.info(pick).cost ?? 0;
  }
  return chosen;
}

/**
 * CR 14.2.2 — a serve ability, "{[feed]}×`times` {[costN]}: [effect]" (Umamusume): serve this follower `times` times
 * and pay `playPoints`. Serve abilities are equivalent to evolve abilities (14.2.2.5, 8.3.2.1: one per turn together
 * with evolving) and 1 evolution point may pay 1 play point (14.2.2.4) — the handling of `advanced` abilities. The
 * effect is "Race this follower `times` times" unless given.
 */
export function serveAbility(times: number, playPoints: number, spec: Omit<ActivatedAbility, "kind" | "cost" | "advanced"> = {}): ActivatedAbility {
  return activated(
    { playPoints, custom: serveCost(times) },
    {
      advanced: true,
      *resolve(fx) {
        yield* fx.race(fx.self, times);
      },
      ...spec,
    },
  );
}

/** CR 14.2.4 — "On Race: [text]": when this card races; racing N times triggers it N times (CP01-042 ruling). */
export const onRace = (spec: TimingSpec) =>
  automatic(
    "onRace",
    (e, me) => (!me.lookBack && e.type === "raced" && e.card === me.card ? Array.from({ length: e.times }, (_, i) => ({ count: i + 1 })) : false),
    spec,
  );

/**
 * "Whenever [another] one of your followers races" (CP01-032, 082): once per race (a follower racing 3 times
 * triggers it 3 times — CP01-032 ruling). Data: the card.
 */
export function whenYourFollowerRaces(spec: TimingSpec, opts: { another?: boolean } = {}): AutomaticAbility {
  return automatic(
    "other",
    (e, me) =>
      !me.lookBack && e.type === "raced" && e.player === me.controller && !(opts.another && e.card === me.card)
        ? Array.from({ length: e.times }, () => ({ card: e.card }))
        : false,
    spec,
  );
}

/** An activated ability. */
/**
 * CR 14.4.9 — "{[ride]} {[costN]}: Give this follower Drive." (a Cardfight!! Vanguard card). A Drive Point from the evolve
 * deck goes into the drive zone, linked (the cost, `rideCost`); 1 evolution point may pay 1 play point, and it is
 * equivalent to an evolve ability (14.4.9.5 → 8.3.2.1), so it is written as an advanced activated ability (`advanced`).
 */
export function rideAbility(playPoints: number, spec: Omit<ActivatedAbility, "kind" | "cost" | "advanced"> = {}): ActivatedAbility {
  return activated(
    { playPoints, custom: rideCost },
    {
      advanced: true,
      *resolve(fx) {
        yield* fx.giveDrive(fx.self);
      },
      ...spec,
    },
  );
}

/** CR 14.4.8 — "On Drive": when this card is given Drive. */
export const onDrive = (spec: TimingSpec) =>
  automatic("onDrive", (e, me) => !me.lookBack && e.type === "givenDrive" && e.card === me.card, spec);

/**
 * CR 14.4.5.1.4 — "When you drive check a Trigger": a Trigger of your drive check resolved (not one left unresolved);
 * Twin Drive may trigger it twice (CP03-072 / 107 rulings). Data: `card`, the Trigger card.
 */
export const whenYouDriveCheckTrigger = (spec: TimingSpec) =>
  automatic("other", (e, me) => (!me.lookBack && e.type === "driveTriggered" && e.player === me.controller ? [{ card: e.card }] : false), spec);

/**
 * "Whenever a follower on your field performs a drive check" (CR 14.4.5): once per drive check, so twice for Twin Drive; it
 * resolves after the drive check (CP03-039 / 065 rulings). Data: `card`, the follower.
 */
export const whenYourFollowerDriveChecks = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => (!me.lookBack && e.type === "driveChecked" && e.player === me.controller && e.follower !== null ? [{ card: e.follower }] : false),
    spec,
  );

export function activated(cost: CostSpec, spec: Omit<ActivatedAbility, "kind" | "cost"> = {}): ActivatedAbility {
  return { kind: "activated", cost, ...spec };
}

/**
 * CR 14.5.1 — "{[ub]} [ability]": a Union Burst ability (CP04), valid only in a deck based on Princess Connect! Re: Dive
 * (14.5.1.2). An "if" in its effect goes into `resolve`: played and resolved, it has executed (14.5.1.3).
 */
export function ub<A extends ActivatedAbility | AutomaticAbility>(ability: A): A {
  return { ...ability, unionBurst: true };
}

/**
 * "Whenever a {[ub]} ability of another follower on your field is executed" (CP04, CR 14.5.1.3): once per execution, also
 * during an opponent's turn and for one executed by another ability's effect (rulings; not this follower's own, CP04-114
 * Q13). Data: that follower.
 */
export const whenAnotherFollowersUnionBurst = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me, game) =>
      !me.lookBack &&
      e.type === "unionBurstExecuted" &&
      e.source !== me.card &&
      game.card(e.source)?.zone === "field" &&
      game.controller(e.source) === me.controller &&
      game.info(e.source).type === "follower"
        ? [{ card: e.source }]
        : false,
    spec,
  );

/**
 * "{[fanfare]} {[cost02]}: Equip this with a [name] token." (CP04): pay the play points to equip it (CR 10.4.7.4, 14.5.2.2).
 * Without `playPoints`, "{[fanfare]} Equip this with ..." (CP04-022, 055 under a condition: `condition` in `resolve`).
 */
export function equipFanfare(tokenName: string, playPoints: number, when?: (fx: EffectContext) => boolean): AutomaticAbility {
  return fanfare({
    ...(playPoints > 0 ? { cost: playPointsCost(playPoints) } : {}),
    *resolve(fx) {
      if (when && !when(fx)) return;
      yield* fx.equip(fx.self, tokenName);
    },
  });
}

/** "When this is put into your EX area" (CP04-007), from any zone, during either player's turn (its rulings). */
export const whenThisPutIntoYourEx = (spec: TimingSpec) =>
  automatic(
    "other",
    (e, me) => !me.lookBack && moves(e).some((m) => m.newCard === me.card && m.to.zone === "ex" && m.from?.zone !== "ex"),
    spec,
    { validIn: ["ex"] },
  );

/** A spell's text (CR 10.1.1.4). */
export function spell(spec: Omit<import("./types").SpellAbility, "kind">): import("./types").SpellAbility {
  return { kind: "spell", ...spec };
}

export type { PlayerId };

/** "the number of crests in your EX area" (BP20; CR 9.1.1.1 — they are cards there). */
export function crestsInEx(game: GameReader, player: PlayerId): number {
  return game.cards(player, "ex").filter((id) => isCrest(game, id)).length;
}
