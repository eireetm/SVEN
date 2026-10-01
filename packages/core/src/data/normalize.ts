import { backFaceId, CARD_CLASSES, type CardClass, type CardDefinition, type CardType, type LocalizedText, type TriggerIcon } from "../model/card";
import { englishText, japaneseKey, japaneseWordsKey, PREVIEW_TEXT, treatedAs, withoutReminders, withoutTreatedAs, wordDice, type TextSource } from "./english-text";
import type { RawCardJson } from "./raw";
import { MAGICAL_ITEM, UNIVERSE_OF_SET } from "./universes";

/**
 * Raw scraped JSON -> CardDefinition.
 *
 * Pure functions: no file system access (the build tool reads files and calls these).
 * Every data anomaly is either fixed by an explicit, documented table (`data/fixes.ts`) or
 * reported as an error — never silently guessed.
 */

export class CardDataError extends Error {
  override name = "CardDataError";
}

const EVOLVED_SUFFIX = " (Evolved)";

export type { TextSource };

/** One printing after normalization, before alternate-art grouping. */
export interface NormalizedPrinting {
  printing: string;
  set: string;
  def: Omit<CardDefinition, "id" | "printings" | "traits">;
  /**
   * Japanese traits of this printing, or null when its data has none. Resolved per card from
   * all its printings (see groupPrintings).
   */
  traits: string[] | null;
  textSource: TextSource;
  /** The printing's official English text describes another card (see english-text.ts; report only). */
  officialMismatch: boolean;
  /** CR 2.13 — the printed name, when it is an alternate name of the card (`def.name`). */
  alternateName: LocalizedText | null;
  /** Japanese text, normalized, to check that printings grouped together say the same thing. */
  jaKey: string;
  /** The same from the text with the icons written as words, to check pre-release printings (english-text.ts). */
  jaWordsKey: string;
  /** CR 2.14 — the back face of a double-faced card. */
  back: NormalizedBack | null;
  /**
   * An evolved card whose English name lacks " (Evolved)": either named differently from any base card by design
   * (CR 5.16.1.1.1 "unless specified otherwise", e.g. CP03-006 Navalgazer Dragon, evolved into by name; the
   * evolve-deck spells Carrot / Drive Point), or a data error when its Japanese name is a base card's (checked in
   * groupPrintings).
   */
  ownEvolvedName: boolean;
}

/** The back face of a double-faced card after normalization (CR 2.14). */
export interface NormalizedBack {
  def: Omit<CardDefinition, "id" | "printings" | "traits">;
  traits: string[] | null;
}

/** CR 2.3 — `card_type` array -> primary type + special types. */
export function parseCardType(cardNo: string, raw: readonly string[]): {
  type: CardType;
  evolved: boolean;
  token: boolean;
  advanced: boolean;
} {
  const primaries: CardType[] = [];
  let evolved = false;
  let token = false;
  let advanced = false;
  for (const t of raw) {
    switch (t) {
      case "Follower":
        primaries.push("follower");
        break;
      case "Spell":
        primaries.push("spell");
        break;
      case "Amulet":
        primaries.push("amulet");
        break;
      case "Leader":
        primaries.push("leader");
        break;
      case "Crest":
        primaries.push("crest");
        break;
      case "Equipment":
        primaries.push("equipment");
        break;
      case "Evolved":
        evolved = true;
        break;
      case "Token":
        token = true;
        break;
      case "Advanced":
        advanced = true;
        break;
      default:
        throw new CardDataError(`${cardNo}: unsupported card_type entry "${t}"`);
    }
  }
  const [type, ...rest] = primaries;
  if (type === undefined || rest.length > 0) {
    throw new CardDataError(`${cardNo}: expected exactly one primary card type, got ${JSON.stringify(raw)}`);
  }
  // Evolved spells are the evolve-deck resources Carrot (CR 14.2.1, 4.13) and Drive Point (14.4.9, 4.14).
  if (evolved && type !== "follower" && type !== "amulet" && type !== "spell") {
    throw new CardDataError(`${cardNo}: evolved card must be a follower, amulet or spell in the supported sets`);
  }
  // CR 9.1.4.2 — crests exist only as tokens (BP20). A crest that is not a token fails until one appears.
  if (type === "crest" && (!token || evolved || advanced)) {
    throw new CardDataError(`${cardNo}: a crest must be a token in the supported sets`);
  }
  // CR 14.5.2.1 — equipment exists only as tokens (CP04).
  if (type === "equipment" && (!token || evolved || advanced)) {
    throw new CardDataError(`${cardNo}: equipment must be a token`);
  }
  // CR 9.2 — advanced cards are followers (BP10) or spells (BP13). Other kinds fail until they appear.
  if (advanced && (evolved || token || (type !== "follower" && type !== "spell"))) {
    throw new CardDataError(`${cardNo}: advanced card must be a follower or spell in the supported sets`);
  }
  return { type, evolved, token, advanced };
}

