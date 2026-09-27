import type { CardId, PlayerId } from "../../model/ids";
import type { Mode, PlayOption, SpellAbility, TargetSpec } from "../../script/types";
import { putOntoField } from "../actions/cards";
import { canPayPlayPoints, payPlayPoints } from "../actions/points";
import { chooseTargets, targetsAvailable } from "../abilities/targets";
import { earthRiteSources, nextPlayModifiersFor, payEarthRite, playCost } from "../costs";
import { makeEffectContext, type EffectInit } from "../effects/context";
import { chooseModes, chooseModeTargets, resolveModes } from "../abilities/modes";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import { chooseOptions, confirm } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { getCard, type Env } from "../state/access";
import { characteristics } from "../state/characteristics";
import { fieldLimit } from "../state/limits";
import { moveCards } from "../state/zones";
import { countsThisTurn, thisTurn } from "../state/turn-counts";
import { restricted } from "../state/restrictions";
import { makeReader } from "../query";

export interface PlayCardOptions {
  /** "Play it for N play points" — sets the cost (CR 10.10.2.4 set-to-value). */
  setCost?: number | undefined;
  /** Played by an effect: the card may be in any zone and Quick timing does not apply. */
  byEffect?: boolean;
}

/**
 * CR 8.2.1 — cards are played from the hand or the EX area. Card effects add (CR 1.3.1) the cemetery
 * for a card that says so (BP18-007 "You may play this from the cemetery if ...", valid there, 10.3.5)
 * and the banished zone for the rest of a turn (BP18-T03).
 */
function playableFrom(g: Env, player: PlayerId, card: CardId): boolean {
  const c = g.state.cards[card];
  if (!c || c.controller !== player) return false;
  if (c.zone === "hand" || c.zone === "ex") return true;
  if (c.zone === "cemetery") return g.scripts[c.def]?.playableFromCemetery?.(makeReader(g), card, player) ?? false;
  if (c.zone === "banished") return countsThisTurn(g.state, player).playFromBanished;
  return false;
}

/** The cards a player may try to play now (CR 8.2.1, 7.4.5), in zone order. */
export function cardsToPlayFrom(g: Env, player: PlayerId): CardId[] {
  const z = g.state.players[player].zones;
  const fromCemetery = z.cemetery.filter((id) => g.scripts[g.state.cards[id]!.def]?.playableFromCemetery !== undefined);
  const fromBanished = countsThisTurn(g.state, player).playFromBanished ? z.banished : [];
  return [...z.hand, ...z.ex, ...fromCemetery, ...fromBanished];
}

function spellAbilityOf(g: Env, card: CardId): SpellAbility | undefined {
  const ref = characteristics(g, card).abilities.find((a) => a.ability.kind === "spell");
  return ref?.ability as SpellAbility | undefined;
}

/**
 * CR 5.18.3.1.2 — options that can be performed (and so may be chosen). An option with Earth Rite
 * can be chosen without paying it, even with no Stack on the field; it then does nothing (13.3.3.2
 * "you may ... If you paid this additional cost"; BP10-050 ruling).
 */
export function performableModes(g: Env, modes: readonly Mode[], player: PlayerId, self: CardId): Mode[] {
  const reader = makeReader(g);
  return modes.filter((m) => (m.available?.(reader, player, self) ?? true) && targetsAvailable(g, m.targets, player, self));
}

/**
 * The spell's target selections as the chosen play option allows them (`PlayOption.targetFilter`,
 * BP17-030: the cost depends on the selected target, CR 10.6.2.3 before 10.6.2.5).
 */
function targetsFor(spell: SpellAbility, option: PlayOption | null): readonly TargetSpec[] | undefined {
  const filter = option?.targetFilter;
  if (!filter || !spell.targets) return spell.targets;
  return spell.targets.map((t) => ({ ...t, candidates: (game, c, self) => t.candidates(game, c, self).filter((id) => filter(game, id)) }));
}

/** Can the spell's text be performed at all (targets, required Earth Rite, modes)? */
function spellPlayable(g: Env, card: CardId, player: PlayerId): boolean {
  const spell = spellAbilityOf(g, card);
  if (!spell) return true;
  if (spell.modes) return performableModes(g, spell.modes, player, card).length > 0;
  if (spell.earthRite?.mode === "required" && earthRiteSources(g, player, spell.earthRite.count).length === 0) return false;
  return targetsAvailable(g, spell.targets, player, card);
}

