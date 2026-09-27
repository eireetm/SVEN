import type { CardClass, CardDefinition, CardType, DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { Keyword } from "../../model/keyword";
import type { GameState, GrantedAbilityId, ZoneName } from "../../model/state";
import type { AbilityDef, CardScript } from "../../script/types";
import { GRANT_ABILITIES, GRANT_PREFIX } from "../abilities/grants";
import { KEYWORD_ABILITIES, KEYWORD_DEF_PREFIX } from "../abilities/keyword-abilities";
import { EQUIP_PREFIX, equipmentOf } from "../abilities/equipment";
import { makeReader } from "../query";
import { getCard, type Env } from "./access";
import { effectInForce } from "./effects";
import { isRacing } from "./links";

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

/**
 * Timestamp of the latest "loses all abilities" effect in force on the card (BP05-061), or null.
 * Being Boxed is one too (CR 5.31.2, 5.31.2.1).
 */
export function abilitiesLostAt(state: Readonly<GameState>, id: CardId): number | null {
  let at: number | null = null;
  for (const e of state.effects) {
    if (e.target === id && (e.change.kind === "loseAbilities" || e.change.kind === "boxed") && effectInForce(state, e)) at = e.seq;
  }
  return at;
}

/** CR 5.31 — is the card Boxed (e.g. BP11-024 "a Boxed enemy follower")? */
export function isBoxed(state: Readonly<GameState>, id: CardId): boolean {
  return state.effects.some((e) => e.target === id && e.change.kind === "boxed" && effectInForce(state, e));
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

const ON_FIELD: readonly ZoneName[] = ["field"];
const IN_EX: readonly ZoneName[] = ["ex"];
const IN_EQUIPMENT_ZONE: readonly ZoneName[] = ["equipmentZone"];

/**
 * CR 10.3.5 / 10.3.6 / 14.5.2.1.2 — where the abilities of a card with this definition work unless its text says
 * otherwise: a crest's in the EX area, an equipment token's in the equipment zone, other cards' on the field.
 * (Abilities given by effects, "grant:" definitions, and by equipment, "equip:", work on the field.)
 */
export function defaultAbilityZones(env: Env, def: DefId): readonly ZoneName[] {
  if (!env.db.has(def)) return ON_FIELD;
  const type = env.db.get(def).type;
  return type === "crest" ? IN_EX : type === "equipment" ? IN_EQUIPMENT_ZONE : ON_FIELD;
}

/** The zones where an ability of a card with definition `def` works: its `validIn`, else the default. */
export function abilityZones(env: Env, def: DefId, ability: { readonly validIn?: readonly ZoneName[] | undefined }): readonly ZoneName[] {
  return ability.validIn ?? defaultAbilityZones(env, def);
}

/** Is a card where its passive abilities work (CR 10.3.5 / 10.3.6: the field, or the EX area for a crest)? */
export function inAbilityZone(env: Env, id: CardId): boolean {
  const c = getCard(env.state, id);
  return defaultAbilityZones(env, c.def).includes(c.zone);
}

/**
 * CR 10.3.5 / 10.3.6 / 14.5.2.1.2 — the cards of a player whose passive abilities (`CardScript.field`) work: the
 * cards on their field, the crests in their EX area and the equipment tokens in their equipment zone. (The EX-area
 * passives of other cards are `CardScript.exPassives`, BP13-003.) Without crests and equipment this is the field
 * list itself.
 */
export function passiveSources(env: Env, player: PlayerId): readonly CardId[] {
  const zones = env.state.players[player].zones;
  let crests: CardId[] | null = null;
  for (const id of zones.ex) if (env.db.get(getCard(env.state, id).def).type === "crest") (crests ??= []).push(id);
  if (zones.equipmentZone.length > 0) return [...zones.field, ...(crests ?? []), ...zones.equipmentZone];
  return crests === null ? zones.field : [...zones.field, ...crests];
}

/**
 * The definition providing a card object's information, without applying effects: the linked
 * evolve-zone card's definition on the field (CR 10.9.1.1.1), otherwise the printed card. A
 * double-faced card shows its visible face (CR 2.14.3.1).
 */
export function infoDefId(env: Env, id: CardId): DefId {
  const c = getCard(env.state, id);
  if (c.zone === "field" && c.evolvedWith !== null) {
    const evo = env.state.cards[c.evolvedWith];
    if (evo && evo.zone === "evolveZone") return visibleFaceDefId(env, evo);
  }
  return visibleFaceDefId(env, c);
}

/**
 * CR 2.14 — the face of a double-faced card whose information applies: the back face while it
 * is visible (on the field or in the evolve zone, 2.14.3.1), otherwise the front (2.14.2.1).
 */
function visibleFaceDefId(env: Env, c: { def: DefId; backFace: boolean }): DefId {
  return c.backFace ? (env.db.get(c.def).backFace ?? c.def) : c.def;
}

/**
 * The card type before effects: the printed type, or the type the card gives itself on the field by
 * its own passive while it has its abilities (`CardScript.typeWhile`, BP16-093 "While this has at
 * least 4 prayer counters, it's a follower"; boxed, it is an amulet again — rulings). Effects that
 * change the type come later (CR 10.9.1.3, 10.9.1.6: the passive's timestamp is when the card was
 * put onto the field).
 */
function selfType(env: Env, id: CardId, printed: CardType, lostAt: number | null): CardType {
  const c = getCard(env.state, id);
  if (c.zone !== "field" || lostAt !== null) return printed;
  const typeWhile = env.scripts[infoDefId(env, id)]?.typeWhile;
  return typeWhile?.(makeReader(env), id) ?? printed;
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
  let type = selfType(env, id, def.type, lostAt);
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
    } else if (e.change.kind === "maneuver") {
      // CR 5.32.1 — an amulet with printed attack and defense becomes a follower with those
      // values; changes from before it (an earlier maneuver's) don't carry over (rulings).
      if (def.attack !== null && def.defense !== null) {
        type = "follower";
        attack = def.attack;
        defense = def.defense;
      }
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
  let reader: ReturnType<typeof makeReader> | null = null;
  // Keywords the card gives itself under a condition, in any zone (BP12-058 "While Overflow is
  // active for you, this card has Quick").
  if (lostAt === null && script?.selfKeywords) {
    reader ??= makeReader(env);
    for (const k of script.selfKeywords(reader, id)) addKeyword(k);
  }
  // Keywords given by passive abilities of cards on the field (e.g. BP01-091) and of crests in an EX
  // area (CR 10.3.6), and of cards in an EX area whose passives work there too (CR 10.3.5, BP13-003).
  for (const p of [0, 1] as const) {
    for (const f of passiveSources(env, p)) {
      const passive = activeScript(env, f)?.field?.keywordsFor;
      if (!passive || lost(getCard(state, f).zoneSeq)) continue;
      reader ??= makeReader(env);
      for (const k of passive(reader, f, id)) addKeyword(k);
    }
    for (const x of state.players[p].zones.ex) {
      const passive = env.scripts[getCard(state, x).def]?.exPassives?.keywordsFor;
      if (!passive || lost(getCard(state, x).zoneSeq)) continue;
      reader ??= makeReader(env);
      for (const k of passive(reader, x, id)) addKeyword(k);
    }
  }
  // CR 14.5.2 — what the equipment tokens it equips give it ("The equipped follower has ..."): keyword abilities
  // (CP04-T09 Storm) and activated abilities (CP04-T01); automatic ones trigger through triggers.ts. They are its own
  // abilities, so a "loses all abilities" after the token was linked removes them (rulings); one per token (CP04-114 Q11).
  if (c.zone === "field") {
    for (const token of equipmentOf(env, id)) {
      const t = getCard(state, token);
      const gift = scripts[t.def]?.equipment;
      if (!gift || lost(t.zoneSeq)) continue;
      for (const k of gift.keywords ?? []) addKeyword(k);
      (gift.abilities ?? []).forEach((ability, index) => {
        if (ability.kind === "activated") grantedAbilities.push({ def: `${EQUIP_PREFIX}${t.def}`, index, ability });
      });
    }
  }
  // CR 14.2.3.1 — a card that raced has Rush while it is linked to a race-zone card.
  if (c.raceSeq !== undefined && !lost(c.raceSeq) && isRacing(env, id)) addKeyword("rush");
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

  return {
    card: id,
    baseDef,
    def,
    name: def.name,
    names: namesOf(env, id),
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

/**
 * Abilities given to a card on the field (CR 10.9.1.2), one entry per gift: by effects in force
 * (`fx.grant`) and by passive abilities of cards on the field (`FieldPassives.grantsFor`,
 * BP03-011). Gifts from before it lost all abilities don't count (BP05-061 ruling). Used for the
 * look-back information of a card leaving the field (CR 10.7.4.1, e.g. a given Last Words).
 */
export function grantedAbilitiesOf(env: Env, id: CardId): GrantedAbilityId[] {
  const { state } = env;
  const at = abilitiesLostAt(state, id);
  const kept = (seq: number) => at === null || seq > at;
  const out: GrantedAbilityId[] = [];
  for (const e of state.effects) {
    if (e.target === id && e.change.kind === "grantedAbility" && effectInForce(state, e) && kept(e.seq)) out.push(e.change.grant);
  }
  let reader: ReturnType<typeof makeReader> | null = null;
  for (const p of [0, 1] as const) {
    for (const giver of passiveSources(env, p)) {
      const grantsFor = activeScript(env, giver)?.field?.grantsFor;
      if (!grantsFor || !kept(getCard(state, giver).zoneSeq)) continue;
      reader ??= makeReader(env);
      out.push(...grantsFor(reader, giver, id));
    }
  }
  return out;
}

/**
 * Every name a card has (CR 2.1): its (evolved card's) name, and while it is on the field the
 * names its passive "this card's name is also X" gives (BP03-058/078, BP08-T01; official rulings:
 * only on the field, and not after it lost all abilities). Safe inside `FieldPassives.keywordsFor`
 * (BP08-003_back "each Puppet on your field has Assail").
 */
export function namesOf(env: Env, id: CardId): string[] {
  const c = getCard(env.state, id);
  const def = env.db.get(infoDefId(env, id));
  const names = [def.name];
  if (c.zone === "field" && abilitiesLostAt(env.state, id) === null) {
    for (const extra of env.scripts[def.id]?.alsoNames ?? []) if (!names.includes(extra)) names.push(extra);
  }
  return names;
}

/**
 * A card's current card type and traits (CR 10.9.1.1, 10.9.1.3, 5.25) without the rest of its
 * information. Safe inside `FieldPassives.keywordsFor`, which is part of computing information
 * (e.g. BP07-080 "while there's another Machina follower on your field").
 */
export function typeAndTraits(env: Env, id: CardId): { type: CardType; traits: readonly string[] } {
  const def = env.db.get(infoDefId(env, id));
  let type = selfType(env, id, def.type, abilitiesLostAt(env.state, id));
  const traits = [...def.traits];
  for (const e of env.state.effects) {
    if (e.target !== id || !effectInForce(env.state, e)) continue;
    if (e.change.kind === "changeType") type = e.change.type;
    else if (e.change.kind === "maneuver" && def.attack !== null && def.defense !== null) type = "follower"; // CR 5.32.1
    else if (e.change.kind === "trait" && !traits.includes(e.change.trait)) traits.push(e.change.trait);
  }
  return { type, traits };
}

/**
 * A card's current attack and defense (CR 10.9.1.1, 10.9.1.4, 5.25.2.1, 2.8.2) without the rest of
 * its information. Like `typeAndTraits`, safe inside `FieldPassives.keywordsFor` (e.g. BP09-003
 * "While this follower's attack is at least 4, it has Ward").
 */
export function currentStats(env: Env, id: CardId): { attack: number | null; defense: number | null } {
  const c = getCard(env.state, id);
  const baseDef = env.db.get(c.def);
  const def = env.db.get(infoDefId(env, id));
  let type = selfType(env, id, def.type, abilitiesLostAt(env.state, id));
  let attack = def.attack;
  let defense = def.defense;
  for (const e of env.state.effects) {
    if (e.target !== id || !effectInForce(env.state, e)) continue;
    if (e.change.kind === "changeType") type = e.change.type;
    else if (e.change.kind === "maneuver" && def.attack !== null && def.defense !== null) {
      // CR 5.32.1 — as in `characteristics`: the printed values, earlier changes don't carry over.
      type = "follower";
      attack = def.attack;
      defense = def.defense;
    } else if (e.change.kind === "stats") {
      if (attack !== null) attack += e.change.attack;
      if (defense !== null) defense += e.change.defense;
    }
  }
  if (type !== "follower" && baseDef.type !== "leader") return { attack: null, defense: null };
  if (baseDef.type === "leader") return { attack, defense: env.state.players[c.controller].leaderDefense };
  return { attack, defense: defense === null ? null : defense - c.damage };
}

export function hasKeyword(env: Env, id: CardId, keyword: Keyword): boolean {
  return characteristics(env, id).keywords.includes(keyword);
}

/** CR 4.4.1 / 2.3 — is this card object a follower on the field? */
export function isFollowerOnField(env: Env, id: CardId): boolean {
  const c = env.state.cards[id];
  return c !== undefined && c.zone === "field" && characteristics(env, id).type === "follower";
}