function parseClass(cardNo: string, raw: string): CardClass {
  if ((CARD_CLASSES as readonly string[]).includes(raw)) return raw as CardClass;
  throw new CardDataError(`${cardNo}: unknown class "${raw}"`);
}

/**
 * CR 2.4 — traits, taken from the Japanese data only (`traits_ja`, e.g. "妖精・獣").
 * Japanese is the original printing; the English `traits` field is a translation with
 * inconsistencies (untranslated entries, swapped names), so it is ignored on purpose
 * (decided by the project owner, see docs/data-notes.md).
 *
 * Several traits are joined with "・". A trait may itself contain "・" inside 〈〉 brackets
 * (e.g. "プリコネ・〈ジオ・ゲヘナ〉"), so separators inside brackets do not split.
 * Returns null when the printing has no Japanese traits (another printing may have them).
 */
export function parseTraits(cardNo: string, raw: string | null): string[] | null {
  if (raw === null) return null;
  const text = raw.trim();
  if (text === "-" || text === "") return []; // "-" means "no trait" (e.g. leaders)
  // Japanese card data never uses U+00B7; it shows up when a source filled in Chinese traits.
  if (text.includes("\u00b7")) throw new CardDataError(`${cardNo}: traits_ja "${text}" uses U+00B7 (not Japanese data?)`);
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "〈") depth += 1;
    else if (ch === "〉") depth -= 1;
    if (ch === "・" && depth === 0) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  if (depth !== 0 || out.some((t) => t === "")) throw new CardDataError(`${cardNo}: malformed traits_ja "${text}"`);
  return out;
}

function checkStats(
  cardNo: string,
  type: CardType,
  evolved: boolean,
  cost: number | null,
  atk: number | null,
  def: number | null,
): void {
  const fail = (msg: string) => {
    throw new CardDataError(`${cardNo}: ${msg} (cost=${cost}, atk=${atk}, def=${def})`);
  };
  if (type === "leader" || type === "crest") {
    // CR 2.5 — neither is played, so neither has a cost (crests: 9.1.4.2, BP20).
    if (cost !== null || atk !== null || def !== null) fail(`${type} must not have cost/atk/def`);
    return;
  }
  if (type === "equipment") {
    // CR 14.5.2 — an equipment token has a printed cost (CP04-T01 … T12: 2) but is never played; no attack or defense.
    if (atk !== null || def !== null) fail("equipment must not have atk/def");
    return;
  }
  if (type === "follower") {
    if (atk === null || def === null) fail("follower needs attack and defense");
    if (evolved ? cost !== null : cost === null) fail(evolved ? "evolved card must not have a cost" : "follower needs a cost");
    return;
  }
  if (evolved) {
    // Evolved amulets (CR 5.16.1.2.1) and the evolve-deck spells Carrot / Drive Point (14.2.1, 14.4.9): never
    // played, so no cost.
    if (cost !== null || atk !== null || def !== null) fail(`evolved ${type} must not have cost/atk/def`);
    return;
  }
  if (cost === null) fail(`${type} needs a cost`);
}

