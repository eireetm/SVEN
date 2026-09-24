import type { CardClass, CardDefinition, CardType, DefId } from "../../model/card";
import type { CardId } from "../../model/ids";
import type { Keyword } from "../../model/keyword";
import type { GameState } from "../../model/state";
import type { AbilityDef, CardScript } from "../../script/types";
import { GRANT_ABILITIES, GRANT_PREFIX } from "../abilities/grants";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX } from "../abilities/keyword-abilities";
import { makeReader } from "../query";
import { getCard, type Env } from "./access";
import { effectInForce } from "./effects";

/** An ability together with where it is defined (definition id + index in its script). */
export interface AbilityRef {
  def: DefId;
  index: number;
  ability: AbilityDef;
}

/** Current card information of a card object, after CR 10.9 has been applied. */
export interface Characteristics {
  card: CardId;
  /** The printed card of this object. */
  baseDef: CardDefinition;
  /** The definition that currently provides the information (evolved card while evolved). */
  def: CardDefinition;
  /** Printed name, or the evolved card's name while evolved (CR 10.9.1.1). */
  name: string;
  /**
   * Every name the card has. While on the field this includes `alsoNames` (BP03-058/078);
   * elsewhere only the printed name. Deck limits use the printed name (CR 6.1.1.4).
   */
  names: readonly string[];
  class: CardClass;
  type: CardType;
  traits: readonly string[];
  /** CR 5.16.1.2 — an evolved follower keeps the cost of its base card. */
  cost: number | null;
  attack: number | null;
  /** Current defense: printed/modified defense minus damage (CR 2.8.2). */
  defense: number | null;
  /** Has the special type "evolved" (CR 2.3.3.1). */
  evolved: boolean;
  keywords: readonly Keyword[];
  abilities: readonly AbilityRef[];
  /**
   * Timestamp of the latest "it loses all abilities" effect on it (BP05-061), or null. Its
   * printed abilities and the abilities it was given before then don't work.
   */
  abilitiesLostAt: number | null;
}

/** Timestamp of the latest "loses all abilities" effect in force on the card (BP05-061), or null. */
export function abilitiesLostAt(state: Readonly<GameState>, id: CardId): number | null {
  let at: number | null = null;
  for (const e of state.effects) {
    if (e.target === id && e.change.kind === "loseAbilities" && effectInForce(state, e)) at = e.seq;
  }
  return at;
}

const NO_ABILITIES: CardScript = {};

/**
 * The script whose passive abilities and rule flags (e.g. "can't be destroyed by abilities",
 * "your followers take 1 less damage") currently work for a card: its information definition's
 * script, or none while it has lost all abilities (BP05-061).
 */
export function activeScript(env: Env, id: CardId): CardScript | undefined {
  return abilitiesLostAt(env.state, id) !== null ? NO_ABILITIES : env.scripts[infoDefId(env, id)];
}

/**
 * The definition providing a card object's information, without applying effects: the linked
 * evolve-zone card's definition on the field (CR 10.9.1.1.1), otherwise the printed card.
 */
export function infoDefId(env: Env, id: CardId): DefId {
  const c = getCard(env.state, id);
  if (c.zone === "field" && c.evolvedWith !== null) {
    const evo = env.state.cards[c.evolvedWith];
    if (evo && evo.zone === "evolveZone") return evo.def;
  }
  return c.def;
}

/**
 * CR 10.9.1 — derive a card's information:
 *  1. printed information, or the linked evolve-zone card's information on the field
 *     (excluding cost) (10.9.1.1, 10.9.1.1.1, 5.16.1.2);
 *  2. abilities given by effects and by passive abilities of cards on the field (10.9.1.2);
 *     "loses all abilities" removes the abilities it had when that effect was created: they
 *     apply in timestamp order (10.9.1.6), a passive of another card from when that card was
 *     put onto the field (10.9.1.6.1), and abilities given later work (BP05-061 ruling; cf.
 *     CR 5.31.2.1);
 *  3. non-numeric changes: traits given by effects (10.9.1.3, e.g. BP02-T07), card type
 *     changes (5.25.1; a non-follower's attack and defense are not referenced, 5.25.2.1);
 *  4. numeric changes in timestamp order (10.9.1.4, 10.9.1.6);
 * then damage reduces defense (2.8.2). Leaders use the player's leader defense (2.8.3).
 */
