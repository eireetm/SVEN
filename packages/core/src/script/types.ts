import type { DefId } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { Keyword } from "../model/keyword";
import type { GrantedAbilityId, TriggerData, ZoneName } from "../model/state";
import type { GameEvent } from "../events/types";
import type { Proc } from "../engine/runtime/proc";
import type { GameReader } from "../engine/query";
import type { EffectContext } from "../engine/effects/context";

/**
 * Card behaviour. One script per card definition (alternate printings share it), in
 * `script/<SET>/<CARD-NO>.ts`. Scripts are static code; everything they know about a game
 * comes from the GameReader / EffectContext they are handed, and they must be deterministic.
 *
 * The ability model follows CR 10.1 (activated / automatic / passive / spell abilities) and
 * the play procedure CR 10.6.2 (choices -> targets -> costs -> resolve).
 */
export interface CardScript {
  /** Keyword abilities printed on the card (CR 12, 13). */
  keywords?: readonly Keyword[];
  /**
   * Keywords the card has under a condition, in every zone (e.g. BP12-058 "While Overflow is
   * active for you, this card has Quick", which matters in the hand). Like `keywordsFor`, it
   * must not call `game.info()` (that would recurse).
   */
  selfKeywords?(game: GameReader, self: CardId): readonly Keyword[];
  abilities?: readonly AbilityDef[];
  /**
   * Passive change of this card's own play cost (e.g. "Spellchain (5): This card costs 3 less
   * to play"). Valid in the zone it is played from (CR 10.3.4). Negative = cheaper.
   */
  playCost?(game: GameReader, self: CardId, controller: PlayerId): number;
  /** CR 10.4.7.3 "When playing this card, [process]: [effect]" — optional ways to play it. */
  playOptions?: readonly PlayOption[];
  /**
   * The card can only be played with one of its `playOptions`: "As an additional cost to play
   * this card, [process]" (e.g. BP11-007 "bury 4 Pixie tokens"; it can't be played without).
   */
  playOptionsRequired?: boolean;
  /** Passive abilities that work while this card is on the field (CR 10.1.1.3, 10.3.5). */
  field?: FieldPassives;
  /**
   * Passive abilities that also work while this card is in its controller's EX area (CR 10.3.5
   * "unless indicated otherwise"; BP13-003 "While this card is on your field or in your EX area,
   * ..."). Only keyword-giving passives are read from the EX area so far.
   */
  exPassives?: Pick<FieldPassives, "keywordsFor">;
  /**
   * CR 8.4.3.2.1 "This follower can't attack enemies." A function is the conditional form
   * (BP03-110 "if this follower has no Fable counters").
   */
  cannotAttack?: boolean | ((game: GameReader, self: CardId) => boolean);
  /**
   * Extra names this card has while it is on the field (BP03-058/078 "This follower's name is
   * also X"). Only the name is shared — not the other card's abilities (official ruling).
   */
  alsoNames?: readonly string[];
  /**
   * "Whenever an opponent is selecting cards for an ability, if they can select this card, they
   * must select it" (BP03-091, CR 1.3.2.3). Only while this card is on the field, and only for
   * a "select", not an attack, a discard, or a cost.
   */
  mustBeSelected?: boolean;
  /**
   * "This follower can't attack enemy leaders" while the condition holds (e.g. BP02-107
   * "If there are at least 2 enemy followers on the field, ..."); CR 8.4.3.
   */
  cannotAttackLeader?(game: GameReader, self: CardId): boolean;
  /**
   * "This card can't be destroyed by abilities" (BP02-089/090/091): prohibits destroying it by
   * an ability's effect (CR 1.3.3). Rules handling still destroys it (defense 0, 11.3).
   */
  cannotBeDestroyedByAbilities?: boolean;
  /** "This card can't be banished by abilities" while it is on the field (BP06-022, CR 1.3.3). */
  cannotBeBanishedByAbilities?: boolean;
  /**
   * A condition the card itself puts on playing it, e.g. BP06-059 "This card can only be played
   * from hand", BP06-105 "This card can't be played during your turn". Checked like every other
   * requirement for playing it (CR 8.1.2), also when an effect plays it.
   */
  playableIf?(game: GameReader, self: CardId, player: PlayerId): boolean;
  /**
   * Change to the play points of this card's evolve abilities, e.g. BP06-019 "This card's Evolve
   * costs 1 less for every other follower on your field" (negative = cheaper; never below 0 —
   * its ruling).
   */
  evolveCostChange?(game: GameReader, self: CardId): number;
  /** "This card is put onto the field engaged." */
  entersEngaged?: boolean;
  /** "This card doesn't refresh during your start phase" (CR 7.2.3, e.g. BP11-092). */
  noStartPhaseRefresh?: boolean;
  /**
   * "This follower ignores Ward" (BP04-006, これは【守護】を無視して攻撃できる): when it attacks,
   * the Ward requirement (CR 12.8.2 iii) does not apply to its attack target. A function is the
   * conditional form (BP09-003 "While this follower's attack is at least 10, it ignores Ward").
   */
  ignoresWard?: boolean | ((game: GameReader, self: CardId) => boolean);
  /**
   * CR 6.1.2 — a deck-construction passive replacing the copy limit of CR 6.1.1.4 for this card
   * (BP09-049 "You can put up to 50 of this card into your deck").
   */
  deckLimit?: number;
  /**
   * Which cards a "the next [matching] card you play this turn costs N less" effect created by
   * this card applies to, by key (`fx.nextPlayCostsLess(key, n)`, BP03-038).
   */
  nextPlay?: Readonly<Record<string, (game: GameReader, card: CardId, player: PlayerId) => boolean>>;
}