/**
 * CR 14.3.1.1 — Magical Item tokens have alternate names (2.13): whatever name is printed, the card name is "Magical Item"
 * (CP02-T01 ruling Q3: Cute Earrings, Cool Pendant, … are all the card named Magical Item). Every one of them carries the
 * reminder of 14.3.1.2, which is how they are recognized.
 */
/**
 * CR 14.4.1 — a Trigger icon is printed in the card's corner, and the data has no field for it. Every card with one explains
 * it in a reminder, "(If this card is revealed by a drive check, [its ability])" (14.4.5.1.3), which tells the icon. The
 * English and the Japanese reminders must agree.
 */
const TRIGGER_REMINDERS: readonly { icon: TriggerIcon; en: string; ja: string }[] = [
  { icon: "critical", en: "giveafolloweronyourfield{[attack]}+2", ja: "{[attack]}+2" },
  { icon: "draw", en: "drawacard", ja: "1枚引く" },
  { icon: "stand", en: "refreshafolloweronyourfield", ja: "スタンドする" },
  { icon: "heal", en: "giveyourleader{[defense]}+3", ja: "{[defense]}+3" },
];

function triggerIcon(cardNo: string, en: string | null, ja: string | null): TriggerIcon | undefined {
  const squash = (s: string) => s.replace(/\s+/g, "");
  const enReminder = /\(If this card is revealed by a drive check, ([^)]*)\)/.exec(en ?? "")?.[1];
  const jaReminder = /（ドライブチェックによってこれが捲れたなら、([^）]*)）/.exec(ja ?? "")?.[1];
  if (enReminder === undefined && jaReminder === undefined) return undefined;
  const fromEn = enReminder === undefined ? undefined : TRIGGER_REMINDERS.find((r) => squash(enReminder).includes(r.en))?.icon;
  const fromJa = jaReminder === undefined ? undefined : TRIGGER_REMINDERS.find((r) => squash(jaReminder).includes(r.ja))?.icon;
  const icon = fromJa ?? fromEn;
  if (!icon || (fromEn !== undefined && fromJa !== undefined && fromEn !== fromJa)) {
    throw new CardDataError(`${cardNo}: Trigger reminders don't tell one icon (en ${fromEn ?? "?"}, ja ${fromJa ?? "?"})`);
  }
  return icon;
}

const MAGICAL_ITEM_NAMES: LocalizedText = { en: MAGICAL_ITEM, ja: "魔法のアイテム", cn: "魔法道具" };
/** CR 14.3.1.1 — a Magical Item token: its text has the starting reminder (CP02), or a fix names it (ECP02's tokens). */
const isMagicalItem = (token: boolean, text: string | null, treatedAs: string | undefined): boolean =>
  token && (treatedAs === MAGICAL_ITEM || (text ?? "").includes("put 5 Magical Item tokens into your EX area"));

/**
 * Japanese-only data (some promos and deck products, docs/data-notes.md): the scraped `name_en` holds the Japanese name and
 * `name_ja` is empty. The Japanese name is then the card name too, evolved cards included (no " (Evolved)" to strip).
 */
const japaneseOnlyName = (raw: RawCardJson): boolean => !(raw.name_ja ?? "").trim() && /[\u3040-\u30ff\u3400-\u9fff]/.test(raw.name_en);