/**
 * CR 8.2 / 10.6.2 / 10.4.7.3 — the ways `player` can play `card` right now: normally (null)
 * and / or with one of its "when playing" options. Empty = the card cannot be played.
 * Checks everything that would make the play illegal (8.1.2, 10.6.2.1.2): Quick timing
 * (12.3), costs (10.6.2.5), targets (10.6.2.3.3), the field limit after paying (10.6.2.6).
 */
export function playVariants(
  g: Env,
  player: PlayerId,
  card: CardId,
  timing: "main" | "quick" | "effect",
  opts: PlayCardOptions = {},
): (PlayOption | null)[] {
  const c = g.state.cards[card];
  if (!c) return [];
  if (timing !== "effect" && !playableFrom(g, player, card)) return [];
  const ch = characteristics(g, card);
  // CR 8.2.1 — a card is played by paying its cost: leaders and crests have none (2.5; a crest can't be
  // in the resolution zone either, 9.1.4.2 — confirmed by the project owner).
  if (ch.type === "leader" || ch.type === "crest" || ch.evolved || ch.cost === null) return [];
  if (timing === "quick" && !ch.keywords.includes("quick")) return [];
  // BP05-006 — "can't play followers during their next main phase", by an effect too (ruling).
  if (ch.type === "follower" && g.state.phase === "main" && restricted(g.state, player, "cantPlayFollowers")) return [];
  // The card's own condition (BP06-059 "only from hand", BP06-105 "not during your turn").
  const own = g.scripts[c.def]?.playableIf;
  if (own && !own(makeReader(g), card, player)) return [];
  if (ch.type === "spell" && !spellPlayable(g, card, player)) return [];
  const reader = makeReader(g);
  // "As an additional cost to play this card, ..." (e.g. BP11-007): not without one of its options.
  const script = g.scripts[c.def];
  const options: (PlayOption | null)[] = [...(script?.playOptionsRequired ? [] : [null]), ...(script?.playOptions ?? [])];
  return options.filter((o) => {
    if (o && !o.canPay(reader, player, card)) return false;
    if (o?.targetFilter && ch.type === "spell") {
      const spell = spellAbilityOf(g, card);
      if (spell && !targetsAvailable(g, targetsFor(spell, o), player, card)) return false;
    }
    if (!canPayPlayPoints(g, player, playCost(g, card, player, o, opts.setCost))) return false;
    if (ch.type === "follower" || ch.type === "amulet") {
      const onField = g.state.players[player].zones.field.length - (o?.freesFieldSlots ?? 0);
      if (onField >= fieldLimit(g, player)) return false;
    }
    return true;
  });
}

export function canPlayCard(g: Env, player: PlayerId, card: CardId, timing: "main" | "quick" | "effect", opts: PlayCardOptions = {}): boolean {
  return playVariants(g, player, card, timing, opts).length > 0;
}