export type ScriptRegistry = Readonly<Record<DefId, CardScript>>;

/** Information about one instance of damage, for damage-changing passives (CR 5.14.2). */
export interface DamageInfo {
  source: CardId | null;
  /** Controller of the ability or of the fighting card dealing it (CR 3.1.2.4). */
  controller: PlayerId | null;
  target: CardId;
  amount: number;
  kind: "attack" | "combat" | "ability";
  /** CR 5.14.3.2 — combat damage (between an attacking follower and the follower it attacks). */
  combat: boolean;
}

/** Passive abilities of a card on the field. */
export interface FieldPassives {
  /**
   * Change to the play cost of `card` played by `player`, e.g. "your Golem followers cost 1 less"
   * or "any spell an opponent plays costs 1 more" (BP05-070). Asked of the cards on both fields,
   * so check `player`.
   */
  playCostOf?(game: GameReader, self: CardId, card: CardId, player: PlayerId): number;
  /**
   * Keywords this card gives to `card`, e.g. "your Dragon tokens have Rush". Must only use
   * `game.card()` / `game.db` (not `game.info()`), because it is part of computing info.
   */
  keywordsFor?(game: GameReader, self: CardId, card: CardId): readonly Keyword[];
  /** "Your followers deal damage equal to their defense" — attack damage only (BP01-129 ruling). */
  combatDamageFromDefense?: boolean;
  /** Replacement effect on damage this card deals; returns the change (CR 5.14.2, 10.2.1.3.2). */
  damageDealt?(game: GameReader, self: CardId, damage: DamageInfo): number;
  /**
   * Replacement effect on damage any card deals (e.g. BP06-074 "if a Yokai follower on your field
   * would deal damage, it deals that much plus 1 instead"; CR 10.12.2.3: damage whose source is
   * that card); returns the change.
   */
  damageBy?(game: GameReader, self: CardId, damage: DamageInfo): number;
  /** Replacement effect on damage this card takes; returns the change. */
  damageTaken?(game: GameReader, self: CardId, damage: DamageInfo): number;
  /**
   * Replacement effect on damage any follower takes (e.g. BP02-004 "your followers take 1 less
   * damage from enemy abilities"); returns the change (-amount prevents it).
   */
  damageToFollower?(game: GameReader, self: CardId, damage: DamageInfo): number;
  /**
   * Replacement effect on damage any leader takes (e.g. BP05-108 "your leader doesn't take
   * ability damage"); returns the change (-amount prevents it).
   */
  damageToLeader?(game: GameReader, self: CardId, damage: DamageInfo): number;
  /**
   * "You can't lose the game, and opponents can't win" (BP05-092): its controller does not lose
   * while it is on the field — not by rules handling (CR 11.2) nor by an effect that makes an
   * opponent win (5.23.1); a prohibition takes precedence (1.3.3). Conceding still works (1.2.3.1).
   */
  cantLose?: boolean;
  /**
   * BP06-113 "While this card is on the field, if a follower on the field can attack a follower,
   * it can't attack leaders" — every follower on either side.
   */
  followersBeforeLeaders?: boolean;
  /**
   * "While this card is on the field, [matching] followers on the field can't attack enemies"
   * (BP09-040; both sides, CR 8.4.3.2.1): does it forbid `follower` to attack?
   */
  preventsAttack?(game: GameReader, self: CardId, follower: CardId): boolean;
  /**
   * CR 1.3.3 — forbids `player` to draw now (BP10-076 "Opponents can't draw cards outside of
   * their start phase"; `startPhase`: it is that player's start phase). The draw doesn't happen.
   * Asked of the cards on both fields.
   */
  forbidsDraw?(game: GameReader, self: CardId, player: PlayerId, startPhase: boolean): boolean;
  /**
   * BP02-035/036 "include both spells and Runecraft followers when counting your Spellchain"
   * (CR 13.3.1.1 counts spells in the cemetery).
   */
  spellchainCountsRunecraftFollowers?: boolean;
  /**
   * Abilities this card gives other cards while it is on the field, e.g. BP03-011 "your
   * followers have 'Follower Strike: Deal 2 damage to the enemy follower'". They are the
   * receiving card's abilities: it is their source (CR 10.9.1.2). One instance per giving card.
   */
  grantsFor?(game: GameReader, self: CardId, card: CardId): readonly GrantedAbilityId[];
}