export function normalizePrinting(raw: RawCardJson): NormalizedPrinting {
  const cardNo = raw.card_no;
  const { type, evolved, token, advanced } = parseCardType(cardNo, raw.card_type);
  checkStats(cardNo, type, evolved, raw.cost, raw.atk, raw.def);
  const doubleFaced = raw.back !== undefined && raw.back !== null;

  // A pre-release printing of a card the scraped data doesn't know (data/preview.ts) is named by its Japanese name, like
  // Japanese-only data, evolved cards included; a reprint keeps its card's English name, so that it joins the card.
  const previewName = raw.preview === true && raw.name_en.trim() === "";
  const rawName = previewName ? raw.name_ja.trim() : raw.name_en.trim();
  const japaneseOnly = previewName || japaneseOnlyName(raw);
  const nameJa = japaneseOnly ? rawName : raw.name_ja;
  const ownEvolvedName = evolved && !doubleFaced && !japaneseOnly && !rawName.endsWith(EVOLVED_SUFFIX);
  const printedName = ownEvolvedName || japaneseOnly ? rawName : stripEvolvedSuffix(cardNo, rawName, evolved, doubleFaced);
  // A pre-release printing has no English text yet: a placeholder where it has text (english-text.ts PREVIEW_TEXT).
  const en = raw.preview
    ? { text: (raw.effect_ja ?? "").trim() === "" ? "" : PREVIEW_TEXT, source: "preview" as const, officialMismatch: false }
    : englishText(raw);
  // CR 2.13: "(This card is treated as X.)" — X is the card name, the printed name an alternate name.
  const magicalItem = isMagicalItem(token, en.text, raw.treated_as);
  const alias = magicalItem ? MAGICAL_ITEM : (raw.treated_as ?? treatedAs(en.text));
  const name = alias === null ? printedName : stripEvolvedSuffix(cardNo, alias, false);
  if (name === "") throw new CardDataError(`${cardNo}: empty English name`);
  const universe = raw.universe ?? UNIVERSE_OF_SET[raw.set];
  const trigger = triggerIcon(cardNo, raw.effect_en, raw.effect_ja);

  return {
    printing: cardNo,
    set: raw.set,
    def: {
      name,
      names: magicalItem
        ? MAGICAL_ITEM_NAMES
        : alias !== null
          ? { en: name, cn: null, ja: null }
          : { en: raw.preview ? PREVIEW_TEXT : name, cn: raw.name_cn, ja: nameJa },
      class: parseClass(cardNo, raw.class),
      type,
      evolved,
      token,
      ...(advanced ? { advanced: true as const } : {}),
      ...(universe ? { universe } : {}),
      ...(trigger ? { trigger } : {}),
      cost: raw.cost,
      attack: raw.atk,
      defense: raw.def,
      text: {
        en: withoutTreatedAs(en.text),
        cn: raw.effect_cn?.trim() ?? null,
        ja: (raw.effect_ja_sve ?? raw.effect_ja)?.trim() ?? null,
      },
    },
    // A leader has no traits (its data says ""); the Japanese-only data of some leaders has none at all.
    traits: type === "leader" && raw.traits_ja == null ? [] : parseTraits(cardNo, raw.traits_ja),
    textSource: en.source,
    officialMismatch: en.officialMismatch,
    alternateName: alias === null ? null : { en: printedName, cn: raw.name_cn, ja: nameJa },
    jaKey: japaneseKey(raw),
    jaWordsKey: japaneseWordsKey(raw),
    back: doubleFaced ? normalizeBack(cardNo, raw) : null,
    ownEvolvedName,
  };
}

const withoutSpaces = (s: string | null | undefined) => (s ?? "").replace(/[\s　]+/g, "");