/** CR 10.6.2 — play a card and resolve it. Legality must have been checked (playVariants). */
export function* playCard(g: G, player: PlayerId, card: CardId, opts: PlayCardOptions = {}): Proc<void> {
  const variants = playVariants(g, player, card, "effect", opts);
  if (variants.length === 0) throw new EngineError(`${card} cannot be played`);
  const from = getCard(g.state, card).zone;
  const def = getCard(g.state, card).def;
  const ch = characteristics(g, card);

  // 10.6.2.1 reveal it and move it to the resolution zone (effects and counters it had in the
  // EX area carry over, 10.6.2.1.3)
  const fromEx = from === "ex";
  const [played] = moveCards(g, [{ card, to: "resolution", player, keepEffects: fromEx, keepCounters: fromEx }], "play");
  if (played === undefined) throw new EngineError("played card vanished");
  const spell = ch.type === "spell" ? spellAbilityOf(g, played) : undefined;

  // 10.6.2.2 choices: how to play it (10.4.7.3), which option (5.18.3), Earth Rite (13.3.3.2)
  let option: PlayOption | null = variants[0]!;
  if (variants.length > 1) {
    const labeled = variants.map((v) => ({ id: v?.id ?? "normal", label: v?.label ?? "Play normally" }));
    const [id] = yield* chooseOptions(g, player, "playOption", labeled, 1, 1, played);
    option = variants.find((v) => (v?.id ?? "normal") === id) ?? null;
  }
  let modes: Mode[] = [];
  if (spell?.modes) {
    const chosen = yield* chooseModes(g, player, spell, played, option?.id ?? null);
    if (chosen === null) throw new EngineError("card played without a performable option");
    modes = chosen;
  }
  let earthRite = false;
  if (spell?.earthRite?.mode === "required") earthRite = true;
  else if ((spell?.earthRite || modes.some((m) => m.earthRite)) && earthRiteSources(g, player, spell?.earthRite?.count).length > 0) {
    earthRite = yield* confirm(g, player, "earthRite", played);
  }
  // 10.6.2.3 targets (of each chosen option, 5.18.4)
  const targets = spell && modes.length === 0 ? yield* chooseTargets(g, targetsFor(spell, option), player, played) : [];
  const modeTargets = yield* chooseModeTargets(g, player, modes, played);
  if (targets === null || modeTargets === null) throw new EngineError("card played without legal targets");
  // One memory for the play option's process and the effect (BP15-PR12 "the number of Idolatry cards
  // you engaged as the additional cost").
  const memory: NonNullable<EffectInit["memory"]> = {};
  const fx = (extra: Partial<EffectInit> = {}) =>
    makeEffectContext(g, {
      controller: player,
      self: played,
      sourceDef: def,
      targets,
      event: null,
      mode: null,
      earthRitePaid: earthRite,
      playOption: option?.id ?? null,
      memory,
      ...extra,
    });
  // 10.6.2.5 determine and pay the cost: the play option's process, Earth Rite, play points,
  // the options' additional costs
  if (option) yield* option.pay(fx());
  if (earthRite) yield* payEarthRite(g, player, spell?.earthRite?.count ?? 1, played);
  const nextPlay = nextPlayModifiersFor(g, played, player);
  payPlayPoints(g, player, playCost(g, played, player, option, opts.setCost));
  // "The next card you play this turn costs N less" is used up by this play (BP03-038 ruling).
  if (nextPlay.length > 0) g.state.nextPlay = g.state.nextPlay.filter((m) => !nextPlay.includes(m));
  // "The next card you play that was put into your EX area this way costs 0" (BP14-046): the other
  // cards of the group lose it.
  const groups = g.state.effects.flatMap((e) => (e.target === played && e.change.kind === "playCostSet" && e.change.group ? [e.change.group] : []));
  if (groups.length > 0) {
    g.state.effects = g.state.effects.filter((e) => !(e.change.kind === "playCostSet" && e.change.group !== undefined && groups.includes(e.change.group)));
  }
  // 10.6.2.6 field limit: verified by playVariants before anything moved.
  // 10.6.2.7 the card has been played (counts for Combo, 13.2.1.3)
  const ps = g.state.players[player];
  ps.cardsPlayed = ps.cardsPlayed.turn === g.state.turn ? { turn: g.state.turn, count: ps.cardsPlayed.count + 1 } : { turn: g.state.turn, count: 1 };
  thisTurn(g.state, player).played.push(def);
  g.emit({ type: "cardPlayed", player, card: played, def, from });

  // 10.6.2.8 resolve
  if (ch.type === "follower" || ch.type === "amulet") {
    // 10.6.2.8.1 onto the field if under the limit; effects and counters from the resolution
    // zone carry over (10.6.2.8.1.1)
    const [onField] = yield* putOntoField(g, [played], player, "resolve", { keepEffects: true, keepCounters: true });
    // The play option and what its process recorded stay with the card for its own abilities (CP03-084 "If you buried a Blaster
    // Dark as the additional cost to play this card, evolve this follower").
    if (onField !== undefined && (option !== null || Object.keys(memory).length > 0)) {
      g.state.cards[onField]!.playedWith = { option: option?.id ?? null, memory: { ...memory } };
    }
  } else if (spell) {
    // 10.6.2.8.2 perform the spell's text in order (the chosen options in listed order, 5.18.1;
    // an option's "[process]:" is asked for when it resolves, 10.4.7.5)
    if (modes.length > 0) {
      yield* resolveModes(modes, (m, i) => fx({ targets: modeTargets[i]!, mode: m.id }));
    } else if (spell.resolve) {
      yield* spell.resolve(fx());
    }
  }
  // 10.6.2.8.2.3 anything still in the resolution zone goes to its owner's cemetery
  if (g.state.cards[played]?.zone === "resolution") moveCards(g, [{ card: played, to: "cemetery" }], "resolve");
  g.state.revealed = []; // CR 5.21.1.1
}