/** A cost the engine cannot express with the standard parts (select and move cards, counters...). */
export interface CustomCost {
  canPay(game: GameReader, controller: PlayerId, self: CardId): boolean;
  pay(fx: EffectContext): Proc<void>;
}

/** CR 10.4 — the cost of an activated ability, paid in this order (10.4.2.1). */
export interface CostSpec {
  /** CR 10.4.4 play-point icon. */
  playPoints?: number;
  /** CR 10.4.6 engage icon without a specified card: engage this reserved card. */
  engageSelf?: boolean;
  custom?: CustomCost;
  /** "Give your leader -X defense" — CR 10.4.5: the leader needs at least X defense. */
  leaderDefense?: number;
  /** "put this card into its owner's cemetery" */
  burySelf?: boolean;
}

/**
 * CR 13.3.3 Earth Rite: remove a Stack counter as an additional cost.
 *  - "optional": the player may pay while playing; `fx.earthRitePaid` tells the effect.
 *  - "required": the whole effect depends on it. Activated abilities / modes with it are only
 *    offered when it can be paid (and then it is paid); an automatic ability with it asks
 *    whether to pay, and does nothing if not.
 */
export interface EarthRiteSpec {
  mode: "optional" | "required";
  count?: number;
}

/**
 * CR 10.6.2.3 — a target selection made while playing the card or ability.
 * "Select N": exactly N, and the card / ability cannot be played with fewer than N legal
 * targets. "Select up to N": 0..N. (Confirmed interpretation, docs/open-questions.md.)
 * Opponent's cards with Aura on the field are removed from the candidates (CR 12.15).
 */