/** CR 2.14 — the back face of a double-faced card (English data plus data/fixes.ts). */
function normalizeBack(cardNo: string, raw: RawCardJson): NormalizedBack {
  const b = raw.back!;
  const where = `${cardNo}: back face`;
  const { type, evolved, token } = parseCardType(where, b.card_type);
  checkStats(where, type, evolved, b.cost, b.atk, b.def);
  const ja = b.effect_ja?.trim() ?? null;
  // The scraped back face repeats the front's Japanese text (RawCardBack); it must be corrected.
  if (ja !== null && withoutSpaces(ja) === withoutSpaces(raw.effect_ja)) {
    throw new CardDataError(`${where}: its Japanese text is the front face's; transcribe the printed back face in data/fixes.ts`);
  }
  const name = stripEvolvedSuffix(where, b.name_en.trim(), evolved, true);
  if (name === "") throw new CardDataError(`${where}: empty English name`);
  return {
    def: {
      name,
      names: { en: name, cn: b.name_cn ?? null, ja: b.name_ja },
      class: parseClass(where, b.class),
      type,
      evolved,
      token,
      cost: b.cost,
      attack: b.atk,
      defense: b.def,
      text: { en: b.effect_en?.trim() ?? "", cn: b.effect_cn?.trim() ?? null, ja },
    },
    traits: parseTraits(where, b.traits_ja ?? null),
  };
}

/**
 * CR 5.16.1.1.1: an evolved card has the *same* name as its base card; the data adds " (Evolved)".
 * The faces of a double-faced evolved card have names of their own (CR 2.14, BP09-004 "Evolve
 * this follower into a Paula, Gentle Warmth or Paula, Passionate Warmth"), without the suffix.
 */
function stripEvolvedSuffix(cardNo: string, name: string, evolved: boolean, doubleFaced = false): string {
  if (!evolved) return name;
  if (!name.endsWith(EVOLVED_SUFFIX)) {
    if (doubleFaced) return name;
    throw new CardDataError(`${cardNo}: evolved card name "${name}" lacks the "${EVOLVED_SUFFIX}" suffix`);
  }
  return name.slice(0, -EVOLVED_SUFFIX.length);
}

/**
 * Identity key for alternate-art grouping (CR 2.1.1: card names are unique). Leaders also
 * key on their class: two different leader cards share a name (CP04-PR02 / CP04-PR09,
 * "Pecorine [Princess Form]", Forestcraft and Swordcraft).
 */
export function identityKey(d: NormalizedPrinting["def"]): string {
  const special = d.evolved ? "evolved" : d.advanced ? "advanced" : "base";
  const base = `${d.type}|${special}|${d.token ? "token" : "card"}|${d.name}`;
  return d.type === "leader" ? `${base}|${d.class}` : base;
}

/**
 * Game-relevant fields that must agree exactly between printings of the same card (traits
 * are checked separately because some printings lack them). Card text is deliberately
 * excluded: reprints may carry wording updates (e.g. "Piercing Attack", the pre-rename wording
 * of Assail, CR 12.11). Substantial differences are reported and the canonical printing's text
 * is used.
 */
function functionalSignature(d: NormalizedPrinting["def"]): string {
  return JSON.stringify([d.class, d.cost, d.attack, d.defense]);
}

export interface TextVariant {
  canonical: string;
  variant: string;
  canonicalText: string;
  variantText: string;
}

export interface GroupResult {
  cards: CardDefinition[];
  /** Definition id -> the set of its canonical printing (the set whose data file holds it). */
  setOf: Readonly<Record<string, string>>;
  /** Printings whose English text says something substantially different from the canonical printing's. */
  textVariants: TextVariant[];
  /** Definitions with Japanese text but no English text (Japan-only printings). */
  noEnglishText: string[];
  /** Definitions whose canonical printing has an official English text describing another card. */
  officialMismatches: string[];
  /** Printings grouped with a card whose Japanese text differs from the canonical printing's. */
  japaneseVariants: { canonical: string; variant: string }[];
  /** Definitions of pre-release cards (canonical printing from a pre-release file, data/preview.ts). */
  previewDefinitions: string[];
}

const PRINTING_KIND_ORDER: readonly RegExp[] = [
  /^[A-Za-z0-9]+-\d+$/, // regular collector number, e.g. BP01-006
  /^[A-Za-z0-9]+-T\d+$/, // token
  /^[A-Za-z0-9]+-LD\d+$/, // leader
];