export function characteristics(env: Env, id: CardId): Characteristics {
  const { state, db, scripts } = env;
  const c = getCard(state, id);
  const baseDef = db.get(c.def);
  const def = db.get(infoDefId(env, id));
  const script = scripts[def.id];

  const lostAt = abilitiesLostAt(state, id);
  /** Was an ability given at timestamp `seq` lost by "loses all abilities"? */
  const lost = (seq: number) => lostAt !== null && seq <= lostAt;
  const keywords: Keyword[] = lostAt === null ? [...(script?.keywords ?? [])] : [];
  const addKeyword = (k: Keyword) => {
    if (!keywords.includes(k)) keywords.push(k);
  };
  let type = def.type;
  let attack = def.attack;
  let defense = def.defense;
  const traits = [...def.traits];
  const grantedAbilities: AbilityRef[] = [];
  for (const e of state.effects) {
    if (e.target !== id || !effectInForce(state, e)) continue; // state.effects is kept in timestamp order
    if (e.change.kind === "keyword") {
      if (!lost(e.seq)) addKeyword(e.change.keyword);
    } else if (e.change.kind === "trait") {
      if (!traits.includes(e.change.trait)) traits.push(e.change.trait);
    } else if (e.change.kind === "changeType") {
      type = e.change.type;
    } else if (e.change.kind === "stats") {
      if (attack !== null) attack += e.change.attack;
      if (defense !== null) defense += e.change.defense;
    } else if (e.change.kind === "grantedAbility" && !lost(e.seq)) {
      // Given activated abilities are listed here; given automatic abilities trigger through
      // engine/abilities/triggers.ts.
      const ability = GRANT_ABILITIES[e.change.grant];
      if (ability.kind === "activated") grantedAbilities.push({ def: `${GRANT_PREFIX}${e.change.grant}`, index: 0, ability });
    }
  }
  // Keywords given by passive abilities of cards on the field (e.g. BP01-091).
  let reader: ReturnType<typeof makeReader> | null = null;
  for (const p of [0, 1] as const) {
    for (const f of state.players[p].zones.field) {
      const passive = activeScript(env, f)?.field?.keywordsFor;
      if (!passive || lost(getCard(state, f).zoneSeq)) continue;
      reader ??= makeReader(env);
      for (const k of passive(reader, f, id)) addKeyword(k);
    }
  }
  if (type !== "follower" && baseDef.type !== "leader") {
    // CR 5.25.2.1 — a card that is not a follower has no attack or defense to reference.
    attack = null;
    defense = null;
  }
  if (baseDef.type === "leader") {
    defense = state.players[c.controller].leaderDefense;
  } else if (defense !== null) {
    defense -= c.damage;
  }

  const abilities: AbilityRef[] =
    lostAt === null ? (script?.abilities ?? []).map((ability, index) => ({ def: def.id, index, ability })) : [];
  for (const k of keywords) {
    (KEYWORD_ABILITIES[k] ?? []).forEach((ability, index) => {
      abilities.push({ def: `${KEYWORD_DEF_PREFIX}${k}`, index, ability });
    });
  }
  abilities.push(...grantedAbilities);

  const names = [def.name];
  // "This follower's name is also X" works only while the card is on the field (official ruling).
  if (c.zone === "field" && lostAt === null) {
    for (const extra of script?.alsoNames ?? []) if (!names.includes(extra)) names.push(extra);
  }

  return {
    card: id,
    baseDef,
    def,
    name: def.name,
    names,
    class: def.class,
    type,
    traits,
    cost: baseDef.cost,
    attack,
    defense,
    evolved: def.evolved,
    keywords,
    abilities,
    abilitiesLostAt: lostAt,
  };
}

export function hasKeyword(env: Env, id: CardId, keyword: Keyword): boolean {
  return characteristics(env, id).keywords.includes(keyword);
}

/** CR 4.4.1 / 2.3 — is this card object a follower on the field? */
export function isFollowerOnField(env: Env, id: CardId): boolean {
  const c = env.state.cards[id];
  return c !== undefined && c.zone === "field" && characteristics(env, id).type === "follower";
}