export interface TargetSpec {
  /**
   * Legal targets for the given controller. `self` is the card with the ability.
   * Must return the candidates as they will be when the selection is made (e.g. a spell is
   * already in the resolution zone then), because playability is decided from it.
   */
  candidates(game: GameReader, controller: PlayerId, self: CardId): CardId[];
  /** Number of targets. */
  count: number;
  /** "up to [count]" (CR 10.6.2.3.2) — zero is allowed. */
  upTo?: boolean;
  /**
   * Lowers the maximum of an "up to" selection (only), evaluated when the selection is made. E.g.
   * BP03-007 "deal X damage divided between up to 2": each selected follower must get at least
   * 1 damage (rulings BP08-028 / EBD02-015), so at most X can be selected.
   */
  max?(game: GameReader, controller: PlayerId, self: CardId): number;
  /** The selection is only part of the effect when this holds (e.g. "Combo (3): Select ..."). */
  when?(game: GameReader, controller: PlayerId, self: CardId): boolean;
}

/** CR 5.18 — one option of a "choose" ability. */
export interface Mode {
  id: string;
  label: string;
  targets?: readonly TargetSpec[];
  /**
   * "(N) Earth Rite: [effect]" (CR 13.3.3.2): the option can be chosen without Earth Rite, even with
   * no Stack on the field; its controller may pay Earth Rite while playing, and the option does
   * nothing if it wasn't paid (BP10-050 ruling).
   */
  earthRite?: boolean;
  /**
   * "(1) [process]: [effect]" — the option's effect is applied only if its controller executes
   * the process when the option resolves (CR 10.4.7.2, 10.4.7.5; BP03-117 ruling): the option can
   * be chosen even if the process is not executed (or cannot be), and then does nothing.
   */
  cost?: CustomCost;
  /** Extra condition for the option to be performable (CR 5.18.3.1.2). */
  available?(game: GameReader, controller: PlayerId, self: CardId): boolean;
  resolve(fx: EffectContext): Proc<void>;
}

/** CR 10.4.7.3 — "When playing this card, [process]: [effect]". */
export interface PlayOption {
  id: string;
  label: string;
  canPay(game: GameReader, controller: PlayerId, self: CardId): boolean;
  pay(fx: EffectContext): Proc<void>;
  /** Cards paying moves off the controller's field (for the field-limit check, CR 10.6.2.6). */
  freesFieldSlots?: number;
  /** "This card costs N to play" — applied before other cost changes (CR 10.10.2.4). */
  setCost?: number;
  /** "This card costs N less to play" (negative). */
  costDelta?: number;
}

/** CR 10.1.1.1 */
export interface ActivatedAbility {
  kind: "activated";
  /**
   * Zones where the ability can be activated (CR 10.3.5: the field unless the text says
   * otherwise), e.g. BP06-059 "bury this card from your EX area", BP06-079 "discard this card".
   * Evolve abilities are only activated on the field.
   */
  validIn?: readonly ZoneName[];
  /** CR 12.2 — an evolve ability ("Evolve [cost]: Evolve this follower"). */
  evolve?: boolean;
  /**
   * "Evolve this follower into an evolved follower with [name] in its name" (BP03-056).
   * The corresponding evolve-deck cards are evolved cards whose name contains this string
   * (CR 5.16.1.1.1 "unless specified otherwise"), instead of the same name.
   */
  evolveNameIncludes?: string;
  /**
   * "Evolve this follower into a X or Y" (BP09-004): the corresponding cards are evolved cards
   * with one of these names — a face of a double-faced card, which is then revealed (CR 4.6.4).
   */
  evolveInto?: readonly string[];
  /** CR 12.3.3 — Quick activated ability. */
  quick?: boolean;
  cost: CostSpec;
  /** "This ability can be activated once per turn." */
  oncePerTurn?: boolean;
  /** "Activate only [N] times per turn" (BP08-084: twice). */
  timesPerTurn?: number;
  /** "This ability can be activated if ..." (e.g. BP02-054 "if Overflow is active for you"). */
  condition?(game: GameReader, controller: PlayerId, self: CardId): boolean;
  earthRite?: EarthRiteSpec;
  /**
   * CR 5.18 — "Choose one of the following" (BP09-006, 071, 078): chosen while playing the ability
   * (10.6.2.2), before its targets; it can be played only if an option can be performed.
   */
  modes?: readonly Mode[];
  /** See SpellAbility.modeCount. */
  modeCount?(game: GameReader, controller: PlayerId, self: CardId): number;
  targets?: readonly TargetSpec[];
  /** Not used for evolve abilities (the engine performs CR 5.16). */
  resolve?(fx: EffectContext): Proc<void>;
}