function printingRank(p: string): number {
  const i = PRINTING_KIND_ORDER.findIndex((re) => re.test(p));
  return i === -1 ? PRINTING_KIND_ORDER.length : i;
}

/**
 * Merge printings that are the same card into definitions, across all sets.
 *
 * Only cards with a printing in one of the `supported` sets become definitions; printings of
 * the same card in other sets (promos, reprints, alternate art, alternate names) are attached
 * to them. The canonical printing (definition id) is chosen by: earlier set in `supported`
 * (new sets are appended, so existing ids never change), then printings under the card's own
 * name before alternate-name printings (CR 2.13), then regular > token > leader > other
 * numbering, then lexical order.
 */
export function groupPrintings(printings: readonly NormalizedPrinting[], supported: readonly string[]): GroupResult {
  // CR 5.16.1.1.1 — an evolved card without " (Evolved)" whose Japanese name is a base card's has lost the suffix
  // in the data (e.g. BP14-057): an error to fix in data/fixes.ts. Otherwise its name is its own (CP03-006).
  const baseJapaneseNames = new Set(printings.filter((p) => !p.def.evolved && p.def.names.ja).map((p) => p.def.names.ja!));
  // Data errors of all groups are collected and reported together.
  const errors: string[] = [];
  for (const p of printings) {
    if (p.ownEvolvedName && p.def.names.ja && baseJapaneseNames.has(p.def.names.ja) && supported.includes(p.set)) {
      errors.push(`${p.printing}: evolved card name "${p.def.name}" lacks the "${EVOLVED_SUFFIX}" suffix`);
    }
  }
  const groups = new Map<string, NormalizedPrinting[]>();
  for (const p of printings) {
    const key = identityKey(p.def);
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }
  const setRank = (s: string) => {
    const i = supported.indexOf(s);
    return i === -1 ? supported.length : i;
  };
  const defs: CardDefinition[] = [];
  const setOf: Record<string, string> = {};
  const textVariants: TextVariant[] = [];
  const noEnglishText: string[] = [];
  const officialMismatches: string[] = [];
  const japaneseVariants: GroupResult["japaneseVariants"] = [];
  const previewDefinitions: string[] = [];
  for (const list of groups.values()) {
    if (!list.some((p) => supported.includes(p.set))) continue;
    try {
      groupOne(list);
    } catch (e) {
      if (!(e instanceof CardDataError)) throw e;
      errors.push(e.message);
    }
  }
  if (errors.length > 0) throw new CardDataError(`${errors.length} card data error(s):\n${errors.join("\n")}`);
  defs.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  previewDefinitions.sort();
  return { cards: defs, setOf, textVariants, noEnglishText, officialMismatches, japaneseVariants, previewDefinitions };

  /** One group of printings with the same identity: its definition (and back face), or a CardDataError. */
  function groupOne(list: NormalizedPrinting[]): void {
    list.sort(
      (a, b) =>
        setRank(a.set) - setRank(b.set) ||
        Number(a.alternateName !== null) - Number(b.alternateName !== null) ||
        printingRank(a.printing) - printingRank(b.printing) ||
        (a.printing < b.printing ? -1 : a.printing > b.printing ? 1 : 0),
    );
    const canonical = list[0]!;
    const sig = functionalSignature(canonical.def);
    for (const other of list.slice(1)) {
      if (functionalSignature(other.def) !== sig) {
        throw new CardDataError(
          `${other.printing} has the same name as ${canonical.printing} ("${canonical.def.name}") but different game information`,
        );
      }
      const differs = wordDice(withoutReminders(other.def.text.en), withoutReminders(canonical.def.text.en)) < 0.6;
      const compared = (s: TextSource) => s === "effect_en";
      if (compared(other.textSource) && compared(canonical.textSource) && differs) {
        textVariants.push({
          canonical: canonical.printing,
          variant: other.printing,
          canonicalText: canonical.def.text.en,
          variantText: other.def.text.en,
        });
      }
      // A pre-release printing has the Japanese text only with the icons written as words (data/preview.ts).
      const words = other.textSource === "preview" || canonical.textSource === "preview";
      const [a, b] = words ? [other.jaWordsKey, canonical.jaWordsKey] : [other.jaKey, canonical.jaKey];
      if (a !== "" && b !== "" && a !== b) {
        japaneseVariants.push({ canonical: canonical.printing, variant: other.printing });
      }
    }
    const withTraits = list.filter((p) => p.traits !== null);
    const traits = withTraits[0]?.traits;
    if (!traits) throw new CardDataError(`${canonical.printing}: no printing of "${canonical.def.name}" has Japanese traits`);
    const conflict = withTraits.find((p) => JSON.stringify(p.traits) !== JSON.stringify(traits));
    if (conflict) {
      throw new CardDataError(
        `${conflict.printing}: traits ${JSON.stringify(conflict.traits)} differ from ${withTraits[0]!.printing} ${JSON.stringify(traits)}`,
      );
    }
    if (canonical.textSource === "none" && canonical.jaKey !== "") noEnglishText.push(canonical.printing);
    if (canonical.textSource === "preview") previewDefinitions.push(canonical.printing);
    if (canonical.officialMismatch) officialMismatches.push(canonical.printing);
    const def: CardDefinition = { id: canonical.printing, printings: list.map((p) => p.printing), ...canonical.def, traits: [...traits] };
    // CR 2.12.2.1 — the universe of the printings from universe sets (reprints elsewhere carry none); they must agree.
    const universes = [...new Set(list.flatMap((p) => (p.def.universe ? [p.def.universe] : [])))];
    if (universes.length > 1) throw new CardDataError(`${canonical.printing}: printings in different universes ${universes.join(", ")}`);
    if (universes[0]) def.universe = universes[0];
    else delete def.universe;
    const alternates = list.filter((p) => p.alternateName !== null);
    if (alternates.length > 0) def.alternateNames = Object.fromEntries(alternates.map((p) => [p.printing, p.alternateName!]));
    defs.push(def);
    setOf[canonical.printing] = canonical.set;
    if (list.some((p) => p.back !== null)) {
      const back = backFaceDefinition(canonical.printing, list);
      def.backFace = back.id;
      defs.push(back);
      setOf[back.id] = canonical.set;
    }
  }
}

