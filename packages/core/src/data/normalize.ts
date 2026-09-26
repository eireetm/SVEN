import { backFaceId, CARD_CLASSES, type CardClass, type CardDefinition, type CardType, type LocalizedText } from "../model/card";
import { englishText, japaneseKey, treatedAs, withoutReminders, withoutTreatedAs, wordDice, type TextSource } from "./english-text";
import type { RawCardJson } from "./raw";

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
  /** CR 2.14 — the back face of a double-faced card. */
  back: NormalizedBack | null;
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
  if (evolved && type !== "follower" && type !== "amulet") {
    throw new CardDataError(`${cardNo}: evolved card must be a follower or amulet in the supported sets`);
  }
  // CR 9.1.4.2 — crests exist only as tokens (BP20). A crest that is not a token fails until one appears.
  if (type === "crest" && (!token || evolved || advanced)) {
    throw new CardDataError(`${cardNo}: a crest must be a token in the supported sets`);
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
  if (type === "follower") {
    if (atk === null || def === null) fail("follower needs attack and defense");
    if (evolved ? cost !== null : cost === null) fail(evolved ? "evolved card must not have a cost" : "follower needs a cost");
    return;
  }
  if (evolved) {
    if (type !== "amulet") fail("only followers and amulets can currently be evolved cards");
    if (cost !== null || atk !== null || def !== null) fail("evolved amulet must not have cost/atk/def");
    return;
  }
  if (cost === null) fail(`${type} needs a cost`);
}

export function normalizePrinting(raw: RawCardJson): NormalizedPrinting {
  const cardNo = raw.card_no;
  const { type, evolved, token, advanced } = parseCardType(cardNo, raw.card_type);
  checkStats(cardNo, type, evolved, raw.cost, raw.atk, raw.def);
  const doubleFaced = raw.back !== undefined && raw.back !== null;

  const printedName = stripEvolvedSuffix(cardNo, raw.name_en.trim(), evolved, doubleFaced);
  const en = englishText(raw);
  // CR 2.13: "(This card is treated as X.)" — X is the card name, the printed name an alternate name.
  const alias = treatedAs(en.text);
  const name = alias === null ? printedName : stripEvolvedSuffix(cardNo, alias, false);
  if (name === "") throw new CardDataError(`${cardNo}: empty English name`);

  return {
    printing: cardNo,
    set: raw.set,
    def: {
      name,
      names: alias === null ? { en: name, cn: raw.name_cn, ja: raw.name_ja } : { en: name, cn: null, ja: null },
      class: parseClass(cardNo, raw.class),
      type,
      evolved,
      token,
      ...(advanced ? { advanced: true as const } : {}),
      cost: raw.cost,
      attack: raw.atk,
      defense: raw.def,
      text: {
        en: withoutTreatedAs(en.text),
        cn: raw.effect_cn?.trim() ?? null,
        ja: (raw.effect_ja_sve ?? raw.effect_ja)?.trim() ?? null,
      },
    },
    traits: parseTraits(cardNo, raw.traits_ja),
    textSource: en.source,
    officialMismatch: en.officialMismatch,
    alternateName: alias === null ? null : { en: printedName, cn: raw.name_cn, ja: raw.name_ja },
    jaKey: japaneseKey(raw),
    back: doubleFaced ? normalizeBack(cardNo, raw) : null,
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
  for (const list of groups.values()) {
    if (!list.some((p) => supported.includes(p.set))) continue;
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
      if (other.textSource !== "none" && canonical.textSource !== "none" && differs) {
        textVariants.push({
          canonical: canonical.printing,
          variant: other.printing,
          canonicalText: canonical.def.text.en,
          variantText: other.def.text.en,
        });
      }
      if (other.jaKey !== "" && canonical.jaKey !== "" && other.jaKey !== canonical.jaKey) {
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
    if (canonical.officialMismatch) officialMismatches.push(canonical.printing);
    const def: CardDefinition = { id: canonical.printing, printings: list.map((p) => p.printing), ...canonical.def, traits: [...traits] };
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
  defs.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { cards: defs, setOf, textVariants, noEnglishText, officialMismatches, japaneseVariants };
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
