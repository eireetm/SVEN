import type { CardId, PlayerId } from "../../model/ids";
import type { Mode, PlayOption, SpellAbility } from "../../script/types";
import { putOntoField } from "../actions/cards";
import { canPayPlayPoints, payPlayPoints } from "../actions/points";
import { chooseTargets, targetsAvailable } from "../abilities/targets";
import { earthRiteSources, payEarthRite, playCost } from "../costs";
import { makeEffectContext } from "../effects/context";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import { chooseOptions, confirm } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { getCard, type Env } from "../state/access";
import { characteristics } from "../state/characteristics";
import { fieldLimit } from "../state/limits";
import { moveCards } from "../state/zones";
import { makeReader } from "../query";

export interface PlayCardOptions {
  /** "Play it for N play points" — sets the cost (CR 10.10.2.4 set-to-value). */
  setCost?: number | undefined;
  /** Played by an effect: the card may be in any zone and Quick timing does not apply. */
  byEffect?: boolean;
}

function spellAbilityOf(g: Env, card: CardId): SpellAbility | undefined {
  const ref = characteristics(g, card).abilities.find((a) => a.ability.kind === "spell");
  return ref?.ability as SpellAbility | undefined;
}

/** CR 5.18.3.1.2 — options that can be performed (and so may be chosen). */
export function performableModes(g: Env, modes: readonly Mode[], player: PlayerId, self: CardId): Mode[] {
  const reader = makeReader(g);
  return modes.filter(
    (m) =>
      (m.available?.(reader, player, self) ?? true) &&
      targetsAvailable(g, m.targets, player, self) &&
      (!m.earthRite || earthRiteSources(g, player).length > 0),
  );
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
  if (timing !== "effect" && (c.controller !== player || (c.zone !== "hand" && c.zone !== "ex"))) return [];
  const ch = characteristics(g, card);
  if (ch.type === "leader" || ch.evolved || ch.cost === null) return [];
  if (timing === "quick" && !ch.keywords.includes("quick")) return [];
  if (ch.type === "spell" && !spellPlayable(g, card, player)) return [];
  const reader = makeReader(g);
  const options: (PlayOption | null)[] = [null, ...(g.scripts[c.def]?.playOptions ?? [])];
  return options.filter((o) => {
    if (o && !o.canPay(reader, player, card)) return false;
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

  // 10.6.2.1 reveal it and move it to the resolution zone (EX effects carry over, 10.6.2.1.3)
  const [played] = moveCards(g, [{ card, to: "resolution", player, keepEffects: from === "ex" }], "play");
  if (played === undefined) throw new EngineError("played card vanished");
  const spell = ch.type === "spell" ? spellAbilityOf(g, played) : undefined;

  // 10.6.2.2 choices: how to play it (10.4.7.3), which option (5.18.3), Earth Rite (13.3.3.2)
  let option: PlayOption | null = variants[0]!;
  if (variants.length > 1) {
    const labeled = variants.map((v) => ({ id: v?.id ?? "normal", label: v?.label ?? "Play normally" }));
    const [id] = yield* chooseOptions(g, player, "playOption", labeled, 1, 1, played);
    option = variants.find((v) => (v?.id ?? "normal") === id) ?? null;
  }
  let mode: Mode | null = null;
  if (spell?.modes) {
    const modes = performableModes(g, spell.modes, player, played);
    const [id] = yield* chooseOptions(g, player, "mode", modes.map((m) => ({ id: m.id, label: m.label })), 1, 1, played);
    mode = modes.find((m) => m.id === id)!;
  }
  let earthRite = false;
  if (mode?.earthRite || spell?.earthRite?.mode === "required") earthRite = true;
  else if (spell?.earthRite && earthRiteSources(g, player, spell.earthRite.count).length > 0) {
    earthRite = yield* confirm(g, player, "earthRite", played);
  }
  // 10.6.2.3 targets
  const targets = spell ? yield* chooseTargets(g, mode?.targets ?? spell.targets, player, played) : [];
  if (targets === null) throw new EngineError("card played without legal targets");
  const fx = (extra = {}) =>
    makeEffectContext(g, {
      controller: player,
      self: played,
      sourceDef: def,
      targets,
      event: null,
      mode: mode?.id ?? null,
      earthRitePaid: earthRite,
      ...extra,
    });
  // 10.6.2.5 determine and pay the cost: the play option's process, Earth Rite, play points
  if (option) yield* option.pay(fx());
  if (earthRite) yield* payEarthRite(g, player, spell?.earthRite?.count ?? 1, played);
  payPlayPoints(g, player, playCost(g, played, player, option, opts.setCost));
  // 10.6.2.6 field limit: verified by playVariants before anything moved.
  // 10.6.2.7 the card has been played (counts for Combo, 13.2.1.3)
  const ps = g.state.players[player];
  ps.cardsPlayed = ps.cardsPlayed.turn === g.state.turn ? { turn: g.state.turn, count: ps.cardsPlayed.count + 1 } : { turn: g.state.turn, count: 1 };
  g.emit({ type: "cardPlayed", player, card: played, def, from });

  // 10.6.2.8 resolve
  if (ch.type === "follower" || ch.type === "amulet") {
    // 10.6.2.8.1 onto the field if under the limit; effects from the resolution zone carry over (10.6.2.8.1.1)
    yield* putOntoField(g, [played], player, "resolve", { keepEffects: true });
  } else if (spell) {
    // 10.6.2.8.2 perform the spell's text in order
    const resolve = mode?.resolve ?? spell.resolve;
    if (resolve) yield* resolve(fx());
  }
  // 10.6.2.8.2.3 anything still in the resolution zone goes to its owner's cemetery
  if (g.state.cards[played]?.zone === "resolution") moveCards(g, [{ card: played, to: "cemetery" }], "resolve");
  g.state.revealed = []; // CR 5.21.1.1
}