/**
 * CR 2.14 — the back-face definition of a double-faced card, from its printings (canonical one
 * first). Every printing must carry the same back face; its traits come from the printings that
 * have Japanese traits, like the front's.
 */
function backFaceDefinition(front: string, list: readonly NormalizedPrinting[]): CardDefinition {
  const canonical = list[0]!.back;
  if (!canonical) throw new CardDataError(`${front}: printing without a back face grouped with double-faced printings`);
  for (const p of list) {
    if (!p.back) throw new CardDataError(`${p.printing}: printing without a back face grouped with double-faced ${front}`);
    const same = p.back.def.name === canonical.def.name && functionalSignature(p.back.def) === functionalSignature(canonical.def);
    if (!same) throw new CardDataError(`${p.printing}: back face differs from the back face of ${front}`);
  }
  const withTraits = list.filter((p) => p.back!.traits !== null);
  const traits = withTraits[0]?.back!.traits;
  if (!traits) throw new CardDataError(`${front}: no printing's back face has Japanese traits (data/fixes.ts)`);
  const conflict = withTraits.find((p) => JSON.stringify(p.back!.traits) !== JSON.stringify(traits));
  if (conflict) throw new CardDataError(`${conflict.printing}: back face traits differ from ${withTraits[0]!.printing}`);
  return { id: backFaceId(front), printings: [], ...canonical.def, traits: [...traits], frontFace: front };
}