/**
 * Who / what an automatic ability belongs to when a trigger is checked.
 * `card` is the object's current id; for look-back checks (CR 10.7.4.1, e.g. Last Words
 * after the card left the field) it is the id the card had in the zone it left.
 */
export interface TriggerSubject {
  card: CardId;
  controller: PlayerId;
  zone: ZoneName;
  lookBack: boolean;
}

/** CR 10.1.1.2 */
export interface AutomaticAbility {
  kind: "automatic";
  /** The keyword this ability is written with, for UI / docs (CR 12.4–12.7, 12.17). */
  timing: "fanfare" | "lastWords" | "onEvolve" | "onSuperEvolve" | "strike" | "other";
  /** Zones where the ability is valid (CR 10.3.5 default: field). */
  validIn?: readonly ZoneName[];
  /**
   * Trigger condition (CR 10.1.1.2.1.1). `true` = triggers once; an array = triggers once per
   * element, each pending instance getting that data (CR 10.7.2.1).
   */
  trigger(event: GameEvent, me: TriggerSubject, game: GameReader): boolean | readonly TriggerData[];
  /**
   * "If ..." in its effect: checked when it is played, not when it triggers — the ability becomes
   * pending anyway and does nothing if the condition doesn't hold then (CR 10.7.3.2). The player
   * may resolve other pending abilities first to meet it (BP08-071, BP10-109 rulings).
   */
  condition?(game: GameReader, controller: PlayerId, self: CardId): boolean;
  /**
   * A restriction that is part of the trigger condition (CR 10.1.1.2.1.1), e.g. "During your turn,
   * whenever ...": checked when the event happens; the ability doesn't become pending otherwise.
   */
  triggerIf?(game: GameReader, controller: PlayerId, self: CardId): boolean;
  /** CR 10.7.2.2 — becomes pending at most once per turn. */
  oncePerTurn?: boolean;
  /** CR 10.7.2.2 "[N] times per turn" — becomes pending at most N times per turn (BP07-036). */
  timesPerTurn?: number;
  /** Only used through delayed triggers created by effects (CR 10.7.5). */
  delayed?: boolean;
  /** CR 10.4.7.4 "when [event], [cost]: [effect]" — the controller may pay to play it. */
  cost?: CustomCost;
  earthRite?: EarthRiteSpec;
  modes?: readonly Mode[];
  /** See SpellAbility.modeCount. */
  modeCount?(game: GameReader, controller: PlayerId, self: CardId): number;
  targets?: readonly TargetSpec[];
  resolve?(fx: EffectContext): Proc<void>;
}

/** CR 10.1.1.4 — the text of a spell card. */
export interface SpellAbility {
  kind: "spell";
  earthRite?: EarthRiteSpec;
  modes?: readonly Mode[];
  /**
   * "Choose up to N of the following" (CR 5.18.2.1: 1 to N options). Without it, exactly one
   * option is chosen. Evaluated when the card or ability is played (5.18.3.1, 5.18.3.1.1).
   */
  modeCount?(game: GameReader, controller: PlayerId, self: CardId): number;
  targets?: readonly TargetSpec[];
  resolve?(fx: EffectContext): Proc<void>;
}

export type AbilityDef = ActivatedAbility | AutomaticAbility | SpellAbility;
