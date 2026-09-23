import type { CardClass, CardDefinition, CardType, DefId } from "../../model/card";
import type { CardId } from "../../model/ids";
import type { Keyword } from "../../model/keyword";
import type { AbilityDef } from "../../script/types";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX } from "../abilities/keyword-abilities";
import { makeReader } from "../query";
import { getCard, type Env } from "./access";

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
  name: string;
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
 *  3. (non-numeric changes — none implemented yet, 10.9.1.3);
 *  4. numeric changes in timestamp order (10.9.1.4, 10.9.1.6);
 * then damage reduces defense (2.8.2). Leaders use the player's leader defense (2.8.3).
 */
export function characteristics(env: Env, id: CardId): Characteristics {
  const { state, db, scripts } = env;
  const c = getCard(state, id);
  const baseDef = db.get(c.def);
  const def = db.get(infoDefId(env, id));
  const script = scripts[def.id];

  const keywords: Keyword[] = [...(script?.keywords ?? [])];
  const addKeyword = (k: Keyword) => {
    if (!keywords.includes(k)) keywords.push(k);
  };
  let attack = def.attack;
  let defense = def.defense;
  for (const e of state.effects) {
    if (e.target !== id) continue; // state.effects is kept in timestamp order
    if (e.change.kind === "keyword") addKeyword(e.change.keyword);
    else if (e.change.kind === "stats") {
      if (attack !== null) attack += e.change.attack;
      if (defense !== null) defense += e.change.defense;
    }
  }
  // Keywords given by passive abilities of cards on the field (e.g. BP01-091).
  let reader: ReturnType<typeof makeReader> | null = null;
  for (const p of [0, 1] as const) {
    for (const f of state.players[p].zones.field) {
      const passive = scripts[infoDefId(env, f)]?.field?.keywordsFor;
      if (!passive) continue;
      reader ??= makeReader(env);
      for (const k of passive(reader, f, id)) addKeyword(k);
    }
  }
  if (baseDef.type === "leader") {
    defense = state.players[c.controller].leaderDefense;
  } else if (defense !== null) {
    defense -= c.damage;
  }

  const abilities: AbilityRef[] = (script?.abilities ?? []).map((ability, index) => ({ def: def.id, index, ability }));
  for (const k of keywords) {
    (KEYWORD_ABILITIES[k] ?? []).forEach((ability, index) => {
      abilities.push({ def: `${KEYWORD_DEF_PREFIX}${k}`, index, ability });
    });
  }

  return {
    card: id,
    baseDef,
    def,
    name: def.name,
    class: def.class,
    type: def.type,
    traits: def.traits,
    cost: baseDef.cost,
    attack,
    defense,
    evolved: def.evolved,
    keywords,
    abilities,
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
